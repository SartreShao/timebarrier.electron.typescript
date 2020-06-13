<template>
  <div class="container">
    <plan-rectangular-tree></plan-rectangular-tree>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  inject,
  Ref,
  computed,
  watchEffect,
  onMounted
} from "@vue/composition-api";
import AverageScatterDiagram from "../components/AverageScatterDiagram.vue";
import TotalScatterDiagram from "../components/TotalScatterDiagram.vue";
import PeriodBarChart from "../components/PeriodBarChart.vue";
import WeekBarChart from "../components/WeekBarChart.vue";
import MonthBarChart from "../components/MonthBarChart.vue";
import InfoItem from "../components/InfoItem.vue";
import Store from "@/store";
import AV from "leancloud-storage";
import { StatPage } from "@/lib/vue-viewmodels";
import { TwoChronotype } from "../../../../lib/types/vue-viewmodels";
import { UI } from "@/lib/vue-utils";
import PlanRectangularTree from "../components/PlanRectangularTree.vue";
export default defineComponent({
  components: { PlanRectangularTree },
  setup(props, context) {
    // 外部注入的番茄列表
    const tomatoList: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    onMounted(() => {
      if (dateRange.value.length === 2) {
        const startTime = dateRange.value[0];
        const endTime = dateRange.value[1];
        StatPage.initTomatoListWithDateRange(
          context.root,
          tomatoList,
          startTime,
          endTime
        );
      }
    });
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  display flex
  flex-direction column
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
.horizontal-container {
  width 100%
  height 7.8vh
  display flex
  justify-content space-between
  background #F5F5F5
}
</style>
