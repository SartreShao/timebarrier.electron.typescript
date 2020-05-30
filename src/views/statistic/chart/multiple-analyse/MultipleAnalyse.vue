<template>
  <div class="container">
    <!-- 散点图 -->
    <scatter-diagram></scatter-diagram>

    <div style="height:0.15vh"></div>

    <!-- 散点图的公式 -->
    <info-item
      :value="linearRegressionExpression"
      title="Linear Regression 每日工作量预测分析"
      width="100vw"
    ></info-item>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "@vue/composition-api";
import ScatterDiagram from "../components/ScatterDiagram.vue";
import InfoItem from "../components/InfoItem.vue";
import Store from "@/store";

export default defineComponent({
  components: { ScatterDiagram, InfoItem },
  setup(props, context) {
    // 线性回归表达式，由 regressionData
    const linearRegressionExpression = inject(
      Store.linearRegressionExpression,
      ref("")
    );
    return {
      linearRegressionExpression
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  display flex
  flex-direction column
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
</style>
