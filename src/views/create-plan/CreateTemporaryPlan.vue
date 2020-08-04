<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 主要页面 -->
      <top-tips
        title="创建一个「临时计划」"
        sub-title="计划赶不上变化，临时计划帮我们应对变化"
      ></top-tips>

      <!-- 计划名称 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：计划名称——您计划做什么事？</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入计划名称（必填）"
            v-model="input_creatingPlan.name"
          />
        </div>
        <h2 class="h-2">例如：帮妈妈买菜、完成语文作业、参加同学聚会</h2>
      </section>

      <!-- 关联能力 -->
      <section class="section section-2">
        <h1 class="h-1">Step 2：关联能力——完成计划会提升您的什么能力？</h1>
        <div class="button" @click="click_relateAbility">
          点击关联能力（选填）
        </div>
        <h2 class="h-2">
          例如：帮妈妈买菜——提升「生活能力」<br />
          完成语文作业——提升「语文能力」or「文学能力」<br />
          参加同学聚会——提升「社交能力」
        </h2>
      </section>

      <!-- 关联目标 -->
      <section class="section section-3">
        <h1 class="h-1">Step 3：关联目标——完成计划会有助于实现什么目标？</h1>
        <div class="button">点击关联目标（选填）</div>
        <h2 class="h-2">
          例如：帮妈妈买菜——有助于「让妈妈感到幸福」目标<br />
          完成语文作业——有助于「成为一名优秀的作家」目标<br />
          参加同学聚会——有助于「成为中国卡戴珊」目标
        </h2>
      </section>

      <!-- 关联目标 -->
      <section class="section section-4">
        <h1 class="h-1">Step 4：计划截止日期——最晚什么时候完成计划？</h1>
        <div class="button">请选择一个日期（选填）</div>
        <h2 class="h-2">例如：2020 年 1 月 1 日</h2>
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
  inject
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import { Router } from "@/lib/vue-utils";
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
        type: "temporary",
        target: "",
        isActived: false,
        isFinished: false
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

    // 点击关联能力
    const click_relateAbility = () => {
      Router.push(context.root.$router, "/plan-relate-ability");
    };

    // 点击关联目标
    const click_realteTarget = () => {
      Router.push(context.root.$router, "plan-relate-target");
    };

    // 点击事件：创建计划
    const click_createPlanButton = () => {
      PlanPage.createPlan(
        context.root,
        input_creatingPlan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList
      );
    };

    return {
      input_creatingPlan,
      click_relateAbility,
      click_createPlanButton
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
  background #F9385E
}

.section-2 {
  background #22272C
}

.section-3 {
  background #552FB9
}

.section-4 {
  background #240083
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
  }
}
</style>
