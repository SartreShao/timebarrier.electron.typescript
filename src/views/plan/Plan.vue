<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 创建新计划的输入框 -->
    <section class="new-plan-input-container">
      <input
        type="text"
        placeholder="快速添加一个临时计划"
        @keyup.enter="keyUpEnter_planInputBox"
        v-model="input_planName"
      />
    </section>

    <!-- 主界面 -->
    <main
      v-if="
        temporaryPlanList.length !== 0 ||
          dailyPlanList.length !== 0 ||
          completedPlanList.length !== 0
      "
    >
      <div style="height:2.1vh;flex-shrink:0"></div>

      <!-- 临时计划列表 -->
      <section class="temporary" v-if="temporaryPlanList.length !== 0">
        <draggable
          :options="draggableOptions"
          v-model="temporaryPlanList"
          ghost-class="ghost"
          @end="dragend_templayPlanItem"
        >
          <transition-group type="transition" name="flip-list">
            <temporary-plan-item
              v-for="(item, index) in temporaryPlanList"
              :key="item.id"
              :plan="item"
              @edit-plan="click_planItem(item, index)"
              @finish-plan="click_completePlanButton(item)"
            ></temporary-plan-item>
          </transition-group>
        </draggable>
      </section>

      <!-- 每日计划 -->
      <section class="daily">
        <draggable
          :options="draggableOptions"
          v-model="dailyPlanList"
          ghost-class="ghost"
          @end="dragend_dailyPlanItem"
        >
          <transition-group type="transition" name="flip-list">
            <daily-plan-item
              v-for="(item, index) in dailyPlanList"
              v-bind:key="item.id"
              @edit-plan="click_planItem(item, index)"
              @start-tomato="click_startTomatoButton(item)"
              :plan="item"
            ></daily-plan-item>
          </transition-group>
        </draggable>
      </section>

      <!-- 「已完成」按钮 -->
      <div
        v-if="
          dailyPlanList.length !== 0 ||
            temporaryPlanList.length !== 0 ||
            completedPlanList.length !== 0
        "
        class="completed-container"
        v-darked-when-click
        @click="click_completedPlanListButton"
      >
        <svg
          class="icon-completed"
          xmlns="http://www.w3.org/2000/svg"
          width="22.725"
          height="15.15"
          viewBox="0 0 22.725 15.15"
        >
          <path
            id="路径_619"
            data-name="路径 619"
            d="M36.141,17.465c.456-.415.817-.727,1.161-1.058q4.921-4.741,9.838-9.488c.793-.768,1.621-1.154,2.591-.35.813.671.692,1.6-.32,2.582Q43.6,14.776,37.762,20.389c-1.219,1.17-1.881,1.178-3.079.037-2.111-2.017-4.2-4.059-6.312-6.073-.8-.759-1.2-1.559-.374-2.5.7-.787,1.668-.671,2.681.3,1.812,1.741,3.605,3.5,5.461,5.308Z"
            transform="translate(-27.539 -6.124)"
            fill="#222a36"
          />
        </svg>
        <span>已完成· {{ completedPlanList.length }}</span>
      </div>
    </main>

    <!-- 新手提示 -->
    <main v-else>
      <plan-novice-tutorial style="margin-top:10.36vh"></plan-novice-tutorial>
    </main>

    <create-plan-button class="create-plan"></create-plan-button>

    <!-- 抽屉菜单：已完成的番茄 -->
    <el-drawer
      class="finished-plan-container"
      title="已完成的番茄"
      :visible.sync="isCompletedPlanDrawerDisplayed"
      direction="btt"
      size="69.64%"
    >
      <!-- 临时计划 -->
      <section class="finished">
        <div
          v-splash-when-click
          class="item-container"
          v-for="(item, index) in completedPlanList"
          v-bind:key="item.id"
          @click="click_planItem(item, index)"
          :title="item.attributes.name"
        >
          <h2>
            {{ item.attributes.type === "daily" ? "每日计划" : "临时计划" }}
          </h2>
          <div class="placeholder"></div>
          <h3>{{ item.attributes.name }}</h3>
          <img
            :src="assets.icon_finished"
            class="cancel-finished-button"
            @click.stop="click_cancelCompletePlanButton(item)"
          />
        </div>
      </section>
    </el-drawer>

    <!-- Plan 的底边菜单 -->
    <plan-bottom-menu
      :isShow="isPlanBottomMenuShow"
      @click-cancel="isPlanBottomMenuShow = false"
      @click-background="isPlanBottomMenuShow = false"
      @click-edit="click_editPlan"
      @click-delete="click_deletePlanButton"
    ></plan-bottom-menu>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  onMounted,
  inject,
  reactive
} from "@vue/composition-api";
import AV from "leancloud-storage";
import BottomBar from "../../components/BottomBar.vue";
import TopBar from "../../components/TopBar.vue";
import { PlanPage, TomatoTimerPage } from "@/lib/vue-viewmodels/index";
import Store from "../../store";
import icon_finished from "../../assets/icon_finished.svg";
import icon_logo from "../../assets/icon_logo.svg";
import icon_add from "../../assets/icon_add.svg";
import icon_selected from "../../assets/selected_icon.svg";
import icon_unselected from "../../assets/unselected_icon.svg";
import icon_enter from "../../assets/icon_enter.svg";
import icon_start from "../../assets/icon_start.svg";
import {
  PlanType,
  InputPlanType,
  TomatoCloudStatus
} from "@/lib/types/vue-viewmodels";
import Draggable from "vuedraggable";
import PlanNoviceTutorial from "./components/PlanNoviceTutorial.vue";
import CreatePlanButton from "./components/CreatePlanButton.vue";
import TemporaryPlanItem from "./components/TemporaryPlanItem.vue";
import DailyPlanItem from "./components/DailyPlanItem.vue";
import PlanBottomMenu from "./components/PlanBottomMenu.vue";

