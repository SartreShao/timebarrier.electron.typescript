<template>
  <div class="target-container">
    <!-- 无目录的目标 -->
    <draggable
      :options="draggableOptions"
      v-model="unSubjectiveTargetList"
      ghost-class="ghost"
      @end="dragend_unSubjectiveTarget"
    >
      <transition-group type="transition" name="flip-list">
        <target-item
          v-for="target in unSubjectiveTargetList"
          :key="target.id"
          :id="target.id"
          @click="click_editTargetButton(target)"
          v-splash-when-click
          :target="target"
        ></target-item>
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
          <target-subject-item
            v-splash-when-click
            @click="() => click_editTargetSubjectButton(targetSubject)"
            :isShow.sync="targetSubject.attributes.showSubjectList"
            :name="targetSubject.attributes.name"
            :length="targetSubject.attributes.targetListOfTargetSubject.length"
          ></target-subject-item>

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
                <target-item
                  v-for="target in targetSubject.attributes
                    .targetListOfTargetSubject"
                  :key="target.id"
                  :id="target.id"
                  @click="click_editTargetButton(target)"
                  v-splash-when-click
                  :target="target"
                ></target-item>
              </transition-group>
            </draggable>
          </div>
        </div>
      </transition-group>
    </draggable>

    <!-- 已完成的目标目录 -->
    <target-subject-item
      v-if="completedTargetList.length !== 0"
      v-darked-when-click
      :isShow.sync="isCompletedTargetShown"
      name="已完成的目标"
    ></target-subject-item>

    <!-- 已完成的目标 -->
    <div style="width:100%" v-if="isCompletedTargetShown === true">
      <target-item
        v-for="target in completedTargetList"
        :key="target.id"
        :id="target.id"
        @click="click_editTargetButton(target)"
        v-splash-when-click
        :target="target"
      ></target-item>
    </div>

    <target-novice-tutorial
      v-if="
        unSubjectiveTargetList.length === 0 &&
          completedTargetList.length === 0 &&
          targetSubjectList.length === 0
      "
      style="margin-top:10.36vh"
    ></target-novice-tutorial>

    <!-- 添加「目标」按钮 -->
    <create-target-button class="create-target"></create-target-button>

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
import CreateTargetButton from "./components/CreateTargetButton.vue";
import TargetItem from "./components/TargetItem.vue";
import TargetSubjectItem from "./components/TargetSubjectItem.vue";
import TargetNoviceTutorial from "./components/TargetNoviceTutorial.vue";

export default defineComponent({
  components: {
    draggable,
    CreateTargetButton,
    TargetItem,
    TargetSubjectItem,
    TargetNoviceTutorial
  },
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
          planList: [],
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
          planList: [],
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

.target-container {
  height 100%
  overscroll-behavior none
  overflow scroll
  width 100%
  background #F4F4F8
  display flex
  flex-direction column
  align-items center
  margin-top 0.15vh
}

.create-target {
  position fixed
  bottom 8.17vh
  left 0
  right 0
}
</style>
