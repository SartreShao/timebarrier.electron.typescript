<template>
  <div>
    <footer>
      <img class="icon1" :src="assets.icon_plan" alt="icon_plan" />

      <img class="icon2" :src="assets.icon_target" alt="icon_target" />

      <div @click="clickTomatoClock">
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

      <img class="icon3" :src="assets.icon_statistics" alt="icon_statistics" />

      <img class="icon4" :src="assets.icon_me" alt="icon_me" />
    </footer>

    <el-drawer
      title="提交番茄"
      :visible.sync="isCommitPlanDrawerDisplayed"
      direction="btt"
      size="86.64%"
    >
      <section class="temporary">
        <div v-for="item in temporaryPlanList" v-bind:key="item.id">
          <div
            v-bind:class="{
              'item-container': !item.selected,
              'item-container-selected': item.selected
            }"
            @click="clickPlanItem(item)"
          >
            <h2>临时任务</h2>
            <div class="placeholder"></div>
            <h3>{{ item.attributes.name }}</h3>
            <div class="finished-button"></div>
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
              placeholder="可输入临时任务"
              @keyup.enter="keyUpEnter_planInputBox"
              v-model="input_plan"
            />
            <img :src="assets.icon_enter" alt="icon_enter" class="icon-enter" />
          </div>
        </section>
        <textarea
          class="input-description"
          type="text"
          placeholder="描述[可省略]"
          v-model="input_description"
        />
        <section class="button-container">
          <div class="give-up" @click="clickGiveUp">放弃</div>
          <div class="commit" @click="clickCommit">提交</div>
        </section>
      </section>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import icon_plan from "../assets/plan.svg";
import icon_target from "../assets/target.svg";
import icon_statistics from "../assets/statistics.svg";
import icon_me from "../assets/me.svg";
import icon_play from "../assets/play.svg";
import icon_finished from "../assets/finished.svg";
import icon_enter from "../assets/enter.svg";

import { UI } from "../lib/vue-utils";
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
import { TomatoCloudStatus } from "../lib/types/vue-viewmodels";
import { TomatoTimerPage } from "../lib/vue-viewmodels";

export default defineComponent({
  setup(props, context) {
    // 倒计时器 instance
    const interval: Ref<NodeJS.Timeout | null> = ref(null);

    // 倒计时表盘值
    const countDown: Ref<number> = ref(1500);

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

    // 提交番茄的窗口的显示控制
    const isCommitPlanDrawerDisplayed = ref(false);

    // 番茄钟表盘值
    const countDownForUI = computed(() => UI.formatTime(countDown.value));

    // 点击事件：点击番茄时钟
    const clickTomatoClock = () => {
      TomatoTimerPage.clickTomatoClock(
        context.root,
        tomatoCloudStatus,
        interval,
        countDown,
        isCommitPlanDrawerDisplayed
      );
    };

    // 点击事件：点击放弃一个正在进行的番茄
    const clickGiveUp = () => {
      TomatoTimerPage.abandonTomato(
        context.root,
        tomatoCloudStatus,
        interval,
        countDown
      );
    };

    const clickCommit = () => {};

    return {
      clickTomatoClock,
      isCommitPlanDrawerDisplayed,
      temporaryPlanList,
      clickCommit,
      clickGiveUp,
      tomatoCloudStatus,
      countDownForUI,
      countDown,
      assets: {
        icon_plan,
        icon_target,
        icon_statistics,
        icon_me,
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
  width 100%
  height 6.82vh
  position fixed
  bottom 0
  justify-content space-between
  display flex
  align-items center
  .icon1 {
    margin-left 8.93vw
    width 3.8vw
    cursor pointer
    height 2.25vh
  }
  .icon2 {
    width 4.27vw
    cursor pointer
    height 2.4vh
  }
  .icon3 {
    width 4.41vw
    height 2.48vh
    cursor pointer
  }
  .icon4 {
    width 3.67vw
    height 2.48vh
    margin-right 8.87vw
    cursor pointer
  }
  div {
    cursor pointer
    width 14.4vw
    height 4.87vh
    border-radius 1.05vh
    background-color #3846cf
    display flex
    align-items center
    justify-content center
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
  height 49.63vh
  overflow scroll
  display flex
  flex-direction column
  align-items center
  div.item-container {
    cursor pointer
    width 95.73vw
    height 7.2vh
    background #f0f1f3
    display flex
    flex-shrink 0
    align-items center
    position relative
    margin-bottom 7px
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
    width 95.73vw
    height 7.2vh
    box-shadow 0 0.4vw 0.8vw 0 rgba(0, 0, 0, 0.25)
    display flex
    flex-shrink 0
    align-items center
    position relative
    margin-bottom 7px
    background #3846cf
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
