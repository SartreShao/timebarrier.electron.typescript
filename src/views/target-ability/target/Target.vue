<template>
  <div class="container">
    <!-- 添加「目标」按钮 -->
    <div class="add-button" @click="click_createTargetButton">
      <div v-darked-when-click>
        <img :src="assets.icon_create_target" alt="icon_create_target" />
      </div>
    </div>

    <!-- 无目录的目标 -->
    <draggable
      :options="draggableOptions"
      v-model="unSubjectiveTargetList"
      ghost-class="ghost"
      @end="dragend_unSubjectiveTarget"
    >
      <transition-group type="transition" name="flip-list">
        <div
          :id="target.id"
          class="target-item-container"
          v-for="target in unSubjectiveTargetList"
          :key="target.id"
          v-longclick="() => click_editTargetButton(target)"
          v-splash-when-click
        >
          <!-- 完成目标 -->
          <div class="finished-button-container">
            <svg
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
                      (target.attributes.validity.getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24) +
                        1
                    ) +
                    " 天"
                  : ""
              }}
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
      </transition-group>
    </draggable>

    <!-- 有目录的目标 -->
    <draggable
      :options="draggableOptions"
      v-model="targetSubjectList"
      ghost-class="ghost"
      @end="dragend_targetSubject"
      style="width:100%"
    >
      <transition-group type="transition" name="flip-list">
        <div
          style="width:100%"
          v-for="targetSubject in targetSubjectList"
          :key="targetSubject.id"
          :id="targetSubject.id"
        >
          <!-- 目标目录 -->
          <div
            class="target-subject-container"
            v-splash-when-click
            v-longclick="() => click_editTargetSubjectButton(targetSubject)"
            @click="
              targetSubject.attributes.showSubjectList = !targetSubject
                .attributes.showSubjectList
            "
          >
            {{ targetSubject.attributes.name }} ({{
              targetSubject.attributes.targetListOfTargetSubject.length
            }})
            <img
              class="icon-downward"
              :src="assets.icon_downward"
              alt="icon_downward"
              v-if="targetSubject.attributes.showSubjectList === true"
            />
            <img
              class="icon-leftward"
              :src="assets.icon_leftward"
              alt="icon_leftward"
              v-else
            />
          </div>

          <div
            style="width:100%"
            v-if="targetSubject.attributes.showSubjectList === true"
          >
            <draggable
              :options="draggableOptions"
              v-model="targetSubject.attributes.targetListOfTargetSubject"
              ghost-class="ghost"
              @end="dragend_subjectiveTarget(targetSubject)"
            >
              <transition-group type="transition" name="flip-list">
                <!-- 目标 -->
                <div
                  class="target-item-container"
                  v-for="target in targetSubject.attributes
                    .targetListOfTargetSubject"
                  :key="target.id"
                  :id="target.id"
                  v-longclick="() => click_editTargetButton(target)"
                  v-splash-when-click
                >
                  <!-- 完成目标 -->
                  <div class="finished-button-container">
                    <svg
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
                              (target.attributes.validity.getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24) +
                                1
                            ) +
                            " 天"
                          : ""
                      }}
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
              </transition-group>
            </draggable>
          </div>
        </div>
      </transition-group>
    </draggable>

    <!-- 已完成的目标目录 -->
    <div
      v-darked-when-click
      class="target-subject-container"
      @click="isCompletedTargetShown = !isCompletedTargetShown"
    >
      已完成的目标
      <img
        class="icon-downward"
        :src="assets.icon_downward"
        alt="icon_downward"
        v-if="isCompletedTargetShown === true"
      />
      <img
        class="icon-leftward"
        :src="assets.icon_leftward"
        alt="icon_leftward"
        v-else
      />
    </div>

    <!-- 已完成的目标 -->
    <div style="width:100%" v-if="isCompletedTargetShown === true">
      <div
        class="target-item-container"
        v-for="target in completedTargetList"
        v-bind:key="target.id"
        v-longclick="() => click_editTargetButton(target)"
        v-splash-when-click
      >
        <!-- 完成目标 -->
        <div class="finished-button-container">
          <svg
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
                    (target.attributes.validity.getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24) +
                      1
                  ) +
                  " 天"
                : ""
            }}
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
    </div>

    <div style="height:15vh"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted,
  computed,
  reactive
} from "@vue/composition-api";
import icon_create_target from "../../../assets/icon_create_target.svg";
import icon_downward from "../../../assets/icon_downward.svg";
import icon_leftward from "../../../assets/icon_leftward.svg";
import icon_red_finished_button from "../../../assets/icon_red_finished_button.svg";
import Store from "../../../store";
import AV from "leancloud-storage";
import { TargetPage } from "../../../lib/vue-viewmodels";
import draggable from "vuedraggable";
import { InputTargetOrTargetSubjectType } from "@/lib/types/vue-viewmodels";

