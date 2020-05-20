import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import VueRouter, { RawLocation } from "vue-router";
import { Router, Time, Check, UI } from "./vue-utils";
import {
  ElementVue,
  TomatoCloudStatus,
  PlanType,
  InputPlanType,
  InputTargetOrTargetSubjectType,
  InputAbilityType,
  TargetAbilityTabType,
  StatTomatoDate,
  StatStatusMode,
  StatTargetDate,
  StatPlanDate,
  TomatoStatStatusMode,
  StatAbilityDate
} from "./types/vue-viewmodels";
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
   * @param type 计划类别
   * @param temporaryPlanList 临时计划的列表，用于创建 Plan 后更新列表数据
   * @param dailyPlanList 每日计划的列表，用于创建 Plan 后更新列表数据
   */
  createPlan: async (
    vue: ElementVue,
    name: Ref<string>,
    type: PlanType,
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
    const loadingInstance = UI.showLoading(vue.$loading, "正在创建临时计划...");

    try {
      // 创建计划
      await Api.createPlan(name.value, type, user);

      // 刷新计划列表
      if (type === "temporary") {
        // 更新临时计划
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      } else if (type === "daily") {
        // 更新每日计划列表
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      name.value = "";

      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "临时计划创建成功",
        "可长按编辑临时计划为每日计划",
        "success"
      );
    } catch (error) {
      UI.hideLoading(loadingInstance);

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
   * @param type plan 的类型
   * @param temporaryPlanList 临时计划的列表，用于完成 Plan 后更新列表数据
   * @param dailyPlanList 每日计划的列表，用于完成 Plan 后更新列表数据
   */
  completePlan: async (
    vue: ElementVue,
    planId: string,
    type: PlanType,
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
      if (type === "temporary") {
        // 更新临时计划
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      } else if (type === "daily") {
        // 更新每日计划列表
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      completedPlanList.value = await Api.fetchPlanList(user, "completed");

      UI.showNotification(
        vue.$notify,
        "计划完成",
        "您可以在底部「已完成」中找到它",
        "success"
      );
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
   * @param type plan 的类型
   * @param temporaryPlanList 临时计划的列表，用于完成 Plan 后更新列表数据
   * @param dailyPlanList 每日计划的列表，用于完成 Plan 后更新列表数据
   */
  cancelCompletePlan: async (
    vue: ElementVue,
    planId: string,
    type: PlanType,
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
      if (type === "temporary") {
        // 更新临时计划
        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      } else if (type === "daily") {
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
  },
  /**
   * 编辑计划
   *
   * @param isPlanEditorDrawerDisplayed 传入 PlanEditor 的编辑抽屉菜单的控制变量
   * @param input_editingPlan 传入等待用户输入的 Plan 信息接收器 input_editingPlan
   * @param plan 传入选择的 Plan
   */
  editPlan: async (
    isPlanEditorDrawerDisplayed: Ref<boolean>,
    input_editingPlan: InputPlanType,
    plan: AV.Object
  ) => {
    // 打开抽屉菜单
    isPlanEditorDrawerDisplayed.value = true;

    // 初始化用户的输入
    input_editingPlan.id = plan.id;
    input_editingPlan.target = plan.attributes.target;
    input_editingPlan.name = plan.attributes.name;
    input_editingPlan.type = plan.attributes.type;
    input_editingPlan.isActived = plan.attributes.isActived;
    input_editingPlan.isFinished = plan.attributes.isFinished;
    input_editingPlan.abilityList = plan.attributes.abilityListOfPlan.map(
      (ability: AV.Object) => {
        return { id: ability.id, name: ability.attributes.name };
      }
    );
    input_editingPlan.targetList = plan.attributes.targetListOfPlan.map(
      (target: AV.Object) => {
        return { id: target.id, name: target.attributes.name };
      }
    );
  },
  /**
   * 保存计划
   *
   * @param vue ElementVue
   * @param isPlanEditorDrawerDisplayed 传入 PlanEditor 的编辑抽屉菜单的控制变量
   * @param input_editingPlan 用户输入的 Plan 信息接收器 input_editingPlan
   * @param temporaryPlanList 临时计划列表
   * @param dailyPlanList 每日计划列表
   * @param completedPlanList 已完成的计划列表
   */
  savePlan: async (
    vue: ElementVue,
    isPlanEditorDrawerDisplayed: Ref<boolean>,
    input_editingPlan: InputPlanType,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 如果没有定义每日目标，则不允许保存为「每日计划」
    if (input_editingPlan.type === "daily") {
      if (input_editingPlan.target === undefined) {
        UI.showNotification(vue.$notify, "请输入每日目标", "", "warning");
        return;
      }

      if (parseInt(input_editingPlan.target) < 0) {
        UI.showNotification(vue.$notify, "每日目标数不可为负数", "", "warning");
        input_editingPlan.target = "0";
        return;
      }
    }

    if (input_editingPlan.id !== undefined) {
      // 显示进度条
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在保存您的计划..."
      );

      // 尝试保存 Plan
      try {
        await Api.editPlan(
          input_editingPlan.id,
          input_editingPlan.name,
          Number(input_editingPlan.target),
          input_editingPlan.type,
          input_editingPlan.isActived,
          input_editingPlan.isFinished,
          input_editingPlan.abilityList.map(ability => ability.id),
          input_editingPlan.targetList.map(target => target.id)
        );

        temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
        completedPlanList.value = await Api.fetchPlanList(user, "completed");

        // 保存成功
        UI.hideLoading(loadingInstance);
        UI.showNotification(vue.$notify, "计划保存成功", "", "success");
        // 关闭窗口
        isPlanEditorDrawerDisplayed.value = false;
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "计划保存失败",
          `错误原因：${error.message},`,
          "error"
        );
      }
    } else {
      UI.showNotification(
        vue.$notify,
        "数据出错",
        "错误原因：input_editingPlan.id is undefined",
        "error"
      );
    }
  },
  /**
   * 删除计划
   * @param vue ElementVue
   * @param isPlanEditorDrawerDisplayed 传入 PlanEditor 的编辑抽屉菜单的控制变量
   * @param input_editingPlan 用户输入的 Plan 信息接收器 input_editingPlan
   * @param temporaryPlanList 临时计划列表
   * @param dailyPlanList 每日计划列表
   * @param completedPlanList 已完成的计划列表
   */
  deletePlan: async (
    vue: ElementVue,
    isPlanEditorDrawerDisplayed: Ref<boolean>,
    input_editingPlan: InputPlanType,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    if (input_editingPlan.id !== undefined) {
      // 弹窗询问用户是否确定删除
      try {
        await UI.showConfirm(
          vue.$confirm,
          "这将导致该计划及其背后的记录永久丢失",
          "是否确定删掉该计划"
        );

        // 确定删除
        // 显示进度条
        const loadingInstance = UI.showLoading(
          vue.$loading,
          "正在删除您的计划..."
        );

        // 尝试删除计划，并刷新列表
        try {
          await Api.deletePlan(input_editingPlan.id);

          temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
          dailyPlanList.value = await Api.fetchPlanList(user, "daily");
          completedPlanList.value = await Api.fetchPlanList(user, "completed");

          // 保存成功
          UI.hideLoading(loadingInstance);
          UI.showNotification(vue.$notify, "计划删除成功", "", "success");

          // 关闭窗口
          isPlanEditorDrawerDisplayed.value = false;
        } catch (error) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "计划删除失败",
            `错误原因：${error.message},`,
            "error"
          );
        }
      } catch (error) {
        // 取消删除
        // doing nothing
      }
    } else {
      UI.showNotification(
        vue.$notify,
        "数据出错",
        "错误原因：input_editingPlan.id is undefined",
        "error"
      );
    }
  },
  /**
   * 当用户拖动列表时进行调用
   * @param planList 用户拖动的列表
   */
  changePlanListOrder: async (planList: Ref<AV.Object[]>) => {
    const list: AV.Object[] = [];
    planList.value.forEach((plan, index) => {
      if (plan.attributes.order !== index && plan.id !== undefined) {
        const object = AV.Object.createWithoutData("Plan", plan.id).set(
          "order",
          index
        );
        list.push(object);
      }
    });
    await Api.savePlanList(list);
  },
  /**
   * 用户点击「关联相关能力」
   */
  relatedAbility: async (
    vue: ElementVue,
    isPlanRelateAbilityDrawerDisplayed: Ref<boolean>,
    input_abilityListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    // 打开抽屉菜单
    isPlanRelateAbilityDrawerDisplayed.value = true;

    if (input_editingPlan.id !== undefined) {
      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的能力"
      );

      try {
        input_abilityListOfPlan.value = await Api.fetchAbilityListWithPlanSelect(
          input_editingPlan.id
        );
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    } else {
      UI.showNotification(
        vue.$notify,
        "数据出错",
        "错误原因：input_editingPlan.id is undefined",
        "error"
      );
    }
  },
  /**
   * 用户点击「关联相关目标」
   */
  relatedTarget: async (
    vue: ElementVue,
    isPlanRelateTargetDrawerDisplayed: Ref<boolean>,
    input_targetListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    // 打开抽屉菜单
    isPlanRelateTargetDrawerDisplayed.value = true;

    if (input_editingPlan.id !== undefined) {
      // 尝试请求带有 selected 属性的 Target
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的目标"
      );

      try {
        input_targetListOfPlan.value = await Api.fetchTargetListWithPlanSelect(
          input_editingPlan.id
        );
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    } else {
      UI.showNotification(
        vue.$notify,
        "数据出错",
        "错误原因：input_editingPlan.id is undefined",
        "error"
      );
    }
  },
  /**
   * 创建一个 Ability
   * 会先创建一个 Ability，然后再刷新 Ability 列表，最后在清空输入框
   */
  createAbility: async (
    vue: ElementVue,
    input_abilityName: Ref<string>,
    input_abilityListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType,
    colormap: string[]
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 检测传入数据
    if (input_abilityName.value.length === 0) {
      // doing nothing
      return;
    }

    // 尝试请求带有 selected 属性的 Ability
    const loadingInstance = UI.showLoading(vue.$loading, "正在请求相关的能力");
    try {
      // 创建计划
      await Api.createAbility(
        input_abilityName.value,
        user,
        "",
        false,
        true,
        colormap
      );

      // 刷新能力列表
      if (input_editingPlan.id !== undefined) {
        try {
          input_abilityListOfPlan.value = await Api.fetchAbilityListWithPlanSelect(
            input_editingPlan.id
          );
          UI.hideLoading(loadingInstance);
        } catch (error) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "网络出错",
            `错误原因：${error.message}`,
            "error"
          );
        }
      } else {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingPlan.id is undefined",
          "error"
        );
      }

      input_abilityName.value = "";
    } catch (error) {
      UI.showNotification(
        vue.$notify,
        "创建计划失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },

  createTarget: async (
    vue: ElementVue,
    input_targetName: Ref<string>,
    input_targetListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType,
    colormap: string[]
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 检查传入数据
    if (input_targetName.value.length === 0) {
      // doing nothing
      return;
    }

    // 尝试请求带有 selected 属性的 Target
    const loadingInstance = UI.showLoading(vue.$loading, "正在请求相关的目标");

    try {
      // 创建目标
      await Api.createTarget(
        user,
        null,
        input_targetName.value,
        "",
        "indefinite",
        null,
        [],
        [],
        true,
        false,
        colormap
      );

      // 刷新目标列表
      if (input_editingPlan.id !== undefined) {
        try {
          input_targetListOfPlan.value = await Api.fetchTargetListWithPlanSelect(
            input_editingPlan.id
          );
          UI.hideLoading(loadingInstance);
        } catch (error) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "网络出错",
            `错误原因：${error.message}`,
            "error"
          );
        }
      } else {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingPlan.id is undefined",
          "error"
        );
      }

      input_targetName.value = "";
    } catch (error) {
      UI.showNotification(
        vue.$notify,
        "创建目标失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },

  /**
   * @TO-FIX
   */
  selectAbilityToCommit: (ability: {
    attributes: { selected: boolean; name: string };
  }) => {
    ability.attributes.selected = !ability.attributes.selected;

    // 下面的纯粹是因为前面选择了后不刷新
    const temp = ability.attributes.name;
    ability.attributes.name = "";
    ability.attributes.name = temp;
  },
  selectTargetToComit: (target: { attributes: { selected: boolean } }) => {
    target.attributes.selected = !target.attributes.selected;
  },
  /**
   * 将选择好的 Ability(input_abilityListOfPlan) 保存到 input_editingPlan 的 ablityList 中
   */
  saveSelectedAblityToEditingPlan: (
    isPlanRelateAbilityDrawerDisplayed: Ref<boolean>,
    input_abilityListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    isPlanRelateAbilityDrawerDisplayed.value = false;
    const list: { id: string; name: string }[] = [];
    input_abilityListOfPlan.value.forEach(ability => {
      if (ability.attributes.selected === true) {
        if (ability.id !== undefined) {
          list.push({
            id: ability.id,
            name: ability.attributes.name
          });
        }
      }
    });
    input_editingPlan.abilityList = list;
  },

  saveSelectedTargetToEditingPlan: (
    isPlanRelateTargetDrawerDisplayed: Ref<boolean>,
    input_targetListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    isPlanRelateTargetDrawerDisplayed.value = false;
    const list: { id: string; name: string }[] = [];
    input_targetListOfPlan.value.forEach(target => {
      if (target.attributes.selected === true) {
        if (target.id !== undefined) {
          list.push({
            id: target.id,
            name: target.attributes.name
          });
        }
      }
    });
    input_editingPlan.targetList = list;
  }
};

/**
 * 番茄计时器页
 */
const TomatoTimerPage = {
  /**
   * 点击番茄钟
   *
   * 使用场景：
   * 1. 点击「每日计划」上的「开始按钮」：
   * - 传入 plan
   * - 不传 isCommitPlanDrawerDisplayed
   * - 不传 input_tomatoName
   *
   * 2. 点击「底边栏」上的「开始按钮」：
   * - 不传入 plan
   * - 传入 isCommitPlanDrawerDisplayed
   * - 传入 input_tomatoName
   *
   * @param vue 还是绑定了 Element 后的 context.root
   * @param tomatoCloudStatus 这是番茄钟的状态，由外部引入
   * @param tomatoClockInterval 计时器实例，由外部引入
   * @param countDown 计时器表盘值，由外部引入
   * @param isCommitPlanDrawerDisplayed 控制「提交番茄」抽屉是否打开的变量
   * @param input_tomatoName 提交番茄用的番茄名称
   * @param plan 点击「每日计划」时，需传入的「被点击的计划」
   */
  clickTomatoClock: async (
    vue: ElementVue,
    tomatoCloudStatus: Ref<TomatoCloudStatus>,
    tomatoClockInterval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    isCommitPlanDrawerDisplayed: Ref<boolean> | null,
    input_tomatoName: Ref<string> | null,
    plan: AV.Object | null,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>,
    tomatoStartTime: Ref<Date>,
    input_tomatoDescription?: Ref<string>
  ) => {
    switch (tomatoCloudStatus.value) {
      case "prepared": {
        // 传入数据检测
        if (tomatoClockInterval.value !== null) {
          UI.showNotification(
            vue.$notify,
            "开始计时失败",
            "失败原因：计时器 (tomatoClockInterval) 不为 null",
            "error"
          );
          return;
        }

        // 记录开始的时间
        tomatoStartTime.value = new Date();

        // 选择传入的 Plan
        if (plan !== null) {
          plan.attributes.selected = true;
        }

        // 修改番茄钟的状态为「正在进行」
        tomatoCloudStatus.value = "processive";
        // 重设表盘值为 1500s（25 分钟）
        countDown.value = 1500;
        // 开始计时
        tomatoClockInterval.value = setInterval(() => {
          countDown.value--;
          if (countDown.value === 0 && tomatoClockInterval.value !== null) {
            clearInterval(tomatoClockInterval.value);
            tomatoCloudStatus.value = "finished";
            new Notification("番茄已完成", { body: "请提交您的番茄" });
          }
        }, 1);
        UI.showNotification(
          vue.$notify,
          "开始番茄",
          "请在接下来的 25 分钟保持专注",
          "success"
        );
        break;
      }
      case "finished": {
        if (plan !== null) {
          UI.showNotification(vue.$notify, "请先提交番茄", "", "warning");
          return;
        }
        if (isCommitPlanDrawerDisplayed !== null && input_tomatoName !== null) {
          isCommitPlanDrawerDisplayed.value = true;
          // 清空 input_tomatoName 的值
          input_tomatoName.value = "";
          if (input_tomatoDescription !== undefined) {
            input_tomatoDescription.value = "";
          }

          // 遍历 temporaryPlanList
          temporaryPlanList.value.forEach(plan => {
            if (plan.attributes.selected === true) {
              if (input_tomatoName.value.length === 0) {
                input_tomatoName.value = plan.attributes.name;
              } else {
                input_tomatoName.value =
                  input_tomatoName.value + " + " + plan.attributes.name;
              }
            }
          });

          // 遍历 dailyPlanList
          dailyPlanList.value.forEach(plan => {
            if (plan.attributes.selected === true) {
              if (input_tomatoName.value.length === 0) {
                input_tomatoName.value = plan.attributes.name;
              } else {
                input_tomatoName.value =
                  input_tomatoName.value + " + " + plan.attributes.name;
              }
            }
          });

          // 遍历 completedPlanList
          completedPlanList.value.forEach(plan => {
            if (plan.attributes.selected === true) {
              if (input_tomatoName.value.length === 0) {
                input_tomatoName.value = plan.attributes.name;
              } else {
                input_tomatoName.value =
                  input_tomatoName.value + " + " + plan.attributes.name;
              }
            }
          });
        }
        break;
      }
      case "processive": {
        if (tomatoClockInterval.value === null) {
          UI.showNotification(
            vue.$notify,
            "终止计时失败",
            "失败原因：计时器 (tomatoClockInterval) 为 null",
            "error"
          );
          return;
        }

        if (plan !== null) {
          UI.showNotification(
            vue.$notify,
            "您正在一个番茄之中",
            "请完成后再开始新的番茄",
            "warning"
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
          clearInterval(tomatoClockInterval.value);
          tomatoClockInterval.value = null;
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
   * @param tomatoClockInterval 计时器实例，由外部引入
   * @param countDown 计时器表盘值，由外部引入
   */
  abandonTomato: async (
    vue: ElementVue,
    tomatoCloudStatus: Ref<TomatoCloudStatus>,
    tomatoClockInterval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    isCommitPlanDrawerDisplayed: Ref<boolean>
  ) => {
    try {
      // 询问用户是否放弃番茄
      await UI.showConfirm(
        vue.$confirm,
        "您目前正在一个番茄工作实践中，要放弃这个番茄吗？",
        "放弃番茄"
      );
      // 放弃番茄
      tomatoCloudStatus.value = "prepared";
      tomatoClockInterval.value = null;
      countDown.value = 1500;
      isCommitPlanDrawerDisplayed.value = false;
    } catch (error) {
      // doing nothing
    }
  },
  /**
   * 操作 Plan 的临时属性 selected
   * @param plan 传入数据应为 Api.fetchPlanList() 返回数据的子项
   */
  selectPlanToCommit: (
    plan: {
      attributes: {
        selected: boolean;
      };
    },
    input_tomatoName: Ref<string>,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>
  ) => {
    // 修改 selected 的选择状态
    plan.attributes.selected = !plan.attributes.selected;

    // 清空 input_tomatoName 的值
    input_tomatoName.value = "";

    // 遍历 temporaryPlanList
    temporaryPlanList.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (input_tomatoName.value.length === 0) {
          input_tomatoName.value = plan.attributes.name;
        } else {
          input_tomatoName.value =
            input_tomatoName.value + " + " + plan.attributes.name;
        }
      }
    });

    // 遍历 dailyPlanList
    dailyPlanList.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (input_tomatoName.value.length === 0) {
          input_tomatoName.value = plan.attributes.name;
        } else {
          input_tomatoName.value =
            input_tomatoName.value + " + " + plan.attributes.name;
        }
      }
    });

    // 遍历 completedPlanList
    completedPlanList.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (input_tomatoName.value.length === 0) {
          input_tomatoName.value = plan.attributes.name;
        } else {
          input_tomatoName.value =
            input_tomatoName.value + " + " + plan.attributes.name;
        }
      }
    });
  },
  /**
   * 提交番茄
   */
  commitTomato: async (
    vue: ElementVue,
    tomatoCloudStatus: Ref<TomatoCloudStatus>,
    tomatoClockInterval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    isCommitPlanDrawerDisplayed: Ref<boolean>,
    input_tomatoName: Ref<string>,
    input_description: Ref<string>,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>,
    tomatoStartTime: Ref<Date>,
    colormap: string[]
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 检查传入参数
    if (input_tomatoName.value.length === 0) {
      UI.showNotification(
        vue.$notify,
        "提交番茄失败",
        "请选择您完成的任务，或手动输入做过的事",
        "warning"
      );
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在提交番茄");

    try {
      // 尝试提交番茄
      const tomato: AV.Object = await Api.createTomato(
        input_tomatoName.value,
        input_description.value,
        user,
        tomatoStartTime.value,
        colormap
      );

      // 遍历 PlanList 寻找被选择的 Plan
      const planIdList: string[] = [];

      temporaryPlanList.value.forEach(plan => {
        if (plan.attributes.selected === true && plan.id !== undefined) {
          planIdList.push(plan.id);
        }
      });

      dailyPlanList.value.forEach(plan => {
        if (plan.attributes.selected === true && plan.id !== undefined) {
          planIdList.push(plan.id);
        }
      });

      completedPlanList.value.forEach(plan => {
        if (plan.attributes.selected === true && plan.id !== undefined) {
          planIdList.push(plan.id);
        }
      });

      // 类型检测
      if (tomato.id === undefined) {
        throw "tomato.id === undefined";
      }

      // 创建 TomatoPlan
      await Api.createTomatoPlan(tomato.id, planIdList);

      // 结束 Loading
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "提交番茄成功", "", "success");

      // 更新番茄钟状态
      tomatoCloudStatus.value = "prepared";
      tomatoClockInterval.value = null;
      countDown.value = 1500;
      isCommitPlanDrawerDisplayed.value = false;

      // 清除用户的选择
      completedPlanList.value.forEach(plan => {
        plan.attributes.selected = false;
      });

      // 刷新更新的状态
      // 获取临时计划列表
      temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");

      // 获取每日计划列表
      dailyPlanList.value = await Api.fetchPlanList(user, "daily");

      // 获取已完成计划列表
      completedPlanList.value = await Api.fetchPlanList(user, "completed");
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "提交番茄失败",
        `错误原因：${error.message}`,
        "error"
      );
    }
  }
};

