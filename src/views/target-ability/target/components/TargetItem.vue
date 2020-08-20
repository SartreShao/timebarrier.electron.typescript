<template>
  <div
    class="target-item-container"
    v-splash-when-click
    @click="$emit('click')"
  >
    <!-- 完成目标 -->
    <div class="finished-button-container">
      <!-- 点击「取消完成目标」 -->
      <svg
        v-if="target.attributes.isFinished"
        v-darked-when-click
        class="unfinished-button"
        @click="click_unfinishedTargetButton(target)"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="21.484"
        viewBox="0 0 28 21.484"
      >
        <g id="组_1370" data-name="组 1370" transform="translate(-0.385)">
          <path
            id="路径_418"
            data-name="路径 418"
            d="M15.126,319.693l-3.4,3.436a.8.8,0,0,1-1.1,0L.6,313.08a.8.8,0,0,1,0-1.1l3.4-3.4a.8.8,0,0,1,1.1,0L15.126,318.59A.8.8,0,0,1,15.126,319.693Z"
            transform="translate(0 -301.863)"
            :fill="target.attributes.color"
          />
          <path
            id="路径_419"
            data-name="路径 419"
            d="M336.708.292l3.047,3.047a1.058,1.058,0,0,1,0,1.459L323.547,21.006a1.058,1.058,0,0,1-1.459,0l-3.047-3.047a1.058,1.058,0,0,1,0-1.459L335.249.292a1.057,1.057,0,0,1,1.459,0Z"
            transform="translate(-311.662)"
            :fill="target.attributes.color"
          />
        </g>
      </svg>

      <!-- 点击「完成目标」 -->
      <svg
        v-else
        v-darked-when-click
        @click="click_finishedTargetButton(target)"
        class="finished-button"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g
          id="椭圆_53"
          data-name="椭圆 53"
          fill="none"
          :stroke="target.attributes.color"
          stroke-width="3"
        >
          <circle cx="14" cy="14" r="14" stroke="none" />
          <circle cx="14" cy="14" r="12.5" fill="none" />
        </g>
      </svg>
    </div>

    <!-- 占位符 -->
    <div class="placeholder"></div>

    <!-- 目标主体 -->
    <div class="target-body-container">
      <div class="target-type">
        {{
          target.attributes.validityType === "time-bound"
            ? "时限目标"
            : "长期目标"
        }}{{
          target.attributes.validityType === "time-bound"
            ? "｜剩余 " +
              parseInt(
                (target.attributes.validity.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24) +
                  1
              ) +
              " 天"
            : ""
        }}｜累计
        {{
          target.attributes.totalTime
            ? (target.attributes.totalTime / (3600 * 1000)).toFixed(1)
            : 0
        }}
        小时
      </div>
      <div class="target-name">{{ target.attributes.name }}</div>
      <div class="target-ability-container">
        <div
          class="target-ability"
          v-for="ability in target.attributes.abilityListOfTarget"
          v-bind:key="ability.id"
        >
          · {{ ability.attributes.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  inject,
  ref,
  reactive
} from "@vue/composition-api";
import AV from "leancloud-storage";
import { TargetPage } from "@/lib/vue-viewmodels";
import Store from "@/store";
import { InputTargetOrTargetSubjectType } from "@/lib/types/vue-viewmodels";
export default defineComponent({
  props: {
    target: AV.Object
  },
  setup(props, context) {
    // 未分组的「目标」的列表
    const unSubjectiveTargetList: Ref<AV.Object[]> = inject(
      Store.unSubjectiveTargetList,
      ref([])
    );

    // 已完成的「目标」列表
    const completedTargetList: Ref<AV.Object[]> = inject(
      Store.completedTargetList,
      ref([])
    );

    //「目标类别」的列表
    const targetSubjectList: Ref<AV.Object[]> = inject(
      Store.targetSubjectList,
      ref([])
    );

    // 点击事件：完成 Target
    const click_finishedTargetButton = (target: AV.Object) => {
      TargetPage.finishTarget(
        context.root,
        target,
        unSubjectiveTargetList,
        completedTargetList,
        targetSubjectList
      );
    };

    // 点击事件：将已完成的 Target 拉回来
    const click_unfinishedTargetButton = (target: AV.Object) => {
      TargetPage.unFinishedTarget(
        context.root,
        target,
        unSubjectiveTargetList,
        completedTargetList,
        targetSubjectList
      );
    };

    return { click_finishedTargetButton, click_unfinishedTargetButton };
  }
});
</script>

<style lang="stylus" scoped>
.target-item-container {
  cursor pointer
  user-select none
  width 100%
  display flex
  flex-direction row
  margin-bottom 0.15vh
  align-items stretch
  flex-shrink 0

  .finished-button-container {
    width 15.73vw
    background-color #fcfbfc
    display flex
    justify-content center
    align-items center

    .finished-button {
      width 2.1vh
      height 2.1vh
    }

    .unfinished-button {
      width 2.1vh
      height 1.61vh
    }
  }

  .placeholder {
    width 0.15vh
  }

  .target-body-container {
    user-select none
    width 84vw
    background-color #ffffff

    .target-type {
      margin-top 1.8vh
      margin-left 8.53vw
      margin-right 8.53vw
      height 2.17vh
      opacity 0.4
      font-size 1.5vh
      font-weight normal
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align left
      color #222a36
    }

    .target-name {
      margin-top 0.30vh
      margin-left 8.53vw
      margin-right 8.53vw
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      letter-spacing 0.02vh
      text-align left
      color #222a36
    }

    .target-ability-container {
      margin-top 0.30vh
      margin-bottom 1.95vh
      margin-left 8.53vw
      margin-right 8.53vw

      .target-ability {
        height 2.7vh
        opacity 0.4
        font-size 1.65vh
        font-weight normal
        font-stretch normal
        font-style normal
        letter-spacing 0.01vh
        text-align left
        color #222a36
      }
    }
  }
}
</style>
