import { Ref } from "@vue/composition-api";
import AV from "leancloud-storage";
import { PlanPage, TargetPage, AbilityPage, StatPage } from ".";
import { ElementVue } from "../types/vue-viewmodels";
import { UI } from "../vue-utils";
import Api from "@/lib/api";

export default {
  /**
   * 1. 临时计划列表：temporaryPlanList
   * 2. 每日计划列表：dailyPlanList
   * 3. 已完成的计划列表：completedPlanList
   * 4. 未分组的目标列表：unSubjectiveTargetList
   * 5. 已分组的目标列表：targetSubjectList
   * 6. 已完成的目标列表：completedTargetList
   * 7. 能力列表：abilityList
   * 8. 能力等级列表：levelRuleList
   * 9. 番茄列表：tomatoList
   * 10. 用户完成的总番茄数：totalTomatoNumber
   * 11. 用户完成的总时间：totalTime
   * 12. 今年完成的番茄列表：thisYearTomatoList
   */
  fetchAppData: async (
    vue: ElementVue,
    temporaryPlanList: Ref<AV.Object[]>,
    dailyPlanList: Ref<AV.Object[]>,
    completedPlanList: Ref<AV.Object[]>,
    unSubjectiveTargetList: Ref<AV.Object[]>,
    targetSubjectList: Ref<AV.Object[]>,
    completedTargetList: Ref<AV.Object[]>,
    abilityList: Ref<AV.Object[]>,
    levelRuleList: Ref<AV.Object[]>,
    tomatoList: Ref<AV.Object[]>,
    totalTomatoNumber: Ref<string>,
    totalTime: Ref<string>,
    thisYearTomatoList: Ref<AV.Object[]>
  ) => {
    // 请求计划列表
    await PlanPage.init(
      vue,
      temporaryPlanList,
      dailyPlanList,
      completedPlanList
    );

    // 请求目标列表
    await TargetPage.init(
      vue,
      unSubjectiveTargetList,
      completedTargetList,
      targetSubjectList
    );

    // 请求能力列表
    await AbilityPage.init(vue, abilityList, levelRuleList);

    // 请求番茄列表
    await StatPage.initTomatoList(vue, tomatoList);

    // 请求用户完成的总番茄数
    await StatPage.fetchTotalTomatoAndTime(vue, totalTomatoNumber, totalTime);

    // 本年的番茄列表
    await StatPage.initTomatoListWithDateRange(
      vue,
      thisYearTomatoList,
      new Date(UI.getYearStartTimestamp(new Date().getTime())),
      new Date(UI.getTodayStartTimestamp(new Date().getTime()))
    );
  },
  isClosedBeta: async (isClosedBeta: Ref<boolean>) => {
    isClosedBeta.value = await Api.isClosedBeta();
    console.log("fuck", isClosedBeta.value);
  }
};
