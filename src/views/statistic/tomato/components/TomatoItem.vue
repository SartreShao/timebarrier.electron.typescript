<template>
  <div class="tomato-item-container" v-if="mode !== `date`">
    <div class="time">
      {{ startTimeFormat }}
      - {{ endTimeFormat }}｜{{ duration }}
    </div>

    <div class="tomato-name">
      {{ tomatoName }}
    </div>
    <div class="tomato-description" v-if="tomatoDescription">
      {{ tomatoDescription }}
    </div>
    <div
      class="related-target-list"
      v-if="targetNameList && targetNameList.length !== 0 && mode === `detail`"
    >
      <span>相关目标：</span>
      <div v-for="(targetName, index) in targetNameList" :key="index">
        {{ index + 1 }}. {{ targetName }}
      </div>
    </div>
    <div
      class="related-ability-list"
      v-if="
        abilityNameList && abilityNameList.length !== 0 && mode === `detail`
      "
    >
      <span>相关能力：</span>
      <div v-for="(abilityName, index) in abilityNameList" :key="index">
        {{ index + 1 }}. {{ abilityName }}
      </div>
    </div>
    <div style="height:2.32vh"></div>

    <div class="line-container">
      <div class="line"></div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 30 30"
      >
        <g
          id="椭圆_89"
          data-name="椭圆 89"
          fill="#fff"
          :stroke="itemColor ? itemColor : `#222A36`"
          stroke-width="3"
          stroke-dasharray="130 361"
        >
          <circle cx="15" cy="15" r="15" stroke="none" />
          <circle cx="15" cy="15" r="13.5" fill="none" />
        </g>
      </svg>

      <div class="line-bottom"></div>
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
    itemColor: String,
    mode: String,
    targetTomatoNumber: Number,
    todayTomatoNumber: Number
  },
  setup(props, context) {
    const startTimeFormat = computed(() =>
      UI.dateToHourMinute12(props.startTime as any)
    );

    const endTimeFormat = computed(() =>
      UI.dateToHourMinute12(props.endTime as any)
    );

    const duration = UI.formatTime(
      ((props.endTime as any).getTime() - (props.startTime as any).getTime()) /
        1000,
      true
    );

    return {
      startTimeFormat,
      endTimeFormat,
      duration
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
    width 0.4vw
    height 100%
    left 10vw
    display flex
    flex-direction column
    align-items center
    .line {
      opacity 0.1
      width 0.14vw
      background #222A36
      height 4.5vh
    }
    .line-bottom {
      opacity 0.1
      width 0.14vw
      background #222A36
      height 100%
    }
    svg {
      width 2.25vh
      height 2.25vh
    }
  }
  .time {
    margin-top 1.2vh
    margin-left 18.13vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 2.62vh
    letter-spacing normal
    text-align left
    color #222a36
  }
  .tomato-name {
    margin-left 18.13vw
    margin-top 0.67vh
    width 63.73vw
    font-size 2.1vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 3vh
    letter-spacing normal
    text-align left
    color #222a36
  }
  .tomato-description {
    margin-top 0.67vh
    margin-left 18.13vw
    width 63.73vw
    opacity 0.5
    font-size 1.8vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 2.62vh
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
    line-height 2.62vh
    letter-spacing normal
    text-align left
    color #959595
    span {
      color #222a36
      font-size 1.8vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 2.62vh
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
