<template>
  <div class="date-item-container" @click="$emit('click')">
    <div class="date" v-if="type === `tomato`">
      {{ date }}｜{{ todayTomatoNumber }} / {{ targetTomatoNumber }} 番茄｜{{
        totalTimeFormat ? totalTimeFormat : "暂无用时数据"
      }}
    </div>
    <div class="date" v-if="type === `target`">
      {{ date }}｜训练了 {{ todayTargetNumber }} 种目标｜{{
        totalTimeFormat ? totalTimeFormat : "暂无用时数据"
      }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, computed } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    date: String,
    todayTomatoNumber: Number,
    targetTomatoNumber: Number,
    todayTargetNumber: Number,
    totalTime: Number,
    color: String,
    type: String
  },
  setup(props, context) {
    const totalTimeFormat = computed(() =>
      props.totalTime
        ? UI.formatTimeHourMinute(Number(props.totalTime / 1000))
        : undefined
    );
    return {
      totalTimeFormat
    };
  }
});
</script>

<style lang="stylus" scoped>
.date-item-container {
  width 100vw
  height 5.55vh
  background #fff
  display flex
  align-items center
  justify-content center
  flex-direction column
  position relative
  .date {
    height 2.62vh
    font-size 1.8vh
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align center
    color #222A36
  }
}
</style>
