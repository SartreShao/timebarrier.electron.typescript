import { Router } from "@/lib/vue-utils";
import { ElementVue, TargetAbilityTabType } from "@/lib/types/vue-viewmodels";
export default {
  switchTab: (vue: ElementVue, target: TargetAbilityTabType) => {
    Router.replace(vue.$router, "/target-ability/" + target);
  }
};
