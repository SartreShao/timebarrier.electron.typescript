import VueRouter, { RawLocation } from "vue-router";
import { Router, Time, Check, UI } from "./vue-utils";
import Api from "./api";
import { ref, Ref } from "@vue/composition-api";
import {
  ElNotificationOptions,
  ElNotificationComponent
} from "element-ui/types/notification";
/**
 * 启动页
 */
const SplashPage = {
  /**
   * 启动页标准启动方法：停留两秒钟，然后进入首页或登录页
   *
   * @param residenceTime 停留时间 - 单位：毫秒，建议传入值：2000
   * @param routerInstance VueRouter 实例
   * @param indexRoute 首页的 Route 路径
   * @param loginLocation 登录页的 Route 路径
   */
  init: async (
    residenceTime: number,
    routerInstance: VueRouter,
    indexLocation: RawLocation,
    loginLocation: RawLocation
  ) => {
    // 开始动画保留 2000ms 或 residenceTime
    await Time.sleep(residenceTime);

    // 依据登录情况跳转不同页面
    Api.isLoggedIn()
      ? Router.replace(routerInstance, indexLocation)
      : Router.replace(routerInstance, loginLocation);
  }
};

/**
 * 登录页
 */
const LoginPage = {
  /**
   * 登录
   * */
  login: async (vue: Vue, phoneNumber: string, verificationCode: string) => {
    // 检查计算属性是否符合要求
    if (!Check.isPhoneNumber(phoneNumber)) {
      UI.showNotification(vue.$notify, "错误", "请输入正确的手机号", "error");
      return;
    }

    if (!Check.isVerificationCode(verificationCode)) {
      UI.showNotification(vue.$notify, "错误", "请输入正确的验证码", "error");
      return;
    }

    // 显示 loading
    const loadingInstance = UI.showLoading(vue.$loading, "正在登录");

    try {
      // 尝试登录
      await Api.loginWithVerificationCode(phoneNumber, verificationCode);

      // 登录成功=》隐藏 loading=》显示登录成功通知
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "登录成功", "", "success");
    } catch (error) {
      // 登录失败=》隐藏 loading=》
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "登录失败", "用户名或密码错误", "error");
    }
  },
  sendVerificationCode: async (
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>
  ) => {
    if (interval.value === null) {
      countDown.value = 30;
      interval.value = setInterval(() => {
        // 如果当前表盘值为 0
        if (countDown.value === 0) {
          // 停止倒计时
          if (interval.value !== null) {
            clearInterval(interval.value);
          }

          // 清空 interval 实例
          interval.value = null;

          // 重制表盘值为 30
          countDown.value = 30;
        }

        // 如果当前表盘值不为 0，则表盘值减 1
        countDown.value = countDown.value - 1;
      }, 1000);
    }
  }
};

export { SplashPage, LoginPage };
