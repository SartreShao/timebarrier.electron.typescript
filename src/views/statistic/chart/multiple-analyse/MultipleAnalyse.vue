<template>
  <div class="container">
    <!-- 散点图 -->
    <scatter-diagram></scatter-diagram>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 散点图的公式 -->
    <info-item
      :value="linearRegressionExpression"
      title="Linear Regression 每日工作量预测分析"
      width="100vw"
    ></info-item>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 每日平均番茄 -->
      <info-item
        :value="averageDailyTomato"
        title="每日平均番茄"
        width="49.87vw"
      ></info-item>

      <!-- 单日最多完成番茄 -->
      <info-item
        :value="maximumDailyTomato"
        title="单日最多完成番茄"
        width="49.87vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 每日平均用时 -->
      <info-item
        :value="averageDailyTime"
        title="每日平均用时"
        width="49.87vw"
      ></info-item>

      <!-- 单日最长工作时间 -->
      <info-item
        :value="maximumDailyTime"
        title="单日最长工作时间"
        width="49.87vw"
      ></info-item>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  inject,
  Ref,
  computed
} from "@vue/composition-api";
import ScatterDiagram from "../components/ScatterDiagram.vue";
import InfoItem from "../components/InfoItem.vue";
import Store from "@/store";
import AV from "leancloud-storage";
import { StatPage } from "@/lib/vue-viewmodels";

export default defineComponent({
  components: { ScatterDiagram, InfoItem },
  setup(props, context) {
    // 外部注入的番茄列表
    const tomatoList: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 真正使用的数据，由番茄列表映射而来
    const statDateList = computed(() => StatPage.mapStatDate(tomatoList.value));

    // 线性回归表达式，由 regressionData
    const linearRegressionExpression = inject(
      Store.linearRegressionExpression,
      ref("")
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    // 每日平均番茄
    const averageDailyTomato = computed(() =>
      StatPage.getAverageDailyTomato(
        tomatoList.value.length,
        dateRange.value[0],
        dateRange.value[1]
      )
    );

    // 单日最多完成番茄数
    const maximumDailyTomato = computed(() =>
      StatPage.getMaximumDailyTomato(statDateList.value)
    );

    // 每日平均用时
    const averageDailyTime = computed(() =>
      StatPage.getAverageDailyTime(
        statDateList.value,
        dateRange.value[0],
        dateRange.value[1]
      )
    );

    // 单日最长工作时间
    const maximumDailyTime = computed(() =>
      StatPage.getMaximumDailyTime(statDateList.value)
    );

    return {
      linearRegressionExpression,
      averageDailyTomato,
      maximumDailyTomato,
      averageDailyTime,
      maximumDailyTime
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  display flex
  flex-direction column
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
.horizontal-container {
  width 100%
  height 7.8vh
  display flex
  justify-content space-between
  background #F5F5F5
}
</style>
