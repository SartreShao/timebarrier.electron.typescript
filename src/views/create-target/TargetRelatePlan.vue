<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 主要页面 -->
      <top-tips
        title="为「目标」制定训练「计划」"
        :sub-title="
          isCreateTarget
            ? `目标：${input_creatingTarget.name}`
            : `目标：${input_editingTarget.name}`
        "
      ></top-tips>

      <!-- 创建目标 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：您可以创建一个新计划</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="创建新计划"
            v-model="input_planName"
            @keyup.enter="keyUpEnter_planInputBox"
          />

          <svg
            class="enter-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17.787"
            height="15.563"
            viewBox="0 0 17.787 15.563"
          >
            <path
              id="路径_778"
              data-name="路径 778"
              d="M72.452,124.893H63.558v4.447l-6.67-5.558,6.67-5.558v4.447h8.893v-8.893h2.223v11.117Z"
              transform="translate(-56.888 -113.777)"
            />
          </svg>
        </div>
        <h2 class="h-2">
          例如：每日阅读 1 小时、学习产品经理课程
        </h2>
      </section>

      <!-- 目标列表 -->
      <section class="section section-2">
        <h1 class="h-1" style="color:#222A36">
          Step 2：在「计划列表」中「选择」需要关联的计划
        </h1>
        <h2 class="h-2" style="color:#222A36;font-weight:lighter;">
          选择完成后，点击右下角「对勾」保存
        </h2>

        <place-holder
          v-if="input_planListOfTarget.length === 0"
          tip="您还没有创建「训练计划」，创建后才可以关联哦"
        ></place-holder>

        <item
          v-for="(plan, index) in input_planListOfTarget"
          :key="plan.id"
          :data="plan"
          :buttonColor="colormap[index % colormap.length]"
          @click="click_planItem(plan)"
        ></item>
      </section>
    </main>

    <create-button @click="click_saveRelatedPlan"></create-button>

    <input-plan-target
      :isShow="isInputPlanTargetShow"
      @commit="commitPlanTarget"
      @cancel-commit="cancelCommitPlanTarget"
      v-model="input_dailyPlanTarget"
    ></input-plan-target>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted,
  reactive
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import PlaceHolder from "./components/PlaceHolder.vue";
import Item from "./components/Item.vue";
import AV from "leancloud-storage";
import { PlanPage, TargetPage } from "@/lib/vue-viewmodels";
import Store from "@/store";
import CreateButton from "./components/CreateButton.vue";
import { InputPlanType, InputTargetType } from "@/lib/types/vue-viewmodels";
import { Router } from "@/lib/vue-utils";
import InputPlanTarget from "./components/InputPlanTarget.vue";

