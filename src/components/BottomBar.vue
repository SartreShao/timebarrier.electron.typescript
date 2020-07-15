<template>
  <div>
    <footer>
      <!-- TAB 1 -->
      <div class="icon1-background" @click="click_planTab">
        <img
          class="icon1"
          :src="
            currentTab === 'plan' ? assets.icon_plan_selected : assets.icon_plan
          "
          alt="icon_plan_selected"
        />
        <span
          class="tab-text"
          :style="{ color: currentTab === 'plan' ? '#222a36' : '#9A9A9A' }"
          >计划</span
        >
      </div>

      <!-- TAB 2 -->
      <div class="icon2-background" @click="click_targetAbilityTab">
        <img
          class="icon2"
          :src="
            currentTab === 'target-ability'
              ? assets.icon_target_ability_selected
              : assets.icon_target_ability
          "
          alt="icon_target_ability"
        />
        <span
          class="tab-text"
          :style="{
            color: currentTab === 'target-ability' ? '#222a36' : '#9A9A9A'
          }"
          >目标&能力</span
        >
      </div>

      <div class="tomato-button" @click="click_tomatoClockButton">
        <img
          :src="assets.icon_play"
          alt="icon_play"
          v-if="tomatoCloudStatus === 'prepared'"
        />

        <img
          :src="assets.icon_finished"
          class="finished"
          alt="icon_finished"
          v-if="tomatoCloudStatus === 'finished'"
        />

        <span v-if="tomatoCloudStatus === 'processive'">{{
          countDownForUI
        }}</span>
      </div>

      <!-- TAB 3 -->
      <div class="icon3-background" @click="click_statisticTab">
        <img
          class="icon3"
          :src="
            currentTab === 'statistic'
              ? assets.icon_statistic_selected
              : assets.icon_statistic
          "
          alt="icon_statistic"
        />
        <span
          class="tab-text"
          :style="{ color: currentTab === 'statistic' ? '#222a36' : '#9A9A9A' }"
          >统计</span
        >
      </div>

      <!-- TAB 4 -->
      <div class="icon4-background" @click="click_meTab">
        <img
          class="icon4"
          :src="currentTab === 'me' ? assets.icon_me_selected : assets.icon_me"
          alt="icon_me"
        />
        <span
          class="tab-text"
          :style="{ color: currentTab === 'me' ? '#222a36' : '#9A9A9A' }"
          >我的</span
        >
      </div>
    </footer>

    <!-- 提交番茄的抽屉菜单 -->
    <el-drawer
      title="提交番茄"
      :visible.sync="isCommitPlanDrawerDisplayed"
      direction="btt"
      size="86.64%"
    >
      <!-- 提交番茄的临时计划列表 -->
      <section class="temporary">
        <!-- 标题：近期完成的计划 -->
        <span
          v-if="hasRecentlyCompletedPlan.value"
          class="recently-completed-plan"
          >近期完成的计划</span
        >

        <!-- 刚刚完成的计划 -->
        <div v-for="item in completedPlanList" v-bind:key="item.id">
          <div
            v-if="tomatoStartTime <= item.updatedAt"
            v-bind:class="{
              'item-container': !item.attributes.selected,
              'item-container-selected': item.attributes.selected
            }"
            @click="click_planItemSelector(item)"
          >
            <h2>
              {{ item.attributes.type === "daily" ? "每日计划" : "临时计划" }}
            </h2>
            <div class="placeholder"></div>
            <h3>{{ item.attributes.name }}</h3>
            <!-- <div class="finished-button"></div> -->
          </div>
        </div>

        <div style="height: 3.37vh" v-if="hasRecentlyCompletedPlan.value"></div>

        <!-- 标题：计划列表 -->
        <span class="plan-list">计划列表</span>

        <!-- 临时计划 -->
        <div v-for="item in temporaryPlanList" v-bind:key="item.id">
          <div
            v-bind:class="{
              'item-container': !item.attributes.selected,
              'item-container-selected': item.attributes.selected
            }"
            @click="click_planItemSelector(item)"
          >
            <h2>临时计划</h2>
            <div class="placeholder"></div>
            <h3>{{ item.attributes.name }}</h3>
            <!-- <div class="finished-button"></div> -->
          </div>
        </div>

        <!-- 每日计划 -->
        <div v-for="item in dailyPlanList" v-bind:key="item.id">
          <div
            v-bind:class="{
              'item-container': !item.attributes.selected,
              'item-container-selected': item.attributes.selected
            }"
            @click="click_planItemSelector(item)"
          >
            <h2>每日计划</h2>
            <div class="placeholder"></div>
            <h3>{{ item.attributes.name }}</h3>
            <!-- <div class="finished-button"></div> -->
          </div>
        </div>
      </section>
      <section class="footer">
        <section class="temporary-plan-container">
          <img src="" alt="" />
          <div>
            <input
              class="input-plan"
              type="text"
              placeholder="25 分钟做的事情"
              @keyup.enter="keyUpEnter_planInputBox"
              v-model="input_tomatoName"
            />
            <img :src="assets.icon_enter" alt="icon_enter" class="icon-enter" />
          </div>
        </section>
        <textarea
          class="input-description"
          type="text"
          placeholder="详细描述[可省略]"
          v-model="input_tomatoDescription"
        />
        <section class="button-container">
          <div class="give-up" @click="click_giveUpTomatoButton">放弃</div>
          <div class="commit" @click="click_commitTomatoButton">提交</div>
        </section>
      </section>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import icon_plan from "../assets/plan.svg";
