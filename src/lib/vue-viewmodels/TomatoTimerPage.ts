import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import Api from "@/lib/api";
import { ElementVue, TomatoCloudStatus } from "@/lib/types/vue-viewmodels";
/**
 * 番茄计时器页
 */
export default {
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
        }, 1000);
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
