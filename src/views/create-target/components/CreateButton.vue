<template>
  <!-- 创建按钮 -->
  <div class="create-button" @click="$emit('click')">
    <svg
      class="icon-create"
      xmlns="http://www.w3.org/2000/svg"
      width="27.401"
      height="18.267"
      viewBox="0 0 27.401 18.267"
    >
      <path
        id="路径_777"
        data-name="路径 777"
        d="M10.384,13.674c.552-.5.988-.876,1.4-1.273Q17.722,6.685,23.648.959C24.6.034,25.6-.432,26.772.535c.982.809.835,1.935-.387,3.116Q19.38,10.434,12.34,17.2c-1.471,1.413-2.269,1.422-3.713.047-2.546-2.43-5.063-4.892-7.611-7.322C.054,9.006-.433,8.043.567,6.912c.839-.947,2.01-.809,3.232.365C5.983,9.375,8.146,11.5,10.384,13.674Z"
        transform="translate(-0.016 0)"
        fill="#222a36"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({});
</script>

<style lang="stylus" scoped>
.create-button {
  opacity 0.9
  cursor pointer
  height 7.5vh
  width 7.5vh
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  display flex
  align-items center
  justify-content center
  border-radius 3.75vh
  position fixed
  right 5.07vw
  bottom 5.85vh
  background white
  transition all 0.2s linear
  z-index 1000

  &:hover {
    opacity 1
  }
}

.icon-create {
  width 3.65vw
  height 1.37vh
}
</style>
