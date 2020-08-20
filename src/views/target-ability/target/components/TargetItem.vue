<template>
  <div
    class="target-item-container"
    v-splash-when-click
    @click="$emit('click')"
  >
    <!-- 完成目标 -->
    <div class="finished-button-container">
      <svg
        v-if="isDone"
        class="finished-button"
        xmlns="http://www.w3.org/2000/svg"
        width="34"
        height="34"
        viewBox="0 0 34 34"
      >
        <path
          id="路径_534"
          data-name="路径 534"
          d="M17,0A17,17,0,1,0,34,17,17,17,0,0,0,17,0Zm9.747,12.591L15.753,23.585a1.541,1.541,0,0,1-2.176,0L7.253,17.249a1.541,1.541,0,0,1,2.176-2.176l5.247,5.247,9.905-9.905a1.541,1.541,0,1,1,2.176,2.176Z"
          fill="#f9385e"
        />
      </svg>

      <svg
        v-else
        class="finished-button"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 30 30"
      >
        <g
          id="组_1639"
          data-name="组 1639"
          transform="translate(-406 75) rotate(-90)"
        >
          <circle
            id="椭圆_105"
            data-name="椭圆 105"
            cx="15"
            cy="15"
            r="15"
            transform="translate(45 406)"
            fill="#fff"
          />
          <g
            id="椭圆_105-2"
            data-name="椭圆 105"
            transform="translate(45 406)"
            fill="none"
            :stroke="
              target.attributes.color ? target.attributes.color : `#222a36`
            "
            stroke-width="3"
            opacity="0.395"
          >
            <circle cx="15" cy="15" r="15" stroke="none" />
            <circle cx="15" cy="15" r="13.5" fill="none" />
          </g>
          <g
            id="椭圆_106"
            data-name="椭圆 106"
            transform="translate(45 406)"
            fill="none"
            :stroke="
              target.attributes.color ? target.attributes.color : `#222a36`
            "
            stroke-width="3"
            :stroke-dasharray="percent"
          >
            <circle cx="15" cy="15" r="15" stroke="none" />
            <circle cx="15" cy="15" r="13.5" fill="none" />
          </g>
        </g>
      </svg>
    </div>

    <!-- 占位符 -->
    <div class="placeholder"></div>

    <!-- 目标主体 -->
    <div class="target-body-container">
      <div class="target-type">
        {{ mileStoneTip }}已累计
        {{
          target.attributes.totalTime
            ? (target.attributes.totalTime / (3600 * 1000)).toFixed(1)
            : 0
        }}
        小时｜关联 {{ target.attributes.planListOfTarget.length }} 个计划
      </div>
      <div class="target-name">{{ target.attributes.name }}</div>
      <div class="target-ability-container">
        {{ currentMileStone ? currentMileStone.attributes.name : "" }}
      </div>
      <div
        class="target-validity"
        v-if="target.attributes.validity"
        :style="{ background: color }"
      >
        {{ validity }}
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
  reactive,
  computed
} from "@vue/composition-api";
import AV from "leancloud-storage";
import { TargetPage } from "@/lib/vue-viewmodels";
import Store from "@/store";
import { InputTargetOrTargetSubjectType } from "@/lib/types/vue-viewmodels";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    target: AV.Object
  },
  setup(props, context) {
    console.log("color", (props.target as AV.Object).attributes.color);

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

    // 如何判断是否已完成
    const isDone = computed(() => {
      let totalTomatoNumber = 0;
      let todayTomatoNumber = 0;
      (props.target as AV.Object).attributes.planListOfTarget.forEach(
        (plan: AV.Object) => {
          totalTomatoNumber += plan.attributes.target;
          todayTomatoNumber += plan.attributes.todayTomatoNumber;
        }
      );
      if (totalTomatoNumber === 0) {
        return false;
      } else {
        return totalTomatoNumber === todayTomatoNumber;
      }
    });

    // 判断当前处于什么位置
    const percent = computed(() => {
      let totalTomatoNumber = 0;
      let todayTomatoNumber = 0;
      (props.target as AV.Object).attributes.planListOfTarget.forEach(
        (plan: AV.Object) => {
          totalTomatoNumber += plan.attributes.target;
          todayTomatoNumber += plan.attributes.todayTomatoNumber;
        }
      );
      if (totalTomatoNumber === 0) {
        return 1;
      } else {
        return todayTomatoNumber / totalTomatoNumber;
      }
    });

    // 里程碑提示语
    const mileStoneTip = computed(() => {
      let totalMileStone = (props.target as AV.Object).attributes
        .mileStoneListOfTarget.length;
      let completedMileStone = 0;
      (props.target as AV.Object).attributes.mileStoneListOfTarget.forEach(
        (mileStone: AV.Object) => {
          if (mileStone.attributes.isFinished) {
            completedMileStone++;
          }
        }
      );
      if (totalMileStone === 0) {
        return "";
      } else {
        return `里程碑 ${completedMileStone}/${totalMileStone}｜`;
      }
    });

    const currentMileStone = computed(() => {
      let currentMileStone: AV.Object | null = null;
      const mileStoneList = (props.target as AV.Object).attributes
        .mileStoneListOfTarget;
      try {
        mileStoneList.forEach((mileStone: AV.Object) => {
          if (mileStone.attributes.isFinished === false) {
            currentMileStone = mileStone;
            throw "";
          }
        });
        currentMileStone = null;
        throw "";
      } catch (error) {
        return currentMileStone;
      }
    });

    const validity = computed(() => {
      if ((props.target as AV.Object).attributes.validity === undefined) {
        return "";
      }

      const validity: Date = (props.target as AV.Object).attributes.validity;

      const todayStartTime = UI.getTodayStartTimestamp(new Date().getTime());

      const result = (validity.getTime() - todayStartTime) / (1000 * 3600 * 24);
      if (result > 1) {
        return `剩余 ${parseInt(String(result))} 天`;
      } else if (result >= 0) {
        return `今日截止`;
      } else {
        return `过期 ${parseInt(String(-result)) + 1} 天`;
      }
    });

    const color = computed(() => {
      if ((props.target as AV.Object).attributes.validity === undefined) {
        return "";
      }

      const validity: Date = (props.target as AV.Object).attributes.validity;

      const todayStartTime = UI.getTodayStartTimestamp(new Date().getTime());

      const result = (validity.getTime() - todayStartTime) / (1000 * 3600 * 24);
      if (result > 1) {
        return `#039E7E`;
      } else if (result >= 0) {
        return `#6566A9`;
      } else {
        return `#D45070`;
      }
    });

    return {
      click_finishedTargetButton,
      click_unfinishedTargetButton,
      isDone,
      percent,
      mileStoneTip,
      currentMileStone,
      validity,
      color
    };
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
    position relative

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
      margin-top 0.3vh
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
      margin-top 0.3vh
      margin-bottom 1.95vh
      margin-left 8.53vw
      margin-right 8.53vw
      line-height 2.4vh
      opacity 0.4
      font-size 1.65vh
      color #222a36
    }

    .target-validity {
      position absolute
      right 0
      top 0
      padding-top 0.15vh
      padding-bottom 0.15vh
      padding-left 1.6vw
      padding-right 1.6vw
      color #FFFFFF
      font-size 1.27vh
      font-weight 500
    }
  }
}
</style>
