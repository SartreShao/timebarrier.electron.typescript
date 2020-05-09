<template>
  <div
    class="date-item-container"
    @click="$emit('click')"
    :style="{ background: color }"
  >
    <div class="date">
      {{ date }}｜{{ todayTomatoNumber }} / {{ targetTomatoNumber }} 番茄｜{{
        totalTime
      }}
    </div>
    <svg
      class="svg"
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 30 30"
    >
      <g
        id="椭圆_89"
        data-name="椭圆 89"
        fill="#fff"
        :stroke="color"
        stroke-width="3"
      >
        <circle cx="15" cy="15" r="15" stroke="none" />
        <circle cx="15" cy="15" r="13.5" fill="none" />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "@vue/composition-api";
export default defineComponent({
  props: {
    date: String,
    todayTomatoNumber: Number,
    targetTomatoNumber: Number,
    totalTime: String,
    color: String
  }
});
</script>

<style lang="stylus" scoped>
.date-item-container {
  width 100vw
  height 5.55vh
  background #3846cf
  display flex
  align-items center
  justify-content center
  flex-direction column
  position relative
  .date {
    height 2.62vh
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align center
    color #fff
    margin-bottom 0.15vh
  }
  .svg {
    position absolute
    width 2.25vh
    height 2.25vh
    left 3.2vw
    bottom -1.125vh
    z-index 9999
  }
}
</style>
