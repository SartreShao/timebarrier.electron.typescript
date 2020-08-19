<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 主要页面 -->
      <top-tips
        title="为「计划」关联「目标」"
        sub-title="完成计划会有助与您实现什么目标？"
      ></top-tips>

      <!-- 创建目标 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：您可以创建一个新目标</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="创建新目标"
            v-model="input_targetName"
            @keyup.enter="keyUpEnter_targetInputBox"
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
          例如：拥有强健的身体、阅读 100 本书、成为优秀的前端工程师
        </h2>
      </section>

      <!-- 目标列表 -->
      <section class="section section-2">
        <h1 class="h-1" style="color:#222A36">
          Step 2：在「目标列表」中「选择」需要关联的目标
        </h1>
        <h2 class="h-2" style="color:#222A36;font-weight:lighter;">
          选择完成后，点击右下角「对勾」保存
        </h2>

        <place-holder
          v-if="input_targetListOfPlan.length === 0"
          tip="您还没有创建「目标」，创建后才可以关联哦"
        ></place-holder>

        <item
          v-for="(target, index) in input_targetListOfPlan"
          :key="target.id"
          :data="target"
          :background-color="target.attributes.color"
          :button-color="
            colormapForTreeChart[index % colormapForTreeChart.length]
          "
          @click="click_targetItem(target)"
        ></item>
      </section>
    </main>

    <create-button @click="click_saveRelatedTarget"></create-button>
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
import { PlanPage } from "@/lib/vue-viewmodels";
import Store from "@/store";
import CreateButton from "./components/CreateButton.vue";
import { InputPlanType } from "@/lib/types/vue-viewmodels";
import { Router } from "@/lib/vue-utils";

export default defineComponent({
  components: { TopBar, TopTips, PlaceHolder, Item, CreateButton },
  props: {
    isCreatePlan: Boolean
  },
  setup(props, context) {
    // 用户输入：创建的「目标」的名称
    const input_targetName: Ref<string> = ref("");

    // 用户输入：需要关联到计划的目标列表
    const input_targetListOfPlan: Ref<AV.Object[]> = ref([]);

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

    // 颜色表
    const colormap = inject(Store.colormap, []);

    const colormapForTreeChart = inject(Store.colormapForTreeChart, []);

    // 正在创建的计划
    const input_creatingPlan: InputPlanType = inject(
      Store.input_creatingPlan,
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

    // 在目标输入框回车：创建目标
    const keyUpEnter_targetInputBox = () => {
      if (props.isCreatePlan === true) {
        PlanPage.createTarget(
          context.root,
          input_targetName,
          input_targetListOfPlan,
          null,
          input_creatingPlan,
          unSubjectiveTargetList,
          completedTargetList,
          targetSubjectList,
          colormap
        );
      } else {
        PlanPage.createTarget(
          context.root,
          input_targetName,
          input_targetListOfPlan,
          input_editingPlan,
          null,
          unSubjectiveTargetList,
          completedTargetList,
          targetSubjectList,
          colormap
        );
      }
    };

    // 选择目标
    const click_targetItem = (target: AV.Object) => {
      PlanPage.selectTargetToCommit(target);
    };

    // 保存已关联的目标列表
    const click_saveRelatedTarget = () => {
      if (props.isCreatePlan) {
        input_creatingPlan.targetList = [];
        input_targetListOfPlan.value.forEach(target => {
          if (target.attributes.selected === true) {
            input_creatingPlan.targetList.push({
              id: target.id as string,
              name: target.attributes.name
            });
          }
        });
        Router.back(context.root.$router);
      } else {
        input_editingPlan.targetList = [];
        input_targetListOfPlan.value.forEach(target => {
          if (target.attributes.selected === true) {
            input_editingPlan.targetList.push({
              id: target.id as string,
              name: target.attributes.name
            });
          }
        });
        Router.back(context.root.$router);
      }
    };

    onMounted(() => {
      if (props.isCreatePlan) {
        PlanPage.initRelatedTarget(
          context.root,
          input_targetListOfPlan,
          null,
          input_creatingPlan
        );
      } else {
        PlanPage.initRelatedTarget(
          context.root,
          input_targetListOfPlan,
          input_editingPlan,
          null
        );
      }
    });

    return {
      input_targetName,
      keyUpEnter_targetInputBox,
      input_targetListOfPlan,
      colormap,
      colormapForTreeChart,
      click_targetItem,
      click_saveRelatedTarget
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
  background #5F4B8B
}

.section-2 {
  background white
  margin-bottom 13vh
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
