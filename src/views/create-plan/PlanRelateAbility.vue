<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 主要页面 -->
      <top-tips
        title="为「计划」关联「能力」"
        sub-title="完成计划会提升您的什么能力？"
      ></top-tips>

      <!-- 创建能力 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：您可以创建一个新能力</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="创建新能力"
            v-model="input_abilityName"
            @keyup.enter="keyUpEnter_abilityInputBox"
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
        <h2 class="h-2">例如：英语能力、运动能力、编程能力</h2>
      </section>

      <!-- 能力列表 -->
      <section class="section section-2">
        <h1 class="h-1" style="color:#222A36">
          Step 2：在「能力列表」中「选择」需要关联能力
        </h1>
        <h2 class="h-2" style="color:#222A36;font-weight:lighter;">
          选择完成后，点击右下角「对勾」保存
        </h2>

        <place-holder
          v-if="input_abilityListOfPlan.length === 0"
          tip="您还没有创建「能力」，创建后才可以关联哦"
        ></place-holder>

        <item
          v-for="(ability, index) in input_abilityListOfPlan"
          :key="ability.id"
          :data="ability"
          :background-color="ability.attributes.color"
          :button-color="
            colormapForTreeChart[index % colormapForTreeChart.length]
          "
          @click="click_abilityItem(ability)"
        ></item>
      </section>
    </main>

    <create-button></create-button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import PlaceHolder from "./components/PlaceHolder.vue";
import Item from "./components/Item.vue";
import AV from "leancloud-storage";
import { PlanPage } from "@/lib/vue-viewmodels";
import Store from "@/store";
import CreateButton from "./components/CreateButton.vue";

export default defineComponent({
  components: { TopBar, TopTips, PlaceHolder, Item, CreateButton },
  setup(props, context) {
    // 用户输入：创建的「能力」的名称
    const input_abilityName: Ref<string> = ref("");

    // 用户输入：需要关联到计划的能力列表
    const input_abilityListOfPlan: Ref<AV.Object[]> = ref([]);

    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

    // 能力等级列表
    const levelRuleList: Ref<AV.Object[]> = inject(
      Store.levelRuleList,
      ref([])
    );

    // 颜色表
    const colormap = inject(Store.colormap, []);

    const colormapForTreeChart = inject(Store.colormapForTreeChart, []);

    // 在能力输入框回车：创建能力
    const keyUpEnter_abilityInputBox = () => {
      PlanPage.createAbility(
        context.root,
        input_abilityName,
        input_abilityListOfPlan,
        null,
        abilityList,
        levelRuleList,
        colormap
      );
    };

    // 选择能力
    const click_abilityItem = (ability: AV.Object) => {
      console.log("shit");
      PlanPage.selectAbilityToCommit(ability);
    };

    onMounted(() => {
      PlanPage.initRelatedAbility(context.root, input_abilityListOfPlan, null);
    });

    return {
      input_abilityName,
      keyUpEnter_abilityInputBox,
      input_abilityListOfPlan,
      colormap,
      colormapForTreeChart,
      click_abilityItem
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
