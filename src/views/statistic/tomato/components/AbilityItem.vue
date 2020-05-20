<template>
  <div class="ability-item-container" v-if="mode === `simple`">
    <div class="name">{{ name }}</div>
    <div class="percent" v-if="targetTomatoNumber">
      今日已完成
      {{ ((tomatoNumber / targetTomatoNumber) * 100).toFixed(0) + "%" }}
    </div>
    <div class="percent" v-else>临时计划</div>
    <div class="time">{{ currentTimeFormat }}</div>
    <div class="tomato">
      {{ tomatoNumber }}
      <span v-if="targetTomatoNumber">/ {{ targetTomatoNumber }} </span
      ><span v-else>个</span>番茄
    </div>
    <div class="line-container">
      <div class="line"></div>
      <svg
        v-if="isDone"
        class="progress"
        xmlns="http://www.w3.org/2000/svg"
        width="34"
        height="34"
        viewBox="0 0 34 34"
      >
        <path
          id="路径_534"
          data-name="路径 534"
          d="M17,0A17,17,0,1,0,34,17,17,17,0,0,0,17,0Zm9.747,12.591L15.753,23.585a1.541,1.541,0,0,1-2.176,0L7.253,17.249a1.541,1.541,0,0,1,2.176-2.176l5.247,5.247,9.905-9.905a1.541,1.541,0,1,1,2.176,2.176Z"
          fill="#f9385e"
        />
      </svg>

      <svg
        v-else
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
            :stroke="color ? color : `#222a36`"
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
            :stroke="color ? color : `#222a36`"
            stroke-width="3"
            :stroke-dasharray="percent"
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
    targetTomatoNumber: Number,
    currentTime: Number,
    color: String,
    mode: String
  },
  setup(props, context) {
    const currentTimeFormat = computed(() =>
      props.currentTime
        ? UI.formatTimeHourMinute((props.currentTime as any) / 1000)
        : ""
    );

    const percent = computed(
      () =>
        String(
          ((props.tomatoNumber as number) /
            (props.targetTomatoNumber as number)) *
            84.7
        ) + " 84.7"
    );

    const isDone = computed(
      () =>
        (props.tomatoNumber as number) / (props.targetTomatoNumber as number) >=
        1
    );
    return {
      currentTimeFormat,
      percent,
      isDone
    };
  }
});
</script>

<style lang="stylus" scoped>
.ability-item-container {
  width 100%
  position relative
  display flex
  flex-direction column
  background white
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
  color #222a36
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
  color #222a36
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
  color #222a36
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
  color #222a36
}
.line-container {
  position absolute
  height 100%
  width 4.53vw
  left 9.73vw
  top 0
  bottom 0
}
.progress {
  position absolute
  width 2.55vh
  height 2.55vh
  top 2.77vh
}
.line {
  position absolute
  height 100%
  background #222a36
  width 0.13vw
  opacity 0.13
  left 0
  right 0
  margin-left auto
  margin-right auto
}
</style>