export default defineComponent({
  components: {
    BottomBar,
    TopBar,
    Draggable,
    PlanNoviceTutorial,
    CreatePlanButton,
    TemporaryPlanItem,
    DailyPlanItem,
    PlanBottomMenu
  },
  setup(props, context) {
    // 用户输入：创建的「计划」的名称
    const input_planName: Ref<string> = ref("");

    // 用户输入：当前编辑的「计划」
    const input_editingPlan: InputPlanType = inject(
      Store.input_editingPlan,
      reactive({
        id: undefined,
        name: "",
        abilityList: [],
        targetList: [],
        type: "temporary",
        target: "",
        isActived: false,
        isFinished: false,
        deadline: ""
      })
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

    // 番茄开始的时间
    const tomatoStartTime: Ref<Date> = inject(
      Store.tomatoStartTime,
      ref<Date>(Date())
    );

    // 「展示 `已完成的计划列表` 的抽屉」是否已经打开
    const isCompletedPlanDrawerDisplayed: Ref<Boolean> = ref(false);

    // 颜色表
    const colormap = inject(Store.colormap, []);

    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

    // 能力等级列表
    const levelRuleList: Ref<AV.Object[]> = inject(
      Store.levelRuleList,
      ref([])
    );

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

    // 是否显示底部的菜单
    const isPlanBottomMenuShow = ref(false);

    // 在计划输入框回车：创建计划
    const keyUpEnter_planInputBox = () => {
      PlanPage.quicklyCreateTemporaryPlan(
        context.root,
        input_planName,
        temporaryPlanList
      );
    };

    // 点击事件：点击「完成计划」按钮
    const click_completePlanButton = (plan: AV.Object) => {
      if (plan.id !== undefined) {
        PlanPage.completePlan(
          context.root,
          plan,
          temporaryPlanList,
          dailyPlanList,
          completedPlanList
        );
      }
    };

    // 点击时间：点击「取消完成计划」按钮
    const click_cancelCompletePlanButton = (plan: AV.Object) => {
      if (plan.id !== undefined) {
        PlanPage.cancelCompletePlan(
          context.root,
          plan,
          temporaryPlanList,
          dailyPlanList,
          completedPlanList
        );
      }
    };

    // 点击事件：点击「已完成的计划列表」按钮
    const click_completedPlanListButton = () => {
      console.log("Click");
      isCompletedPlanDrawerDisplayed.value = true;
    };

    // 点击事件：点击「计划」条目：弹出菜单
    const click_planItem = (plan: AV.Object, index: number) => {
      PlanPage.openPlanBottomMenu(
        isPlanBottomMenuShow,
        input_editingPlan,
        plan
      );
    };

    // 点击事件：点击「编辑计划」按钮
    const click_editPlan = (plan: AV.Object) => {
      PlanPage.openEditPlanPage(context.root);
    };

    // 点击事件：点击「保存计划」按钮
    const click_savePlanButton = () => {};

    // 点击事件：点击「删除计划」按钮
    const click_deletePlanButton = () => {
      PlanPage.deletePlan(
        context.root,
        input_editingPlan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    };

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

    // 当用户拖动「临时计划」列表完毕时，执行
    const dragend_templayPlanItem = (event: any) => {
      PlanPage.changePlanListOrder(temporaryPlanList);
    };

    // 当用户拖动「每日计划」列表完毕
    const dragend_dailyPlanItem = (event: any) => {
      PlanPage.changePlanListOrder(dailyPlanList);
    };

    // 配置信息
    const draggableOptions = inject(Store.draggableOptions, {});

    return {
      input_planName,
      input_editingPlan,
      temporaryPlanList,
      dailyPlanList,
      completedPlanList,
      isCompletedPlanDrawerDisplayed,
      keyUpEnter_planInputBox,
      click_completePlanButton,
      click_completedPlanListButton,
      click_cancelCompletePlanButton,
      click_planItem,
      click_editPlan,
      click_savePlanButton,
      click_deletePlanButton,
      click_startTomatoButton,
      dragend_templayPlanItem,
      dragend_dailyPlanItem,
      draggableOptions,
      isPlanBottomMenuShow,
      assets: {
        icon_finished,
        icon_logo,
        icon_add,
        icon_selected,
        icon_unselected,
        icon_enter,
        icon_start
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3

  // 「创建新计划」输入框包含者
  section.new-plan-input-container {
    display flex
    background white
    justify-content center
    height 5.25vh
    position fixed
    top 7.52vh
    left 0
    right 0
    margin-left auto
    margin-right auto

    // 输入框
    input {
      opacity 0.54
      margin-top 0.3vh
      padding 0px
      width 92.67vw
      height 3.9vh
      background-color #F4F4F8
      border-radius 1.95vh
      border none
      text-align center
      font-size 2.02vh
      color #222a36

      // 输入框 placeholder
      &::-webkit-input-placeholder {
        opacity 0.6
        font-size 2.02vh
        font-weight normal
        font-stretch normal
        font-style normal
        letter-spacing 0.03vw
        text-align center
        color #222A36
      }
    }
  }

  main {
    position fixed
    top 12.77vh
    height 80.41vh
    overflow scroll
    width 100%
    background #F4F4F8
    display flex
    flex-direction column
    align-items center

    section.temporary {
      flex-shrink 0
      margin-bottom 1.57vh
      width 95.73vw
      display flex
      flex-direction column

      div.item-container {
        user-select none
        cursor pointer
        width 95.73vw
        height 7.2vh
        background white
        display flex
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
          color #222a36
          margin-left 4.67vw
          margin-right 3.27vw
        }

        div.placeholder {
          width 0.13vw
          height 2.92vh
          background #707070
          opacity 0.4
        }

        h3 {
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

        div.finished-button {
          cursor pointer
          width 2.7vh
          height 2.7vh
          border-radius 50%
          opacity 0.5
          border solid 0.15vw #959595
          background-color #ffffff
          position absolute
          right 4.13vw
        }
      }
    }

    section.daily {
      flex-shrink 0
      width 95.73vw
      display flex
      flex-direction column

      .item-container {
        user-select none
        cursor pointer
        width 95.73vw
        height 11.47vh
        flex-shrink 0
        background white
        margin-bottom 1vh

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

          h2 {
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

          div.placeholder {
            width 0.13vw
            height 2.92vh
            background #707070
            opacity 0.4
          }

          h3 {
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

          img.start-button {
            cursor pointer
            width 2.7vh
            height 2.7vh
            border-radius 50%
            opacity 0.5
            position absolute
            right 4.13vw
            border solid 0.15vw #959595
          }
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
      }
    }

    div.completed-container {
      flex-shrink 0
      cursor pointer
      margin-top 3.75vh
      margin-bottom 3.75vh
      width 32vw
      height 4.87vh
      border-radius 3.15vh
      background-color white
      display flex
      align-items center
      justify-content center
      font-size 1.72vh
      color #222A36
      letter-spacing 0.03vw

      .icon-completed {
        width 3.03vw
        height 1.14vh
      }

      span {
        margin-left 3vw
      }
    }
  }
}

.container .item-container-drag {
  opacity 0
}

.flip-list-move {
  transition transform 0.5s
}

.ghost {
  box-shadow 10px 10px 5px -1px rgba(0, 0, 0, 0.14)
  opacity 0.7
}

.finished-plan-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center

  section.finished {
    flex-shrink 0
    margin-bottom 1.57vh
    width 95.73vw
    display flex
    flex-direction column

    .item-container {
      cursor pointer
      user-select none
      width 95.73vw
      height 7.2vh
      background #f0f1f3
      display flex
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
        color #222a36
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
        color #222a36
        margin-left 3.27vw
        width 57.73vw
        overflow hidden
        text-overflow ellipsis
        white-space nowrap
      }

      img.cancel-finished-button {
        cursor pointer
        width 2.7vh
        height 2.7vh
        position absolute
        right 4.13vw
      }
    }
  }
}

.finished-plan-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }

  i {
    &:focus {
      outline 0
    }
  }
}

.edit-plan-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center
}

.edit-plan-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }

  i {
    &:focus {
      outline 0
    }
  }
}

.input-plan-name {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
  width 89.6vw
  height 6.9vh
  border-radius 0.67vh
  border solid 0.15vh #ebebf3
  padding-left 4.8vw
  padding-right 4.8vw
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636

  &::-webkit-input-placeholder {
    font-size 1.95vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.21px
    text-align left
    color #969294
  }
}

.input-plan-target {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
  width 89.6vw
  height 6.9vh
  border-radius 0.67vh
  border solid 0.15vh #ebebf3
  padding-left 4.8vw
  padding-right 4.8vw
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636
  margin-top 2.4vh
}

.input-plan-target::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #969294
}

