<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>
    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script>
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
export default defineComponent({
  components: { TopBar, BottomBar }
});
</script>
<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3
}
</style>
