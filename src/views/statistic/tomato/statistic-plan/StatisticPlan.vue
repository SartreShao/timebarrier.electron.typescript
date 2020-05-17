<template>
  <div class="container">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statPlanDate, index) in statPlanDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>
        <date-item
          :date="statPlanDate.date"
          :totalTime="
            statPlanDate.totalTime ? statPlanDate.totalTime : undefined
          "
          :color="colormap[index % colormap.length]"
          :todayTargetNumber="statPlanDate.todayPlanNumber"
          type="target"
        ></date-item>

        <plan-item
          v-for="(plan, planIndex) in statPlanDate.statPlanList"
          :key="planIndex"
          :name="plan.attributes.name"
          style="margin-top:0.15vh"
          :tomato-number="plan.attributes.todayTomatoNumber"
          :target-tomato-number="plan.attributes.target"
          :totalTime="plan.attributes.totalTime"
          :currentTime="plan.attributes.todayTotalTime"
          :total-tomato-number="plan.attributes.tomatoNumber"
          :color="colormap[planIndex % colormap.length]"
        ></plan-item>
      </div>
    </transition-group>
    <div style="height:12.32vh"></div>
  </div>
</template>

<script lang="ts">
import Store from "@/store";
import {
  defineComponent,
  Ref,
  ref,
  onMounted,
  inject
} from "@vue/composition-api";
import PlanItem from "../components/PlanItem.vue";
import DateItem from "../components/DateItem.vue";
import { StatPlanDate } from "@/lib/types/vue-viewmodels";
import { StatPlanPage } from "@/lib/vue-viewmodels";

export default defineComponent({
  components: { DateItem, PlanItem },
  setup(props, context) {
    const statPlanDateList: Ref<StatPlanDate[]> = ref([]);
    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatPlanPage.init(context.root, statPlanDateList);
    });
    return {
      statPlanDateList,
      colormap
    };
  }
});
</script>

<style lang="stylus" scoped>
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
