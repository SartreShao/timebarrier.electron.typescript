import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import { ElementVue, StatPlanDate } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";

export default {
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
