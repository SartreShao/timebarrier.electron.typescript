<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要界面 -->
    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 顶部提示语 -->
      <top-tips
        title="创建一个「每日计划」"
        sub-title="我们相信时间积累的力量，每日付出终会得偿所愿"
      ></top-tips>

      <!-- 计划名称 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：计划名称——您希望制定什么训练计划？</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入计划名称（必填）"
            v-model="input_creatingPlan.name"
          />
        </div>
        <h2 class="h-2">
          例如：每日阅读、搞笑小说写作、编写「时间壁垒」App
        </h2>
      </section>

      <!-- 用时目标 -->
      <section class="section section-4">
        <h1 class="h-1">Step 2：用时目标——您计划每天训练它多久？</h1>

        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入一个番茄数（必填）"
            v-model="input_creatingPlan.target"
          />
        </div>
        <h2 class="h-2">说明：1 个番茄 = 25 分钟，请在上面输入纯数字</h2>
      </section>

      <!-- 关联能力 -->
      <section class="section section-2">
        <h1 class="h-1">Step 3：关联能力——完成计划会提升您的什么能力？</h1>
        <div
          class="button"
          @click="click_relateAbility"
          v-if="input_creatingPlan.abilityList.length === 0"
        >
          点击关联能力（选填）
        </div>

        <div class="button" @click="click_relateAbility" v-else>
          <span>{{
            "相关能力：" +
              input_creatingPlan.abilityList
                .map(ability => ability.name)
                .join("、")
          }}</span>
        </div>
        <h2 class="h-2">
          例如：每日阅读——提升「思维能力」<br />
          搞笑小说写作——提升「写作能力」or「文学能力」<br />
          编写「时间壁垒」App——提升「前端编程能力」、「产品能力」
        </h2>
      </section>

      <!-- 关联目标 -->
      <section class="section section-3">
        <h1 class="h-1">Step 4：关联目标——完成计划会有助于实现什么目标？</h1>
        <div
          class="button"
          @click="click_relateTarget"
          v-if="input_creatingPlan.targetList.length === 0"
        >
          点击关联目标（选填）
        </div>

        <div class="button" @click="click_relateTarget" v-else>
          <span>{{
            "相关目标：" +
              input_creatingPlan.targetList
                .map(target => target.name)
                .join("、")
          }}</span>
        </div>
        <h2 class="h-2">
          例如：每日阅读——有助于「阅读 100 本书」目标<br />
          搞笑小说写作——有助于「成为一名搞笑小说家」目标<br />
          编写「时间壁垒」App——有助于「创业成功」目标
        </h2>
      </section>
    </main>

    <create-button @click="click_createPlanButton"></create-button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  reactive,
  inject,
  computed
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import { Router, UI } from "@/lib/vue-utils";
import CreateButton from "./components/CreateButton.vue";
import { InputPlanType } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { PlanPage } from "@/lib/vue-viewmodels";
import AV from "leancloud-storage";

export default defineComponent({
  components: { TopBar, TopTips, CreateButton },
  setup(props, context) {
    // 正在创建的计划
    const input_creatingPlan: InputPlanType = inject(
      Store.input_creatingPlan,
      reactive({
        id: undefined,
        name: "",
        abilityList: [],
        targetList: [],
        type: "daily",
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

    // 点击关联能力
    const click_relateAbility = () => {
      Router.push(context.root.$router, "/plan-relate-ability");
    };

    // 点击关联目标
    const click_relateTarget = () => {
      Router.push(context.root.$router, "plan-relate-target");
    };

    // 点击事件：创建计划
    const click_createPlanButton = () => {
      PlanPage.createPlan(
        context.root,
        input_creatingPlan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        abilityList,
        levelRuleList,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    };

    const planDeadLineFormat = computed(() => {
      return UI.dateToYearMonthDay(new Date(input_creatingPlan.deadline));
    });

    return {
      input_creatingPlan,
      click_relateAbility,
      click_relateTarget,
      click_createPlanButton,
      planDeadLineFormat
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
  background #D94F70
}

.section-2 {
  background #22272C
}

.section-3 {
  background #5F4B8B
}

.section-4 {
  background #1B3C79
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
  width 88.8vw
  height 6.22vh
  background white
  border-radius 0.67vh
  box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  margin-top 1.87vh
  display flex
  align-items center
}

.button {
  cursor pointer
  width 88.8vw
  height 6.22vh
  background white
  border-radius 0.67vh
  box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  margin-top 1.87vh
  display flex
  align-items center
  color #222A36
  font-size 1.87vh
  padding-left 5.47vw
  box-sizing border-box
  position relative

  span {
    width 100%
    white-space nowrap
    text-overflow ellipsis
    overflow hidden
  }
}

.date-picker {
  position absolute
  width 100%
  height 100%
  top 0
  bottom 0
  right 0
  left 0
  opacity 0
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
  box-sizing border-box

  &::-webkit-input-placeholder {
    color #222A36
    font-size 1.87vh
    color #222A36
    opacity 0.3
  }
}
</style>