const TargetAbilityPage = {
  switchTab: (vue: ElementVue, target: TargetAbilityTabType) => {
    Router.replace(vue.$router, "/target-ability/" + target);
  }
};

/**
 * 目标页
 */
const TargetPage = {
  /**
   * 初始化 TargetPage
   *
   * @param vue ElementVue
   * @param unSubjectiveTargetList 目标列表
   * @param targetSubjectList 目标类别列表
   */
  init: async (
    vue: ElementVue,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 显示 loading
    const loadingInstance = UI.showLoading(vue.$loading, "正在获取目标列表");

    try {
      // 尝试获取目标列表
      unSubjectiveTargetList.value = await Api.fetchTargetList(
        user,
        "unsubjective"
      );

      // 尝试获取已完成的目标列表
      completedTargetList.value = await Api.fetchTargetList(user, "completed");

      // 尝试获取目标类别列表
      targetSubjectList.value = await Api.fetchTargetSubjectList(user);

      // 获取列表成功
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取目标列表失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 创建「目标」或「目标类别」
   *
   * @param vue ElementVue
   * @parma input_creatingTargetOrTargetSubject 用户输入的表单
   * @param isCreateTargetDrawerDisplayed 控制抽屉菜单的控制变量
   * @param unSubjectiveTargetList 全局变量：目标列表
   * @param targetSubjectList 全局变量：目标类别列表
   */
  createTargetOrTargetSubject: async (
    vue: ElementVue,
    input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    isCreateTargetDrawerDisplayed: Ref<boolean>,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>,
    colormap: string[]
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 判断是创建「目标」还是创建「目标类别」
    if (input_creatingTargetOrTargetSubject.inputType === "target") {
      // 如果是目标
      // 判断依赖条件：目标所属类别
      if (input_creatingTargetOrTargetSubject.target.targetSubjectId === "") {
        UI.showNotification(
          vue.$notify,
          "请选择一个目标所属类别",
          "",
          "warning"
        );
        return;
      }

      // 判断依赖条件：目标名称
      if (input_creatingTargetOrTargetSubject.target.name === "") {
        UI.showNotification(vue.$notify, "请输入目标名称", "", "warning");
        return;
      }

      // 判断依赖条件：达成目标所需条件
      if (input_creatingTargetOrTargetSubject.target.description === "") {
        UI.showNotification(
          vue.$notify,
          "请输入达成目标所需条件",
          "",
          "warning"
        );
        return;
      }

      // 判断依赖条件：目标有效期
      if (input_creatingTargetOrTargetSubject.target.validityType === "") {
        UI.showNotification(vue.$notify, "请选择目标有效期", "", "warning");
        return;
      }

      // 判断依赖条件：目标名称
      if (
        input_creatingTargetOrTargetSubject.target.validityType ===
          "time-bound" &&
        input_creatingTargetOrTargetSubject.target.validity === null
      ) {
        UI.showNotification(
          vue.$notify,
          "请输入预计达成目标的日期",
          "",
          "warning"
        );
        return;
      }

      // 显示进度条
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在创建您的目标..."
      );

      // 尝试保存 Target
      try {
        await Api.createTarget(
          user,
          input_creatingTargetOrTargetSubject.target.targetSubjectId,
          input_creatingTargetOrTargetSubject.target.name,
          input_creatingTargetOrTargetSubject.target.description,
          input_creatingTargetOrTargetSubject.target.validityType,
          input_creatingTargetOrTargetSubject.target.validity,
          input_creatingTargetOrTargetSubject.target.abilityList,
          input_creatingTargetOrTargetSubject.target.planList,
          input_creatingTargetOrTargetSubject.target.isActived,
          input_creatingTargetOrTargetSubject.target.isFinished,
          colormap
        );

        // 保存完成后，刷新 TargetList
        unSubjectiveTargetList.value = await Api.fetchTargetList(
          user,
          "unsubjective"
        );
        completedTargetList.value = await Api.fetchTargetList(
          user,
          "completed"
        );
        targetSubjectList.value = await Api.fetchTargetSubjectList(user);

        // 保存成功
        UI.hideLoading(loadingInstance);
        UI.showNotification(vue.$notify, "目标创建成功", "", "success");

        // 清除数据
        input_creatingTargetOrTargetSubject.inputType = "target";
        input_creatingTargetOrTargetSubject.target.targetSubjectId = "";
        input_creatingTargetOrTargetSubject.target.name = "";
        input_creatingTargetOrTargetSubject.target.description = "";
        input_creatingTargetOrTargetSubject.target.validityType = "";
        input_creatingTargetOrTargetSubject.target.validity = null;
        input_creatingTargetOrTargetSubject.target.abilityList = [];
        input_creatingTargetOrTargetSubject.target.isActived = true;
        input_creatingTargetOrTargetSubject.target.isFinished = false;
        input_creatingTargetOrTargetSubject.targetSubject.name = "";

        // 关闭窗口
        isCreateTargetDrawerDisplayed.value = false;
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "目标创建失败",
          `错误原因：${error.message}`,
          "error"
        );
      }
    } else if (
      input_creatingTargetOrTargetSubject.inputType === "targetSubject"
    ) {
      // 如果是目标类别
      // 判断依赖条件：目标名称
      if (input_creatingTargetOrTargetSubject.targetSubject.name === "") {
        UI.showNotification(vue.$notify, "请输入目标类别名称", "", "warning");
        return;
      }

      // 显示进度条
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在创建您的目标类别..."
      );

      // 尝试保存 TargetSubject
      try {
        await Api.createTargetSubject(
          user,
          input_creatingTargetOrTargetSubject.targetSubject.name
        );

        // 保存完成后，刷新 TargetSubjectList
        targetSubjectList.value = await Api.fetchTargetSubjectList(user);

        // 保存成功
        UI.hideLoading(loadingInstance);
        UI.showNotification(vue.$notify, "目标类别创建成功", "", "success");

        // 清除数据
        input_creatingTargetOrTargetSubject.inputType = "target";
        input_creatingTargetOrTargetSubject.target.targetSubjectId = "";
        input_creatingTargetOrTargetSubject.target.name = "";
        input_creatingTargetOrTargetSubject.target.description = "";
        input_creatingTargetOrTargetSubject.target.validityType = "";
        input_creatingTargetOrTargetSubject.target.validity = null;
        input_creatingTargetOrTargetSubject.target.abilityList = [];
        input_creatingTargetOrTargetSubject.target.isActived = true;
        input_creatingTargetOrTargetSubject.target.isFinished = false;
        input_creatingTargetOrTargetSubject.targetSubject.name = "";

        // 关闭窗口
        isCreateTargetDrawerDisplayed.value = false;
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "目标类别创建失败",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },
  /**
   * 打开「目标」编辑抽屉
   */
  openTargetEditDrawer: async (
    isEditTargetDrawerDisplayed: Ref<boolean>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    target: AV.Object
  ) => {
    // 打开抽屉菜单
    isEditTargetDrawerDisplayed.value = true;

    // 初始化用户的输入
    input_editingTargetOrTargetSubject.inputType = "target";
    input_editingTargetOrTargetSubject.target.id = target.id;
    input_editingTargetOrTargetSubject.target.targetSubjectId =
      target.attributes.targetSubject === undefined ||
      target.attributes.targetSubject === null
        ? null
        : target.attributes.targetSubject.id;
    input_editingTargetOrTargetSubject.target.name = target.attributes.name;
    input_editingTargetOrTargetSubject.target.description =
      target.attributes.description;
    input_editingTargetOrTargetSubject.target.validityType =
      target.attributes.validityType;
    input_editingTargetOrTargetSubject.target.validity =
      target.attributes.validity;
    input_editingTargetOrTargetSubject.target.abilityList = target.attributes.abilityListOfTarget.map(
      (ability: AV.Object) => {
        return { id: ability.id, name: ability.attributes.name };
      }
    );
    input_editingTargetOrTargetSubject.target.planList = target.attributes.planListOfTarget.map(
      (plan: AV.Object) => {
        return { id: plan.id, name: plan.attributes.name };
      }
    );
    input_editingTargetOrTargetSubject.target.isActived =
      target.attributes.isActived;
    input_editingTargetOrTargetSubject.target.isFinished =
      target.attributes.isFinished;
  },
  /**
   * 打开「目标目录」编辑抽屉
   */
  openTargetSubjectEditDrawer: async (
    isEditTargetDrawerDisplayed: Ref<boolean>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    targetSubject: AV.Object
  ) => {
    // 打开抽屉菜单
    isEditTargetDrawerDisplayed.value = true;

    // 初始化用户的输入
    input_editingTargetOrTargetSubject.inputType = "targetSubject";
    input_editingTargetOrTargetSubject.targetSubject.id = targetSubject.id;
    input_editingTargetOrTargetSubject.targetSubject.name =
      targetSubject.attributes.name;
  },
  openTargetSubjectCreateDrawer: async (
    isCreateTargetDrawerDisplayed: Ref<boolean>,
    input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType
  ) => {
    // 打开抽屉菜单
    isCreateTargetDrawerDisplayed.value = true;

    // 初始化用户的输入
    input_creatingTargetOrTargetSubject.inputType = "target";
    input_creatingTargetOrTargetSubject.target.id = "";
    input_creatingTargetOrTargetSubject.target.targetSubjectId = "";
    input_creatingTargetOrTargetSubject.target.name = "";
    input_creatingTargetOrTargetSubject.target.description = "";
    input_creatingTargetOrTargetSubject.target.validityType = "";
    input_creatingTargetOrTargetSubject.target.validity = null;
    input_creatingTargetOrTargetSubject.target.abilityList = [];
    input_creatingTargetOrTargetSubject.target.isActived = true;
    input_creatingTargetOrTargetSubject.target.isFinished = false;
    input_creatingTargetOrTargetSubject.targetSubject.id = "";
    input_creatingTargetOrTargetSubject.targetSubject.name = "";
  },
  /**
   * 打开「关联相关能力」编辑抽屉
   */
  openRelateAbilityDrawer: async (
    vue: ElementVue,
    isTargetRelateAbilityDrawerDisplayed: Ref<boolean>,
    input_abilityListOfTarget: Ref<AV.Object[]>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType | null,
    input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 打开抽屉菜单
    isTargetRelateAbilityDrawerDisplayed.value = true;

    // 初始化 input_abilityListOfTarget
    if (
      input_editingTargetOrTargetSubject === null &&
      input_creatingTargetOrTargetSubject === null
    ) {
      isTargetRelateAbilityDrawerDisplayed.value = false;
      UI.showNotification(
        vue.$notify,
        "出现错误",
        "input_editingTargetOrTargetSubject and input_creatingTargetOrTargetSubject both is null",
        "error"
      );
      return;
    }

    // 编辑目标
    if (input_editingTargetOrTargetSubject !== null) {
      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的能力"
      );

      try {
        if (input_editingTargetOrTargetSubject.target.id !== undefined) {
          input_abilityListOfTarget.value = await Api.fetchAbilityListWithTargetSelect(
            input_editingTargetOrTargetSubject.target.id
          );
          UI.hideLoading(loadingInstance);
        } else {
          UI.showNotification(
            vue.$notify,
            "出现错误",
            "input_editingTargetOrTargetSubject.target.id is undefined",
            "error"
          );
          UI.hideLoading(loadingInstance);
        }
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }

    // 创建目标
    else if (input_creatingTargetOrTargetSubject !== null) {
      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的能力"
      );

      try {
        const tempList = await Api.fetchAbilityList(user, false);
        input_abilityListOfTarget.value = tempList.map(item => {
          item.attributes.selected = false;
          return item;
        });

        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },

  /**
   * 打开「关联相关计划」编辑抽屉
   */
  openRelatePlanDrawer: async (
    vue: ElementVue,
    isTargetRelatePlanDrawerDisplayed: Ref<boolean>,
    input_planListOfTarget: Ref<AV.Object[]>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType | null,
    input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 打开抽屉菜单
    isTargetRelatePlanDrawerDisplayed.value = true;

    // 初始化 input_abilityListOfTarget
    if (
      input_editingTargetOrTargetSubject === null &&
      input_creatingTargetOrTargetSubject === null
    ) {
      isTargetRelatePlanDrawerDisplayed.value = false;
      UI.showNotification(
        vue.$notify,
        "出现错误",
        "input_editingTargetOrTargetSubject and input_creatingTargetOrTargetSubject both is null",
        "error"
      );
      return;
    }

    // 编辑目标
    if (input_editingTargetOrTargetSubject !== null) {
      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的计划"
      );

      try {
        if (input_editingTargetOrTargetSubject.target.id !== undefined) {
          input_planListOfTarget.value = await Api.fetchPlanListWithTargetSelect(
            input_editingTargetOrTargetSubject.target.id
          );
          UI.hideLoading(loadingInstance);
        } else {
          UI.showNotification(
            vue.$notify,
            "出现错误",
            "input_editingTargetOrTargetSubject.target.id is undefined",
            "error"
          );
          UI.hideLoading(loadingInstance);
        }
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }

    // 创建目标
    else if (input_creatingTargetOrTargetSubject !== null) {
      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的计划"
      );

      try {
        input_planListOfTarget.value = await Api.fetchPlanListWithSelect(user);

        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },
  /**
   * 删除「目标」或「目标目录」
   */
  deleteTargetOrTargetSubject: async (
    vue: ElementVue,
    isEditTargetDrawerDisplayed: Ref<boolean>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    if (input_editingTargetOrTargetSubject.inputType === "target") {
      deleteTarget(
        vue,
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    } else if (
      input_editingTargetOrTargetSubject.inputType === "targetSubject"
    ) {
      deleteTargetSubject(
        vue,
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    }

    async function deleteTarget(
      vue: ElementVue,
      isEditTargetDrawerDisplayed: Ref<boolean>,
      input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
      unSubjectiveTargetList: Ref<AV.Object[]>,
      targetSubjectList: Ref<AV.Object[]>,
      completedTargetList: Ref<AV.Object[]>
    ) {
      if (input_editingTargetOrTargetSubject.target.id !== undefined) {
        // 弹窗询问用户是否确定删除
        try {
          await UI.showConfirm(
            vue.$confirm,
            "这将导致该目标及其背后的记录永久丢失",
            "是否确定删掉该目标"
          );

          // 确认删除
          // 显示进度条
          const loadingInstance = UI.showLoading(
            vue.$loading,
            "正在删除您的目标..."
          );

          // 尝试删除目标，并刷新列表
          try {
            await Api.deleteTarget(
              input_editingTargetOrTargetSubject.target.id
            );

            // 尝试获取已完成的目标列表
            completedTargetList.value = await Api.fetchTargetList(
              user,
              "completed"
            );
            // 尝试获取未分类的目标列表
            unSubjectiveTargetList.value = await Api.fetchTargetList(
              user,
              "unsubjective"
            );
            // 尝试获取目标类别列表
            targetSubjectList.value = await Api.fetchTargetSubjectList(user);

            // 保存成功
            UI.hideLoading(loadingInstance);
            UI.showNotification(vue.$notify, "目标删除成功", "", "success");

            // 关闭窗口
            isEditTargetDrawerDisplayed.value = false;
          } catch (error) {
            UI.hideLoading(loadingInstance);
            UI.showNotification(
              vue.$notify,
              "目标删除失败",
              `错误原因：${error.message},`,
              "error"
            );
          }
        } catch (error) {
          // 取消删除
          // doing nothing
        }
      } else {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "input_editingTargetOrTargetSubject.target.id is undefined",
          "error"
        );
      }
    }

    async function deleteTargetSubject(
      vue: ElementVue,
      isEditTargetDrawerDisplayed: Ref<boolean>,
      input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
      unSubjectiveTargetList: Ref<AV.Object[]>,
      targetSubjectList: Ref<AV.Object[]>,
      completedTargetList: Ref<AV.Object[]>
    ) {
      if (input_editingTargetOrTargetSubject.targetSubject.id !== undefined) {
        // 弹窗询问用户是否确定删除
        try {
          await UI.showConfirm(
            vue.$confirm,
            "这将导致该目标目录下的目标变为无目录目标",
            "是否确定删掉该目标目录"
          );

          // 确认删除
          // 显示进度条
          const loadingInstance = UI.showLoading(
            vue.$loading,
            "正在删除您的目标目录..."
          );

          // 尝试删除目标目录，并刷新列表
          try {
            await Api.deleteTargetSubject(
              input_editingTargetOrTargetSubject.targetSubject.id
            );

            // 请求刷新对应的列表

            // 尝试获取未分类的目标列表
            unSubjectiveTargetList.value = await Api.fetchTargetList(
              user,
              "unsubjective"
            );
            // 尝试获取目标类别列表
            targetSubjectList.value = await Api.fetchTargetSubjectList(user);

            // 保存成功
            UI.hideLoading(loadingInstance);
            UI.showNotification(vue.$notify, "目标目录删除成功", "", "success");

            // 关闭窗口
            isEditTargetDrawerDisplayed.value = false;
          } catch (error) {
            UI.hideLoading(loadingInstance);
            UI.showNotification(
              vue.$notify,
              "目标目录删除失败",
              `错误原因：${error.message},`,
              "error"
            );
          }
        } catch (error) {
          // 取消删除
          // doing nothing
        }
      } else {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "input_editingTargetOrTargetSubject.targetSubject.id is undefined",
          "error"
        );
      }
    }
  },
  /**
   * 保存「目标」或「目标目录」
   */
  saveTargetOrTargetSubject: async (
    vue: ElementVue,
    isEditTargetDrawerDisplayed: Ref<boolean>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    if (input_editingTargetOrTargetSubject.inputType === "target") {
      saveTarget(
        vue,
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    } else if (
      input_editingTargetOrTargetSubject.inputType === "targetSubject"
    ) {
      saveTargetSubject(
        vue,
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        targetSubjectList
      );
    }

    async function saveTarget(
      vue: ElementVue,
      isEditTargetDrawerDisplayed: Ref<boolean>,
      input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
      unSubjectiveTargetList: Ref<AV.Object[]>,
      targetSubjectList: Ref<AV.Object[]>,
      completedTargetList: Ref<AV.Object[]>
    ) {
      if (input_editingTargetOrTargetSubject.target.id !== undefined) {
        // 判断依赖条件：目标所属类别
        if (input_editingTargetOrTargetSubject.target.targetSubjectId === "") {
          UI.showNotification(
            vue.$notify,
            "请选择一个目标所属类别",
            "",
            "warning"
          );
          return;
        }

        // 判断依赖条件：目标名称
        if (input_editingTargetOrTargetSubject.target.name === "") {
          UI.showNotification(vue.$notify, "请输入目标名称", "", "warning");
          return;
        }

        // 判断依赖条件：达成目标所需条件
        if (input_editingTargetOrTargetSubject.target.description === "") {
          UI.showNotification(
            vue.$notify,
            "请输入达成目标所需条件",
            "",
            "warning"
          );
          return;
        }

        // 判断依赖条件：目标有效期
        if (input_editingTargetOrTargetSubject.target.validityType === "") {
          UI.showNotification(vue.$notify, "请选择目标有效期", "", "warning");
          return;
        }

        // 判断依赖条件：目标名称
        if (
          input_editingTargetOrTargetSubject.target.validityType ===
            "time-bound" &&
          input_editingTargetOrTargetSubject.target.validity === null
        ) {
          UI.showNotification(
            vue.$notify,
            "请输入预计达成目标的日期",
            "",
            "warning"
          );
          return;
        }

        // 显示进度条
        const loadingInstance = UI.showLoading(
          vue.$loading,
          "正在保存您的目标..."
        );

        // 尝试保存 Target
        try {
          await Api.saveTarget(
            input_editingTargetOrTargetSubject.target.id,
            user,
            input_editingTargetOrTargetSubject.target.targetSubjectId,
            input_editingTargetOrTargetSubject.target.name,
            input_editingTargetOrTargetSubject.target.description,
            input_editingTargetOrTargetSubject.target.validityType,
            input_editingTargetOrTargetSubject.target.validity,
            input_editingTargetOrTargetSubject.target.abilityList,
            input_editingTargetOrTargetSubject.target.planList,
            input_editingTargetOrTargetSubject.target.isActived,
            input_editingTargetOrTargetSubject.target.isFinished
          );

          // 尝试获取已完成的目标列表
          completedTargetList.value = await Api.fetchTargetList(
            user,
            "completed"
          );

          // 尝试获取未分类的目标列表
          unSubjectiveTargetList.value = await Api.fetchTargetList(
            user,
            "unsubjective"
          );

          // 尝试获取目标类别列表
          targetSubjectList.value = await Api.fetchTargetSubjectList(user);

          // 保存成功
          UI.hideLoading(loadingInstance);
          UI.showNotification(vue.$notify, "目标保存成功", "", "success");

          // 关闭窗口
          isEditTargetDrawerDisplayed.value = false;
        } catch (error) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "目标保存失败",
            `错误原因：${error.message},`,
            "error"
          );
        }
      } else {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingTargetOrTargetSubject.target.id is undefined",
          "error"
        );
      }
    }

    async function saveTargetSubject(
      vue: ElementVue,
      isEditTargetDrawerDisplayed: Ref<boolean>,
      input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
      targetSubjectList: Ref<AV.Object[]>
    ) {
      if (input_editingTargetOrTargetSubject.targetSubject.id !== undefined) {
        // 如果是目标类别
        // 判断依赖条件：目标名称
        if (input_editingTargetOrTargetSubject.targetSubject.name === "") {
          UI.showNotification(vue.$notify, "请输入目标类别名称", "", "warning");
          return;
        }

        // 显示进度条
        const loadingInstance = UI.showLoading(
          vue.$loading,
          "正在保存您的目标类别..."
        );

        // 尝试保存 TargetSubject
        try {
          await Api.saveTargetSubject(
            input_editingTargetOrTargetSubject.targetSubject.id,
            user,
            input_editingTargetOrTargetSubject.targetSubject.name
          );

          // 刷新列表
          targetSubjectList.value = await Api.fetchTargetSubjectList(user);

          // 保存成功
          UI.hideLoading(loadingInstance);
          UI.showNotification(vue.$notify, "目标目录保存成功", "", "success");

          // 关闭窗口
          isEditTargetDrawerDisplayed.value = false;
        } catch (error) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "目标保存失败",
            `错误原因：${error.message},`,
            "error"
          );
        }
      } else {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingTargetOrTargetSubject.targetSubject.id is undefined",
          "error"
        );
      }
    }
  },
  /**
   * 保存 TargetList 的优先级
   */
  changeTargetListOrder: async (targetList: AV.Object[]) => {
    const list: AV.Object[] = [];
    targetList.forEach((target, index) => {
      if (target.attributes.order !== index && target.id !== undefined) {
        const object = AV.Object.createWithoutData("Target", target.id).set(
          "order",
          index
        );
        list.push(object);
      }
    });
    await Api.saveTargetList(list);
  },
  /**
   * 保存 TargetSubjectList 的优先级
   */
  changeTargetSubjectListOrder: async (targetSubjectList: AV.Object[]) => {
    const list: AV.Object[] = [];
    targetSubjectList.forEach((targetSubject, index) => {
      if (
        targetSubject.attributes.order !== index &&
        targetSubject.id !== undefined
      ) {
        const object = AV.Object.createWithoutData(
          "TargetSubject",
          targetSubject.id
        ).set("order", index);
        list.push(object);
      }
    });
    await Api.saveTargetSubjectList(list);
  },
  /**
   * 选择 Ability Item
   */
  selectAbilityToCommit: (ability: { attributes: { selected: boolean } }) => {
    ability.attributes.selected = !ability.attributes.selected;
  },
  /**
   * 保存 Ability 的选择结果到创建 Target 的用户输入中
   */
  saveSelectedAbilityToCreatingOrEditingTarget: (
    isTargetRelateAbilityDrawerDisplayed: Ref<boolean>,
    input_abilityListOfTarget: Ref<AV.Object[]>,
    input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType
  ) => {
    // 关闭抽屉菜单
    isTargetRelateAbilityDrawerDisplayed.value = false;

    // 给 input_creatingTarget.target.abilityList 赋值
    const list: { id: string; name: string }[] = [];
    input_abilityListOfTarget.value.forEach(ability => {
      if (ability.attributes.selected === true) {
        if (ability.id !== undefined) {
          list.push({
            id: ability.id,
            name: ability.attributes.name
          });
        }
      }
    });
    input_creatingTargetOrTargetSubject.target.abilityList = list;
    input_editingTargetOrTargetSubject.target.abilityList = list;
  },
  /**
   * 保存 Plan 的选择结果到创建 Target 的用户输入中
   */
  saveSelectedPlanToCreatingOrEditingTarget: (
    isTargetRelatePlanDrawerDisplayed: Ref<boolean>,
    input_planListOfTarget: Ref<AV.Object[]>,
    input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType
  ) => {
    // 关闭抽屉菜单
    isTargetRelatePlanDrawerDisplayed.value = false;

    // 给 input_creatingTarget.target.abilityList 赋值
    const list: { id: string; name: string }[] = [];
    input_planListOfTarget.value.forEach(target => {
      if (target.attributes.selected === true) {
        if (target.id !== undefined) {
          list.push({
            id: target.id,
            name: target.attributes.name
          });
        }
      }
    });

    input_creatingTargetOrTargetSubject.target.planList = list;
    input_editingTargetOrTargetSubject.target.planList = list;
  },
  /**
   * 创建能力（在关联能力的框里）
   * @param input_abilityName 需要创建的能力的名称
   * @param input_abilityListOfTarget 需要让用户选择的能力列表（可多选）
   * @param input_editingTargetOrTargetSubject 如果传入数据，则是编辑目标；不传入数据就是创建目标
   */
  createAbility: async (
    vue: ElementVue,
    input_abilityName: Ref<string>,
    input_abilityListOfTarget: Ref<AV.Object[]>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType | null,
    colormap: string[]
  ) => {
    if (input_editingTargetOrTargetSubject !== null) {
      createAbilityInEditTarget(
        vue,
        input_abilityName,
        input_abilityListOfTarget,
        input_editingTargetOrTargetSubject,
        colormap
      );
    } else {
      createAbilityInCreateTarget(
        vue,
        input_abilityName,
        input_abilityListOfTarget,
        colormap
      );
    }

    async function createAbilityInEditTarget(
      vue: ElementVue,
      input_abilityName: Ref<string>,
      input_abilityListOfTarget: Ref<AV.Object[]>,
      input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType,
      colormap: string[]
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_abilityName.value.length === 0) {
        // doing nothing
        return;
      }

      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(vue.$loading, "正在创建能力...");

      try {
        // 创建计划
        await Api.createAbility(
          input_abilityName.value,
          user,
          "",
          false,
          true,
          colormap
        );

        // 刷新能力列表
        if (input_editingTargetOrTargetSubject.target.id !== undefined) {
          try {
            input_abilityListOfTarget.value = await Api.fetchAbilityListWithTargetSelect(
              input_editingTargetOrTargetSubject.target.id
            );
            UI.hideLoading(loadingInstance);
            input_abilityName.value = "";
          } catch (error) {
            UI.hideLoading(loadingInstance);
            UI.showNotification(
              vue.$notify,
              "网络出错",
              `错误原因：${error.message}`,
              "error"
            );
          }
        } else {
          UI.showNotification(
            vue.$notify,
            "数据出错",
            "错误原因：input_editingTargetOrTargetSubject.target.id is undefined",
            "error"
          );
        }
      } catch (error) {
        UI.showNotification(
          vue.$notify,
          "创建计划失败",
          `失败原因：${error.message}`,
          "error"
        );
      }
    }

    async function createAbilityInCreateTarget(
      vue: ElementVue,
      input_abilityName: Ref<string>,
      input_abilityListOfTarget: Ref<AV.Object[]>,
      colormap: string[]
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_abilityName.value.length === 0) {
        // doing nothing
        return;
      }

      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的能力"
      );

      try {
        // 创建能力
        await Api.createAbility(
          input_abilityName.value,
          user,
          "",
          false,
          true,
          colormap
        );

        // 刷新能力列表
        input_abilityListOfTarget.value = await Api.fetchAbilityList(
          user,
          false,
          true
        );

        UI.hideLoading(loadingInstance);
        input_abilityName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },
  /**
   * 在 Target 关联 Plan 的抽屉菜单中创建 Plan
   */
  createPlan: async (
    vue: ElementVue,
    input_planName: Ref<string>,
    input_planListOfTarget: Ref<AV.Object[]>,
    input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType | null
  ) => {
    if (input_editingTargetOrTargetSubject !== null) {
      createPlanInEditTarget(
        vue,
        input_planName,
        input_planListOfTarget,
        input_editingTargetOrTargetSubject
      );
    } else {
      createPlanInCreateTarget(vue, input_planName, input_planListOfTarget);
    }
    async function createPlanInEditTarget(
      vue: ElementVue,
      input_planName: Ref<string>,
      input_planListOfTarget: Ref<AV.Object[]>,
      input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_planName.value.length === 0) {
        // doing nothing
        return;
      }

      if (input_editingTargetOrTargetSubject.target.id === undefined) {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingTargetOrTargetSubject.target.id === undefined",
          "error"
        );
        return;
      }

      // 尝试创建新 Plan
      const loadingInstance = UI.showLoading(vue.$loading, "正在创建计划...");

      try {
        await Api.createPlan(input_planName.value, "daily", user);

        // 刷新能力列表
        input_planListOfTarget.value = await Api.fetchPlanListWithTargetSelect(
          input_editingTargetOrTargetSubject.target.id
        );

        UI.hideLoading(loadingInstance);
        // 清空输入框
        input_planName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
    async function createPlanInCreateTarget(
      vue: ElementVue,
      input_planName: Ref<string>,
      input_planListOfTarget: Ref<AV.Object[]>
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_planName.value.length === 0) {
        // doing nothing
        return;
      }

      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在创建您的计划..."
      );

      try {
        // 创建计划
        await Api.createPlan(input_planName.value, "daily", user);

        // 刷新计划列表
        input_planListOfTarget.value = await Api.fetchPlanListWithSelect(user);

        UI.hideLoading(loadingInstance);

        input_planName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },
  /**
   * 完成一个 目标
   */
  finishTarget: async (
    vue: ElementVue,
    target: AV.Object,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 确认
    try {
      await UI.showConfirm(
        vue.$confirm,
        `您是否已经达成：${target.attributes.description}`,
        `完成目标：${target.attributes.name}`
      );

      const loadingInstance = UI.showLoading(vue.$loading, "正在完成该目标");

      try {
        // 已完成该目标
        if (target.id !== undefined) {
          await Api.finishTarget(target.id, true);

          // 刷新列表
          // 尝试获取已完成的目标列表
          completedTargetList.value = await Api.fetchTargetList(
            user,
            "completed"
          );

          // 尝试获取未分类的目标列表
          unSubjectiveTargetList.value = await Api.fetchTargetList(
            user,
            "unsubjective"
          );

          // 尝试获取目标类别列表
          targetSubjectList.value = await Api.fetchTargetSubjectList(user);

          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            `完成目标：${target.attributes.name}`,
            "继续向下一个目标进发吧！",
            "success"
          );
        } else {
          UI.showNotification(
            vue.$notify,
            "数据出错",
            `target.id is undefined`,
            "error"
          );
        }
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    } catch (error) {
      // 未完成该目标
    }
  },
  /**
   * 取消完成一个目标
   */
  unFinishedTarget: async (
    vue: ElementVue,
    target: AV.Object,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    if (target.id !== undefined) {
      const loadingInstance = UI.showLoading(vue.$loading, "正在刷新...");
      try {
        await Api.finishTarget(target.id, false);

        // 刷新列表
        // 尝试获取已完成的目标列表
        completedTargetList.value = await Api.fetchTargetList(
          user,
          "completed"
        );

        // 尝试获取未分类的目标列表
        unSubjectiveTargetList.value = await Api.fetchTargetList(
          user,
          "unsubjective"
        );

        // 尝试获取目标类别列表
        targetSubjectList.value = await Api.fetchTargetSubjectList(user);
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    } else {
      UI.showNotification(
        vue.$notify,
        "数据出错",
        `target.id is undefined`,
        "error"
      );
    }
  }
};

