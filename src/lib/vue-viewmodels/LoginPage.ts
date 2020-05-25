import { Ref } from "@vue/composition-api";
import { RawLocation } from "vue-router";
import { Router, Check, UI } from "@/lib/vue-utils";
import { ElementVue } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";

/**
 * 登录页
 */
export default {
  /**
   * 用户点击登录
   * @remark 通用函数
   * @param vue 传入绑定 Element 后（通过 Vue.use()）的 setup(props, context) 中的 context.root 即可
   * @param phoneNumber 手机号
   * @param verificationCode 验证码
   * */
  login: async (
    vue: ElementVue,
    phoneNumber: string,
    verificationCode: string,
    indexLocation: RawLocation
  ) => {
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

      // 登录成功后跳转到对应路由
      Router.replace(vue.$router, indexLocation);
    } catch (error) {
      // 登录失败=》隐藏 loading=》
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "登录失败", "用户名或密码错误", "error");
    }
  },
  /**
   * 用户点击发送验证码
   * @remark 通用函数
   * @param vue 传入绑定 Element 后（通过 Vue.use()）的 setup(props, context) 中的 context.root 即可
   * @param interval 计时器实例，请传入一个 ref(null) 作为初始状态
   * @param countDown 计时器表盘值，请传入 ref(30) 作为初始状态
   * @param phoneNumber 接收验证码的手机号
   */
  sendVerificationCode: async (
    vue: ElementVue,
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    phoneNumber: string
  ) => {
    // 检查手机号是否符合要求
    if (!Check.isPhoneNumber(phoneNumber)) {
      UI.showNotification(vue.$notify, "错误", "请输入正确的手机号", "error");
      return;
    }

    // 如果 interva 是 null =》 当前状态是未开始计时
    if (interval.value === null) {
      const loadingInstance = UI.showLoading(vue.$loading, "正在发送验证码");

      // 尝试发送验证码
      try {
        await Api.sendSmsVerifyCode(phoneNumber);

        // 验证码发送成功
        UI.hideLoading(loadingInstance);
        UI.showNotification(vue.$notify, "验证码发送成功", "", "success");

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
      } catch (error) {
        // 验证码发送失败
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "验证码发送失败",
          `错误信息：${error.message}`,
          "error"
        );
      }
    }
  }
};