.opacity40 {
  opacity 0.4
}

.input-plan-type >>> .el-input__inner {
  width 89.6vw
  height 6.9vh
  border-radius 0.67vh
  border solid 0.15vh #ebebf3
  padding-left 4.8vw
  padding-right 4.8vw
  margin-top 2.4vh
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636
}

.input-plan-type >>> .el-input__inner::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #969294
}

.add-plan-related {
  width 89.6vw
  height 6.9vh
  margin-top 2.4vh
  border-radius 0.67vh
  background-color #F4F4F8
  display flex
  align-items center
  cursor pointer
  padding-left 3.92vw

  img {
    width 1.92vh
    height 1.92vh
    margin-right 2.8vw
    opacity 0.5
  }

  span {
    opacity 0.5
    font-size 1.95vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align left
    color #636971
  }
}

.input-plan-description {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
  width 89.6vw
  height 16.79vh
  border-radius 0.67vh
  margin-top 2.4vh
  border solid 0.15vh #ebebf3
  resize none
  padding-top 2.1vh
  padding-bottom 2.1vh
  padding-left 4.8vw
  padding-right 4.8vw
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636
}

.input-plan-description::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.02vh
  text-align left
  color #969294
}

.radio-container {
  display flex
  margin-top 2.4vh
  width 89.6vw
  justify-content space-between

  div {
    cursor pointer
    width 42.93vw
    height 6.9vh
    border-radius 0.67vh
    background-color #f4f4f8
    display flex
    align-items center

    span {
      opacity 0.3
      font-size 2.02vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      text-align center
      color #222a36
      margin-left 4.8vw
    }

    img {
      width 2.1vh
      height 2.1vh
      margin-left 12.27vw
    }
  }
}