/**
 * 能力页
 */
const AbilityPage = {
  /**
   * 初始化 AbilityList
   *
   * @param vue ElementVue
   * @param abilityList 能力列表
   * @param levelRuleList 等级列表
   */
  init: async (
    vue: ElementVue,
    abilityList: Ref<AV.Object[]>,
    levelRuleList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 显示 loading
    const loadingInstance = UI.showLoading(vue.$loading, "正在获取能力列表...");

    try {
      if (levelRuleList.value.length === 0) {
        levelRuleList.value = await Api.fetchLevelRuleList();
      }

      // 尝试获取能力列表
      abilityList.value = await Api.fetchAbilityList(
        user,
        false,
        true,
        levelRuleList.value,
        true,
        true
      );

      // 获取列表成功
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取能力列表失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },

  /**
   * 打开编辑能力的抽屉菜单
   */
  openAbilityEditDrawer: async (
    isEditAbilityDrawerDisplayed: Ref<boolean>,
    input_editingAbility: InputAbilityType,
    ability: AV.Object
  ) => {
    // 打开抽屉菜单
    isEditAbilityDrawerDisplayed.value = true;

    // 初始化用户的输入
    input_editingAbility.id = ability.id;
    input_editingAbility.name = ability.attributes.name;
    input_editingAbility.isActived = ability.attributes.isActived;
    input_editingAbility.isFinished = ability.attributes.isFinished;
    input_editingAbility.planList = ability.attributes.planListOfAbility.map(
      (plan: AV.Object) => {
        return { id: plan.id, name: plan.attributes.name };
      }
    );
    input_editingAbility.targetList = ability.attributes.targetListOfAbility.map(
      (target: AV.Object) => {
        return { id: target.id, name: target.attributes.name };
      }
    );
  },

  /**
   * 打开创建能力的抽屉菜单
   */
  openAbilityCreateDrawer: async (
    isCreateAbilityDrawerDisplayed: Ref<boolean>,
    input_creatingAbility: InputAbilityType
  ) => {
    // 打开抽屉菜单
    isCreateAbilityDrawerDisplayed.value = true;

    // 初始化用户的输入
    input_creatingAbility.id = undefined;
    input_creatingAbility.name = "";
    input_creatingAbility.isActived = true;
    input_creatingAbility.isFinished = false;
    input_creatingAbility.planList = [];
    input_creatingAbility.targetList = [];
  },

  /**
   * 删除正在编辑的能力
   */
  deleteAbility: async (
    vue: ElementVue,
    isEditAbilityDrawerDisplayed: Ref<boolean>,
    input_editingAbility: InputAbilityType,
    abilityList: Ref<AV.Object[]>,
    levelRuleList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    if (input_editingAbility.id !== undefined) {
      // 弹窗询问用户是否确定删除
      try {
        await UI.showConfirm(
          vue.$confirm,
          "这将导致该能力及其背后的记录永久丢失",
          "是否确定删掉该能力"
        );

        // 确定删除
        // 显示进度条
        const loadingInstance = UI.showLoading(
          vue.$loading,
          "正在删除您的能力..."
        );

        // 尝试删除计划，并刷新列表
        try {
          await Api.deleteAbility(input_editingAbility.id);

          if (levelRuleList.value.length === 0) {
            levelRuleList.value = await Api.fetchLevelRuleList();
          }

          // 尝试获取能力列表
          abilityList.value = await Api.fetchAbilityList(
            user,
            false,
            true,
            levelRuleList.value,
            true,
            true
          );

          // 保存成功
          UI.hideLoading(loadingInstance);
          UI.showNotification(vue.$notify, "能力删除成功", "", "success");

          // 关闭窗口
          isEditAbilityDrawerDisplayed.value = false;
        } catch (error) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "能力删除失败",
            `错误原因：${error.message},`,
            "error"
          );
        }
      } catch (error) {
        // 取消删除
        // doing nothing
      }
    } else {
      UI.showNotification(
        vue.$notify,
        "数据出错",
        "错误原因：input_editingAbility.id is undefined",
        "error"
      );
    }
  },

  /**
   * 保存正在编辑的能力
   */
  saveAbility: async (
    vue: ElementVue,
    isEditAbilityDrawerDisplayed: Ref<boolean>,
    input_editingAbility: InputAbilityType,
    abilityList: Ref<AV.Object[]>,
    levelRuleList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 输入检测
    if (input_editingAbility.id === undefined) {
      UI.showNotification(
        vue.$notify,
        "能力保存失败",
        "错误原因：input_editingAbility.id === undefined",
        "error"
      );
      return;
    }

    // 输入检测
    if (input_editingAbility.name.length === 0) {
      UI.showNotification(vue.$notify, "请输入能力名称", "", "warning");
      return;
    }

    // 尝试保存 AbilityPage
    const loadingInstance = UI.showLoading(vue.$loading, "正在保存您的能力...");

    try {
      await Api.saveAbility(
        input_editingAbility.id,
        input_editingAbility.name,
        input_editingAbility.planList.map(plan => plan.id),
        input_editingAbility.targetList.map(target => target.id),
        input_editingAbility.isActived,
        input_editingAbility.isFinished
      );

      if (levelRuleList.value.length === 0) {
        levelRuleList.value = await Api.fetchLevelRuleList();
      }

      // 尝试获取能力列表
      abilityList.value = await Api.fetchAbilityList(
        user,
        false,
        true,
        levelRuleList.value,
        true,
        true
      );

      // 保存成功
      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "能力保存成功", "", "success");

      // 关闭窗口
      isEditAbilityDrawerDisplayed.value = false;
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "能力保存失败",
        `错误原因：${error.message},`,
        "error"
      );
    }
  },

  /**
   * 创建 Target
   */
  createTarget: async (
    vue: ElementVue,
    input_targetName: Ref<string>,
    input_targetListOfAbility: Ref<AV.Object[]>,
    input_editingAbility: InputAbilityType | null,
    colormap: string[]
  ) => {
    if (input_editingAbility !== null) {
      createTargetInEditAbility(
        vue,
        input_targetName,
        input_targetListOfAbility,
        input_editingAbility,
        colormap
      );
    } else {
      createTargetInCreateAbility(
        vue,
        input_targetName,
        input_targetListOfAbility,
        colormap
      );
    }

    async function createTargetInEditAbility(
      vue: ElementVue,
      input_targetName: Ref<string>,
      input_targetListOfAbility: Ref<AV.Object[]>,
      input_editingAbility: InputAbilityType,
      colormap: string[]
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_targetName.value.length === 0) {
        // doing nothing
        return;
      }

      if (input_editingAbility.id === undefined) {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingAbility.id === undefined",
          "error"
        );
        return;
      }

      // 尝试创建新 Target
      const loadingInstance = UI.showLoading(vue.$loading, "正在创建目标...");

      try {
        // 创建目标
        await Api.createTarget(
          user,
          null,
          input_targetName.value,
          "",
          "indefinite",
          null,
          [],
          [],
          true,
          false,
          colormap
        );

        // 刷新目标列表
        input_targetListOfAbility.value = await Api.fetchTargetListWithAbilitySelect(
          input_editingAbility.id
        );

        UI.hideLoading(loadingInstance);

        // 清空输入框
        input_targetName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }

    async function createTargetInCreateAbility(
      vue: ElementVue,
      input_targetName: Ref<string>,
      input_targetListOfAbility: Ref<AV.Object[]>,
      colormap: string[]
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_targetName.value.length === 0) {
        // doing nothing
        return;
      }

      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在创建您的目标..."
      );

      try {
        // 创建目标
        await Api.createTarget(
          user,
          null,
          input_targetName.value,
          "",
          "indefinite",
          null,
          [],
          [],
          true,
          false,
          colormap
        );

        // 刷新目标列表
        input_targetListOfAbility.value = await Api.fetchTargetListWithAbilitySelect(
          null,
          user
        );

        UI.hideLoading(loadingInstance);

        input_targetName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },

  /**
   * 创建 Plan
   */
  createPlan: async (
    vue: ElementVue,
    input_planName: Ref<string>,
    input_planListOfAbility: Ref<AV.Object[]>,
    input_editingAbility: InputAbilityType | null
  ) => {
    if (input_editingAbility !== null) {
      createPlanInEditAbility(
        vue,
        input_planName,
        input_planListOfAbility,
        input_editingAbility
      );
    } else {
      createPlanInCreateAbility(vue, input_planName, input_planListOfAbility);
    }

    async function createPlanInEditAbility(
      vue: ElementVue,
      input_planName: Ref<string>,
      input_planListOfAbility: Ref<AV.Object[]>,
      input_editingAbility: InputAbilityType
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_planName.value.length === 0) {
        // doing nothing
        return;
      }

      if (input_editingAbility.id === undefined) {
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "错误原因：input_editingAbility.id === undefined",
          "error"
        );
        return;
      }

      // 尝试创建新 Plan
      const loadingInstance = UI.showLoading(vue.$loading, "正在创建计划...");

      try {
        await Api.createPlan(input_planName.value, "temporary", user);

        // 刷新能力列表
        input_planListOfAbility.value = await Api.fetchPlanListWithAbilitySelect(
          input_editingAbility.id
        );

        UI.hideLoading(loadingInstance);

        // 清空输入框
        input_planName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }

    async function createPlanInCreateAbility(
      vue: ElementVue,
      input_planName: Ref<string>,
      input_planListOfAbility: Ref<AV.Object[]>
    ) {
      // 获取传入参数
      const user = Api.getCurrentUser();

      // 如果未登录，提示用户请先登录
      if (user === null) {
        UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
        return;
      }

      // 检测传入参数
      if (input_planName.value.length === 0) {
        // doing nothing
        return;
      }

      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在创建您的计划..."
      );

      try {
        // 创建计划
        await Api.createPlan(input_planName.value, "temporary", user);

        // 刷新计划列表
        input_planListOfAbility.value = await Api.fetchPlanListWithAbilitySelect(
          null,
          user
        );

        UI.hideLoading(loadingInstance);

        input_planName.value = "";
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },

  /**
   * 打开「关联相关目标」编辑抽屉
   */
  openRelateTargetDrawer: async (
    vue: ElementVue,
    isAbilityRelatedTargetDrawerDisplayed: Ref<boolean>,
    input_targetListOfAbility: Ref<AV.Object[]>,
    input_editingAbility: InputAbilityType | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 打开抽屉菜单
    isAbilityRelatedTargetDrawerDisplayed.value = true;

    // 编辑能力
    if (input_editingAbility !== null) {
      // 尝试请求带有 selected 属性的 Target
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的目标..."
      );

      if (input_editingAbility.id === undefined) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "input_editingAbility.id===undefined",
          "error"
        );
        return;
      }

      try {
        input_targetListOfAbility.value = await Api.fetchTargetListWithAbilitySelect(
          input_editingAbility.id
        );
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
    // 创建能力
    else {
      // 尝试请求带有 selected 属性的 Target
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的目标..."
      );

      try {
        input_targetListOfAbility.value = await Api.fetchTargetListWithAbilitySelect(
          null,
          user
        );
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },

  /**
   * 打开「关联相关计划」编辑抽屉
   */
  openRelatePlanDrawer: async (
    vue: ElementVue,
    isAbilityRelatedPlanDrawerDisplayed: Ref<boolean>,
    input_planListOfAbility: Ref<AV.Object[]>,
    input_editingAbility: InputAbilityType | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 打开抽屉菜单
    isAbilityRelatedPlanDrawerDisplayed.value = true;

    // 编辑能力
    if (input_editingAbility !== null) {
      // 尝试请求带有 selected 属性的 Target
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的计划..."
      );

      if (input_editingAbility.id === undefined) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "数据出错",
          "input_planListOfAbility.id===undefined",
          "error"
        );
        return;
      }

      try {
        input_planListOfAbility.value = await Api.fetchPlanListWithAbilitySelect(
          input_editingAbility.id
        );
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
    // 创建能力
    else {
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的计划..."
      );

      try {
        input_planListOfAbility.value = await Api.fetchPlanListWithAbilitySelect(
          null,
          user
        );
        UI.hideLoading(loadingInstance);
      } catch (error) {
        UI.hideLoading(loadingInstance);
        UI.showNotification(
          vue.$notify,
          "网络出错",
          `错误原因：${error.message}`,
          "error"
        );
      }
    }
  },

  /**
   * 选择 Plan Item
   */
  selectPlanItem: (plan: { attributes: { selected: boolean } }) => {
    plan.attributes.selected = !plan.attributes.selected;
  },

  /**
   * 选择 Target Item
   */
  selectTargetItem: (target: { attributes: { selected: boolean } }) => {
    target.attributes.selected = !target.attributes.selected;
  },

  /**
   * 保存选择好的 Target 到 input_abilityListOfTarget
   */
  saveSelectedTargetToInputAbility: (
    isAbilityRelatedTargetDrawerDisplayed: Ref<boolean>,
    input_targetListOfAbility: Ref<AV.Object[]>,
    input_editingAbility: InputAbilityType,
    input_creatingAbility: InputAbilityType
  ) => {
    // 关闭抽屉菜单
    isAbilityRelatedTargetDrawerDisplayed.value = false;

    const targetList: { id: string; name: string }[] = [];

    input_targetListOfAbility.value.forEach(target => {
      if (target.attributes.selected === true) {
        if (target.id !== undefined) {
          targetList.push({
            id: target.id,
            name: target.attributes.name
          });
        }
      }
    });

    input_editingAbility.targetList = targetList;

    input_creatingAbility.targetList = targetList;
  },

  /**
   * 保存选择好的 Plan 到 input_editingAbility \ input_creatingAbility
   */
  saveSelectedPlanToInputAbility: (
    isAbilityRelatedPlanDrawerDisplayed: Ref<boolean>,
    input_planListOfAbility: Ref<AV.Object[]>,
    input_editingAbility: InputAbilityType,
    input_creatingAbility: InputAbilityType
  ) => {
    // 关闭抽屉菜单
    isAbilityRelatedPlanDrawerDisplayed.value = false;

    const planList: { id: string; name: string }[] = [];

    input_planListOfAbility.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (plan.id !== undefined) {
          planList.push({
            id: plan.id,
            name: plan.attributes.name
          });
        }
      }
    });

    input_editingAbility.planList = planList;

    input_creatingAbility.planList = planList;
  },

  /**
   * 创建 Ability
   */
  createAbility: async (
    vue: ElementVue,
    isCreateAbilityDrawerDisplayed: Ref<boolean>,
    input_creatingAbility: InputAbilityType,
    abilityList: Ref<AV.Object[]>,
    colormap: string[],
    levelRuleList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    if (input_creatingAbility.name.length === 0) {
      UI.showNotification(vue.$notify, "请输入能力名称", "", "warning");
      return;
    }

    // 显示进度条
    const loadingInstance = UI.showLoading(vue.$loading, "正在创建您的能力...");

    // 尝试保存 Ability
    try {
      await Api.createAbility(
        input_creatingAbility.name,
        user,
        "",
        false,
        true,
        colormap,
        input_creatingAbility.planList,
        input_creatingAbility.targetList
      );

      // 保存完成后，尝试获取能力列表
      if (levelRuleList.value.length === 0) {
        levelRuleList.value = await Api.fetchLevelRuleList();
      }

      // 尝试获取能力列表
      abilityList.value = await Api.fetchAbilityList(
        user,
        false,
        true,
        levelRuleList.value,
        true,
        true
      );

      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "能力创建成功", "", "success");

      // 清空输入框
      input_creatingAbility.id = undefined;
      input_creatingAbility.name = "";
      input_creatingAbility.isActived = true;
      input_creatingAbility.isFinished = false;
      input_creatingAbility.planList = [];
      input_creatingAbility.targetList = [];

      // 关闭窗口
      isCreateAbilityDrawerDisplayed.value = false;
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "能力创建失败",
        `错误原因：${error.message}`,
        "error"
      );
    }
  },

  /**
   * 保存 AbilityList 的优先级
   */
  changeAbilityListOrder: async (abilityList: AV.Object[]) => {
    const list: AV.Object[] = [];
    abilityList.forEach((ability, index) => {
      if (ability.attributes.order !== index && ability.id !== undefined) {
        const object = AV.Object.createWithoutData("Ability", ability.id).set(
          "order",
          index
        );
        list.push(object);
      }
    });
    await Api.saveAbilityList(list);
  }
};

