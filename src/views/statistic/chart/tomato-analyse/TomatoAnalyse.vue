<template>
  <div class="container"></div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import InfoItem from "../components/InfoItem.vue";
export default defineComponent({
  components: { InfoItem }
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
