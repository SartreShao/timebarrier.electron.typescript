<template>
  <div class="plan-item-container">
    <div class="name">完成「时间壁垒」APP</div>
    <div class="percent">今日已完成 65%</div>
    <div class="time">3 小时 25 分钟</div>
    <div class="tomato">8 / 12 番茄</div>
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
            stroke="#3846cf"
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
            stroke="#3846cf"
            stroke-width="3"
            stroke-dasharray="50 84.7"
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
import { defineComponent } from "@vue/composition-api";
export default defineComponent({});
</script>

<style lang="stylus" scoped>
.plan-item-container {
  width 100%
  position relative
  display flex
  flex-direction column
  box-shadow 0 3px 6px 0 rgba(0, 0, 0, 0.16)
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
