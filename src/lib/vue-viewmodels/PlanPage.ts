import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI, Router } from "@/lib/vue-utils";
import {
  ElementVue,
  PlanType,
  InputPlanType
} from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";

/**
 * 计划页
 */
export default {
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
  createPlanQuickly: async (
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
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在完成计划");
    try {
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

      UI.hideLoading(loadingInstance);

      UI.showNotification(
        vue.$notify,
        "计划完成",
        "您可以在底部「已完成」中找到它",
        "success"
      );
    } catch (error) {
      UI.hideLoading(loadingInstance);

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
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在恢复计划");
    try {
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

      UI.hideLoading(loadingInstance);
      UI.showNotification(vue.$notify, "恢复计划成功", "", "success");
    } catch (error) {
      UI.hideLoading(loadingInstance);

      UI.showNotification(
        vue.$notify,
        "恢复计划失败",
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
  initRelatedAbility: async (
    vue: ElementVue,
    input_abilityListOfPlan: Ref<AV.Object[]>,
    input_editingPlan: InputPlanType | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 尝试请求带有 selected 属性的 Ability
    const loadingInstance = UI.showLoading(vue.$loading, "正在请求相关的能力");

    try {
      // 刷新 Ability 列表
      if (input_editingPlan === null) {
        input_abilityListOfPlan.value = await Api.fetchAbilityList(
          user,
          false,
          true
        );
        UI.hideLoading(loadingInstance);
      }

      // 刷新 Ability 列表，并带上 Plan Select
      else {
        if (input_editingPlan.id === undefined) {
          return;
        }

        input_abilityListOfPlan.value = await Api.fetchAbilityListWithPlanSelect(
          input_editingPlan.id
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
    input_editingPlan: InputPlanType | null,
    abilityList: Ref<AV.Object[]>,
    levelRuleList: Ref<AV.Object[]>,
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
    const loadingInstance = UI.showLoading(vue.$loading, "正在创建能力...");

    try {
      // 创建 Ability
      await Api.createAbility(
        input_abilityName.value,
        user,
        "",
        false,
        true,
        colormap
      );

      // 刷新 Ability 列表
      if (input_editingPlan === null) {
        input_abilityListOfPlan.value = await Api.fetchAbilityList(
          user,
          false,
          true
        );
      }

      // 刷新 Ability 列表，并带上 Plan Select
      else {
        if (input_editingPlan.id !== undefined) {
          input_abilityListOfPlan.value = await Api.fetchAbilityListWithPlanSelect(
            input_editingPlan.id
          );
        }
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

      // 清空输入框
      input_abilityName.value = "";
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "创建能力失败",
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

          // 尝试获取目标列表
          unSubjectiveTargetList.value = await Api.fetchTargetList(
            user,
            "unsubjective"
          );

          // 尝试获取已完成的目标列表
          completedTargetList.value = await Api.fetchTargetList(
            user,
            "completed"
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
    // const temp = ability.attributes.name;
    // ability.attributes.name = "";
    // ability.attributes.name = temp;
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
  },

  openChoosePlanTypePage: (vue: ElementVue) => {
    Router.push(vue.$router, "choose-plan-type");
  }
};
