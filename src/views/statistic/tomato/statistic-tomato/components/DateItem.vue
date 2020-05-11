<template>
  <div class="date-item-container" @click="$emit('click')">
    <div class="date">
      {{ date }}｜{{ todayTomatoNumber }} / {{ targetTomatoNumber }} 番茄｜{{
        totalTime
      }}
    </div>
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
  background #fff
  display flex
  align-items center
  justify-content center
  flex-direction column
  position relative
  .date {
    height 2.62vh
    font-size 1.8vh
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align center
    color #222A36
  }
}
</style>
