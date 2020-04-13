// Plan
import { provide, ref } from "@vue/composition-api";
import AV from "leancloud-storage";
import { TomatoCloudStatus } from "@/lib/types/vue-viewmodels";

// 临时计划列表
const temporaryPlanList = Symbol();
// 已完成计划的列表
const completedPlanList = Symbol();
// 每日计划的列表
const dailyPlanList = Symbol();
// 「目标类别」的列表
const targetSubjectList = Symbol();
// 「目标」的列表
const targetList = Symbol();
// 已完成的目标列表
const completedTargetList = Symbol();
// 番茄钟的状态
const tomatoCloudStatus = Symbol();
// 番茄中的计时器
const interval = Symbol();
// 番茄钟的表盘值
const countDown = Symbol();
// 番茄开始的时间
const tomatoStartTime = Symbol();
// 控制变量：「创建目标」的抽屉菜单是否打开
const isCreateTargetDrawerDisplayed = Symbol();

/**
 * @TODO 像 vuex 一样，可以把在哪里调用的打印出来
 * 全局只调用一次，在 App.vue 中调用
 */
function useProvider() {
  provide(temporaryPlanList, ref<AV.Object[]>([]));
  provide(completedPlanList, ref<AV.Object[]>([]));
  provide(dailyPlanList, ref<AV.Object[]>([]));
  provide(targetSubjectList, ref<AV.Object[]>([]));
  provide(targetList, ref<AV.Object[]>([]));
  provide(completedTargetList, ref<AV.Object[]>([]));
  const preparedTomatoCloudStatus: TomatoCloudStatus = "prepared";
  provide(tomatoCloudStatus, ref<TomatoCloudStatus>(preparedTomatoCloudStatus));
  provide(interval, ref<NodeJS.Timeout | null>(null));
  provide(countDown, ref<number>(1500));
  provide(tomatoStartTime, ref<Date>(Date()));
  provide(isCreateTargetDrawerDisplayed, ref<boolean>(false));
}

export default {
  useProvider,
  temporaryPlanList,
  completedPlanList,
  dailyPlanList,
  targetSubjectList,
  targetList,
  completedTargetList,
  tomatoCloudStatus,
  interval,
  countDown,
  tomatoStartTime,
  isCreateTargetDrawerDisplayed
};
