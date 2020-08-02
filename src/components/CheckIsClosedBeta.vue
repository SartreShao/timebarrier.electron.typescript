<template>
  <div class="closed-beta-container">
    <section class="section">
      <h1 class="h-1">您使用的是内测版本</h1>
      <h2 class="h-2">当前内测已经结束，请下载正式版 APP</h2>
      <a class="button" href="http://timebarrier.web.hearfresh.cn/">点击下载</a>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {}
});
</script>

<style lang="stylus" scoped>
.closed-beta-container {
  width 100vw
  height 100vh
  background rgba(34, 42, 54, 1)
  display flex
  align-items center
  justify-content center
  position fixed
}

.section {
  background white
  width 76.67vw
  height 27.06vh
  box-shadow 0 0.22vh 0.44vh rgba(0, 0, 0, 0.16)
  border-radius 0.75vh
  display flex
  flex-direction column
  align-items center
}

.h-1 {
  margin-top 4.35vh
  margin-bottom 0
  font-weight bold
  font-size 2.02vh
  line-height 2.92vh
  color #222A36
}

.h-2 {
  margin-top 1.35vh
  margin-bottom 0
  font-weight normal
  font-size 2.02vh
  line-height 2.92vh
}

.button {
  cursor pointer
  margin-top 4.35vh
  width 62.13vw
  height 6.82vh
  background #F9385E
  color white
  font-size 2.02vh
  font-weight bold
  box-shadow 0 0.22vh 0.44vh rgba(0, 0, 0, 0.16)
  border-radius 0.67vh
  display flex
  align-items center
  justify-content center
}
</style>
