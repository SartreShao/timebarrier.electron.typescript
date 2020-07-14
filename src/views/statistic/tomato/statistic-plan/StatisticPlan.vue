<template>
  <div class="container" v-infinite-scroll="loadMore">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statDate, index) in statDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>
        <date-item
          :date="statDate.date"
          :totalTime="statDate.totalTime"
          :color="colormap[index % colormap.length]"
          :todayPlanNumber="statDate.statPlanList.length"
          type="plan"
        ></date-item>

        <plan-charts
          :mode="planStatStatusMode"
          style="margin-top:0.15vh"
          :statPlanList="statDate.statPlanList"
        ></plan-charts>

        <plan-item
          v-for="(plan, planIndex) in statDate.statPlanList"
          :key="planIndex"
          :name="plan.attributes.name"
          style="margin-top:0.15vh"
          :tomato-number="plan.attributes.todayTomatoNumber"
          :target-tomato-number="plan.attributes.target"
          :totalTime="plan.attributes.totalTime"
          :currentTime="plan.attributes.todayTotalTime"
          :total-tomato-number="plan.attributes.tomatoNumber"
          :color="colormap[index % colormap.length]"
          :mode="planStatStatusMode"
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
  inject,
  watchEffect,
  computed
} from "@vue/composition-api";
import PlanItem from "../components/PlanItem.vue";
import DateItem from "../components/DateItem.vue";
import PlanCharts from "../components/PlanCharts.vue";
import { StatStatusMode } from "@/lib/types/vue-viewmodels";
import { StatPage } from "@/lib/vue-viewmodels/index";
import AV from "leancloud-storage";

export default defineComponent({
  components: { DateItem, PlanItem, PlanCharts },
  setup(props, context) {
    const tomatoList: Ref<AV.Object[]> = inject(Store.tomatoList, ref([]));

    const statDateList = computed(() => StatPage.mapStatDate(tomatoList.value));

    const planStatStatusMode: Ref<StatStatusMode> = inject(
      Store.planStatStatusMode,
      ref("simple")
    );

    const colormap: string[] = inject(Store.colormap, []);

    const loadMore = () => {
      StatPage.loadMore(context.root, tomatoList);
    };

    return {
      planStatStatusMode,
      colormap,
      statDateList,
      loadMore
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
