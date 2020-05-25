import { RawLocation } from "vue-router";
import { Router, UI } from "@/lib/vue-utils";
import { ElementVue } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";
/**
 * 设置页
 */
export default {
  logOut: async (vue: ElementVue, splashLocation: RawLocation) => {
    try {
      await UI.showConfirm(vue.$confirm, "确认退出登录吗", "登出");
      const loadingInstance = UI.showLoading(vue.$loading, "正在登出...");

      try {
        await Api.logOut();
        UI.hideLoading(loadingInstance);
        UI.showNotification(vue.$notify, "登出成功", "", "success");

        // 登出成功后跳转到对应路由
        Router.replace(vue.$router, splashLocation);
      } catch (error) {
        // 登录失败=》隐藏 loading=》
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "登出失败",
          `错误原因：${error.message}`,
          "error"
        );
      }
    } catch (error) {
      // doing nothing
    }
  }
};
