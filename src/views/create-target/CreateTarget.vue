<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要页面 -->
    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 顶部提示语 -->
      <top-tips
        :title="`创建一个${input_creatingTarget.subjectName}`"
        sub-title="创建目标 + 制定计划 + 每日执行 = 得偿所愿"
      ></top-tips>

      <!-- 目标名称 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：目标名称——您希望达成什么目标？</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入目标名称（必填）"
            v-model="input_creatingTarget.name"
          />
        </div>
        <h2 class="h-2">例如：减肥 30 斤、百米 11 秒、体悟瑜伽与冥想</h2>
      </section>

      <!-- 关联计划 -->
      <section class="section section-2">
        <h1 class="h-1">Step 2：关联计划——为完成目标，您需要制定一个计划</h1>
        <div
          class="button"
          @click="click_relateAbility"
          v-if="input_creatingPlan.planList.length === 0"
        >
          点击关联能力（选填）
        </div>

        <div class="button" @click="click_relateAbility" v-else>
          <span>{{
            "相关计划：" +
              input_creatingPlan.planList.map(plan => plan.name).join("、")
          }}</span>
        </div>
        <h2 class="h-2">
          例如：减肥 30 斤——跑步 2 公里<br />
          提高语文成绩——训练语文习题 1 小时<br />
          阅读一百本书——阅读 1 小时
        </h2>
      </section>
    </main>

    <create-button></create-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, inject } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import CreateButton from "./components/CreateButton.vue";
import { InputTargetType } from "@/lib/types/vue-viewmodels";
import Store from "@/store";

export default defineComponent({
  components: { TopBar, TopTips },
  setup(props, context) {
    // 创建目标的数据容器
    const input_creatingTarget: InputTargetType = inject(
      Store.input_creatingTarget,
      reactive({
        id: undefined,
        subjectName: "",
        name: "",
        description: "",
        validityType: "",
        validity: null,
        planList: [],
        isActived: true,
        isFinished: false
      })
    );

    return {
      input_creatingTarget
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
  background #22272C
}

.section-3 {
  background #5F4B8B
}

.section-4 {
  background #5A5B9F
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
