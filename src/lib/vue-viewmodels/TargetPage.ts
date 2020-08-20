import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI, Router, Log } from "@/lib/vue-utils";
import {
  ElementVue,
  InputTargetOrTargetSubjectType,
  InputTargetType
} from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";
import _ from "lodash";
/**
 * 目标页
 */
export default {
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
          [],
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
        targetSubjectList
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
      targetSubjectList: Ref<AV.Object[]>
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
  },

  /**
   * 提交自定义目标类别
   */
  commitCustomSubjectName: async (
    vue: ElementVue,
    input_creatingTarget: InputTargetType,
    isCustomTargetSubjectShow: Ref<boolean>
  ) => {
    // 删除前后的空格
    input_creatingTarget.subjectName = _.trim(input_creatingTarget.subjectName);

    // 如果输入判断为空
    if (input_creatingTarget.subjectName.length === 0) {
      UI.showNotification(
        vue.$notify,
        "您的输入有误",
        "「目标类别」不可为空",
        "warning"
      );
      return;
    }

    // 关闭弹窗
    isCustomTargetSubjectShow.value = false;

    Router.push(vue.$router, "/create-target");
  },

  /**
   * 创建「里程碑」
   */
  createMileStone: async (
    vue: ElementVue,
    input_milestoneName: Ref<string>,
    input_creatingTarget: InputTargetType,
    colormap: string[],
    mainElement: Ref<HTMLElement | null>
  ) => {
    const mileStoneName = _.trim(input_milestoneName.value);

    // 输入检测
    if (mileStoneName.length === 0) {
      UI.showNotification(
        vue.$notify,
        "您的输入有误",
        "「里程碑名称」不可为空",
        "warning"
      );
      return;
    }

    // 创建里程碑
    input_creatingTarget.mileStoneList.push({
      name: mileStoneName,
      color:
        colormap[input_creatingTarget.mileStoneList.length % colormap.length]
    });

    // 将滚动条滚到最底部
    if (mainElement.value !== null) {
      mainElement.value.scrollTop = mainElement.value.scrollHeight;
    }

    // 清空输入框
    input_milestoneName.value = "";
  },

  /**
   * 删除里程碑
   */
  deleteMileStone: async (
    vue: ElementVue,
    input_creatingTarget: InputTargetType,
    index: number,
    mainElement: Ref<HTMLElement | null>
  ) => {
    try {
      await UI.showConfirm(
        vue.$confirm,
        "确认删除里程碑：" + input_creatingTarget.mileStoneList[index].name,
        "您正在删除一个里程碑"
      );
      input_creatingTarget.mileStoneList.splice(index, 1);

      // 将滚动条滚到最底部
      if (mainElement.value !== null) {
        mainElement.value.scrollTop = mainElement.value.scrollHeight;
      }
    } catch (error) {
      // doing nothing
    }
  },
  selectPlanToCommit: (plan: { attributes: { selected: boolean } }) => {
    plan.attributes.selected = !plan.attributes.selected;
  },
  /**
   * 初始化关联计划时的数据
   */
  initRelatedPlan: async (
    vue: ElementVue,
    input_planListOfTarget: Ref<AV.Object[]>,
    input_editingTarget: InputTargetType | null,
    input_creatingTarget: InputTargetType | null
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 尝试请求带有 selected 属性的 Ability
    const loadingInstance = UI.showLoading(vue.$loading, "正在请求相关的计划");

    try {
      // 当前在创建计划
      if (input_editingTarget === null && input_creatingTarget !== null) {
        input_planListOfTarget.value = await Api.fetchPlanList(user, "all");

        input_creatingTarget.planList.forEach(input_plan => {
          input_planListOfTarget.value.forEach(plan => {
            if (input_plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });

        UI.hideLoading(loadingInstance);
      }
      // 当前正在编辑计划
      else if (input_editingTarget !== null && input_creatingTarget === null) {
        if (input_editingTarget.id === undefined) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "出现错误",
            "input_editingTarget.id === undefined",
            "error"
          );
          return;
        }

        input_planListOfTarget.value = await Api.fetchPlanList(user, "all");

        input_editingTarget.planList.forEach(input_plan => {
          input_planListOfTarget.value.forEach(plan => {
            if (input_plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });

        UI.hideLoading(loadingInstance);
      } else {
        Log.error(
          "vm: TargetPage's initRelatedPlan",
          new Error(
            "please select input_editingTarget or input_creatingTarget to input"
          )
        );
        return;
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
   * 创建临时计划
   */
  createTemporaryPlan: async (
    vue: ElementVue,
    input_planName: Ref<string>,
    input_editingTarget: InputTargetType | null,
    input_creatingTarget: InputTargetType | null,
    input_planListOfTarget: Ref<AV.Object[]>,
    temporaryPlanList: Ref<AV.Object[]>,
    isInputPlanTargetShow: Ref<boolean>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const planName = _.trim(input_planName.value);

    // 传入数据检查
    if (planName.length === 0) {
      return;
    }

    // 尝试请求带有 selected 属性的 Target
    const loadingInstance = UI.showLoading(vue.$loading, "正在创建计划...");

    try {
      // 创建计划
      await Api.createPlan(
        planName,
        "temporary",
        user,
        undefined,
        true,
        false,
        [],
        [],
        undefined
      );

      // 当前在创建计划
      if (input_editingTarget === null && input_creatingTarget !== null) {
        input_planListOfTarget.value = await Api.fetchPlanList(user, "all");

        input_creatingTarget.planList.forEach(input_plan => {
          input_planListOfTarget.value.forEach(plan => {
            if (input_plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });

        UI.hideLoading(loadingInstance);
      }
      // 当前正在编辑计划
      else if (input_editingTarget !== null && input_creatingTarget === null) {
        if (input_editingTarget.id === undefined) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "出现错误",
            "input_editingTarget.id === undefined",
            "error"
          );
          return;
        }

        input_planListOfTarget.value = await Api.fetchPlanList(user, "all");

        input_editingTarget.planList.forEach(input_plan => {
          input_planListOfTarget.value.forEach(plan => {
            if (input_plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });

        UI.hideLoading(loadingInstance);
      } else {
        Log.error(
          "vm: TargetPage's initRelatedPlan",
          new Error(
            "please select input_editingTarget or input_creatingTarget to input"
          )
        );
        return;
      }

      // 尝试获取临时计划列表
      temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");

      input_planName.value = "";

      isInputPlanTargetShow.value = false;
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "网络出错",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  createDailyPlan: async (
    vue: ElementVue,
    input_planName: Ref<string>,
    input_dailyPlanTarget: Ref<string>,
    input_editingTarget: InputTargetType | null,
    input_creatingTarget: InputTargetType | null,
    input_planListOfTarget: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    isInputPlanTargetShow: Ref<boolean>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const planName = _.trim(input_planName.value);

    // 传入数据检查
    if (planName.length === 0) {
      return;
    }

    if (
      Number(input_dailyPlanTarget.value) < 0 ||
      input_dailyPlanTarget.value === undefined
    ) {
      UI.showNotification(
        vue.$notify,
        "输入有误",
        "请至少输入一个大于 0 的值",
        "warning"
      );
      input_dailyPlanTarget.value = "0";
      return;
    }

    // 尝试请求带有 selected 属性的 Target
    const loadingInstance = UI.showLoading(vue.$loading, "正在创建计划...");

    try {
      // 创建计划
      await Api.createPlan(
        planName,
        "daily",
        user,
        Number(input_dailyPlanTarget.value),
        true,
        false,
        [],
        [],
        undefined
      );

      // 当前在创建计划
      if (input_editingTarget === null && input_creatingTarget !== null) {
        input_planListOfTarget.value = await Api.fetchPlanList(user, "all");

        input_creatingTarget.planList.forEach(input_plan => {
          input_planListOfTarget.value.forEach(plan => {
            if (input_plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });

        UI.hideLoading(loadingInstance);
      }
      // 当前正在编辑计划
      else if (input_editingTarget !== null && input_creatingTarget === null) {
        if (input_editingTarget.id === undefined) {
          UI.hideLoading(loadingInstance);
          UI.showNotification(
            vue.$notify,
            "出现错误",
            "input_editingTarget.id === undefined",
            "error"
          );
          return;
        }

        input_planListOfTarget.value = await Api.fetchPlanList(user, "all");

        input_editingTarget.planList.forEach(input_plan => {
          input_planListOfTarget.value.forEach(plan => {
            if (input_plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });

        UI.hideLoading(loadingInstance);
      } else {
        Log.error(
          "vm: TargetPage's initRelatedPlan",
          new Error(
            "please select input_editingTarget or input_creatingTarget to input"
          )
        );
        return;
      }

      // 尝试获取每日计划列表
      dailyPlanList.value = await Api.fetchPlanList(user, "daily");

      input_planName.value = "";

      isInputPlanTargetShow.value = false;
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "网络出错",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  openPlanTargetInputBox: (
    input_planName: Ref<string>,
    isInputPlanTargetShow: Ref<boolean>,
    input_dailyPlanTarget: Ref<string>
  ) => {
    // 输入检测
    const planName = _.trim(input_planName.value);
    if (planName.length === 0) {
      return;
    }
    input_dailyPlanTarget.value = "";
    isInputPlanTargetShow.value = true;
  },
  createTarget: async (
    vue: ElementVue,
    input_creatingTarget: InputTargetType,
    colormap: string[],
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 输入检测
    const targetName = _.trim(input_creatingTarget.name);
    if (targetName.length === 0) {
      UI.showNotification(
        vue.$notify,
        "输入有误",
        "目标名称不可为空",
        "warning"
      );
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在创建目标");

    try {
      // 获取 TargetSubject
      const targetSubject = await Api.findOrCreateTargetSubject(
        input_creatingTarget.subjectName,
        user
      );

      // 创建 Target
      const target = await Api.createTarget(
        user,
        targetSubject.id as string,
        input_creatingTarget.name,
        input_creatingTarget.description,
        "indefinite",
        input_creatingTarget.validity.length !== 0
          ? new Date(
              new Date(input_creatingTarget.validity).getTime() +
                3600 * 1000 * 24 -
                1
            )
          : null,
        [],
        input_creatingTarget.planList,
        input_creatingTarget.mileStoneList,
        true,
        false,
        colormap
      );

      // 刷新计划列表
      temporaryPlanList.value = await Api.fetchPlanList(user, "temporary");
      dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      completedPlanList.value = await Api.fetchPlanList(user, "completed");

      // 刷新目标列表
      targetSubjectList.value = await Api.fetchTargetSubjectList(user);

      UI.hideLoading(loadingInstance);
      Router.replace(vue.$router, "/target-ability");
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取目标列表失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  }
};
