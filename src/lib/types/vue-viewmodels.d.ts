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

// 底边栏 TAB 的类别
export type TabType = "plan" | "target-ability" | "statistic" | "me";

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
