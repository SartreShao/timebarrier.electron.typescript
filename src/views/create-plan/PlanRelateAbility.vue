<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 主要页面 -->
      <top-tips
        title="为「计划」关联「能力」"
        sub-title="完成计划会提升您的什么能力？"
      ></top-tips>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";

export default defineComponent({
  components: { TopBar, TopTips }
});
</script>

<style lang="stylus" scoped></style>
