// Plan
import { provide, ref } from "@vue/composition-api";
import AV from "leancloud-storage";

// 临时计划列表
const temporaryPlanList = Symbol();
// 已完成计划的列表
const completedPlanList = Symbol();
// 每日计划的列表
const dailyPlanList = Symbol();

/**
 * 全局只调用一次，在 App.vue 中调用
 */
function useProvider() {
  provide(temporaryPlanList, ref<AV.Object[]>([]));
  provide(completedPlanList, ref<AV.Object[]>([]));
  provide(dailyPlanList, ref<AV.Object[]>([]));
}

export default {
  useProvider,
  temporaryPlanList,
  completedPlanList,
  dailyPlanList
};
