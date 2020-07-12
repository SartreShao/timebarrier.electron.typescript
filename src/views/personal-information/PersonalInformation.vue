<template>
  <div class="personal-information-container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";

export default defineComponent({
  components: { TopBar }
});
</script>

<style lang="stylus" scoped>
.personal-information-container {
  width 100%
  height 100vh
  display flex
  flex-direction column
  background #f5f5f5
}
</style>