import icon_plan_selected from "../assets/plan_selected.svg";
import icon_target_ability from "../assets/target_ability.svg";
import icon_target_ability_selected from "../assets/target_ability_selected.svg";
import icon_statistic from "../assets/statistic.svg";
import icon_statistic_selected from "../assets/statistic_selected.svg";
import icon_me from "../assets/me.svg";
import icon_me_selected from "../assets/me_selected.svg";
import icon_play from "../assets/play.svg";
import icon_finished from "../assets/finished.svg";
import icon_enter from "../assets/enter.svg";

import { UI, Router } from "../lib/vue-utils";
import AV from "leancloud-storage";

import Api from "../lib/api";
import {
  defineComponent,
  ref,
  inject,
  Ref,
  watch,
  computed
} from "@vue/composition-api";
import Store from "../store";
import { TomatoCloudStatus, TabType } from "../lib/types/vue-viewmodels";
import { TomatoTimerPage } from "../lib/vue-viewmodels";
import * as _ from "lodash";

export default defineComponent({
  setup(props, context) {
    // 色彩表
    const colormap: string[] = inject(Store.colormap, []);

    // 倒计时器 instance
    const tomatoClockInterval: Ref<NodeJS.Timeout | null> = inject(
      Store.tomatoClockInterval,
      ref(null)
    );

    // 倒计时表盘值
    const countDown: Ref<number> = inject(Store.countDown, ref(1500));

    // 番茄时钟的状态值
    const tomatoCloudStatus: Ref<TomatoCloudStatus> = inject(
      Store.tomatoCloudStatus,
      ref<TomatoCloudStatus>("prepared")
    );

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

    // 近期完成的计划
    const hasRecentlyCompletedPlan = computed(() => {
      const list: AV.Object[] = [];
      completedPlanList.value.forEach(plan => {
        if (plan.updatedAt !== undefined) {
          if (tomatoStartTime.value <= plan.updatedAt) {
            list.push(plan);
          }
        }
      });

      let result: boolean;
      if (list.length === 0) {
        result = false;
      } else {
        result = true;
      }
      return ref(result);
    });

    // 用户输入：提交的番茄名称
    const input_tomatoName: Ref<string> = ref("");

    // 用户输入：提交的番茄描述
    const input_tomatoDescription: Ref<string> = ref("");

    // 提交番茄的窗口的显示控制
    const isCommitPlanDrawerDisplayed = ref(false);

    // 番茄钟表盘值
    const countDownForUI = computed(() => UI.formatTime(countDown.value));

    // 番茄开始的时间
    const tomatoStartTime: Ref<Date> = inject(
      Store.tomatoStartTime,
      ref<Date>(Date())
    );

    // 点击事件：点击番茄时钟
    const click_tomatoClockButton = () => {
      TomatoTimerPage.clickTomatoClock(
        context.root,
        tomatoCloudStatus,
        tomatoClockInterval,
        countDown,
        isCommitPlanDrawerDisplayed,
        input_tomatoName,
        null,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        tomatoStartTime,
        input_tomatoDescription
      );
    };

    // 点击事件：点击放弃一个正在进行的番茄
    const click_giveUpTomatoButton = () => {
      TomatoTimerPage.abandonTomato(
        context.root,
        tomatoCloudStatus,
        tomatoClockInterval,
        countDown,
        isCommitPlanDrawerDisplayed
      );
    };

    // 点击事件：点击选择 Plan 的项目
    const click_planItemSelector = (plan: AV.Object) => {
      TomatoTimerPage.selectPlanToCommit(
        plan,
        input_tomatoName,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList
      );
    };

    const tomatoList: Ref<AV.Object[]> = inject(Store.tomatoList, ref([]));

    const totalTime: Ref<string> = inject(Store.totalTime, ref("0 小时"));

    const totalTomatoNumber: Ref<string> = inject(
      Store.totalTomatoNumber,
      ref("0 番茄")
    );

    const thisYearTomatoList: Ref<AV.Object[]> = inject(
      Store.thisYearTomatoList,
      ref([])
    );

    // 番茄列表：带日期范围
    const tomatoListWithDateRange: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    // 点击事件：点击提交番茄
    const click_commitTomatoButton = () => {
      TomatoTimerPage.commitTomato(
        context.root,
        tomatoCloudStatus,
        tomatoClockInterval,
        countDown,
        isCommitPlanDrawerDisplayed,
        input_tomatoName,
        input_tomatoDescription,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        tomatoStartTime,
        tomatoList,
        totalTomatoNumber,
        totalTime,
        thisYearTomatoList,
        dateRange,
        tomatoListWithDateRange,
        colormap
      );
    };

    // 点击事件：点击「计划 TAB」
    const click_planTab = () => {
      Router.replace(context.root.$router, "/plan");
    };

    // 点击事件：点击「目标-能力 TAB」
    const click_targetAbilityTab = () => {
      Router.replace(context.root.$router, "/target-ability");
    };

    // 点击事件：点击「统计 TAB」
    const click_statisticTab = () => {
      Router.replace(context.root.$router, "/statistic");
    };

    // 点击事件：点击「我的 TAB」
    const click_meTab = () => {
      Router.replace(context.root.$router, "/me");
    };

    // 用户输入：创建回车
    const keyUpEnter_planInputBox = () => {
      TomatoTimerPage.commitTomato(
        context.root,
        tomatoCloudStatus,
        tomatoClockInterval,
        countDown,
        isCommitPlanDrawerDisplayed,
        input_tomatoName,
        input_tomatoDescription,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        tomatoStartTime,
        tomatoList,
        totalTomatoNumber,
        totalTime,
        thisYearTomatoList,
        dateRange,
        tomatoListWithDateRange,
        colormap
      );
    };

    // 当前的 TAB
    const currentTab: Ref<TabType> = ref("plan");

    // 观察：当前路由
    watch(
      () => context.root.$route,
      (to, from) => {
        if (_.startsWith(to.path, "/plan")) {
          currentTab.value = "plan";
        } else if (_.startsWith(to.path, "/target-ability")) {
          currentTab.value = "target-ability";
        } else if (_.startsWith(to.path, "/statistic")) {
          currentTab.value = "statistic";
        } else if (_.startsWith(to.path, "/me")) {
          currentTab.value = "me";
        }
      }
    );

    return {
      input_tomatoName,
      input_tomatoDescription,
      keyUpEnter_planInputBox,
      click_tomatoClockButton,
      isCommitPlanDrawerDisplayed,
      temporaryPlanList,
      dailyPlanList,
      completedPlanList,
      hasRecentlyCompletedPlan,
      click_commitTomatoButton,
      click_giveUpTomatoButton,
      click_planItemSelector,
      click_planTab,
      click_targetAbilityTab,
      click_statisticTab,
      click_meTab,
      tomatoCloudStatus,
      tomatoStartTime,
      countDownForUI,
      countDown,
      currentTab,
      assets: {
        icon_plan_selected,
        icon_plan,
        icon_target_ability_selected,
        icon_target_ability,
        icon_statistic,
        icon_statistic_selected,
        icon_me,
        icon_me_selected,
        icon_play,
        icon_finished,
        icon_enter
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
footer {
  background white
  width 100%
  height 6.82vh
  position fixed
  bottom 0
  display flex
  align-items center
  .icon1-background {
    cursor pointer
    width 14.67vw
    height 6.22vh
    border-radius 1.05vh
    background-color #fff
    display flex
    justify-content center
    flex-direction column
    align-items center
    margin-left 3.47vw
    margin-right 2.27vw
    transition all 0.2s linear
    &:hover {
      background-color #F4F4F8
    }
    .tab-text {
      transition all 0.2s linear
      opacity 0
      display block
      height 0vh
      font-size 0vh
      margin-top 0vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      color #9A9A9A
    }
    &:hover .tab-text {
      transition all 0.2s linear
      opacity 1
      display block
      height 1.87vh
      font-size 1.27vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      margin-top 0.67vh
      color #9A9A9A
    }
  }
  .icon2-background {
    cursor pointer
    width 14.67vw
    height 6.22vh
    border-radius 1.05vh
    background-color #fff
    display flex
    justify-content center
    flex-direction column
    align-items center
    transition all 0.2s linear
    &:hover {
      background-color #F4F4F8
    }
    .tab-text {
      transition all 0.2s linear
      opacity 0
      display block
      height 0vh
      font-size 0vh
      margin-top 0vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      color #9A9A9A
    }
    &:hover .tab-text {
      transition all 0.2s linear
      opacity 1
      display block
      height 1.87vh
      font-size 1.27vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      margin-top 0.67vh
      color #9A9A9A
    }
  }
  .icon3-background {
    cursor pointer
    width 14.67vw
    height 6.22vh
    border-radius 1.05vh
    background-color #fff
    display flex
    justify-content center
    flex-direction column
    align-items center
    transition all 0.2s linear
    &:hover {
      background-color #F4F4F8
    }
    .tab-text {
      transition all 0.2s linear
      opacity 0
      display block
      height 0vh
      font-size 0vh
      margin-top 0vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      color #9A9A9A
    }
    &:hover .tab-text {
      transition all 0.2s linear
      opacity 1
      display block
      height 1.87vh
      font-size 1.27vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      margin-top 0.67vh
      color #9A9A9A
    }
  }
  .icon4-background {
    cursor pointer
    width 14.67vw
    height 6.22vh
    border-radius 1.05vh
    background-color #fff
    display flex
    justify-content center
    flex-direction column
    align-items center
    margin-right 3.47vw
    margin-left 2.27vw
    transition all 0.2s linear
    &:hover {
      background-color #F4F4F8
    }
    .tab-text {
      transition all 0.2s linear
      opacity 0
      display block
      height 0vh
      font-size 0vh
      margin-top 0vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      color #9A9A9A
    }
    &:hover .tab-text {
      transition all 0.2s linear
      opacity 1
      display block
      height 1.87vh
      font-size 1.27vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.01vh
      text-align center
      margin-top 0.67vh
      color #9A9A9A
    }
  }
  .icon1 {
    width 3.8vw
    height 2.25vh
  }
  .icon2 {
    width 3.99vw
    cursor pointer
    height 2.25vh
  }
  .icon3 {
    width 3.99vw
    cursor pointer
    height 2.25vh
  }
  .icon4 {
    width 3.33vw
    height 2.25vh
    cursor pointer
  }
  .tomato-button {
    cursor pointer
    width 14.4vw
    height 4.87vh
    border-radius 1.05vh
    background-color #222A36
    display flex
    align-items center
    justify-content center
    margin-left 7.73vw
    margin-right 7.73vw
    img {
      width 2.68vw
      height 1.93vh
    }
    img.finished {
      width 4.24vw
      height 1.83vh
    }
    span {
      font-family SourceHanSansSC
      font-size 2.1vh
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing 0.07vw
      text-align center
      color #ffffff
    }
  }
}
section.temporary {
  width 100%
  height 46vh
  overflow scroll
  display flex
  flex-direction column
  align-items center
  .recently-completed-plan {
    align-self flex-start
    height 2.92vh
    font-size 2.02vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align left
    color #969294
    margin-left 4vw
    margin-bottom 1.35vh
  }
  .plan-list {
    align-self flex-start
    height 2.92vh
    font-size 2.02vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align left
    color #969294
    margin-left 4vw
    margin-bottom 1.35vh
  }
  div.item-container {
    cursor pointer
    width 92vw
    height 7.2vh
    background #f0f1f3
    display flex
    flex-shrink 0
    align-items center
    position relative
    margin-bottom 0.52vh
    h2 {
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      color #434343
      margin-left 4.67vw
      margin-right 3.27vw
    }
    div.placeholder {
      width 0.13vw
      height 2.92vh
      background #707070
    }
    h3 {
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      color #434343
      margin-left 3.27vw
      width 57.73vw
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
    }
    div.finished-button {
      cursor pointer
      width 4.8vw
      height 4.8vw
      border-radius 2.4vw
      border solid 0.15vw #959595
      background-color #ffffff
      position absolute
      right 4.13vw
    }
  }
  div.item-container-selected {
    cursor pointer
    width 92vw
    height 7.2vh
    box-shadow 0 0.4vw 0.8vw 0 rgba(0, 0, 0, 0.25)
    display flex
    flex-shrink 0
    align-items center
    position relative
    margin-bottom 0.52vh
    background #222a36
    h2 {
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      color white
      margin-left 4.67vw
      margin-right 3.27vw
    }
    div.placeholder {
      width 0.13vw
      height 2.92vh
      background white
    }
    h3 {
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      color white
      margin-left 3.27vw
      width 57.73vw
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
    }
    div.finished-button {
      cursor pointer
      width 4.8vw
      height 4.8vw
      border-radius 2.4vw
      border solid 0.15vw #959595
      background-color #ffffff
      position absolute
      right 4.13vw
    }
  }
}
section.footer {
  background #ffffff
  position absolute
  bottom 0
  width 100%
  height 29.69vh
  box-shadow 0 -0.4vw 0.8vw 0 rgba(0, 0, 0, 0.16)
  display flex
  flex-direction column
  align-items center
  .temporary-plan-container {
    height 5.17vh
    width 100%
    margin-top 1.23vh
    display flex
    img {
      width 5.17vh
      margin-left 2.13vw
      height 5.17vh
      border-radius 2.585vh
    }
    div {
      position relative
      width 83.87vw
      height 5.17vh
      margin-left 1.76vw
      input {
        left 0
        top 0
        position absolute
        background none
        outline none
        border none
        width 83.87vw
        height 5.17vh
        padding-left 3.07vw
        padding-right 9vw
        border-radius 0.67vh
        box-sizing border-box
        background-color #f4f4f8
      }
      input::-webkit-input-placeholder {
        opacity 0.3
        font-size 2.02vh
        font-weight normal
        font-stretch normal
        font-style normal
        line-height 1.44
        letter-spacing 0.02vh
        text-align left
        color #222a36
      }
      .icon-enter {
        position absolute
        width 3.27vw
        height 1.3vh
        right 3.8vw
        top 0
        bottom 0
        margin-top auto
        margin-bottom auto
      }
    }
  }
  .input-description {
    background none
    outline none
    border none
    width 95.73vw
    height 12.74vh
    resize none
    margin-top 1.35vh
    margin-left 2.13vw
    margin-right 2.13vw
    border-radius 0.67vh
    box-sizing border-box
    padding-left 1.6vw
    padding-right 1.6vw
    padding-top 1.27vh
    padding-bottom 1.27vh
    background-color #f4f4f8
  }
  textarea::-webkit-input-placeholder {
    opacity 0.3
    font-size 2.02vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align left
    color #222a36
  }
  .button-container {
    display flex
    margin-top 1.35vh
    div.give-up {
      cursor pointer
      display flex
      justify-content center
      align-items center
      width 46.8vw
      height 6.82vh
      border-radius 1.33vw
      background-color #959595
      font-size 1.8vh
      font-stretch normal
      font-style normal
      letter-spacing 0.06vw
      color #ffffff
      margin-right 1.07vw
    }
    div.commit {
      cursor pointer
      display flex
      justify-content center
      align-items center
      width 46.8vw
      height 6.82vh
      border-radius 1.33vw
      background-color #222a36
      font-size 1.8vh
      font-stretch normal
      font-style normal
      letter-spacing 0.06vw
      color #ffffff
      margin-left 1.07vw
    }
  }
}
</style>
