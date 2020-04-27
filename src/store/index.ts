// Plan
import { provide, ref, reactive } from "@vue/composition-api";
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
const unSubjectiveTargetList = Symbol();
// 已完成的目标列表
const completedTargetList = Symbol();
// 番茄钟的状态
const tomatoCloudStatus = Symbol();
// 番茄中的计时器
const tomatoClockInterval = Symbol();
// 番茄钟的表盘值
const countDown = Symbol();
// 番茄开始的时间
const tomatoStartTime = Symbol();
// 控制变量：「创建目标」的抽屉菜单是否打开
const isCreateTargetDrawerDisplayed = Symbol();
// 控制变量：「编辑目标」的抽屉菜单是否打开
const isEditTargetDrawerDisplayed = Symbol();
// 用户输入：编辑「目标 Target」
const input_editingTargetOrTargetSubject = Symbol();
// 用户输入：创建「目标 Target」
const input_creatingTargetOrTargetSubject = Symbol();
// 配置信息：Vue Dragger
const draggableOptions = Symbol();
// 色彩表
const colormap = Symbol();
// 等级规则
const levelRuleList = Symbol();
// 能力列表
const abilityList = Symbol();

/**
 * @TODO 像 vuex 一样，可以把在哪里调用的打印出来
 * 全局只调用一次，在 App.vue 中调用
 */
function useProvider() {
  provide(temporaryPlanList, ref<AV.Object[]>([]));
  provide(completedPlanList, ref<AV.Object[]>([]));
  provide(dailyPlanList, ref<AV.Object[]>([]));
  provide(targetSubjectList, ref<AV.Object[]>([]));
  provide(unSubjectiveTargetList, ref<AV.Object[]>([]));
  provide(completedTargetList, ref<AV.Object[]>([]));
  const preparedTomatoCloudStatus: TomatoCloudStatus = "prepared";
  provide(tomatoCloudStatus, ref<TomatoCloudStatus>(preparedTomatoCloudStatus));
  provide(tomatoClockInterval, ref<NodeJS.Timeout | null>(null));
  provide(countDown, ref<number>(1500));
  provide(tomatoStartTime, ref<Date>(Date()));
  provide(isCreateTargetDrawerDisplayed, ref<boolean>(false));
  provide(isEditTargetDrawerDisplayed, ref<boolean>(false));
  provide(
    input_editingTargetOrTargetSubject,
    reactive({
      inputType: "target", // 默认选择：目标
      target: {
        id: "",
        targetSubjectId: "", //默认：不选择
        name: "",
        description: "",
        validityType: "",
        validity: null,
        abilityList: [],
        isActived: true,
        isFinished: false
      },
      targetSubject: {
        id: "",
        name: ""
      }
    })
  );
  provide(
    input_creatingTargetOrTargetSubject,
    reactive({
      inputType: "target", // 默认选择：目标
      target: {
        id: "",
        targetSubjectId: "", //默认：不选择
        name: "",
        description: "",
        validityType: "",
        validity: null,
        abilityList: [],
        isActived: true,
        isFinished: false
      },
      targetSubject: {
        id: "",
        name: ""
      }
    })
  );
  provide(draggableOptions, {
    chosenClass: "draggable-chosen",
    ghostClass: "draggable-ghost",
    dragClass: "draggable-drag",
    delayOnTouchOnly: true, //开启触摸延时
    direction: "vertical", //拖动方向
    delay: 200, //延时时长
    touchStartThreshold: 3 //防止某些手机过于敏感(3~5 效果最好)
  });
  provide(colormap, [
    "#3846CF",
    "#FF5050",
    "#FF9300",
    "#007644",
    "#520076",
    "#536761",
    "#0A5CA7",
    "#009D97",
    "#59596F",
    "#CE0057"
  ]);
  provide(levelRuleList, ref<AV.Object[]>([]));
  provide(abilityList, ref<AV.Object[]>([]));
}

export default {
  useProvider,
  temporaryPlanList,
  completedPlanList,
  dailyPlanList,
  targetSubjectList,
  unSubjectiveTargetList,
  completedTargetList,
  tomatoCloudStatus,
  tomatoClockInterval,
  countDown,
  tomatoStartTime,
  isCreateTargetDrawerDisplayed,
  isEditTargetDrawerDisplayed,
  input_editingTargetOrTargetSubject,
  input_creatingTargetOrTargetSubject,
  draggableOptions,
  colormap,
  levelRuleList,
  abilityList
};
