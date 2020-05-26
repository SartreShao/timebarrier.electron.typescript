<template>
  <div class="container">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statDate, index) in statDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>

        <date-item
          :date="statDate.date"
          :totalTime="statDate.totalTime"
          :color="colormap[index % colormap.length]"
          :todayTargetNumber="statDate.statTargetList.length"
          type="target"
        ></date-item>

        <target-charts
          :mode="targetStatStatusMode"
          style="margin-top:0.15vh"
          :statTargetList="statDate.statTargetList"
        ></target-charts>

        <target-item
          v-for="(target, targetIndex) in statDate.statTargetList"
          :key="targetIndex"
          :name="target.attributes.name"
          style="margin-top:0.15vh"
          :tomato-number="target.attributes.todayTomatoNumber"
          :target-tomato-number="target.attributes.targetTomatoNumber"
          :totalTime="target.attributes.totalTime"
          :currentTime="target.attributes.todayTotalTime"
          :total-tomato-number="target.attributes.tomatoNumber"
          :color="colormap[targetIndex % colormap.length]"
          :mode="targetStatStatusMode"
        ></target-item>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  inject,
  onMounted,
  computed
} from "@vue/composition-api";
import { StatStatusMode } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { StatTargetPage, StatPage } from "@/lib/vue-viewmodels/index";
import DateItem from "../components/DateItem.vue";
import TargetCharts from "../components/TargetCharts.vue";
import AV from "leancloud-storage";
import TargetItem from "../components/TargetItem.vue";

export default defineComponent({
  components: { DateItem, TargetItem, TargetCharts },
  setup(props, context) {
    const tomatoList: Ref<AV.Object[]> = inject(Store.tomatoList, ref([]));

    const statDateList = computed(() => StatPage.mapStatDate(tomatoList.value));

    const targetStatStatusMode: Ref<StatStatusMode> = inject(
      Store.targetStatStatusMode,
      ref("simple")
    );

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatPage.initTomatoList(context.root, tomatoList);
    });

    return {
      targetStatStatusMode,
      colormap,
      statDateList
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
