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
  description: string;
  isActived: boolean;
  isFinished: boolean;
  target: string;
};

// 输入目标的类别
export type InputTargetOrTargetSubjectType = {
  inputType: "target" | "targetSubject";
  target: {
    // 当选择为 `target` 时，单选框「目标类别」的值
    targetSubjectId: string;
    // 目标名称
    targetName: string;
    // 达成目标的条件
    targetDescription: string;
    // 目标有效期类型
    validityType: "time-bound" | "indefinite" | "";
    // 目标有效期
    validity: Date | null;
    // 关联的能力
    abilityList: { id: string; name: string }[];
    // 是否激活
    isActived: boolean;
    // 是否已完成
    isFinished: boolean;
  };
  targetSubject: {
    // 目标名称
    targetSubjectName: string;
  };
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
