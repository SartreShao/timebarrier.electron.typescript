<template>
  <div class="container">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statTargetDate, index) in statTargetDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>

        <date-item
          :date="statTargetDate.date"
          :totalTime="
            statTargetDate.totalTime ? statTargetDate.totalTime : undefined
          "
          :color="colormap[index % colormap.length]"
          :todayTargetNumber="statTargetDate.todayTargetNumber"
          type="target"
        ></date-item>

        <target-item
          v-for="(target, targetIndex) in statTargetDate.targetList"
          :key="targetIndex"
          style="margin-top:0.15vh"
          :target-name="target.attributes.name"
          :plan-name="target.attributes.planOfTarget.attributes.name"
          :startTime="target.attributes.tomatoOfTarget.attributes.startTime"
          :endTime="target.attributes.tomatoOfTarget.createdAt"
          :color="colormap[index]"
          :mode="targetStatStatusMode"
          :item-color="colormap[targetIndex % colormap.length]"
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
  onMounted
} from "@vue/composition-api";
import { StatTargetDate, StatStatusMode } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { StatTargetPage } from "@/lib/vue-viewmodels";
import DateItem from "../components/DateItem.vue";
import TargetItem from "../components/TargetItem.vue";

export default defineComponent({
  components: { DateItem, TargetItem },
  setup(props, context) {
    const statTargetDateList: Ref<StatTargetDate[]> = ref([]);

    const targetStatStatusMode: Ref<StatStatusMode> = inject(
      Store.targetStatStatusMode,
      ref("detail")
    );

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatTargetPage.init(context.root, statTargetDateList);
    });

    return {
      statTargetDateList,
      targetStatStatusMode,
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
