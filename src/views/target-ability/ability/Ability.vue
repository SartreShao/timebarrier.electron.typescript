<template>
  <div class="container" v-hello>
    ability
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  setup() {}
});
</script>

<style lang="stylus" scoped>
.container {
  height 100%
  width 100%
  background white
}
</style>
