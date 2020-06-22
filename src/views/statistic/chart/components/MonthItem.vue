<template>
  <div class="plan-item-container" v-if="mode === `simple`">
    <div class="name">{{ name }}</div>
    <div class="percent">
      本月用时占比
      {{ (percent * 100).toFixed(0) + "%" }}
    </div>
    <div class="time">{{ currentTime }} 小时</div>
    <div class="tomato">
      {{ tomatoNumber }}
      番茄
    </div>
    <div class="line-container">
      <div class="line"></div>

      <svg
        class="progress"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 30 30"
      >
        <g
          id="组_1639"
          data-name="组 1639"
          transform="translate(-406 75) rotate(-90)"
        >
          <circle
            id="椭圆_105"
            data-name="椭圆 105"
            cx="15"
            cy="15"
            r="15"
            transform="translate(45 406)"
            fill="#fff"
          />
          <g
            id="椭圆_105-2"
            data-name="椭圆 105"
            transform="translate(45 406)"
            fill="none"
            :stroke="color ? color : `$fontColor`"
            stroke-width="3"
            opacity="0.395"
          >
            <circle cx="15" cy="15" r="15" stroke="none" />
            <circle cx="15" cy="15" r="13.5" fill="none" />
          </g>
          <g
            id="椭圆_106"
            data-name="椭圆 106"
            transform="translate(45 406)"
            fill="none"
            :stroke="color ? color : `$fontColor`"
            stroke-width="3"
            :stroke-dasharray="percentFormat"
          >
            <circle cx="15" cy="15" r="15" stroke="none" />
            <circle cx="15" cy="15" r="13.5" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    name: String,
    tomatoNumber: Number,
    percent: Number,
    currentTime: Number,
    color: String,
    mode: String
  },
  setup(props, context) {
    const percentFormat = computed(
      () => String((props.percent as number) * 84.7) + " 84.7"
    );
    return { percentFormat };
  }
});
</script>

<style lang="stylus" scoped>
$fontColor = #222a36
$background = white
.plan-item-container {
  width 100%
  position relative
  display flex
  flex-direction column
  background $background
}
.name {
  width 52.13vw
  margin-top 2.32vh
  margin-left 19.47vw
  font-size 2.1vh
  font-weight bold
  font-stretch normal
  font-style normal
  line-height 1.43
  letter-spacing normal
  text-align left
  color $fontColor
}
.percent {
  height 2.62vh
  opacity 0.5
  font-size 1.8vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.46
  letter-spacing normal
  text-align left
  color $fontColor
  margin-top 0.67vh
  margin-left 19.47vw
  margin-bottom 2.32vh
}
.time {
  position absolute
  height 2.17vh
  right 3.47vw
  top 3.22vh
  opacity 0.5
  font-size 1.5vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.45
  letter-spacing normal
  text-align right
  color $fontColor
}
.tomato {
  position absolute
  bottom 3.22vh
  right 3.47vw
  height 2.17vh
  opacity 0.5
  font-size 1.5vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.45
  letter-spacing normal
  text-align right
  color $fontColor
}
.line-container {
  position absolute
  height 100%
  width 4.53vw
  left 9.73vw
  top 0
  bottom 0
  .line {
    position absolute
    height 100%
    background $fontColor
    width 0.26vw
    opacity 0.06
    left 0
    right 0
    margin-left auto
    margin-right auto
  }
}
.progress {
  position absolute
  width 2.55vh
  height 2.55vh
  top 2.77vh
}
</style>
