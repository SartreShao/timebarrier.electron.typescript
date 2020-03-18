<template>
  <div>
    <img
      src="https://timebarrier.file.hearfresh.cn/f84d622cf905debee6ea.png"
      alt="background"
    />
    <header>
      <h2>NEVER STOP THINKING</h2>
      <h1>时间壁垒</h1>
      <h3>我们相信时间积累的力量，每天付出汗水</h3>
      <h3>最终会得偿所愿</h3>
      <p>创造自知乎@邵励治</p>
    </header>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/composition-api";

import { SplashPage } from "../../lib/vue-viewmodels";

export default defineComponent({
  setup(props, context) {
    SplashPage.init(2000, context.root.$router, "plan", "login");
  }
});
</script>
<style lang="stylus" scoped>
img {
  position fixed
  width 100%
  bottom 0
  left 0
  right 0
}
header {
  position fixed
  display flex
  bottom 0
  width 100%
  flex-direction column
  align-items center
  h2 {
    font-size 1.8vh
    font-weight normal
    color rgba(216, 115, 102, 1)
    opacity 1
  }
  h1 {
    margin-bottom 2.1vh
    margin-top 0.67vh
    font-size 4.05vh
    font-weight 400
    color rgba(3, 38, 56, 1)
    opacity 1
  }
  h3 {
    margin-bottom 0.5vh
    font-size 2.25vh
    font-weight 500
    color rgba(99, 118, 137, 1)
    opacity 1
    white-space pre
  }
  p {
    margin-top 59.82vh
    font-size 1.8vh
    font-weight normal
    color rgba(255, 255, 255, 1)
    opacity 1
  }
}
</style>
