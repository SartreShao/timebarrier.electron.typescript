import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import { ElementVue, InputAbilityType } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";
/**
 * 能力页
 */
export default {
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
