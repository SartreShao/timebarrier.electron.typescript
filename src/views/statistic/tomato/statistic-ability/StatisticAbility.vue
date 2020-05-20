<template>
  <div class="container">
    <transition-group type="transition" name="flip-list"> </transition-group>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted
} from "@vue/composition-api";
import DateItem from "../components/DateItem.vue";
import AbilityCharts from "../components/AbilityCharts.vue";
import AbilityItem from "../components/AbilityItem.vue";
import { StatAbilityDate, StatStatusMode } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { StatAbilityPage } from "@/lib/vue-viewmodels";

export default defineComponent({
  components: { DateItem, AbilityCharts, AbilityItem },
  setup(props, context) {
    const statAbilityDateList: Ref<StatAbilityDate[]> = ref([]);

    const abilityStatStatusMode: Ref<StatStatusMode> = inject(
      Store.abilityStatStatusMode,
      ref("simple")
    );

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatAbilityPage.init(context.root, statAbilityDateList);
    });

    return {
      statAbilityDateList,
      abilityStatStatusMode,
      colormap
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
</style>
