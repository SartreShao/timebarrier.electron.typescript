<template>
  <div class="container">
    <scatter-diagram></scatter-diagram>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import ScatterDiagram from "../components/ScatterDiagram.vue";
export default defineComponent({
  components: { ScatterDiagram }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
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
