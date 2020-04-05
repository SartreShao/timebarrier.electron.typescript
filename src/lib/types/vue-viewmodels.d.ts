import { ElNotification } from "element-ui/types/notification";
import {
  LoadingServiceOptions,
  ElLoadingComponent,
} from "element-ui/types/loading";
import VueRouter from "vue-router";
import {
  ElMessageBoxOptions,
  MessageBoxData,
} from "element-ui/types/message-box";

/**
 * 计划的类别
 */
export type PlanType = "temporary" | "daily";

export type InputPlanType = {
  id: string | undefined;
  name: string;
  type: PlanType;
  description: string;
  isActived: boolean;
  isFinished: boolean;
  target: string;
};

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
