<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要页面 -->
    <section class="section">
      <h1>创建一个「临时计划」</h1>
      <h2>计划赶不上变化，临时计划帮我们应对变化</h2>
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
  height 100%
  width 100%
  overflow scroll
}
</style>
