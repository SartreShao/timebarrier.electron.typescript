<template>
  <div class="tomato-item-container" v-if="mode === `stat`">
    <div style="height:1.65vh"></div>

    <div class="tomato-name">
      {{ tomatoName }}
    </div>

    <div class="tomato-description">共计 {{ todayTotalTimeFormat }}</div>

    <div style="height:2.32vh"></div>

    <div class="tomato-number">{{ todayTomatoNumber }} 个番茄</div>

    <div class="line-container">
      <div class="line"></div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 30 30"
      >
        <g
          id="椭圆_89"
          data-name="椭圆 89"
          fill="#fff"
          :stroke="color ? color : `#222A36`"
          stroke-width="3"
          stroke-dasharray="130 361"
        >
          <circle cx="15" cy="15" r="15" stroke="none" />
          <circle cx="15" cy="15" r="13.5" fill="none" />
        </g>
      </svg>

      <div class="line-bottom"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import AV from "leancloud-storage";
export default defineComponent({
  props: {
    tomatoName: String,
    todayTotalTime: Number,
    color: String,
    mode: String,
    todayTomatoNumber: Number
  },
  setup(props, context) {
    const todayTotalTimeFormat = computed(() =>
      props.todayTotalTime
        ? UI.formatTimeHourMinute((props.todayTotalTime as any) / 1000)
        : ""
    );
    return { todayTotalTimeFormat };
  }
});
</script>

<style lang="stylus" scoped>
.tomato-item-container {
  background white
  width 100vw
  display flex
  flex-direction column
  position relative
  .line-container {
    position absolute
    width 0.4vw
    height 100%
    left 10vw
    display flex
    flex-direction column
    align-items center
    .line {
      opacity 0.1
      width 0.14vw
      background #222A36
      height 2.74vh
    }
    .line-bottom {
      opacity 0.1
      width 0.14vw
      background #222A36
      height 100%
    }
    svg {
      width 2.25vh
      height 2.25vh
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
  .tomato-name {
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
  .tomato-description {
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
  .tomato-number {
    position absolute
    right 7.33vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    height 2.62vh
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align right
    color #222a36
  }
}
</style>
