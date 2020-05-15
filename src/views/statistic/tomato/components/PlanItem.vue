<template>
  <div class="plan-item-container">
    <aside v-bind:style="{ width: widthPercent, background: color }"></aside>

    <div class="tomato-container">
      <div class="percent">
        {{ ((tomatoNumber / targetTomatoNumber) * 100).toFixed(0) + "%" }}
      </div>
      <div class="tomato">{{ tomatoNumber }} / {{ targetTomatoNumber }}</div>
    </div>
    <div class="name">{{ name }}</div>
    <div class="total">
      共累计 {{ totalTime }} 小时，{{ totalTomatoNumber }} 个番茄
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
    totalTime: String,
    totalTomatoNumber: Number,
    currentTime: Number
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
      UI.formatTimeHourMinute(props.currentTime as any)
    );
    return {
      widthPercent,
      currentTimeFormat
    };
  }
});
</script>

<style lang="stylus" scoped>
.plan-item-container {
  width 100%
  position relative
  background #222a36
  height 10.94vh
}
aside {
  position absolute
  height 10.94vh
  border-radius 0 4.5vh 1.57vh 0
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
    color #ffffff
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
    color #ffffff
  }
}
.name {
  position absolute
  left 18.13vw
  top 2.32vh
  font-size 2.1vh
  font-weight bold
  font-stretch normal
  font-style normal
  line-height 1.43
  letter-spacing normal
  text-align left
  color #ffffff
}
.total {
  position absolute
  left 18.13vw
  bottom 2.32vh
  opacity 0.5
  font-size 1.8vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.46
  letter-spacing normal
  text-align left
  color #ffffff
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
  color #ffffff
}
</style>