.button-container {
  position fixed
  bottom 0
  width 100%
  height 9.25vh
  box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  background-color #ffffff
  display flex
  justify-content space-between
  align-items center
}

.delete-button {
  width 46.8vw
  height 6.82vh
  border-radius 0.75vh
  background-color #959595
  font-size 1.8vh
  font-weight bold
  font-stretch normal
  font-style normal
  line-height 1.5
  letter-spacing 0.04vh
  text-align center
  color #ffffff
  display flex
  justify-content center
  align-items center
  margin-left 2.13vw
  cursor pointer
}

.save-button {
  width 46.8vw
  height 6.82vh
  border-radius 0.75vh
  background-color #222a36
  font-size 1.8vh
  font-weight bold
  font-stretch normal
  font-style normal
  line-height 1.5
  letter-spacing 0.04vh
  text-align center
  color #ffffff
  display flex
  justify-content center
  align-items center
  margin-right 2.13vw
  cursor pointer
}

.related-ability-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center
}

.related-ability-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }

  i {
    &:focus {
      outline 0
    }
  }
}

.input-ability-name {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
  position absolute
  width 89.6vw
  height 6.9vh
  border-radius 0.67vh
  border solid 0.15vh #ebebf3
  padding-left 4.8vw
  padding-right 4.8vw
  box-sizing border-box
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636
}

.input-ability-name::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.02vh
  text-align left
  color #969294
}

.input-ability-name-container {
  position relative
  width 89.6vw
  height 6.9vh
}

.input-ability-name-container img {
  position absolute
  right 5.93vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  width 3.27vw
  height 1.3vh
}

.ability-container {
  margin-top 2.4vh
  width 100%
  display flex
  flex-direction column
  align-items center
}

.ability-item {
  cursor pointer
  width 89.6vw
  height 6.9vh
  border-radius 0.67vh
  background-color #f4f4f8
  display flex
  flex-direction row
  justify-content space-between
  align-items center
  margin-bottom 1.5vh
}

.ability-item span {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.02vh
  text-align left
  color #969294
  margin-left 4.8vw
}

.ability-item img {
  height 2.7vh
  width 2.7vh
  background white
  border-radius 50%
  border solid 0.07vh #d5d5d5
  margin-right 5.87vw
}

.create-plan {
  position fixed
  bottom 8.17vh
  left 0
  right 0
}
</style>
