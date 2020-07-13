<template>
  <div class="info-container" @click="$emit('click')">
    <span class="title">{{ title }}</span>
    <span class="content">{{ content }}</span>
    <svg
      class="arrow"
      xmlns="http://www.w3.org/2000/svg"
      width="8.477"
      height="16.951"
      viewBox="0 0 8.477 16.951"
    >
      <path
        id="路径_273"
        data-name="路径 273"
        d="M256.115,15.911l7-7.436-7-7.433a.641.641,0,0,1,0-.862.548.548,0,0,1,.811,0l7.328,7.787a.634.634,0,0,1,.161.5.627.627,0,0,1-.161.52l-7.328,7.788a.553.553,0,0,1-.811,0,.635.635,0,0,1,0-.861Z"
        transform="translate(-255.947 0)"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    title: String,
    content: String
  }
});
</script>

<style lang="stylus" scoped>
.info-container {
  cursor pointer
  width 100vw
  height 8.4vh
  background #ffffff
  position relative
  .title {
    height 3.3vh
    position absolute
    top 0
    bottom 0
    left 4.8vw
    margin-top auto
    margin-bottom auto
    font-size 2.25vh
    font-weight normal
    font-stretch normal
    font-style normal
    letter-spacing 0.02vh
    text-align left
    color #222a36
  }
  .content {
    height 2.7vh
    position absolute
    opacity 0.36
    font-size 1.87vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.01vh
    text-align right
    color #222a36
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    right 12.4vw
  }
  .arrow {
    position absolute
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    right 4.93vw
    width 1.13vw
    height 1.27vh
  }
}
</style>
