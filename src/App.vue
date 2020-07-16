<template>
  <div id="app">
    <transition name="fade">
      <router-view />
    </transition>
    <bottom-bar v-if="isCurrentPageHome"></bottom-bar>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import BottomBar from "./components/BottomBar.vue";

import {
  defineComponent,
  inject,
  watch,
  Ref,
  ref,
  computed,
  watchEffect
} from "@vue/composition-api";
import Store from "./store";
import * as _ from "lodash";
import {
  PlanPage,
  TargetPage,
  AbilityPage,
  StatPage,
  App
} from "./lib/vue-viewmodels";
import AV from "leancloud-storage";
import { UI } from "./lib/vue-utils";
import Api from "@/lib/api";

export default defineComponent({
  components: { BottomBar },
  setup(props, context) {
    // 提供依赖注入
    Store.useProvider();

    // 监听全局路由
    const homePagePathList: string[] = [
      "/plan",
      "/target-ability",
      "/statistic/",
      "/me"
    ];

    const isCurrentPageHome: Ref<boolean> = inject(
      Store.isCurrentPageHome,
      ref(false)
    );

    watch(
      () => context.root.$route,
      (to, from) => {
        for (let homePagePath of homePagePathList) {
          if (_.startsWith(to.fullPath, homePagePath)) {
            isCurrentPageHome.value = true;
            break;
          } else {
            isCurrentPageHome.value = false;
          }
        }
      }
    );

    //------------- new code ---------------

    // 下面请求数据
    // Plan
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

    // Target
    // 未分组的「目标」的列表
    const unSubjectiveTargetList: Ref<AV.Object[]> = inject(
      Store.unSubjectiveTargetList,
      ref([])
    );

    //「目标类别」的列表
    const targetSubjectList: Ref<AV.Object[]> = inject(
      Store.targetSubjectList,
      ref([])
    );

    // 已完成的「目标」列表
    const completedTargetList: Ref<AV.Object[]> = inject(
      Store.completedTargetList,
      ref([])
    );

    // Ability
    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

    // 能力等级列表
    const levelRuleList: Ref<AV.Object[]> = inject(
      Store.levelRuleList,
      ref([])
    );

    // Statistic
    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    // 选择日期的提示语：如「15 日」、「30 日」、「180 日」
    const dateTip: Ref<string> = inject(Store.dateTip, ref("15 日"));

    // 番茄列表：带日期范围
    const tomatoListWithDateRange: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    watch(dateRange, value => {
      if (value.length === 2 && Api.isLoggedIn()) {
        const startTime = value[0];
        const endTime = value[1];
        dateTip.value = StatPage.getDateTip(startTime, endTime);
        StatPage.initTomatoListWithDateRange(
          context.root,
          tomatoListWithDateRange,
          startTime,
          endTime
        );
      }
    });

    // StatisticTomato、StatisticTarget、StatisticPlan、StatisticAbility
    const tomatoList: Ref<AV.Object[]> = inject(Store.tomatoList, ref([]));

    // MultipleAnalyse
    // 总时间
    const totalTime: Ref<string> = inject(Store.totalTime, ref("0 小时"));

    // 总番茄
    const totalTomatoNumber: Ref<string> = inject(
      Store.totalTomatoNumber,
      ref("0 番茄")
    );

    // 本年的番茄列表
    const thisYearTomatoList: Ref<AV.Object[]> = inject(
      Store.thisYearTomatoList,
      ref([])
    );

    // 是否登录成功
    const isLoginSuccess: Ref<boolean> = inject(
      Store.isLoginSuccess,
      ref(false)
    );

    watch(isLoginSuccess, () => {
      if (Api.isLoggedIn()) {
        App.fetchAppData(
          context.root,
          temporaryPlanList,
          dailyPlanList,
          completedPlanList,
          unSubjectiveTargetList,
          targetSubjectList,
          completedTargetList,
          abilityList,
          levelRuleList,
          tomatoList,
          totalTomatoNumber,
          totalTime,
          thisYearTomatoList
        );

        const startTime = dateRange.value[0];
        const endTime = dateRange.value[1];
        dateTip.value = StatPage.getDateTip(startTime, endTime);
        StatPage.initTomatoListWithDateRange(
          context.root,
          tomatoListWithDateRange,
          startTime,
          endTime
        );
      }
    });

    return {
      isCurrentPageHome
    };
  }
});
</script>
<style lang="stylus">
@import './public/public.stylus'
* {
  flex-shrink 0
  -webkit-tap-highlight-color rgba(0, 0, 0, 0) /* 点击高亮的颜色 */
  // overflow-x hidden
}
.fade-enter-active, .fade-leave-active {
  transition opacity 0.1s
}
.fade-enter, .fade-leave-to { /* .fade-leave-active below version 2.1.8 */
  opacity 0
}
.bounce-enter-active {
  animation bounce-in 0.5s
}
.bounce-leave-active {
  animation bounce-in 0.5s reverse
}
@keyframes bounce-in {
  0% {
    transform scale(0)
  }
  50% {
    transform scale(1.5)
  }
  100% {
    transform scale(1)
  }
}
#app {
  width 100%
  height 100%
}
input {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
}
body, h1, h2, h3, h4, h5, h6 {
  margin 0
  margin-block-start 0
  margin-block-end 0
  margin-inline-start 0
  margin-inline-end 0
}
::-webkit-scrollbar {
  display none
}
.el-message-box {
  width 85% !important
  max-width 420px
}
.el-button--primary {
  background-color #222A36 !important
  border-color #222A36 !important
}
.el-drawer__header {
  margin-bottom 3.9vh !important
}
.draggable-drag {
}
.draggable-ghost {
  opacity 0
}
.draggable-chosen {
  box-shadow 0.75vh 0.75vh 0.37vh -0.07vh rgba(0, 0, 0, 0.05)
}
// 日期选择器
.el-date-range-picker__content {
  float none !important
}
.el-picker-panel__sidebar {
  width 90px !important
}
.el-picker-panel [slot=sidebar]+.el-picker-panel__body, .el-picker-panel__sidebar+.el-picker-panel__body {
  margin-left 88px !important
}
.el-date-range-picker__content {
  width 43.42% !important
  padding-bottom 0 !important
  padding-top 1.5vh !important
}
.el-picker-panel__shortcut {
  font-size 12px !important
}
</style>
