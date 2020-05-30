<template>
  <div class="info-item-container" v-bind:style="{ width: width }">
    <div class="value">{{ value }}</div>
    <div class="title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    value: String,
    title: String,
    width: String
  }
});
</script>

<style lang="stylus" scoped>
.info-item-container {
  background white
  height 7.8vh
  width 100%
  flex-direction column
  align-items center
  .value {
    margin-top 1.45vh
    font-size 1.87vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing normal
    text-align center
    color #222a36
  }
  .title {
    margin-top 0.49vh
    font-size 1.35vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing normal
    text-align center
    color #99a8b8
  }
}
</style>
