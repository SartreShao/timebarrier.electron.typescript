<template>
  <div
    v-if="target !== null"
    @click="$emit('click-background')"
    class="background"
    :style="{
      background: isShow ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
      height: isShow ? '100%' : '0'
    }"
  >
    <section class="section" :style="{ height: isShow ? sectionHeight : `0` }">
      <!-- 开始训练 -->
      <div
        v-for="(plan, index) in target.attributes.planListOfTarget"
        class="item"
        :key="plan.id"
        :class="{
          'item-1': index === 0,
          'item-4': target.attributes.planListOfTarget.length === index + 1
        }"
        @click="click_startTomatoButton(plan)"
        style="color:#222A36"
      >
        开始训练：{{
          plan.attributes.target !== undefined && plan.attributes.target !== 0
            ? `${plan.attributes.name}（${plan.attributes.todayTomatoNumber}/${plan.attributes.target}）`
            : `${plan.attributes.name}`
        }}
      </div>

      <!-- 创建里程碑 -->
      <div
        class="item"
        :class="{ 'item-1': target.attributes.planListOfTarget.length === 0 }"
        v-darked-when-click
      >
        {{ mileStoneTip.length !== 0 ? mileStoneTip : "创建里程碑" }}
      </div>

      <!-- 编辑目标 -->
      <div class="item" @click="$emit('click-edit')" v-darked-when-click>
        {{
          target.attributes.planListOfTarget.length === 0
            ? "编辑目标"
            : "编辑目标（可添加训练计划）"
        }}
      </div>

      <!-- 转变未激活 -->
      <div class="item" v-darked-when-click>转变为「未激活」状态</div>

      <!-- 删除目标 -->
      <div
        class="item item-4"
        @click="$emit('click-delete')"
        v-darked-when-click
      >
        删除目标
      </div>

      <!-- 取消 -->
      <div class="item" @click="$emit('click-cancel')" v-darked-when-click>
        取消
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  inject,
  ref,
  computed
} from "@vue/composition-api";
import AV from "leancloud-storage";
import { TomatoTimerPage } from "@/lib/vue-viewmodels";
import { TomatoCloudStatus } from "@/lib/types/vue-viewmodels";
import Store from "@/store";

export default defineComponent({
  props: {
    isShow: Boolean,
    target: AV.Object
  },
  setup(props, context) {
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
        return `查看里程碑（${completedMileStone}/${totalMileStone}）`;
      }
    });
    // 番茄时钟的状态值
    const tomatoCloudStatus: Ref<TomatoCloudStatus> = inject(
      Store.tomatoCloudStatus,
      ref<TomatoCloudStatus>("prepared")
    );

    // 番茄开始的时间
    const tomatoStartTime: Ref<Date> = inject(
      Store.tomatoStartTime,
      ref<Date>(Date())
    );

    // 倒计时器 instance
    const tomatoClockInterval: Ref<NodeJS.Timeout | null> = inject(
      Store.tomatoClockInterval,
      ref(null)
    );

    // 倒计时表盘值
    const countDown: Ref<number> = inject(Store.countDown, ref(1500));

    // 服务器拉取的数据：临时计划的列表
    const temporaryPlanList: Ref<AV.Object[]> = inject(
      Store.temporaryPlanList,
      ref<AV.Object[]>([])
    );

    // 服务器拉取的数据：每日计划的列表
    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref<AV.Object[]>([])
    );

    // 服务器拉取的数据：已完成计划的列表
    const completedPlanList: Ref<AV.Object[]> = inject(
      Store.completedPlanList,
      ref<AV.Object[]>([])
    );

    // 点击事件：点击「每日计划」上的开始按钮
    const click_startTomatoButton = (plan: AV.Object) => {
      TomatoTimerPage.clickTomatoClock(
        context.root,
        tomatoCloudStatus,
        tomatoClockInterval,
        countDown,
        null,
        null,
        plan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        tomatoStartTime
      );
    };

    // 动态计算弹出框高度
    const sectionHeight = computed(() => {
      const fixHeight = 3 * (7.65 + 0.15) + (7.65 + 0.9) + 7.65 + 0.15;
      function getPlanHeight(target: AV.Object) {
        if (target.attributes.planListOfTarget.length === 0) {
          return 0;
        } else if (target.attributes.planListOfTarget.length > 0) {
          return (
            7.65 +
            0.9 +
            (7.65 + 0.15) * (target.attributes.planListOfTarget.length - 1)
          );
        } else {
          return 0;
        }
      }

      if (props.target === undefined) {
        return String(fixHeight) + "vh";
      } else {
        return String(fixHeight + getPlanHeight(props.target)) + "vh";
      }
    });

    return {
      mileStoneTip,
      click_startTomatoButton,
      sectionHeight
    };
  }
});
</script>

<style lang="stylus" scoped>
.background {
  z-index 1
  width 100%
  height 100%
  position fixed
  top 0
  bottom 0
  left 0
  right 0
  background rgba(0, 0, 0, 0.5)
  transition all 0s ease
}

.section {
  width 100%
  border-radius 1.65vh 1.65vh 0 0
  position fixed
  bottom 0
  left 0
  right 0
  background #F6F7F8
  display flex
  flex-direction column
  transition all 0.4s ease
}

.item {
  cursor pointer
  height 7.65vh
  width 100%
  background white
  display flex
  align-items center
  justify-content center
  color #222A36
  font-size 2.17vh
  margin-bottom 0.15vh
}

.item-1 {
  border-radius 1.65vh 1.65vh 0 0
}

.item-4 {
  color #F9385E
  margin-bottom 0.9vh
}
</style>
