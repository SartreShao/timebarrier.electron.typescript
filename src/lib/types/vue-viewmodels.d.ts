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

export type PlanType = "temporary" | "daily" | "completed";

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

export type TomatoCloudStatus = "prepared" | "finished" | "processive";
