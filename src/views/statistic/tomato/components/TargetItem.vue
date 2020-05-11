<template>
  <div class="target-item-container" v-if="mode !== `date`">
    <div class="time">
      {{ startTimeFormat }} - {{ endTimeFormat }}｜{{ duration }}
    </div>

    <div class="target-name">
      {{ targetName }}
    </div>
    <div class="plan-name" v-if="planName">
      {{ planName }}
    </div>

    <div style="height:2.32vh"></div>

    <div class="line-container">
      <div class="line" :style="{ borderLeft: `0.4vw ${color} dashed` }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    targetName: String,
    planName: String,
    startTime: Date,
    endTime: Date,
    color: String,
    mode: String
  },
  setup(props, context) {
    const startTimeFormat = computed(() =>
      UI.dateToHourMinute12(props.startTime as any)
    );

    const endTimeFormat = computed(() =>
      UI.dateToHourMinute12(props.endTime as any)
    );

    const duration = UI.formatTime(
      ((props.endTime as any).getTime() - (props.startTime as any).getTime()) /
        1000,
      true
    );

    return {
      startTimeFormat,
      endTimeFormat,
      duration
    };
  }
});
</script>

<style lang="stylus" scoped>
.target-item-container {
  background white
  width 100vw
  display flex
  flex-direction column
  position relative
  .line-container {
    position absolute
    width 0.4vw
    height 100%
    left 5.22vw
    display flex
    flex-direction column
    align-items center
    .line {
      height 100%
      opacity 0.5
      border-left 0.4vw #3846cf dashed
    }
  }
  .time {
    margin-top 1.2vh
    margin-left 18.13vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 2.62vh
    letter-spacing normal
    text-align left
    color #222a36
  }
  .target-name {
    margin-left 18.13vw
    margin-top 0.67vh
    width 63.73vw
    font-size 2.1vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 3vh
    letter-spacing normal
    text-align left
    color #222a36
  }
  .plan-name {
    margin-top 0.67vh
    margin-left 18.13vw
    width 63.73vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 2.62vh
    letter-spacing normal
    text-align left
    color #222a36
  }
  .related-target-list {
    margin-top 1.5vh
    margin-left 18.13vw
    width 76.8vw
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 2.62vh
    letter-spacing normal
    text-align left
    color #959595
    span {
      color #222a36
      font-size 1.8vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 2.62vh
      letter-spacing normal
      text-align left
    }
  }
  .related-ability-list {
    margin-top 1.5vh
    margin-left 18.13vw
    width 76.8vw
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align left
    color #959595
    span {
      color #222a36
      font-size 1.8vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.46
      letter-spacing normal
      text-align left
    }
  }
}
</style>
