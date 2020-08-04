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
          />
        </div>
        <h2 class="h-2">例如：英语能力、运动能力、编程能力</h2>
      </section>

      <!-- 能力列表 -->
      <section class="section section-2">
        <h1 class="h-1" style="color:#222A36">
          Step 2：在「能力列表」中「选择」需要关联能力
        </h1>
        <h2 class="h-2" style="color:#222A36">选择完成后，返回上级即可保存</h2>

        <place-holder
          tip="您还没有创建「能力」，创建后才可以关联哦"
        ></place-holder>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import PlaceHolder from "./components/PlaceHolder.vue";

export default defineComponent({
  components: { TopBar, TopTips, PlaceHolder },
  setup(props, context) {
    const input_abilityName: Ref<string> = ref("");
    return {
      input_abilityName
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
    opcity 0.8
    color #222A36
    font-size 1.87vh
    color #222A36
  }
}
</style>
