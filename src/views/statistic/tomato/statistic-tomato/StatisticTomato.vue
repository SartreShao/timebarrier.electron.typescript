<template>
  <div>
    <date-item
      date="2020 年 2 月 22 日"
      :todayTomatoNumber="11"
      :targetTomatoNumber="24"
      totalTime="5 小时 40 分钟"
    ></date-item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import DateItem from "./components/DateItem.vue";
export default defineComponent({
  components: { DateItem }
});
</script>

<style lang="stylus" scoped></style>
