import { ElementVue } from "../types/vue-viewmodels";
import { UI } from "../vue-utils";
import Api from "@/lib/api";
import { Ref } from "@vue/composition-api";

export default {
  /**
   * 上传照片
   */
  uploadAvatar: async (
    vue: ElementVue,
    e: Event,
    htmlInputElement: HTMLInputElement,
    avatarUrl: Ref<string>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      htmlInputElement.value = "";
      return;
    }

    if (e.target === null) {
      htmlInputElement.value = "";
      return;
    }
    const files = (e.target as HTMLInputElement).files;
    if (files === null) {
      htmlInputElement.value = "";
      return;
    }

    // 需要上传的头像文件
    const file = files[0];

    // 判断文件大小，如果超过 5 MB 则提示上传的头像不得超过 5 MB
    if (file.size >= 5 * 1024 * 1024) {
      UI.showNotification(
        vue.$notify,
        "上传头像失败",
        "图片大小需小于 5 MB",
        "warning"
      );
      htmlInputElement.value = "";
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在上传头像");

    try {
      // 上传头像
      const newUser = await Api.uploadAvatar(user, file);
      avatarUrl.value = newUser.attributes.avatarUrl;
      htmlInputElement.value = "";
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "上传头像成功", "", "success");
    } catch (error) {
      htmlInputElement.value = "";
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "上传头像失败",
        `错误原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 获取头像 Url
   */
  fetchAvatar: async (vue: ElementVue, avatarUrl: Ref<string>) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    await user.fetch();

    avatarUrl.value = user.attributes.avatarUrl;
  }
};
