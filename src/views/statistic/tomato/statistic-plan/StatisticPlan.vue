<template>
  <div class="statistic-plan-container">
    <plan-item
      name="计划：完成「时间壁垒」APP"
      :tomato-number="2"
      :target-tomato-number="4"
      totalTime="20"
      :currentTime="6000"
      :total-tomato-number="40"
      color="#3D4551"
    ></plan-item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import PlanItem from "../components/PlanItem.vue";
export default defineComponent({
  components: { PlanItem }
});
</script>

<style lang="stylus" scoped></style>
