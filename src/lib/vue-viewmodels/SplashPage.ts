import VueRouter, { RawLocation } from "vue-router";
import { Router, Time } from "@/lib/vue-utils";
import Api from "@/lib/api";
/**
 * 启动页
 */
export default {
  /**
   * 启动页标准启动方法：停留两秒钟，然后进入首页或登录页
   * @remark 通用函数
   * @param residenceTime 停留时间 - 单位：毫秒，建议传入值：2000
   * @param routerInstance VueRouter 实例
   * @param indexRoute 首页的 Route 路径
   * @param loginLocation 登录页的 Route 路径
   */
  init: async (
    residenceTime: number,
    routerInstance: VueRouter,
    indexLocation: RawLocation,
    loginLocation: RawLocation,
    doingSomething: () => Promise<any> | null
  ) => {
    if (doingSomething === null) {
      // 开始动画保留 2000ms 或 residenceTime
      await Time.sleep(residenceTime);
    } else {
      await doingSomething();
    }
    // 依据登录情况跳转不同页面
    Api.isLoggedIn()
      ? Router.replace(routerInstance, indexLocation)
      : Router.replace(routerInstance, loginLocation);
  }
};