/**
 * 设置页
 */
const SettingPage = {
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

const StatTomatoPage = {
  init: async (
    vue: ElementVue,
    statTomatoDateList: Ref<StatTomatoDate[]>,
    dailyPlanList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取番茄列表...");

    try {
      if (dailyPlanList.value.length === 0) {
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      const tomatoList = await Api.fetchTomatoList(user);

      const targetTomatoNumber = getTargetTomatoNumber(dailyPlanList);

      statTomatoDateList.value = addStatTomatoList(
        getStatTomatoDateList(tomatoList, targetTomatoNumber)
      );

      console.log("statTomatoDateList", statTomatoDateList.value);

      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取番茄列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }

    function addStatTomatoList(statTomatoDateList: StatTomatoDate[]) {
      statTomatoDateList.forEach(statTomatoDate => {
        statTomatoDate.statTomatoList = [];
        statTomatoDate.tomatoList.forEach(tomato => {
          // 判断 tomato 是否已经被加入到 statTomatoDate.statTomatoList 中
          let isTomatoInStatTomatoList = false;
          // 记录 tomato 在 statTomatoDate.statTomatoList 中的位置信息
          let tIndex = -1;

          if (statTomatoDate.statTomatoList === undefined) {
            throw "statTomatoDate.statTomatoList is undefined";
          }

          statTomatoDate.statTomatoList.forEach((statTomato, index) => {
            if (statTomato.attributes.name === tomato.attributes.name) {
              isTomatoInStatTomatoList = true;
              tIndex = index;
            }
          });

          if (isTomatoInStatTomatoList) {
            statTomatoDate.statTomatoList[tIndex].attributes
              .todayTomatoNumber++;
            statTomatoDate.statTomatoList[tIndex].attributes.todayTotalTime +=
              (tomato.createdAt as Date).getTime() -
              tomato.attributes.startTime.getTime();
          } else {
            tomato.attributes.todayTomatoNumber = 1;
            tomato.attributes.todayTotalTime =
              (tomato.createdAt as Date).getTime() -
              tomato.attributes.startTime.getTime();
            statTomatoDate.statTomatoList.push(tomato);
          }
        });
      });
      return statTomatoDateList;
    }

    function getStatTomatoDateList(
      tomatoList: AV.Object[],
      targetTomatoNumber: number
    ): StatTomatoDate[] {
      const statTomatoDateList: StatTomatoDate[] = [];
      let tDate: string = "";
      tomatoList.forEach(tomato => {
        if (tDate !== UI.dateToYearMonthDay(tomato.attributes.startTime)) {
          tDate = UI.dateToYearMonthDay(tomato.attributes.startTime);
          statTomatoDateList.push({
            date: tDate,
            todayTomatoNumber: 1,
            targetTomatoNumber: targetTomatoNumber,
            totalTime:
              (tomato.createdAt as Date).getTime() -
              tomato.attributes.startTime.getTime(),
            tomatoList: [tomato]
          });
        } else {
          statTomatoDateList[statTomatoDateList.length - 1].todayTomatoNumber++;
          statTomatoDateList[statTomatoDateList.length - 1].totalTime +=
            (tomato.createdAt as Date).getTime() -
            tomato.attributes.startTime.getTime();
          statTomatoDateList[statTomatoDateList.length - 1].tomatoList.push(
            tomato
          );
        }
      });
      return statTomatoDateList;
    }

    function getTargetTomatoNumber(dailyPlanList: Ref<AV.Object[]>): number {
      let targetTomatoNumber = 0;
      dailyPlanList.value.forEach(plan => {
        if (
          plan.attributes.target !== undefined &&
          plan.attributes.target !== null
        ) {
          targetTomatoNumber += plan.attributes.target;
        }
      });
      return targetTomatoNumber;
    }
  },
  changeStatStatusMode: (statStatusMode: Ref<TomatoStatStatusMode>) => {
    switch (statStatusMode.value) {
      case "detail":
        statStatusMode.value = "stat";
        break;
      case "simple":
        statStatusMode.value = "detail";
        break;
      case "stat":
        statStatusMode.value = "date";
        break;
      case "date":
        statStatusMode.value = "simple";
        break;
    }
  }
};

const StatTargetPage = {
  init: async (vue: ElementVue, statTargetDateList: Ref<StatTargetDate[]>) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取目标记录...");

    try {
      const statTargetList = await Api.fetchStatTargetList(user);

      statTargetDateList.value = await addPlanListOfStatTargetList(
        addStatTargetList(getStatTargetDateList(statTargetList))
      );

      console.log("statTargetDateList", statTargetDateList.value);

      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取统计目标列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }

    function getStatTargetDateList(
      statTargetList: AV.Object[]
    ): StatTargetDate[] {
      const statTargetDateList: StatTargetDate[] = [];
      let tDate: string = "";

      statTargetList.forEach(statTarget => {
        if (
          tDate !==
          UI.dateToYearMonthDay(
            statTarget.attributes.tomatoOfTarget.attributes.startTime
          )
        ) {
          tDate = UI.dateToYearMonthDay(
            statTarget.attributes.tomatoOfTarget.attributes.startTime
          );
          statTargetDateList.push({
            date: tDate,
            todayTargetNumber: 1,
            totalTime:
              (statTarget.attributes.tomatoOfTarget
                .createdAt as Date).getTime() -
              statTarget.attributes.tomatoOfTarget.attributes.startTime.getTime(),
            targetList: [statTarget]
          });
        } else {
          let isStatExist = false;
          statTargetDateList[statTargetDateList.length - 1].targetList.forEach(
            oldStatTarget => {
              if (
                oldStatTarget.attributes.name === statTarget.attributes.name
              ) {
                isStatExist = true;
              }
            }
          );

          if (!isStatExist) {
            statTargetDateList[statTargetDateList.length - 1]
              .todayTargetNumber++;
          }

          let isSameTime = false;
          statTargetDateList[statTargetDateList.length - 1].targetList.forEach(
            oldStatTarget => {
              if (
                oldStatTarget.attributes.tomatoOfTarget.attributes.startTime ===
                  statTarget.attributes.tomatoOfTarget.attributes.startTime &&
                oldStatTarget.attributes.tomatoOfTarget.createdAt ===
                  statTarget.attributes.tomatoOfTarget.createdAt
              ) {
                isSameTime = true;
              }
            }
          );
          if (!isSameTime) {
            statTargetDateList[statTargetDateList.length - 1].totalTime +=
              (statTarget.attributes.tomatoOfTarget
                .createdAt as Date).getTime() -
              statTarget.attributes.tomatoOfTarget.attributes.startTime.getTime();
          }

          statTargetDateList[statTargetDateList.length - 1].targetList.push(
            statTarget
          );
        }
      });
      return statTargetDateList;
    }

    function addStatTargetList(statTargetDateList: StatTargetDate[]) {
      statTargetDateList.forEach(statTargetDate => {
        statTargetDate.statTargetList = [];
        statTargetDate.targetList.forEach(target => {
          // 判断 target 是否已经被加入到 statTargetDate.statTargetList 中
          let isTargetInStatTargetList = false;
          // 记录 target 在 statTargetDate.statTargetList 中的位置信息
          let tIndex = -1;

          if (statTargetDate.statTargetList === undefined) {
            throw "statTargetDate.statTargetList is undefined";
          }

          statTargetDate.statTargetList.forEach((statTarget, index) => {
            if (statTarget.id === target.id) {
              isTargetInStatTargetList = true;
              tIndex = index;
            }
          });

          if (isTargetInStatTargetList) {
            statTargetDate.statTargetList[tIndex].attributes
              .todayTomatoNumber++;
            statTargetDate.statTargetList[
              tIndex
            ].attributes.todayTotalTime += target.attributes.tomatoOfTarget
              .attributes.duration
              ? target.attributes.tomatoOfTarget.attributes.duration
              : target.attributes.tomatoOfTarget.createdAt.getTime() -
                target.attributes.tomatoOfTarget.attributes.startTime.getTime();
          } else {
            target.attributes.todayTomatoNumber = 1;
            target.attributes.todayTotalTime = target.attributes.tomatoOfTarget
              .attributes.duration
              ? target.attributes.tomatoOfTarget.attributes.duration
              : target.attributes.tomatoOfTarget.createdAt.getTime() -
                target.attributes.tomatoOfTarget.attributes.startTime.getTime();
            statTargetDate.statTargetList.push(target);
          }
        });
      });
      return statTargetDateList;
    }

    async function addPlanListOfStatTargetList(
      statTargetDateList: StatTargetDate[]
    ) {
      const tempTargetList: AV.Object[] = [];
      statTargetDateList.forEach(statTargetDate => {
        if (statTargetDate.statTargetList !== undefined) {
          statTargetDate.statTargetList.forEach(statTarget => {
            let isTargetInList = false;
            tempTargetList.forEach(tempTarget => {
              if (tempTarget.id === statTarget.id) {
                isTargetInList = true;
              }
            });
            if (!isTargetInList) {
              tempTargetList.push(statTarget);
            }
          });
        }
      });
      await Api.fetchPlanListOfTargetList(tempTargetList);
      statTargetDateList.forEach(statTargetDate => {
        if (statTargetDate.statTargetList !== undefined) {
          statTargetDate.statTargetList.forEach(statTarget => {
            tempTargetList.forEach(tempTarget => {
              if (statTarget.id === tempTarget.id) {
                statTarget.attributes.targetTomatoNumber =
                  tempTarget.attributes.targetTomatoNumber;
              }
            });
          });
        }
      });
      return statTargetDateList;
    }
  }
};

const StatAbilityPage = {
  init: async (
    vue: ElementVue,
    statAbilityDateList: Ref<StatAbilityDate[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取能力记录...");

    try {
      const statAbilityList = await Api.fetchStatAbilityList(user);

      statAbilityDateList.value = await addPLanListOfStatAbilityList(
        addStatAbilityList(getStatAbilityDateList(statAbilityList))
      );

      console.log("statAbilityDateList", statAbilityDateList.value);
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取统计能力列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }

    function getStatAbilityDateList(
      statAbilityList: AV.Object[]
    ): StatAbilityDate[] {
      const statAbilityDateList: StatAbilityDate[] = [];
      let tDate: string = "";

      statAbilityList.forEach(statAbility => {
        if (
          tDate !==
          UI.dateToYearMonthDay(
            statAbility.attributes.tomatoOfAbility.attributes.startTime
          )
        ) {
          tDate = UI.dateToYearMonthDay(
            statAbility.attributes.tomatoOfAbility.attributes.startTime
          );
          statAbilityDateList.push({
            date: tDate,
            todayAbilityNumber: 1,
            totalTime:
              (statAbility.attributes.tomatoOfAbility
                .createdAt as Date).getTime() -
              statAbility.attributes.tomatoOfAbility.attributes.startTime.getTime(),
            abilityList: [statAbility]
          });
        } else {
          let isStatExist = false;
          statAbilityDateList[
            statAbilityDateList.length - 1
          ].abilityList.forEach(oldStatAbility => {
            if (
              oldStatAbility.attributes.name === statAbility.attributes.name
            ) {
              isStatExist = true;
            }
          });

          if (!isStatExist) {
            statAbilityDateList[statAbilityDateList.length - 1]
              .todayAbilityNumber++;
          }

          let isSameTime = false;
          statAbilityDateList[
            statAbilityDateList.length - 1
          ].abilityList.forEach(oldStatAbility => {
            if (
              oldStatAbility.attributes.tomatoOfAbility.attributes.startTime ===
                statAbility.attributes.tomatoOfAbility.attributes.startTime &&
              oldStatAbility.attributes.tomatoOfAbility.createdAt ===
                statAbility.attributes.tomatoOfAbility.createdAt
            ) {
              isSameTime = true;
            }
          });

          if (!isSameTime) {
            statAbilityDateList[statAbilityDateList.length - 1].totalTime +=
              (statAbility.attributes.tomatoOfAbility
                .createdAt as Date).getTime() -
              statAbility.attributes.tomatoOfAbility.attributes.startTime.getTime();
          }

          statAbilityDateList[statAbilityDateList.length - 1].abilityList.push(
            statAbility
          );
        }
      });
      return statAbilityDateList;
    }

    function addStatAbilityList(statAbilityDateList: StatAbilityDate[]) {
      statAbilityDateList.forEach(statAbilityDate => {
        statAbilityDate.statAbilityList = [];
        statAbilityDate.abilityList.forEach(ability => {
          // 判断 ability 是否已经被加入到 statAbilityDate.statAbilityList 中
          let isAbilityInStatAbilityList = false;
          // 记录 ability 在 statAbilityDate.statAbilityList 中的位置信息
          let tIndex = -1;

          if (statAbilityDate.statAbilityList === undefined) {
            throw "statAbilityDate.statAbilityList is undefined";
          }

          statAbilityDate.statAbilityList.forEach((statAbility, index) => {
            if (statAbility.id === ability.id) {
              isAbilityInStatAbilityList = true;
              tIndex = index;
            }
          });

          if (isAbilityInStatAbilityList) {
            statAbilityDate.statAbilityList[tIndex].attributes
              .todayTomatoNumber++;
            statAbilityDate.statAbilityList[tIndex].attributes.todayTotalTime +=
              ability.attributes.tomatoOfAbility.createdAt.getTime() -
              ability.attributes.tomatoOfAbility.attributes.startTime.getTime();
          } else {
            ability.attributes.todayTomatoNumber = 1;
            ability.attributes.todayTotalTime =
              ability.attributes.tomatoOfAbility.createdAt.getTime() -
              ability.attributes.tomatoOfAbility.attributes.startTime.getTime();
            statAbilityDate.statAbilityList.push(ability);
          }
        });
      });
      return statAbilityDateList;
    }

    async function addPLanListOfStatAbilityList(
      statAbilityDateList: StatAbilityDate[]
    ) {
      const tempAbilityList: AV.Object[] = [];
      statAbilityDateList.forEach(statAbilityDate => {
        if (statAbilityDate.statAbilityList !== undefined) {
          statAbilityDate.statAbilityList.forEach(statAbility => {
            let isAbilityInList = false;
            tempAbilityList.forEach(tempAbility => {
              if (tempAbility.id === statAbility.id) {
                isAbilityInList = true;
              }
            });
            if (!isAbilityInList) {
              tempAbilityList.push(statAbility);
            }
          });
        }
      });
      await Api.fetchPlanListOfAbilityList(tempAbilityList);
      statAbilityDateList.forEach(statAbilityDate => {
        if (statAbilityDate.statAbilityList !== undefined) {
          statAbilityDate.statAbilityList.forEach(statAbility => {
            tempAbilityList.forEach(tempAbility => {
              if (statAbility.id === tempAbility.id) {
                statAbility.attributes.targetTomatoNumber =
                  tempAbility.attributes.targetTomatoNumber;
              }
            });
          });
        }
      });
      return statAbilityDateList;
    }
  }
};

const StatPlanPage = {
  init: async (vue: ElementVue, statPlanDateList: Ref<StatPlanDate[]>) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取计划记录...");

    try {
      const statPlanList = await Api.fetchStatPlanList(user);

      statPlanDateList.value = addStatPlanList(
        getStatPlanDateList(statPlanList)
      );

      console.log("statPlanDateList", statPlanDateList.value);
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取统计计划列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }

    function getStatPlanDateList(statPlanList: AV.Object[]): StatPlanDate[] {
      const statPlanDateList: StatPlanDate[] = [];
      let tDate: string = "";

      statPlanList.forEach(statPlan => {
        if (
          tDate !==
          UI.dateToYearMonthDay(
            statPlan.attributes.tomatoOfPlan.attributes.startTime
          )
        ) {
          tDate = UI.dateToYearMonthDay(
            statPlan.attributes.tomatoOfPlan.attributes.startTime
          );
          statPlanDateList.push({
            date: tDate,
            todayPlanNumber: 1,
            totalTime:
              (statPlan.attributes.tomatoOfPlan.createdAt as Date).getTime() -
              statPlan.attributes.tomatoOfPlan.attributes.startTime.getTime(),
            planList: [statPlan]
          });
        } else {
          let isStatPlanExist = false;

          statPlanDateList[statPlanDateList.length - 1].planList.forEach(
            oldStatPlan => {
              if (oldStatPlan.attributes.name === statPlan.attributes.name) {
                isStatPlanExist = true;
              }
            }
          );

          if (!isStatPlanExist) {
            statPlanDateList[statPlanDateList.length - 1].todayPlanNumber++;
          }

          let isSameTime = false;

          statPlanDateList[statPlanDateList.length - 1].planList.forEach(
            oldStatPlan => {
              if (
                oldStatPlan.attributes.tomatoOfPlan.attributes.startTime ===
                  statPlan.attributes.tomatoOfPlan.attributes.startTime &&
                oldStatPlan.attributes.tomatoOfPlan.createdAt ===
                  statPlan.attributes.tomatoOfPlan.createdAt
              ) {
                isSameTime = true;
              }
            }
          );

          if (!isSameTime) {
            statPlanDateList[statPlanDateList.length - 1].totalTime +=
              (statPlan.attributes.tomatoOfPlan.createdAt as Date).getTime() -
              statPlan.attributes.tomatoOfPlan.attributes.startTime.getTime();
          }

          statPlanDateList[statPlanDateList.length - 1].planList.push(statPlan);
        }
      });
      return statPlanDateList;
    }

    function addStatPlanList(statPlanDateList: StatPlanDate[]) {
      statPlanDateList.forEach(statPlanDate => {
        statPlanDate.statPlanList = [];
        statPlanDate.planList.forEach(plan => {
          // 判断 plan 是否已经被加入到 statPlanDate.statPlanList 中
          let isPlanInStatPlanList = false;
          // 记录 plan 在 statPlanDate.statPlanList 中的位置信息
          let tIndex = -1;

          if (statPlanDate.statPlanList === undefined) {
            throw "statPlanDate.statPlanList is undefined";
          }

          statPlanDate.statPlanList.forEach((statPlan, index) => {
            if (statPlan.id === plan.id) {
              isPlanInStatPlanList = true;
              tIndex = index;
            }
          });

          // 如果 plan 已经存在于 statPlanDate.statPlanList 中
          // plan.attributes.todayTomatoNumber++
          // plan.attributes.todayTotalTime += plan.attributes.duration
          if (isPlanInStatPlanList) {
            statPlanDate.statPlanList[tIndex].attributes.todayTomatoNumber++;
            statPlanDate.statPlanList[tIndex].attributes.todayTotalTime += plan
              .attributes.tomatoOfPlan.attributes.duration
              ? plan.attributes.tomatoOfPlan.attributes.duration
              : plan.attributes.tomatoOfPlan.createdAt.getTime() -
                plan.attributes.tomatoOfPlan.attributes.startTime.getTime();
          } else {
            plan.attributes.todayTomatoNumber = 1;
            plan.attributes.todayTotalTime = plan.attributes.tomatoOfPlan
              .attributes.duration
              ? plan.attributes.tomatoOfPlan.attributes.duration
              : plan.attributes.tomatoOfPlan.createdAt.getTime() -
                plan.attributes.tomatoOfPlan.attributes.startTime.getTime();
            statPlanDate.statPlanList.push(plan);
          }
        });
      });
      return statPlanDateList;
    }
  }
};

const StatPage = {
  changeStatStatusMode: (statStatusMode: Ref<StatStatusMode>) => {
    switch (statStatusMode.value) {
      case "detail":
        statStatusMode.value = "date";
        break;
      case "simple":
        statStatusMode.value = "detail";
        break;
      case "date":
        statStatusMode.value = "simple";
        break;
    }
  }
};

export {
  SplashPage,
  LoginPage,
  PlanPage,
  TomatoTimerPage,
  TargetAbilityPage,
  TargetPage,
  AbilityPage,
  SettingPage,
  StatTomatoPage,
  StatTargetPage,
  StatPlanPage,
  StatPage,
  StatAbilityPage
};
