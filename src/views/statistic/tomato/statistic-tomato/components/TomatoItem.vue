<template>
  <div class="tomato-item-container">
    <div class="tomato-name">完成「时间壁垒」，并进行用户测试</div>
    <div class="tomato-description">
      制作「统计页面」的 UI 设计图，并完成了一些 BUG 的修复
    </div>
    <div class="related-target-list">
      <span>相关目标：</span>
      完成「时间壁垒」、成为优秀的产品经理、成为优秀的前端工程师
    </div>
    <div class="related-ability-list">
      <span>相关能力：</span>产品能力、前端能力、设计能力
    </div>
    <div class="time">8:00 am - 8:30 am</div>
    <div class="line-container">
      <div class="line"></div>
      <svg
        class="svg"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g
          id="椭圆_53"
          data-name="椭圆 53"
          fill="none"
          stroke="#000000"
          stroke-width="3"
        >
          <circle cx="14" cy="14" r="14" stroke="none" />
          <circle cx="14" cy="14" r="12.5" fill="none" />
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
.tomato-item-container {
  background white
  width 100vw
  display flex
  flex-direction column
  position relative
  .line-container {
    position absolute
    width 2.1vh
    height 100%
    left 9.93vw
    display flex
    flex-direction column
    align-items center
    .svg {
      left 0
      right 0
      margin-left auto
      margin-right auto
      top 2.7vh
      position absolute
      width 2.1vh
      height 2.1vh
    }
    .line {
      width 0.13vw
      height 100%
      background #F5F5F5
    }
  }
  .time {
    position absolute
    top 2.85vh
    right 3.33vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align left
    color #222a36
  }
  .tomato-name {
    margin-left 18.13vw
    margin-top 2.32vh
    width 46.67vw
    font-size 2.1vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.43
    letter-spacing normal
    text-align left
    color #222a36
  }
  .tomato-description {
    margin-top 1.5vh
    margin-left 18.13vw
    width 76.8vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
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
  .related-ability-list {
    margin-top 1.5vh
    margin-left 18.13vw
    margin-bottom 2.32vh
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
