<template>
  <div>
    <header>
      <section class="title">
        <h1>时间壁垒</h1>
      </section>

      <section class="create-plan">
        <input
          type="text"
          placeholder="点击添加一个临时任务"
          @keyup.enter="keyUpEnter_planInputBox"
          v-model="input_plan"
        />
      </section>
    </header>
    <section></section>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
export default defineComponent({
  setup(props, context) {
    // 用户输入：创建的「计划」的名称
    const input_plan: Ref<string> = ref("");
    // 在计划输入框回车：创建计划
    const keyUpEnter_planInputBox = () => {
      console.log(input_plan.value);
    };
  }
});
</script>

<style></style>
