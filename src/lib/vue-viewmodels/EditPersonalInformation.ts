import { ElementVue } from "../types/vue-viewmodels";
import { Ref } from "@vue/composition-api";
import { UI } from "../vue-utils";
import Api from "@/lib/api";
import { trace } from "console";

export default {
  savePersonalInformation: async (
    vue: ElementVue,
    input: Ref<string>,
    name: String,
    key: String
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 如果 input 中没有内容，提示请输入内容
    if (input.value.length === 0) {
      UI.showNotification(vue.$notify, "请输入" + name, "", "warning");
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在更新" + name);

    try {
      // 如果 input 中有内容，则更新信息
      await Api.updateUser(user, key, input.value);

      // 完成更新
    } catch (error) {}
  }
};
