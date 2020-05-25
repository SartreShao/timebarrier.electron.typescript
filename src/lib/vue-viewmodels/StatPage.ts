import { Ref } from "@vue/composition-api";
import { StatStatusMode } from "@/lib/types/vue-viewmodels";
export default {
  changeStatStatusMode: (statStatusMode: Ref<StatStatusMode>) => {
    switch (statStatusMode.value) {
      case "detail":
        statStatusMode.value = "date";
        break;
      case "simple":
        statStatusMode.value = "detail";
        break;
      case "date":
        statStatusMode.value = "simple";
        break;
    }
  }
};
