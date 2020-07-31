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
import * as _ from "lodash";
import { Dictionary } from "vue-router/types/router";

const isDev = true;

const Router = {
  replace: async (router: VueRouter, location: RawLocation) => {
    try {
      if (router.currentRoute.path === location) {
        return;
      }
      await router.replace(location);
    } catch (error) {
      console.log("relace router:", location, error);
    }
  },
  push: async (router: VueRouter, location: RawLocation) => {
    try {
      if (router.currentRoute.path === location) {
        return;
      }
      await router.push(location);
    } catch (error) {
      console.log("push router:", location, error);
    }
  },
  pushWithParams: async (
    router: VueRouter,
    name: string,
    params: Dictionary<string>
  ) => {
    try {
      if (router.currentRoute.name === name) {
        return;
      }
      await router.push({ name: name, params: params });
    } catch (error) {
      console.log("pushWithParams router:", name, "params:", params, error);
    }
  },
  back: async (router: VueRouter) => {
    router.back();
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
    // const regex = /^0?1[3|4|5|6|7|8][0-9]\d{8}$/;
    // return regex.test(value);
    return value.length > 0;
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
      background: "rgba(255,255,255,0.7)"
    });
  },
  // 隐藏加载
  hideLoading(loadingInstance: ElLoadingComponent) {
    loadingInstance.close();
  },
  // 格式化 1500s => 25:00
  formatTime(second: number, words?: boolean): string {
    let sec = String(Math.trunc(second % 60));
    let min = String(Math.trunc(second / 60));
    if (sec.length < 2) {
      sec = "0" + sec;
    }
    if (min.length < 2) {
      min = "0" + min;
    }
    if (words) {
      return min + " 分 " + sec + " 秒";
    } else {
      return min + ":" + sec;
    }
  },
  // 格式化
  formatTimeHourMinute: (second: number) => {
    let hour = Math.trunc(second / 3600);
    let min = Math.trunc((second - hour * 3600) / 60);
    if (hour === 0) {
      return `${min} 分钟`;
    } else {
      return `${hour} 小时 ${min} 分钟`;
    }
  },
  /**
   * 将传入 Date 格式化为 xxxx 年 xx 月 xx 日的形式
   */
  dateToYearMonthDay: (date: Date, separate?: string) => {
    let year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());

    if (month.length === 1) {
      month = "0" + month;
    }

    if (day.length === 1) {
      day = "0" + day;
    }

    if (separate === undefined) {
      return `${year} 年 ${month} 月 ${day} 日`;
    } else {
      return `${year}${separate}${month}${separate}${day}`;
    }
  },
  dateToHourMinute12: (date: Date) => {
    let hour: number | string = date.getHours();
    let minute: number | string = date.getMinutes();
    let type: string = "";

    if (0 <= hour && hour <= 11) {
      type = "am";
    } else if (12 <= hour && hour <= 23) {
      type = "pm";
    }

    minute = String(minute);
    if (minute.length === 1) {
      minute = "0" + minute;
    }

    return `${hour}:${minute} ${type}`;
  },
  getTodayStartTimestamp: (timeStamp: number) => {
    const timeZone = new Date().getTimezoneOffset() / 60;
    return (
      timeStamp - ((timeStamp - timeZone * 3600 * 1000) % (3600 * 1000 * 24))
    );
  },
  getWeekStartTimestamp: function(timeStamp: number) {
    const today = new Date(this.getTodayStartTimestamp(timeStamp));
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDate() - 1;
    return today.getTime() - dayOfWeek * 3600 * 1000 * 24;
  },
  getMonthStartTimestamp: function(timeStamp: number) {
    const dateToYearMonthDay = (date: Date) => {
      let year = String(date.getFullYear());
      let month = String(date.getMonth() + 1);
      if (month.length === 1) {
        month = "0" + month;
      }
      return `${year}/${month}/01`;
    };

    const date = new Date();
    date.setTime(timeStamp);
    const dateString = dateToYearMonthDay(date);
    const result = new Date(dateString);
    return result.getTime();
  },
  getYearStartTimestamp: function(timeStamp: number) {
    const dateToYearMonthDay = (date: Date) => {
      let year = String(date.getFullYear());
      return `${year}/01/01`;
    };

    const date = new Date();
    date.setTime(timeStamp);
    const dateString = dateToYearMonthDay(date);
    const result = new Date(dateString);
    return result.getTime();
  },
  timeStampToHour: function(timeStamp: number) {
    const hour = Number((timeStamp / 1000 / 60 / 60).toFixed(1));
    return hour;
  },
  /**
   * 根据时间戳，获取 0 - 24 小时数
   */
  getHour: function(timeStamp: number) {
    const hourTimeStamp = timeStamp - this.getTodayStartTimestamp(timeStamp);

    const hour = hourTimeStamp / (3600 * 1000);
    return hour;
  },
  /**
   * 输入 1-12，返回汉字一、二、三....
   */
  numberToMonth: (number: number) => {
    switch (number) {
      case 1:
        return "一";
      case 2:
        return "二";
      case 3:
        return "三";
      case 4:
        return "四";
      case 5:
        return "五";
      case 6:
        return "六";
      case 7:
        return "七";
      case 8:
        return "八";
      case 9:
        return "九";
      case 10:
        return "十";
      case 11:
        return "十一";
      case 12:
        return "十二";
      default:
        return "请输入 1-12 范围内的数字";
    }
  }
};

const Mathematic = {
  standardDeviation: function(list: number[]) {
    const variance = this.variance(list);
    return Math.sqrt(variance);
  },

  variance: function(list: number[]) {
    const average = this.average(list);
    const n = list.length;
    let total = 0;
    list.forEach(item => {
      total += this.square(item - average);
    });
    return total / n;
  },
  /**
   * 求平均数
   */
  average: (list: number[]) => {
    let total = 0;
    list.forEach(item => {
      total += item;
    });
    return total / list.length;
  },
  /**
   * 求平方
   */
  square: (number: number) => number * number,
  keepDecimal: (number: number, decimal: number) =>
    Number(number.toFixed(decimal))
};
export { Router, Time, Log, Check, UI, Mathematic };
