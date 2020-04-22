import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import VueRouter, { RawLocation } from "vue-router";
import { Router, Time, Check, UI } from "./vue-utils";
import {
  ElementVue,
  TomatoCloudStatus,
  PlanType,
  InputPlanType,
  InputTargetOrTargetSubjectType
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
    input_editingPlan.description = plan.attributes.description;
    input_editingPlan.isActived = plan.attributes.isActived;
    input_editingPlan.isFinished = plan.attributes.isFinished;
    input_editingPlan.abilityList = plan.attributes.abilityListOfPlan.map(
      (ability: AV.Object) => {
        return { id: ability.id, name: ability.attributes.name };
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
          input_editingPlan.description,
          input_editingPlan.isActived,
          input_editingPlan.isFinished,
          input_editingPlan.abilityList.map(ability => ability.id)
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
    isRelatedAbilityDrawerDisplayed: Ref<boolean>,
    input_abilityList: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    // 打开抽屉菜单
    isRelatedAbilityDrawerDisplayed.value = true;

    if (input_editingPlan.id !== undefined) {
      // 尝试请求带有 selected 属性的 Ability
      const loadingInstance = UI.showLoading(
        vue.$loading,
        "正在请求相关的能力"
      );

      try {
        input_abilityList.value = await Api.fetchAbilityListWithPlanSelect(
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
    input_ability: Ref<string>,
    input_abilityList: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 检测传入数据
    if (input_ability.value.length === 0) {
      // doing nothing
      return;
    }

    try {
      // 创建计划
      await Api.createAbility(input_ability.value, user, "", false, true);

      // 刷新能力列表
      if (input_editingPlan.id !== undefined) {
        // 尝试请求带有 selected 属性的 Ability
        const loadingInstance = UI.showLoading(
          vue.$loading,
          "正在请求相关的能力"
        );

        try {
          input_abilityList.value = await Api.fetchAbilityListWithPlanSelect(
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

      input_ability.value = "";
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
  /**
   * 将选择好的 Ability(input_abilityList) 保存到 input_editingPlan 的 ablityList 中
   */
  saveSelectedAblityToEditingPlan: (
    isRelatedAbilityDrawerDisplayed: Ref<boolean>,
    input_abilityList: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType
  ) => {
    isRelatedAbilityDrawerDisplayed.value = false;
    const list: { id: string; name: string }[] = [];
    input_abilityList.value.forEach(ability => {
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
   * - 不传 input_plan
   *
   * 2. 点击「底边栏」上的「开始按钮」：
   * - 不传入 plan
   * - 传入 isCommitPlanDrawerDisplayed
   * - 传入 input_plan
   *
   * @param vue 还是绑定了 Element 后的 context.root
   * @param tomatoCloudStatus 这是番茄钟的状态，由外部引入
   * @param interval 计时器实例，由外部引入
   * @param countDown 计时器表盘值，由外部引入
   * @param isCommitPlanDrawerDisplayed 控制「提交番茄」抽屉是否打开的变量
   * @param input_plan 提交番茄用的番茄名称
   * @param plan 点击「每日计划」时，需传入的「被点击的计划」
   */
  clickTomatoClock: async (
    vue: ElementVue,
    tomatoCloudStatus: Ref<TomatoCloudStatus>,
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    isCommitPlanDrawerDisplayed: Ref<boolean> | null,
    input_plan: Ref<string> | null,
    plan: AV.Object | null,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>,
    tomatoStartTime: Ref<Date>
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
        interval.value = setInterval(() => {
          countDown.value--;
          if (countDown.value === 0 && interval.value !== null) {
            clearInterval(interval.value);
            tomatoCloudStatus.value = "finished";
            new Notification("番茄已完成", { body: "请提交您的番茄" });
          }
        }, 1000);
        break;
      }
      case "finished": {
        if (plan !== null) {
          UI.showNotification(vue.$notify, "请先提交番茄", "", "warning");
          return;
        }
        if (isCommitPlanDrawerDisplayed !== null && input_plan !== null) {
          isCommitPlanDrawerDisplayed.value = true;
          // 清空 input_plan 的值
          input_plan.value = "";

          // 遍历 temporaryPlanList
          temporaryPlanList.value.forEach(plan => {
            if (plan.attributes.selected === true) {
              if (input_plan.value.length === 0) {
                input_plan.value = plan.attributes.name;
              } else {
                input_plan.value =
                  input_plan.value + " + " + plan.attributes.name;
              }
            }
          });

          // 遍历 dailyPlanList
          dailyPlanList.value.forEach(plan => {
            if (plan.attributes.selected === true) {
              if (input_plan.value.length === 0) {
                input_plan.value = plan.attributes.name;
              } else {
                input_plan.value =
                  input_plan.value + " + " + plan.attributes.name;
              }
            }
          });

          // 遍历 completedPlanList
          completedPlanList.value.forEach(plan => {
            if (plan.attributes.selected === true) {
              if (input_plan.value.length === 0) {
                input_plan.value = plan.attributes.name;
              } else {
                input_plan.value =
                  input_plan.value + " + " + plan.attributes.name;
              }
            }
          });
        }
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
      interval.value = null;
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
    input_plan: Ref<string>,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>
  ) => {
    // 修改 selected 的选择状态
    plan.attributes.selected = !plan.attributes.selected;

    // 清空 input_plan 的值
    input_plan.value = "";

    // 遍历 temporaryPlanList
    temporaryPlanList.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (input_plan.value.length === 0) {
          input_plan.value = plan.attributes.name;
        } else {
          input_plan.value = input_plan.value + " + " + plan.attributes.name;
        }
      }
    });

    // 遍历 dailyPlanList
    dailyPlanList.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (input_plan.value.length === 0) {
          input_plan.value = plan.attributes.name;
        } else {
          input_plan.value = input_plan.value + " + " + plan.attributes.name;
        }
      }
    });

    // 遍历 completedPlanList
    completedPlanList.value.forEach(plan => {
      if (plan.attributes.selected === true) {
        if (input_plan.value.length === 0) {
          input_plan.value = plan.attributes.name;
        } else {
          input_plan.value = input_plan.value + " + " + plan.attributes.name;
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
    interval: Ref<NodeJS.Timeout | null>,
    countDown: Ref<number>,
    isCommitPlanDrawerDisplayed: Ref<boolean>,
    input_plan: Ref<string>,
    input_description: Ref<string>,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>,
    tomatoStartTime: Ref<Date>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 检查传入参数
    if (input_plan.value.length === 0) {
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
        input_plan.value,
        input_description.value,
        user,
        tomatoStartTime.value
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
      interval.value = null;
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

/**
 * 能力页
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
    targetSubjectList: Ref<AV.Object[]>
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
          input_creatingTargetOrTargetSubject.target.isActived,
          input_creatingTargetOrTargetSubject.target.isFinished
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
    input_editingTargetOrTargetSubject.target.abilityList = target.attributes.abilityListOfTarget.map(
      (ability: AV.Object) => {
        return { id: ability.id, name: ability.attributes.name };
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
  }
};

export { SplashPage, LoginPage, PlanPage, TomatoTimerPage, TargetPage };
