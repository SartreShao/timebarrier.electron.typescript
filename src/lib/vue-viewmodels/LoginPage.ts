import { Ref } from "@vue/composition-api";
import { RawLocation } from "vue-router";
import { Router, UI } from "@/lib/vue-utils";
import { ElementVue } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";

export default {
  login: async (
    vue: ElementVue,
    countryCode: string,
    phoneNumber: string,
    verificationCode: string,
    indexLocation: RawLocation,
    isLoginSuccess: Ref<boolean>
  ) => {
    const userId = phoneNumber.trim();
    if (userId.length === 0) {
      UI.showNotification(vue.$notify, "请输入用户 ID", "本地开发版会自动创建这个用户", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在登录");

    try {
      await Api.loginWithVerificationCode(countryCode, userId, verificationCode);
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "登录成功", "", "success");
      Router.replace(vue.$router, indexLocation);
      isLoginSuccess.value = !isLoginSuccess.value;
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "登录失败", String(error), "error");
    }
  },

  sendVerificationCode: async (
    vue: ElementVue,
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    countryCode: string,
    phoneNumber: string
  ) => {
    UI.showNotification(vue.$notify, "本地开发模式", "直接输入用户 ID 即可登录", "info");
  }
};
