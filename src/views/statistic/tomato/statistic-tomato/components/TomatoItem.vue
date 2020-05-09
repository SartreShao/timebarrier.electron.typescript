<template>
  <div class="tomato-item-container" v-if="mode !== `date`">
    <div class="tomato-name">{{ tomatoName }}</div>
    <div class="tomato-description" v-if="tomatoDescription">
      {{ tomatoDescription }}
    </div>
    <div
      class="related-target-list"
      v-if="targetNameList && targetNameList.length !== 0 && mode === `detail`"
    >
      <span>相关目标：</span>
      {{ targetNameList.join("、") }}
    </div>
    <div
      class="related-ability-list"
      v-if="
        abilityNameList && abilityNameList.length !== 0 && mode === `detail`
      "
    >
      <span>相关能力：</span>{{ abilityNameList.join("、") }}
    </div>
    <div style="height:2.32vh"></div>

    <div class="time">{{ startTimeFormat }} - {{ endTimeFormat }}</div>
    <div class="line-container">
      <div class="line"></div>
      <svg
        class="svg"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g
          id="椭圆_53"
          data-name="椭圆 53"
          fill="none"
          :stroke="color ? color : `#222A36`"
          stroke-width="3"
        >
          <circle cx="14" cy="14" r="14" stroke="none" />
          <circle cx="14" cy="14" r="12.5" fill="none" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    tomatoName: String,
    tomatoDescription: String,
    targetNameList: Array,
    abilityNameList: Array,
    startTime: Date,
    endTime: Date,
    color: String,
    mode: String
  },
  setup(props, context) {
    const startTimeFormat = computed(() =>
      UI.dateToHourMinute12(props.startTime as any)
    );

    const endTimeFormat = computed(() =>
      UI.dateToHourMinute12(props.endTime as any)
    );

    return {
      startTimeFormat,
      endTimeFormat
    };
  }
});
</script>

<style lang="stylus" scoped>
.tomato-item-container {
  background white
  width 100vw
  display flex
  flex-direction column
  position relative
  .line-container {
    position absolute
    width 2.1vh
    height 100%
    left 9.93vw
    display flex
    flex-direction column
    align-items center
    .svg {
      left 0
      right 0
      margin-left auto
      margin-right auto
      top 2.7vh
      position absolute
      width 2.1vh
      height 2.1vh
    }
    .line {
      width 0.13vw
      height 100%
      background #F5F5F5
    }
  }
  .time {
    position absolute
    top 2.85vh
    right 3.33vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align left
    color #222a36
  }
  .tomato-name {
    margin-left 18.13vw
    margin-top 2.32vh
    width 46.67vw
    font-size 2.1vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.43
    letter-spacing normal
    text-align left
    color #222a36
  }
  .tomato-description {
    margin-top 1.5vh
    margin-left 18.13vw
    width 76.8vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align left
    color #222a36
  }
  .related-target-list {
    margin-top 1.5vh
    margin-left 18.13vw
    width 76.8vw
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align left
    color #959595
    span {
      color #222a36
      font-size 1.8vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.46
      letter-spacing normal
      text-align left
    }
  }
  .related-ability-list {
    margin-top 1.5vh
    margin-left 18.13vw
    width 76.8vw
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.46
    letter-spacing normal
    text-align left
    color #959595
    span {
      color #222a36
      font-size 1.8vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.46
      letter-spacing normal
      text-align left
    }
  }
}
</style>
