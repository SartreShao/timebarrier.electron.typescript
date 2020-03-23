import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import VueRouter, { RawLocation } from "vue-router";
import { Router, Time, Check, UI } from "./vue-utils";
import { ElementVue, TomatoCloudStatus } from "./types/vue-viewmodels";
import Api from "./api";
/**
 * 启动页
 */
const SplashPage = {
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

/**
 * 计划页
 */
const PlanPage = {
  /**
   * 初始化计划列表
   * @remark 时间壁垒专用函数
   * @param temporaryPlanList 临时计划列表，如果不需要刷新，请传入 null
   * @param dailyPlanList 每日计划列表，如果不需要刷新，请传入 null
   * @param completedPlanList 已完成的计划列表，如果不需要刷新，请传入 null
   */
  init: async (
    vue: ElementVue,
    temporaryPlanList: Ref<AV.Object[]> | null,
    dailyPlanList: Ref<AV.Object[]> | null,
    completedPlanList: Ref<AV.Object[]> | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 显示 loading
    const loadingInstance = UI.showLoading(vue.$loading, "正在获取计划列表");

    // 尝试获取计划列表
    try {
      // 获取临时计划列表
      if (temporaryPlanList !== null) {
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      }

      // 获取每日计划列表
      if (dailyPlanList !== null) {
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      // 获取已完成计划列表
      if (completedPlanList !== null) {
        completedPlanList.value = await Api.fetchPlanList(user, "completed");
      }

      // 获取列表成功
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取计划列表失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 创建临时计划
   *
   * @param vue 传入绑定 Element 后（通过 Vue.use()）的 setup(props, context) 中的 context.root 即可
   * @param name 计划名称
   * @param isTemporary 是否为临时计划
   * @param temporaryPlanList 临时计划的列表，用于创建 Plan 后更新列表数据
   * @param dailyPlanList 每日计划的列表，用于创建 Plan 后更新列表数据
   */
  createPlan: async (
    vue: ElementVue,
    name: Ref<string>,
    isTemporary: boolean,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 检测传入数据
    if (name.value.length === 0) {
      // doing nothing
      return;
    }

    try {
      // 创建计划
      await Api.createPlan(name.value, isTemporary, user);

      // 刷新计划列表
      if (isTemporary) {
        // 更新临时计划
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      } else {
        // 更新每日计划列表
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      name.value = "";
    } catch (error) {
      UI.showNotification(
        vue.$notify,
        "创建计划失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 完成计划
   *
   * @param vue 传入绑定 Element 后（通过 Vue.use()）的 setup(props, context) 中的 context.root 即可
   * @param planId plan.objectId 需要标记为完成的 Plan 的 objectId
   * @param isTemporary plan 的类型是否是临时计划
   * @param temporaryPlanList 临时计划的列表，用于完成 Plan 后更新列表数据
   * @param dailyPlanList 每日计划的列表，用于完成 Plan 后更新列表数据
   */
  completePlan: async (
    vue: ElementVue,
    planId: string,
    isTemporary: boolean,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>
  ) => {
    try {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 尝试完成 Plan
      await Api.completePlan(planId);
      // 刷新计划列表
      if (isTemporary) {
        // 更新临时计划
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      } else {
        // 更新每日计划列表
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      completedPlanList.value = await Api.fetchPlanList(user, "completed");
    } catch (error) {
      UI.showNotification(
        vue.$notify,
        "完成计划失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 取消完成计划
   *
   * @param vue 传入绑定 Element 后（通过 Vue.use()）的 setup(props, context) 中的 context.root 即可
   * @param planId plan.objectId 需要取消标记为完成的 Plan 的 objectId
   * @param isTemporary plan 的类型是否是临时计划
   * @param temporaryPlanList 临时计划的列表，用于完成 Plan 后更新列表数据
   * @param dailyPlanList 每日计划的列表，用于完成 Plan 后更新列表数据
   */
  cancelCompletePlan: async (
    vue: ElementVue,
    planId: string,
    isTemporary: boolean,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>
  ) => {
    try {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 尝试完成 Plan
      await Api.cancelCompletePlan(planId);
      // 刷新计划列表
      if (isTemporary) {
        // 更新临时计划
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      } else {
        // 更新每日计划列表
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      completedPlanList.value = await Api.fetchPlanList(user, "completed");
    } catch (error) {
      UI.showNotification(
        vue.$notify,
        "取消完成计划失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  }
};

/**
 * 番茄计时器页
 */
const TomatoTimerPage = {
  /**
   * 点击番茄钟
   *
   * @param vue 还是绑定了 Element 后的 context.root
   * @param tomatoCloudStatus 这是番茄钟的状态，由外部引入
   * @param interval 计时器实例，由外部引入
   * @param countDown 计时器表盘值，由外部引入
   * @param isCommitPlanDrawerDisplayed 由于番茄钟完成后要弹起一个
   */
  clickTomatoClock: async (
    vue: ElementVue,
    tomatoCloudStatus: Ref<TomatoCloudStatus>,
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    isCommitPlanDrawerDisplayed: Ref<boolean>
  ) => {
    switch (tomatoCloudStatus.value) {
      case "prepared": {
        // 传入数据检测
        if (interval.value !== null) {
          UI.showNotification(
            vue.$notify,
            "开始计时失败",
            "失败原因：计时器 (interval) 不为 null",
            "error"
          );
          return;
        }
        // 修改番茄钟的状态为「正在进行」
        tomatoCloudStatus.value = "processive";
        // 重设表盘值为 1500s（25 分钟）
        countDown.value = 1500;
        // 开始计时
        interval.value = setInterval(() => {
          countDown.value--;
          if (countDown.value === 0 && interval.value !== null) {
            clearInterval(interval.value);
            tomatoCloudStatus.value = "finished";
          }
        }, 1);
        break;
      }
      case "finished": {
        isCommitPlanDrawerDisplayed.value = true;
        break;
      }
      case "processive": {
        if (interval.value === null) {
          UI.showNotification(
            vue.$notify,
            "终止计时失败",
            "失败原因：计时器 (interval) 为 null",
            "error"
          );
          return;
        }

        try {
          // 询问用户是否放弃番茄
          await UI.showConfirm(
            vue.$confirm,
            "您目前正在一个番茄工作实践中，要放弃这个番茄吗？",
            "放弃番茄"
          );
          // 确认放弃番茄
          tomatoCloudStatus.value = "prepared";
          countDown.value = 1500;
          clearInterval(interval.value);
          interval.value = null;
        } catch (error) {
          // doing nothing
        }
        break;
      }
    }
  },
  /**
   * 点击放弃番茄
   *
   * @param vue 绑定 Element 后的 vue 根实例
   * @param tomatoCloudStatus 这是番茄钟的状态，由外部引入
   * @param interval 计时器实例，由外部引入
   * @param countDown 计时器表盘值，由外部引入
   */
  abandonTomato: async (
    vue: ElementVue,
    tomatoCloudStatus: Ref<TomatoCloudStatus>,
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>
  ) => {
    try {
      // 询问用户是否放弃番茄
      await UI.showConfirm(
        vue.$confirm,
        "您目前正在一个番茄工作实践中，要放弃这个番茄吗？",
        "防窃番茄"
      );
      // 放弃番茄
      tomatoCloudStatus.value = "prepared";
      interval.value = null;
      countDown.value = 1500;
    } catch (error) {
      // doing nothing
    }
  }
};

export { SplashPage, LoginPage, PlanPage, TomatoTimerPage };
