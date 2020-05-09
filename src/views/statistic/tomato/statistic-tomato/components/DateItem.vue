<template>
  <div class="date-item-container">
    <div class="date">{{ date }}</div>
    <div class="data">
      {{ todayTomatoNumber }} / {{ targetTomatoNumber }} 番茄｜{{ totalTime }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    date: String,
    todayTomatoNumber: Number,
    targetTomatoNumber: Number,
    totalTime: String
  }
});
</script>

<style lang="stylus" scoped>
.date-item-container {
  width 100vw
  height 8.02vh
  background #F4F4F8
  display flex
  align-items center
  justify-content center
  flex-direction column
  .date {
    height 2.62vh
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align center
    color #222a36
    margin-bottom 0.15vh
  }
  .data {
    height 2.25vh
    opacity 0.49
    font-size 1.57vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.43
    letter-spacing normal
    text-align center
    color #222a36
  }
}
</style>
