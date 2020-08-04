<template>
  <div
    class="item-container"
    :style="{ background: backgroundColor }"
    @click="$emit('click')"
  >
    <h1 class="h-1">{{ data.attributes.name }}</h1>

    <svg
      v-if="data.attributes.selected"
      class="select-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
    >
      <g id="组_1920" data-name="组 1920" transform="translate(-630 -987)">
        <circle
          id="椭圆_134"
          data-name="椭圆 134"
          cx="18.5"
          cy="18.5"
          r="18.5"
          transform="translate(631 988)"
          fill="#fff"
        />
        <path
          id="路径_779"
          data-name="路径 779"
          d="M20,40A20,20,0,1,1,40,20,20,20,0,0,1,20,40ZM17.429,22.008l-3.324-3.184a2.077,2.077,0,0,0-2.848,0,1.873,1.873,0,0,0,0,2.729L16,26.1a2.078,2.078,0,0,0,2.849,0l9.889-9.473a1.873,1.873,0,0,0,0-2.729,2.077,2.077,0,0,0-2.848,0l-8.467,8.109Z"
          transform="translate(630 987)"
          :fill="buttonColor"
        />
      </g>
    </svg>

    <div v-else class="select-icon" style="background:#fff"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import AV from "leancloud-storage";

export default defineComponent({
  props: {
    data: AV.Object,
    backgroundColor: String,
    buttonColor: String
  },
  setup(props, context) {}
});
</script>

<style lang="stylus" scoped>
.item-container {
  user-select none
  cursor pointer
  width 90.27vw
  height 7.05vh
  border-radius 0.9vh
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  position relative
  margin-bottom 1.35vh
}

.h-1 {
  font-size 2.1vh
  height 3vh
  color white
  font-weight bold
  position absolute
  left 6.27vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
}

.select-icon {
  cursor pointer
  width 3vh
  height 3vh
  position absolute
  border-radius 1.5vh
  right 6.13vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
}
</style>
