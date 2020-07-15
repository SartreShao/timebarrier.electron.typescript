<template>
  <!-- 顶边栏 -->
  <header>
    <!-- 状态栏占位 -->
    <div style="height:1vh"></div>
    <!-- 标题与刷新按钮 -->
    <section class="title">
      <div class="refresh" @click="click_refreshDataButton">
        <img
          :src="assets.icon_logo"
          alt="icon_logo"
          v-if="isCurrentPageHome"
          class="icon-logo"
        />

        <span class="refresh-tip">刷新数据</span>
      </div>

      <div class="back" v-if="!isCurrentPageHome" @click="click_backButton">
        <img :src="assets.icon_back" alt="icon_back" class="icon-back" />
      </div>
      <div class="home" v-if="!isCurrentPageHome" @click="click_homeButton">
        <img :src="assets.icon_home" alt="icon_home" class="icon-home" />
      </div>
      <h1>时间壁垒</h1>
    </section>
  </header>
</template>

<script lang="ts">
import icon_logo from "../assets/icon_logo.svg";
import icon_home from "../assets/icon_home.svg";
import icon_back from "../assets/icon_back.svg";
import { defineComponent, watch, ref, inject, Ref } from "@vue/composition-api";
import Store from "@/store";
import { Router } from "@/lib/vue-utils";
import { App, StatPage } from "@/lib/vue-viewmodels";
import AV from "leancloud-storage";

export default defineComponent({
  setup(props, context) {
    const isCurrentPageHome = inject(Store.isCurrentPageHome, ref(false));

    // 点击事件：后退按钮
    const click_backButton = () => {
      Router.back(context.root.$router);
    };

    // 点击事件：主页按钮
    const click_homeButton = () => {
      Router.replace(context.root.$router, "/plan");
    };
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

    // 点击事件：刷新按钮
    const click_refreshDataButton = async () => {
      await App.fetchAppData(
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
    };

    return {
      click_backButton,
      click_homeButton,
      isCurrentPageHome,
      click_refreshDataButton,
      assets: { icon_logo, icon_home, icon_back }
    };
  }
});
</script>

<style lang="stylus" scoped>
// 背景颜色
$bacground-color = white
// 顶边栏高度
$top-bar-height = 6.52vh
// 标题字体大小
$title-font-size = 2.62vh
// 标题字体颜色
$title-font-color = #222A36
// 顶边栏的容器
header {
  width 100%
  display flex
  flex-direction column
  background $bacground-color
  position fixed
  top 0
  // 标题和按钮的容器
  section.title {
    height $top-bar-height
    display flex
    justify-content center
    align-items center
    background $bacground-color
    position relative
    h1 {
      font-size $title-font-size
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing -0.03vh
      text-align center
      color $title-font-color
    }
  }
}
.refresh {
  cursor pointer
  position absolute
  left 1.73vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  width 21.07vw
  height 4.27vh
  border-radius 1.05vh
  background-color #fff
  display flex
  align-items center
  transition all 0.2s linear
  &:hover {
    background-color #F4F4F8
  }
  .icon-logo {
    transition all 0.2s linear
    cursor pointer
    margin-left 4.29vw
    width 2.89vh
    height 2.89vh
  }
  &:hover .icon-logo {
    transition all 0.2s linear
    cursor pointer
    margin-left 2.99vw
    width 1.51vh
    height 1.51vh
  }
  .refresh-tip {
    transition all 0.2s linear
    opacity 0
    cursor pointer
    font-size 0vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.01vh
    text-align center
    color #9a9a9a
    margin-left 1.99vw
  }
  &:hover .refresh-tip {
    transition all 0.2s linear
    opacity 1
    cursor pointer
    font-size 1.42vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.01vh
    text-align center
    color #9a9a9a
    margin-left 1.99vw
  }
}
.back {
  cursor pointer
  position absolute
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  width 10.53vw
  height 4.27vh
  left 1.73vw
  display flex
  align-items center
  justify-content center
  background #fff
  border-radius 1.05vh
  transition all 0.2s linear
  &:hover {
    background #f4f4f8
    border-radius 1.05vh
  }
}
.icon-back {
  width 1.92vw
  height 1.82vh
}
.home {
  cursor pointer
  position absolute
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  left 12.27vw
  width 10.53vw
  height 4.27vh
  display flex
  align-items center
  justify-content center
  background #fff
  border-radius 1.05vh
  transition all 0.2s linear
  &:hover {
    background #f4f4f8
    border-radius 1.05vh
  }
}
.icon-home {
  width 1.96vh
  height 1.94vh
}
</style>
