import { Ref } from "@vue/composition-api";
import { TomatoStatStatusMode } from "../types/vue-viewmodels";

export default {
  changeStatStatusMode: (statStatusMode: Ref<TomatoStatStatusMode>) => {
    switch (statStatusMode.value) {
      case "detail":
        statStatusMode.value = "stat";
        break;
      case "simple":
        statStatusMode.value = "detail";
        break;
      case "stat":
        statStatusMode.value = "date";
        break;
      case "date":
        statStatusMode.value = "simple";
        break;
    }
  }
};
