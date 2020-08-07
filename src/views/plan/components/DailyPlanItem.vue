<template>
  <div
    :id="plan.id"
    class="daily-plan-container"
    @click="$emit('edit-plan')"
    v-splash-when-click
    :title="plan.attributes.name"
  >
    <div class="plan-container">
      <h2 class="h-2">每日计划</h2>
      <div class="placeholder"></div>
      <h3 class="h-3">{{ plan.attributes.name }}</h3>

      <svg
        @click.stop="$emit('start-tomato')"
        class="start-button"
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 36 36"
      >
        <g id="组_1940" data-name="组 1940" transform="translate(-667 -470)">
          <g
            id="椭圆_7"
            data-name="椭圆 7"
            transform="translate(667 470)"
            fill="#fff"
            stroke="#959595"
            stroke-width="1"
          >
            <circle cx="18" cy="18" r="18" stroke="none" />
            <circle cx="18" cy="18" r="17.5" fill="none" />
          </g>
          <path
            id="路径_116"
            data-name="路径 116"
            d="M111.419,7.63l-6.32,4.5a1.7,1.7,0,0,1-2.691-1.386v-9A1.7,1.7,0,0,1,105.1.356l6.32,4.5a1.7,1.7,0,0,1,0,2.775"
            transform="translate(578.592 481.963)"
            fill="#959595"
          />
        </g>
      </svg>
    </div>
    <div class="plan-detail-container">
      <span v-if="plan.attributes.tomatoNumber !== 0">{{
        "累计执行: " +
          (
            (plan.attributes.totalTime ? plan.attributes.totalTime : 0) /
            (3600 * 1000)
          ).toFixed(1) +
          " 小时 · " +
          plan.attributes.tomatoNumber +
          " 个番茄"
      }}</span>

      <span v-else>尚未开始训练</span>

      <div>
        {{
          `${plan.attributes.todayTomatoNumber} / ${plan.attributes.target} 个番茄`
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import AV from "leancloud-storage";
export default defineComponent({
  props: {
    plan: AV.Object
  }
});
</script>

<style lang="stylus" scoped>
.daily-plan-container {
  user-select none
  cursor pointer
  width 95.73vw
  height 11.47vh
  flex-shrink 0
  background white
  margin-bottom 1vh
}

.plan-container {
  display flex
  flex-direction row cursor pointer
  width 95.73vw
  height 7.2vh
  background white
  display flex
  align-items center
  position relative
  border-bottom dashed 1px #D5D5D5
}

.h-2 {
  font-size 2.02vh
  font-weight 500
  font-stretch normal
  font-style normal
  line-height 1.44
  letter-spacing 0.02vh
  color #222a36
  margin-left 4.67vw
  margin-right 3.27vw
}

.h-3 {
  font-size 2.02vh
  font-weight 500
  font-stretch normal
  font-style normal
  line-height 1.44
  letter-spacing 0.02vh
  color #222a36
  margin-left 3.27vw
  width 57.73vw
  overflow hidden
  text-overflow ellipsis
  white-space nowrap
}

.placeholder {
  width 0.13vw
  height 2.92vh
  background #707070
  opacity 0.4
}

.start-button {
  cursor pointer
  width 2.7vh
  height 2.7vh
  opacity 0.5
  position absolute
  right 4.13vw
}

.plan-detail-container {
  width 95.73vw
  height 4.27vh
  box-shadow 0 3px 6px 0 rgba(0, 0, 0, 0.01)
  background-color #ffffff
  position relative

  span {
    height 2.4vh
    opacity 0.4
    font-size 1.65vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.45
    letter-spacing 0.01vh
    text-align left
    color #222a36
    left 4.67vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    position absolute
  }

  div {
    height 2.4vh
    opacity 0.4
    font-size 1.65vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.45
    letter-spacing 0.01vh
    text-align left
    color #222a36
    right 4.13vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    position absolute
  }
}
</style>