export default defineComponent({
  components: {
    TopBar,
    TopTips,
    PlaceHolder,
    Item,
    CreateButton,
    InputPlanTarget
  },
  props: {
    isCreateTarget: Boolean
  },
  setup(props, context) {
    // 用户输入：创建的「目标」的名称
    const input_planName: Ref<string> = ref("");

    // 用户输入：需要关联到计划的目标列表
    const input_planListOfTarget: Ref<AV.Object[]> = ref([]);

    // 颜色表
    const colormap = inject(Store.colormap, []);

    const colormapForTreeChart = inject(Store.colormapForTreeChart, []);

    const isInputPlanTargetShow = ref(false);

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

    // 用户输入：正在创建的目标
    const input_creatingTarget: InputTargetType = inject(
      Store.input_creatingTarget,
      reactive({
        id: undefined,
        subjectName: "",
        name: "",
        description: "",
        validityType: "",
        validity: "",
        planList: [],
        isActived: true,
        isFinished: false,
        mileStoneList: []
      })
    );

    // 用户输入：正在编辑的目标
    const input_editingTarget: InputTargetType = inject(
      Store.input_editingTarget,
      reactive({
        id: undefined,
        subjectName: "",
        name: "",
        description: "",
        validityType: "",
        validity: "",
        planList: [],
        isActived: true,
        isFinished: false,
        mileStoneList: []
      })
    );

    // 每日计划的目标番茄
    const input_dailyPlanTarget: Ref<string> = ref("");

    // 在目标输入框回车：创建目标
    const keyUpEnter_planInputBox = () => {
      TargetPage.openPlanTargetInputBox(
        input_planName,
        isInputPlanTargetShow,
        input_dailyPlanTarget
      );
    };

    // 选择目标
    const click_planItem = (plan: AV.Object) => {
      TargetPage.selectPlanToCommit(plan);
    };

    // 保存已关联的目标列表
    const click_saveRelatedPlan = () => {
      if (props.isCreateTarget) {
        input_creatingTarget.planList = [];
        input_planListOfTarget.value.forEach(plan => {
          if (plan.attributes.selected === true) {
            input_creatingTarget.planList.push({
              id: plan.id as string,
              name: plan.attributes.name
            });
          }
        });
        Router.back(context.root.$router);
      } else {
        input_editingTarget.planList = [];
        input_planListOfTarget.value.forEach(plan => {
          if (plan.attributes.selected === true) {
            input_editingTarget.planList.push({
              id: plan.id as string,
              name: plan.attributes.name
            });
          }
        });
        Router.back(context.root.$router);
      }
    };

    const cancelCommitPlanTarget = () => {
      if (props.isCreateTarget) {
        TargetPage.createTemporaryPlan(
          context.root,
          input_planName,
          null,
          input_creatingTarget,
          input_planListOfTarget,
          temporaryPlanList,
          isInputPlanTargetShow
        );
      } else {
        TargetPage.createTemporaryPlan(
          context.root,
          input_planName,
          input_editingTarget,
          null,
          input_planListOfTarget,
          temporaryPlanList,
          isInputPlanTargetShow
        );
      }
    };

    const commitPlanTarget = () => {
      if (props.isCreateTarget) {
        TargetPage.createDailyPlan(
          context.root,
          input_planName,
          input_dailyPlanTarget,
          null,
          input_creatingTarget,
          input_planListOfTarget,
          dailyPlanList,
          isInputPlanTargetShow
        );
      } else {
        TargetPage.createDailyPlan(
          context.root,
          input_planName,
          input_dailyPlanTarget,
          input_editingTarget,
          null,
          input_planListOfTarget,
          dailyPlanList,
          isInputPlanTargetShow
        );
      }
    };

    onMounted(() => {
      console.log("props.isCreateTarget", props.isCreateTarget);
      if (props.isCreateTarget) {
        TargetPage.initRelatedPlan(
          context.root,
          input_planListOfTarget,
          null,
          input_creatingTarget
        );
      } else {
        TargetPage.initRelatedPlan(
          context.root,
          input_planListOfTarget,
          input_editingTarget,
          null
        );
      }
    });

    return {
      input_planName,
      keyUpEnter_planInputBox,
      input_planListOfTarget,
      input_creatingTarget,
      input_editingTarget,
      isInputPlanTargetShow,
      colormap,
      colormapForTreeChart,
      click_planItem,
      click_saveRelatedPlan,
      cancelCommitPlanTarget,
      commitPlanTarget,
      input_dailyPlanTarget
    };
  }
});
</script>

<style lang="stylus" scoped>
.section {
  width 100%
  display flex
  flex-direction column
  align-items center
  justify-content center
}

.section-1 {
  background #222A36
}

.section-2 {
  background white
}

.h-1 {
  line-height 2.92vh
  font-size 2.02vh
  color white
  font-weight bold
  margin-top 4.57vh
}

.h-2 {
  line-height 3vh
  font-size 1.8vh
  color white
  font-weight normal
  opacity 0.7
  margin-top 1.2vh
  margin-bottom 4.57vh
  text-align center
}

.input-container {
  position relative
  width 88.8vw
  height 6.22vh
  background white
  border-radius 0.67vh
  box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  margin-top 1.87vh
  display flex
  align-items center
}

.input {
  width 100%
  height 100%
  outline none
  border none
  border-radius 0.67vh
  color #222A36
  font-size 1.87vh
  padding-left 5.47vw
  padding-right 9vw
  box-sizing border-box

  &::-webkit-input-placeholder {
    opcity 0.8
    color #222A36
    font-size 1.87vh
    color #222A36
  }
}

.enter-icon {
  position absolute
  width 2.37vw
  height 1.17vh
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  right 5.57vw
}
</style>
