<template>
  <div class="plan-item-container" @click="$emit('click')">
    {{ data.attributes.name }}

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

    <svg
      v-else
      class="select-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
    >
      <g
        id="椭圆_178"
        data-name="椭圆 178"
        fill="#fff"
        stroke="#959595"
        stroke-width="1"
      >
        <circle cx="18" cy="18" r="18" stroke="none" />
        <circle cx="18" cy="18" r="17.5" fill="none" />
      </g>
    </svg>

    <div
      class="target-container"
      v-if="data.attributes.target !== undefined && data.attributes.target > 0"
    >
      <span>每日训练 {{ data.attributes.target }} 番茄</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import AV from "leancloud-storage";

export default defineComponent({
  props: {
    data: AV.Object,
    buttonColor: String
  }
});
</script>

<style lang="stylus" scoped>
.plan-item-container {
  cursor pointer
  width 88.93vw
  height 7.2vh
  background white
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  box-sizing border-box
  display flex
  align-items center
  padding-left 6.13vw
  padding-right 9.33vw
  font-size 2.02vh
  color #222A36
  font-weight 500
  position relative
  margin-bottom 1.42vh
}

.select-icon {
  width 2.7vh
  height 2.7vh
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  right 4.13vw
  position absolute
}

.target-container {
  height 2.17vh
  padding-left 1.73vw
  padding-right 1.73vw
  background #222A36
  position absolute
  right -1.2vw
  top -1.05vh

  span {
    line-height 1.87vh
    font-size 1.27vh
    color white
  }
}
</style>
