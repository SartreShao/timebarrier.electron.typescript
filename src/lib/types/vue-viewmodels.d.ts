import { ElNotification } from "element-ui/types/notification";
import {
  LoadingServiceOptions,
  ElLoadingComponent
} from "element-ui/types/loading";
import VueRouter from "vue-router";
import {
  ElMessageBoxOptions,
  MessageBoxData
} from "element-ui/types/message-box";
import AV from "leancloud-storage";

/**
 * 计划的类别
 */
export type PlanType = "temporary" | "daily";

// 输入计划的类别
export type InputPlanType = {
  id: string | undefined;
  name: string;
  type: PlanType;
  abilityList: { id: string; name: string }[];
  targetList: { id: string; name: string }[];
  isActived: boolean;
  isFinished: boolean;
  target: string;
};

// 输入目标的类别
export type InputTargetOrTargetSubjectType = {
  inputType: "target" | "targetSubject";
  target: {
    id: string | undefined;
    // 当选择为 `target` 时，单选框「目标类别」的值
    targetSubjectId: string | null;
    // 目标名称
    name: string;
    // 达成目标的条件
    description: string;
    // 目标有效期类型
    validityType: "time-bound" | "indefinite" | "";
    // 目标有效期
    validity: Date | null;
    // 关联的能力
    abilityList: { id: string; name: string }[];
    // 关联的计划
    planList: { id: string; name: string }[];
    // 是否激活
    isActived: boolean;
    // 是否已完成
    isFinished: boolean;
  };
  targetSubject: {
    id: string | undefined;
    // 目标名称
    name: string;
  };
};

// 输入能力的类别
export type InputAbilityType = {
  id: string | undefined;
  name: string;
  targetList: { id: string; name: string }[];
  planList: { id: string; name: string }[];
  isActived: boolean;
  isFinished: boolean;
};

// 底边栏 TAB 的类别
export type TabType = "plan" | "target-ability" | "statistic" | "me";

// 「目标-能力」TAB 的类别
export type TargetAbilityTabType = "target" | "ability";

export interface ElementVue {
  $notify: ElNotification;
  $loading: (options: LoadingServiceOptions) => ElLoadingComponent;
  $router: VueRouter;
  $confirm: (
    message: string,
    title: string,
    options?: ElMessageBoxOptions | undefined
  ) => Promise<MessageBoxData>;
}

/**
 * 番茄时钟的状态
 */
export type TomatoCloudStatus = "prepared" | "finished" | "processive";

export interface StatDate {
  date: string; // 日期：格式化为 xx 年 xx 月 xx 日
  timeStamp: number; // 时间戳：startTime 为准
  tomatoList: AV.Object[]; // 今日训练的番茄列表
  totalTime?: number; // 今日训练总时长，可由 tomatoList 映射得出
  statTomatoList?: AV.Object[]; // 今日训练的统计番茄列表，可由 tomatoList 映射得出
  statPlanList?: AV.Object[]; // 今日训练的统计计划列表，可由 tomatoList 映射得出
  statAbilityList?: AV.Object[]; // 今日训练的统计能力列表，可由 tomatoList 映射得出
  statTargetList?: AV.Object[]; // 今日训练的目标能力列表，可由 tomatoList 映射得出
}

export interface StatTomatoDate {
  date: string;
  timeStamp: Number;
  todayTomatoNumber: number;
  targetTomatoNumber: number;
  totalTime: number;
  tomatoList: AV.Object[];
  statTomatoList?: AV.Object[];
}

export interface StatTargetDate {
  date: string;
  todayTargetNumber: number;
  totalTime: number;
  targetList: AV.Object[];
  statTargetList?: AV.Object[];
}

export interface StatAbilityDate {
  date: string;
  todayAbilityNumber: number;
  totalTime: number;
  abilityList: AV.Object[];
  statAbilityList?: AV.Object[];
}

export interface StatPlanDate {
  date: string;
  todayPlanNumber: number;
  totalTime: number;
  planList: AV.Object[];
  statPlanList?: AV.Object[];
}

export type StatStatusMode = "date" | "detail" | "simple";

export type TomatoStatStatusMode = "date" | "detail" | "simple" | "stat";
