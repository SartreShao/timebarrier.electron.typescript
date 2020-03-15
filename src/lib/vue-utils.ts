import VueRouter, { RawLocation } from "vue-router";
import {
  ElMessageBoxOptions,
  MessageBoxData
} from "element-ui/types/message-box";
import {
  ElNotificationOptions,
  ElNotificationComponent
} from "element-ui/types/notification";
import { MessageType } from "element-ui/types/message";
import {
  ElLoadingComponent,
  LoadingServiceOptions
} from "element-ui/types/loading";

const isDev = false;

const Router = {
  replace: (router: VueRouter, location: RawLocation): void => {
    router.replace(location);
  }
};

const Time = {
  sleep: (time: number) => new Promise(resolve => setTimeout(resolve, time))
};

const Log = {
  success: (functionName: string, result?: any) => {
    if (isDev) {
      console.log(functionName + " success", result);
    }
  },
  error: (functionName: string, error: Error) => {
    if (isDev) {
      console.log(functionName + " error", error);
    }
  }
};

const Check = {
  /**
   * 检查是否是手机号
   * @param value 传入手机号
   */
  isPhoneNumber(value: string) {
    const regex = /^0?1[3|4|5|6|7|8][0-9]\d{8}$/;
    return regex.test(value);
  },
  /**
   * 检查是否为验证码：六位纯数字
   * @param value 传入验证码
   */
  isVerificationCode(value: string) {
    const regex = /^\d{6}$/;
    return regex.test(value);
  }
};

/**
 * Element UI 工具
 */
const UI = {
  /**
   * 显示一个提示框
   * */
  showConfirm(
    $confirm: (
      message: string,
      title: string,
      options?: ElMessageBoxOptions | undefined
    ) => Promise<MessageBoxData>,
    content: string,
    title: string
  ): Promise<null> {
    return new Promise(async (resolve, reject) => {
      try {
        await $confirm(content, title, {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        });
        resolve();
      } catch (error) {
        reject();
      }
    });
  },
  // 显示一个通知
  showNotification(
    $notify: (options: ElNotificationOptions) => ElNotificationComponent,
    title: string,
    message: string,
    type: MessageType // 可选：success/warning/info/error
  ) {
    $notify({
      title,
      message,
      type
    });
  },
  // 显示加载
  showLoading(
    $loading: (options: LoadingServiceOptions) => ElLoadingComponent,
    text: string
  ): ElLoadingComponent {
    return $loading({
      lock: true,
      text,
      spinner: "el-icon-loading",
      background: "rgba(0,0,0,0.7"
    });
  },
  // 隐藏加载
  hideLoading(loadingInstance: ElLoadingComponent) {
    loadingInstance.close();
  },
  // 格式化 1500s => 25:00
  formatTime(second: number) {
    let sec = String(Math.trunc(second % 60));
    let min = String(Math.trunc(second / 60));
    if (sec.length < 2) {
      sec = "0" + sec;
    }
    if (min.length < 2) {
      min = "0" + min;
    }
    return min + ":" + sec;
  }
};

export { Router, Time, Log, Check, UI };
