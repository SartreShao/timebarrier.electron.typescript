<template>
  <input
    type="text"
    class="input-container"
    :placeholder="placeholder"
    v-bind:value="value"
    v-on:input="$emit('input', $event.target.value)"
  />
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    placeholder: String,
    value: String
  }
});
</script>

<style lang="stylus" scoped>
.input-container {
  flex-shrink 0
  width 89.6vw
  height 6.9vh
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
  border-radius 0.67vh
  border solid 0.15vh #ebebf3
  padding-left 4.8vw
  padding-right 4.8vw
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636
  &::-webkit-input-placeholder {
    font-size 1.95vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.21px
    text-align left
    color #969294
  }
}
</style>
