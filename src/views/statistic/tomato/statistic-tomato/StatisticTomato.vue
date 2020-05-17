<template>
  <div class="container">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statTomatoDate, index) in statTomatoDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>

        <date-item
          :date="statTomatoDate.date"
          :todayTomatoNumber="statTomatoDate.todayTomatoNumber"
          :targetTomatoNumber="statTomatoDate.targetTomatoNumber"
          :totalTime="
            statTomatoDate.totalTime ? statTomatoDate.totalTime : undefined
          "
          :color="colormap[index % colormap.length]"
          type="tomato"
        ></date-item>

        <tomato-item
          v-for="(tomato, tomatoIndex) in statTomatoDate.tomatoList"
          :key="tomato.id"
          style="margin-top:0.15vh"
          :tomato-name="tomato.attributes.name"
          :tomato-description="tomato.attributes.description"
          :target-name-list="tomato.attributes.targetNameList"
          :ability-name-list="tomato.attributes.abilityNameList"
          :startTime="tomato.attributes.startTime"
          :endTime="tomato.createdAt"
          :mode="tomatoStatStatusMode"
          :today-tomato-number="statTomatoDate.tomatoList.length - tomatoIndex"
          :target-tomato-number="statTomatoDate.targetTomatoNumber"
          :color="colormap[index % colormap.length]"
          :item-color="tomato.attributes.color"
        ></tomato-item></div
    ></transition-group>

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
  watchEffect
} from "@vue/composition-api";
import DateItem from "../components/DateItem.vue";
import TomatoItem from "../components/TomatoItem.vue";
import PlanItem from "../components/PlanItem.vue";
import { StatTomatoPage } from "@/lib/vue-viewmodels";
import { StatTomatoDate, StatStatusMode } from "@/lib/types/vue-viewmodels";
import AV from "leancloud-storage";
import Store from "@/store";
export default defineComponent({
  components: { DateItem, TomatoItem, PlanItem },
  setup(props, context) {
    const statTomatoDateList: Ref<StatTomatoDate[]> = ref([]);

    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref([])
    );

    const tomatoStatStatusMode: Ref<StatStatusMode> = inject(
      Store.tomatoStatStatusMode,
      ref("detail")
    );

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatTomatoPage.init(context.root, statTomatoDateList, dailyPlanList);
    });

    return {
      statTomatoDateList,
      tomatoStatStatusMode,
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
