<template>
  <div class="target-item-container" v-if="mode === `simple`">
    <aside v-bind:style="{ width: widthPercent, background: color }"></aside>
    <div class="tomato-container" v-if="targetTomatoNumber">
      <div class="percent">
        {{ ((tomatoNumber / targetTomatoNumber) * 100).toFixed(0) + "%" }}
      </div>
      <div class="tomato">{{ tomatoNumber }} / {{ targetTomatoNumber }}</div>
    </div>
    <div class="tomato-number" v-if="!targetTomatoNumber">
      {{ tomatoNumber }} 番茄
    </div>
    <div class="name">{{ name }}</div>
    <div class="total">
      <span v-if="totalTimeFormat.length !== 0"
        >共累计 {{ totalTimeFormat }}， {{ totalTomatoNumber }} 个番茄</span
      >
      <span v-else>临时计划</span>
    </div>
    <div class="time">{{ currentTimeFormat }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    tomatoNumber: Number,
    targetTomatoNumber: Number,
    name: String,
    time: String,
    color: String,
    totalTime: Number,
    totalTomatoNumber: Number,
    currentTime: Number,
    mode: String
  },
  setup(props, context) {
    const widthPercent = computed(
      () =>
        String(
          ((props.tomatoNumber as number) /
            (props.targetTomatoNumber as number)) *
            100 +
            2.5
        ) + "%"
    );

    const currentTimeFormat = computed(() =>
      props.currentTime
        ? UI.formatTimeHourMinute((props.currentTime as any) / 1000)
        : ""
    );

    const totalTimeFormat = computed(() =>
      props.totalTime
        ? UI.formatTimeHourMinute((props.totalTime as any) / 1000)
        : ""
    );

    return {
      widthPercent,
      currentTimeFormat,
      totalTimeFormat
    };
  }
});
</script>

<style lang="stylus" scoped>
// $backgroundColor = #ffffff // #222a36
// $textColor = #222a36 // #ffffff
$backgroundColor = #222a36 // #222a36
$textColor = #ffffff // #ffffff
.target-item-container {
  overflow-x hidden
  width 100%
  position relative
  background $backgroundColor
  display flex
  flex-direction column
}
aside {
  position absolute
  height 100%
  border-radius 0 4.5vh 1.57vh 0
  bottom 0
  left 0
}
.tomato-container {
  height 4.72vh
  position absolute
  left 4.67vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  display flex
  flex-direction column
  align-items center
  justify-content space-between
  .percent {
    font-size 1.65vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.45
    letter-spacing normal
    text-align center
    color $textColor
  }
  .tomato {
    opacity 0.49
    font-size 1.5vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.45
    letter-spacing normal
    text-align center
    color $textColor
  }
}
.tomato-number {
  height 2.4vh
  position absolute
  left 4.67vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  font-size 1.65vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.45
  letter-spacing normal
  text-align center
  color $textColor
}
.name {
  width 56.67vw
  margin-left 18.13vw
  margin-top 2.32vh
  font-size 2.1vh
  font-weight bold
  font-stretch normal
  font-style normal
  line-height 1.43
  letter-spacing normal
  text-align left
  color $textColor
  z-index 111
}
.total {
  margin-left 18.13vw
  margin-top 1vh
  margin-bottom 2.32vh
  height 2.62vh
  opacity 0.5
  font-size 1.8vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.46
  letter-spacing normal
  text-align left
  color $textColor
}
.time {
  position absolute
  height 2.17vh
  right 3.33vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  font-size 1.5vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.45
  letter-spacing normal
  text-align right
  color $textColor
}
</style>
