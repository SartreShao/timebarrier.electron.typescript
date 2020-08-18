<template>
  <div class="mile-stone-item">
    <div
      class="left-part"
      :style="{
        background: secondaryColor
      }"
    >
      {{ order + 1 }}
    </div>

    <div class="right-part" :style="{ background: mainColor }">
      {{ name }}

      <div class="img-container" @click="$emit('click-delete')">
        <svg
          class="img"
          xmlns="http://www.w3.org/2000/svg"
          width="14.971"
          height="14.971"
          viewBox="0 0 14.971 14.971"
        >
          <path
            id="路径_1032"
            data-name="路径 1032"
            d="M15.14,2.616l-5,5,4.926,4.926-2.469,2.469L7.667,10.088l-5,5-2.5-2.5,5-5L.246,2.667,2.715.2,7.641,5.124l5-5Z"
            transform="translate(-0.169 -0.121)"
            fill="#fff"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    secondaryColor: String,
    mainColor: String,
    order: Number,
    name: String
  }
});
</script>

<style lang="stylus" scoped>
.mile-stone-item {
  display flex
  width 88.8vw
  height 6.37vh
  margin-bottom 0.9vh
}

.left-part {
  display flex
  align-items center
  justify-content center
  width 14.13vw
  height 6.37vh
  color white
  font-size 1.65vh
  border-radius 0.22vh
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
}

.right-part {
  display flex
  align-items center
  box-sizing border-box
  padding-left 5.87vw
  padding-right 6.5vw
  font-weight bold
  color white
  font-size 1.65vh
  width 74.67vw
  height 6.37vh
  position relative
}

.img-container {
  cursor pointer
  height 6.37vh
  width 6.37vh
  position absolute
  right 0.67vw
  top 0
  bottom 0
  display flex
  align-items center
  justify-content center
}

.img {
  width 1.12vh
  height 1.12vh
  opacity 0.5
}
</style>
