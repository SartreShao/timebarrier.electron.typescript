<template>
  <div>
    <!-- 主要页面 -->
    <section class="section">
      <h1 class="h-1">{{ title }}</h1>
      <h2 class="h-2">{{ subTitle }}</h2>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: { title: String, subTitle: String }
});
</script>

<style lang="stylus" scoped>
.section {
  display flex
  flex-direction column
  align-items center
  height 100%
  width 100%
  overflow scroll
}

.h-1 {
  line-height 2.92vh
  font-size 2.02vh
  font-weight bold
  color #222A36
  margin-top 4.57vh
  margin-bottom 0
}

.h-2 {
  line-height 2.62vh
  font-size 1.8vh
  font-weight lighter
  color #222A36
  margin-top 1.2vh
  opacity 0.8
  margin-bottom 4.57vh
}
</style>
