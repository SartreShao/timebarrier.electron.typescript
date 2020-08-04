<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要页面 -->
    <section class="section">
      <h1 class="h-1">创建一个「临时计划」</h1>
      <h2 class="h-2">计划赶不上变化，临时计划帮我们应对变化</h2>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";

export default defineComponent({
  components: { TopBar },
  setup(props, context) {}
});
</script>

<style lang="stylus" scoped>
.section {
  margin-top 7.52vh
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
  font-size 1.80vh
  font-weight lighter
  color #222A36
  margin-top 1.20vh
  opacity 0.8
  margin-bottom 0
}
</style>
