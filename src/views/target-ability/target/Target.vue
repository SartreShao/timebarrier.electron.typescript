<template>
  <div class="container">
    <!-- 添加「目标」按钮 -->
    <div class="add-button" @click="isCreateTargetDrawerDisplayed = true">
      <img :src="assets.icon_create_target" alt="icon_create_target" />
    </div>

    <!-- 无目录的目标 -->
    <draggable
      v-model="unSubjectiveTargetList"
      ghost-class="ghost"
      @end="onUnSubjectiveTargetListDragEnd"
    >
      <transition-group type="transition" name="flip-list">
        <div
          :id="target.id"
          class="target-item-container"
          v-for="target in unSubjectiveTargetList"
          :key="target.id"
          v-longclick="() => click_editTargetButton(target)"
          v-hello
        >
          <!-- 完成目标 -->
          <div class="finished-button-container">
            <img
              class="finished-button"
              :src="assets.icon_red_finished_button"
              alt="icon_red_finished_button"
            />
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
              }}
            </div>
            <div class="target-name">{{ target.attributes.name }}</div>
            <div class="target-description">
              {{ target.attributes.description }}
            </div>
          </div>
        </div>
      </transition-group>
    </draggable>

    <!-- 有目录的目标 -->
    <draggable
      v-model="targetSubjectList"
      ghost-class="ghost"
      @end="onTargetSubjectListDragEnd"
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
            v-longclick="() => click_editTargetSubjectButton(targetSubject)"
            v-hello
            @click="
              targetSubject.attributes.showSubjectList = !targetSubject
                .attributes.showSubjectList
            "
          >
            {{ targetSubject.attributes.name }}({{
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
              v-model="targetSubject.attributes.targetListOfTargetSubject"
              ghost-class="ghost"
              @end="onTargetListOfTargetSubjectDragOnEnd"
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
                  v-hello
                >
                  <!-- 完成目标 -->
                  <div class="finished-button-container">
                    <img
                      class="finished-button"
                      :src="assets.icon_red_finished_button"
                      alt="icon_red_finished_button"
                    />
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
                      }}
                    </div>
                    <div class="target-name">{{ target.attributes.name }}</div>
                    <div class="target-description">
                      {{ target.attributes.description }}
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
        v-hello
      >
        <!-- 完成目标 -->
        <div class="finished-button-container">
          <img
            class="finished-button"
            :src="assets.icon_red_finished_button"
            alt="icon_red_finished_button"
          />
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
            }}
          </div>
          <div class="target-name">{{ target.attributes.name }}</div>
          <div class="target-description">
            {{ target.attributes.description }}
          </div>
        </div>
      </div>
    </div>
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

    // 拖动结束：未分类的目标
    const onUnSubjectiveTargetListDragEnd = () => {};

    // 拖动结束：目标目录
    const onTargetSubjectListDragEnd = () => {};

    // 拖动结束：有目录的目标
    const onTargetListOfTargetSubjectDragOnEnd = () => {};

    // 点击事件：编辑目标
    const click_editTargetButton = (target: AV.Object) => {
      TargetPage.openTargetEditDrawer(
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        target
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
      click_editTargetSubjectButton,
      isCreateTargetDrawerDisplayed,
      unSubjectiveTargetList,
      targetSubjectList,
      completedTargetList,
      isCompletedTargetShown,
      onUnSubjectiveTargetListDragEnd,
      onTargetListOfTargetSubjectDragOnEnd,
      onTargetSubjectListDragEnd,
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
  box-shadow 10px 10px 5px -1px rgba(0, 0, 0, 0.14)
  opacity 0.7
}
.container {
  height 73.66vh
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
    display flex
    justify-content center
    align-items center
    img {
      width 2.1vh
      height 2.1vh
    }
  }
  .target-subject-container {
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
    height 16.94vh
    width 100%
    display flex
    flex-direction row
    margin-bottom 0.15vh
    flex-shrink 0
    .finished-button-container {
      width 19.6vw
      height 16.94vh
      background-color #fcfbfc
      display flex
      justify-content center
      align-items center
      .finished-button {
        width 2.1vh
        height 2.1vh
      }
    }
    .placeholder {
      width 0.15vh
    }
    .target-body-container {
      width 80.13vw
      height 16.94vh
      background-color #ffffff
      box-sizing border-box
      padding-left 8.53vw
      padding-right 8.53vw
      padding-top 2.32vh
      padding-bottom 2.4vh
      .target-type {
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
        margin-top 0.52vh
        height 3.15vh
        font-size 2.17vh
        font-weight 500
        font-stretch normal
        font-style normal
        line-height 1.45
        letter-spacing 0.02vh
        text-align left
        color #222a36
      }
      .target-description {
        margin-top 0.75vh
        height 5.4vh
        width 63.07vw
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
</style>
