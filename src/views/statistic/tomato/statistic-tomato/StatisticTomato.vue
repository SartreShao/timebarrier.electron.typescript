<template>
  <div class="container">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statDate, index) in statDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>

        <date-item
          :date="statDate.date"
          :todayTomatoNumber="statDate.tomatoList.length"
          :targetTomatoNumber="targetTomatoNumber"
          :totalTime="statDate.totalTime"
          :color="colormap[index % colormap.length]"
          type="tomato"
        ></date-item>

        <tomato-item
          v-for="(tomato, tomatoIndex) in statDate.tomatoList"
          :key="tomato.id"
          style="margin-top:0.15vh"
          :tomato-name="tomato.attributes.name"
          :tomato-description="tomato.attributes.description"
          :target-name-list="tomato.attributes.targetNameList"
          :ability-name-list="tomato.attributes.abilityNameList"
          :startTime="tomato.attributes.startTime"
          :endTime="tomato.createdAt"
          :mode="tomatoStatStatusMode"
          :today-tomato-number="statDate.tomatoList.length - tomatoIndex"
          :target-tomato-number="targetTomatoNumber"
          :color="colormap[index % colormap.length]"
          :item-color="tomato.attributes.color"
        ></tomato-item>

        <stat-tomato-item
          v-for="statTomato in statDate.statTomatoList"
          :key="statTomato.name"
          style="margin-top:0.15vh"
          :tomatoName="statTomato.attributes.name"
          :todayTotalTime="statTomato.attributes.todayTotalTime"
          :color="statTomato.attributes.color"
          :mode="tomatoStatStatusMode"
          :todayTomatoNumber="statTomato.attributes.todayTomatoNumber"
        ></stat-tomato-item>
      </div>
    </transition-group>

    <div style="height:2.4vh"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  Ref,
  ref,
  inject,
  watchEffect,
  computed
} from "@vue/composition-api";
import DateItem from "../components/DateItem.vue";
import TomatoItem from "../components/TomatoItem.vue";
import PlanItem from "../components/PlanItem.vue";
import StatTomatoItem from "../components/StatTomatoItem.vue";
import { StatTomatoPage, StatPage } from "@/lib/vue-viewmodels/index";
import {
  StatTomatoDate,
  StatStatusMode,
  TomatoStatStatusMode,
  StatDate
} from "@/lib/types/vue-viewmodels";
import AV from "leancloud-storage";
import Store from "@/store";
export default defineComponent({
  components: { DateItem, TomatoItem, PlanItem, StatTomatoItem },
  setup(props, context) {
    const tomatoList: Ref<AV.Object[]> = inject(Store.tomatoList, ref([]));

    const statDateList = computed(() => StatPage.mapStatDate(tomatoList.value));

    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref([])
    );

    const targetTomatoNumber = computed(() => {
      let targetTomatoNumber = 0;
      dailyPlanList.value.forEach(plan => {
        targetTomatoNumber += plan.attributes.target;
      });
      return targetTomatoNumber;
    });

    const tomatoStatStatusMode: Ref<TomatoStatStatusMode> = inject(
      Store.tomatoStatStatusMode,
      ref("detail")
    );

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatPage.initTomatoList(context.root, tomatoList);
      StatPage.initDailyTomatoList(context.root, dailyPlanList);
    });

    return {
      tomatoStatStatusMode,
      colormap,
      statDateList,
      targetTomatoNumber
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
