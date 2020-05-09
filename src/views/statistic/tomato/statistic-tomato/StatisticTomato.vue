<template>
  <div class="container">
    <div v-for="(statTomatoDate, index) in statTomatoDateList" :key="index">
      <date-item
        style="margin-top:0.15vh"
        @click="click_dateItem"
        :date="statTomatoDate.date"
        :todayTomatoNumber="statTomatoDate.todayTomatoNumber"
        :targetTomatoNumber="statTomatoDate.targetTomatoNumber"
        :totalTime="
          statTomatoDate.totalTime ? statTomatoDate.totalTime : `暂无用时数据`
        "
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
        :color="tomato.attributes.color"
        :mode="mode"
        :today-tomato-number="statTomatoDate.tomatoList.length - tomatoIndex"
        :target-tomato-number="statTomatoDate.targetTomatoNumber"
      ></tomato-item>
    </div>

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
import DateItem from "./components/DateItem.vue";
import TomatoItem from "./components/TomatoItem.vue";
import { StatTomatoPage } from "@/lib/vue-viewmodels";
import { StatTomatoDate, TomatoStatStatus } from "@/lib/types/vue-viewmodels";
import AV from "leancloud-storage";
import Store from "@/store";
export default defineComponent({
  components: { DateItem, TomatoItem },
  setup(props, context) {
    const statTomatoDateList: Ref<StatTomatoDate[]> = ref([]);

    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref([])
    );

    const mode: Ref<TomatoStatStatus> = ref("simple");

    const click_dateItem = () => {
      console.log("click");
      switch (mode.value) {
        case "detail":
          mode.value = "date";
          break;
        case "simple":
          mode.value = "detail";
          break;
        case "date":
          mode.value = "simple";
          break;
      }
    };

    onMounted(() => {
      StatTomatoPage.init(context.root, statTomatoDateList, dailyPlanList);
    });

    return { statTomatoDateList, mode, click_dateItem };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  height 75.31vh
  width 100%
  overflow scroll
}
</style>