export default defineComponent({
  components: { draggable },
  setup(props, context) {
    // 控制变量：「创建目标」的抽屉菜单是否打开
    const isCreateTargetDrawerDisplayed: Ref<boolean> = inject(
      Store.isCreateTargetDrawerDisplayed,
      ref(false)
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

    // 已完成的目标是否打开
    const isCompletedTargetShown: Ref<boolean> = ref(false);

    const isEditTargetDrawerDisplayed: Ref<boolean> = inject(
      Store.isEditTargetDrawerDisplayed,
      ref(false)
    );

    // 用户输入：编辑「目标」或「目标类别」
    const input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType = inject(
      Store.input_editingTargetOrTargetSubject,
      reactive({
        inputType: "target", // 默认选择：目标
        target: {
          id: "",
          targetSubjectId: "", //默认：不选择
          name: "",
          description: "",
          validityType: "",
          validity: null,
          abilityList: [],
          isActived: true,
          isFinished: false
        },
        targetSubject: {
          id: "",
          name: ""
        }
      })
    );

    // 用户输入：创建「目标」或「目标类别」
    const input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType = inject(
      Store.input_creatingTargetOrTargetSubject,
      reactive({
        inputType: "target", // 默认选择：目标
        target: {
          id: "",
          targetSubjectId: "", //默认：不选择
          name: "",
          description: "",
          validityType: "",
          validity: null,
          abilityList: [],
          isActived: true,
          isFinished: false
        },
        targetSubject: {
          id: "",
          name: ""
        }
      })
    );

    // 拖动结束：未分类的目标
    const dragend_unSubjectiveTarget = () => {
      TargetPage.changeTargetListOrder(unSubjectiveTargetList.value);
    };

    // 拖动结束：目标目录
    const dragend_targetSubject = () => {
      TargetPage.changeTargetSubjectListOrder(targetSubjectList.value);
    };

    // 拖动结束：有目录的目标
    const dragend_subjectiveTarget = (targetSubject: AV.Object) => {
      console.log(
        "targetSubject",
        targetSubject.attributes.targetListOfTargetSubject
      );
      TargetPage.changeTargetListOrder(
        targetSubject.attributes.targetListOfTargetSubject
      );
    };

    // 点击事件：编辑目标
    const click_editTargetButton = (target: AV.Object) => {
      TargetPage.openTargetEditDrawer(
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        target
      );
    };

    // 点击事件：创建目标
    const click_createTargetButton = () => {
      TargetPage.openTargetSubjectCreateDrawer(
        isCreateTargetDrawerDisplayed,
        input_creatingTargetOrTargetSubject
      );
    };

    // 点击事件：编辑目标目录
    const click_editTargetSubjectButton = (targetSubject: AV.Object) => {
      TargetPage.openTargetSubjectEditDrawer(
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        targetSubject
      );
    };

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
      console.log("un");
      TargetPage.unFinishedTarget(
        context.root,
        target,
        unSubjectiveTargetList,
        completedTargetList,
        targetSubjectList
      );
    };

    // 配置信息
    const draggableOptions = inject(Store.draggableOptions, {});

    // 生命周期：初始化
    onMounted(() => {
      TargetPage.init(
        context.root,
        unSubjectiveTargetList,
        completedTargetList,
        targetSubjectList
      );
    });

    return {
      click_editTargetButton,
      click_createTargetButton,
      click_finishedTargetButton,
      click_editTargetSubjectButton,
      isCreateTargetDrawerDisplayed,
      unSubjectiveTargetList,
      targetSubjectList,
      completedTargetList,
      isCompletedTargetShown,
      dragend_unSubjectiveTarget,
      dragend_subjectiveTarget,
      dragend_targetSubject,
      draggableOptions,
      click_unfinishedTargetButton,
      assets: {
        icon_create_target,
        icon_downward,
        icon_leftward,
        icon_red_finished_button
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.ghost {
  opacity 0.7
}
.container {
  height 73.66vh
  overscroll-behavior none
  overflow scroll
  width 100%
  background #F5F5F5
  display flex
  flex-direction column
  align-items center
  margin-top 6.75vh
  .add-button {
    cursor pointer
    position fixed
    top 12.77vh
    flex-shrink 0
    width 100%
    height 6.45vh
    background white
    margin-top 0.15vh
    div {
      height 100%
      width 100%
      display flex
      justify-content center
      align-items center
      img {
        width 2.1vh
        height 2.1vh
      }
    }
  }
  .target-subject-container {
    user-select none
    margin-bottom 0.15vh
    position relative
    height 6.52vh
    width 100%
    flex-shrink 0
    background-color #fcfbfc
    display flex
    align-items center
    justify-content center
    font-size 2.02vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align left
    color #9a9a9a
    img.icon-downward {
      position absolute
      width 2.35vw
      height 0.65vh
      opacity 0.5
      right 5.52vw
      top 0
      bottom 0
      margin-top auto
      margin-bottom auto
    }
    img.icon-leftward {
      position absolute
      width 1.16vw
      height 1.32vh
      right 6.12vw
      opacity 0.5
      top 0
      bottom 0
      margin-top auto
      margin-bottom auto
    }
  }
  .target-item-container {
    user-select none
    width 100%
    display flex
    flex-direction row
    margin-bottom 0.15vh
    align-items stretch
    flex-shrink 0
    .finished-button-container {
      width 19.6vw
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
      width 80.13vw
      background-color #ffffff
      .target-type {
        margin-top 2.4vh
        margin-left 8.53vw
        margin-right 8.53vw
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
      }
      .target-name {
        margin-top 0.75vh
        margin-left 8.53vw
        margin-right 8.53vw
        font-size 2.17vh
        font-weight 500
        font-stretch normal
        font-style normal
        letter-spacing 0.02vh
        text-align left
        color #222a36
      }
      .target-ability-container {
        margin-top 0.75vh
        margin-bottom 2.4vh
        margin-left 8.53vw
        margin-right 8.53vw
        .target-ability {
          height 2.7vh
          opacity 0.4
          font-size 1.87vh
          font-weight normal
          font-stretch normal
          font-style normal
          line-height 1.44
          letter-spacing 0.01vh
          text-align left
          color #222a36
        }
      }
    }
  }
}
</style>
