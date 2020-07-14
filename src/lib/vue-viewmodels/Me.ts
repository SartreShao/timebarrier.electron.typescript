import { ElementVue } from "../types/vue-viewmodels";
import { UI } from "../vue-utils";
import Api from "@/lib/api";
import { Ref } from "@vue/composition-api";

export default {
  /**
   * 请求网络，更新缓存中的用户信息
   */
  updateUserInformation: async (
    vue: ElementVue,
    avatarUrl: Ref<string>,
    nickName: Ref<string>,
    signature: Ref<string>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    try {
      await user.fetch();
      avatarUrl.value = user.attributes.avatarUrl;
      nickName.value = user.attributes.nickName;
      signature.value = user.attributes.signature;
    } catch (error) {
      UI.showNotification(
        vue.$notify,
        "网络连接失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 不请求网络，但是会重新加载缓存中的用户信息
   */
  showUserInformation: async (
    vue: ElementVue,
    avatarUrl: Ref<string>,
    nickName: Ref<string>,
    signature: Ref<string>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    avatarUrl.value = user.attributes.avatarUrl;
    nickName.value = user.attributes.nickName;
    signature.value = user.attributes.signature;
  }
};
