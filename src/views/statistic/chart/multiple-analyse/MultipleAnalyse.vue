<template>
  <div class="container">
    <!-- 散点图 -->
    <average-scatter-diagram></average-scatter-diagram>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 散点图的公式 -->
    <info-item
      :value="averageLinearRegressionExpression"
      title="Linear Regression 每日工作量预测分析"
      width="100vw"
    ></info-item>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>
    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 今日番茄数 -->
      <info-item
        :value="todayTomatoNumber"
        title="今日番茄数"
        width="33.16vw"
      ></info-item>

      <!-- 每日平均番茄 -->
      <info-item
        :value="averageDailyTomato"
        title="每日平均番茄"
        width="33.16vw"
      ></info-item>

      <!-- 单日最多完成番茄 -->
      <info-item
        :value="maximumDailyTomato"
        title="单日最多完成番茄"
        width="33.16vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 今日工作时长 -->
      <info-item
        :value="todayWorkingTime"
        title="今日工作时长"
        width="33.16vw"
      ></info-item>

      <!-- 每日平均用时 -->
      <info-item
        :value="averageDailyTime"
        title="每日平均用时"
        width="33.16vw"
      ></info-item>

      <!-- 单日最长工作时间 -->
      <info-item
        :value="maximumDailyTime"
        title="单日最长工作时间"
        width="33.16vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <total-scatter-diagram></total-scatter-diagram>

    <!-- 占位 -->
    <!-- <div style="height:0.15vh"></div> -->

    <!-- 散点图的公式 -->
    <!-- <info-item
      :value="totalLinearRegressionExpression"
      title="Linear Regression 工作总量预测分析"
      width="100vw"
    ></info-item> -->

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 散点图的公式 -->
    <info-item
      :value="tenThousandHourDate"
      title="「10,000 小时定律」达成日期预测"
      width="100vw"
    ></info-item>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 每日平均用时 -->
      <info-item
        :value="totalTomatoNumber"
        title="总番茄数"
        width="49.87vw"
      ></info-item>

      <!-- 每日平均用时 -->
      <info-item
        :value="totalTime"
        title="总工作时长"
        width="49.87vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 柱状图：每日用时分析 -->
    <period-bar-chart></period-bar-chart>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 四类时型分析 -->
    <info-item
      :value="chronotype"
      title="Chronotype 四类时型分析"
      width="100vw"
    ></info-item>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 今日工作时长 -->
      <info-item
        :value="todayTomatoEfficiency"
        title="今日番茄效率"
        width="24.80vw"
      ></info-item>

      <!-- 每日平均用时 -->
      <info-item
        :value="averageTomatoEfficiency"
        title="平均番茄效率"
        width="24.80vw"
      ></info-item>
      <!-- 今日工作时长 -->
      <info-item
        :value="todayTimeEfficiency"
        title="今日用时效率"
        width="24.80vw"
      ></info-item>

      <!-- 每日平均用时 -->
      <info-item
        :value="averageTimeEfficiency"
        title="平均用时效率"
        width="24.80vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 每日平均用时 -->
      <info-item
        :value="averagePeriodTomato + ` / ` + averagePeriodTime"
        title="平均时段番茄 / 时间"
        width="49.87vw"
      ></info-item>

      <!-- 每日平均用时 -->
      <info-item
        :value="`标准差 / 均值：` + coefficientOfVariation"
        title="Standard Deviation Rate 均衡发力分析"
        width="49.87vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <week-bar-chart></week-bar-chart>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 最佳工作日 -->
    <info-item
      :value="bestDayInWeek"
      title="最佳工作日"
      width="100vw"
    ></info-item>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 本周番茄数 -->
      <info-item
        :value="thisWeekTomatoNumber"
        title="本周番茄数"
        width="33.16vw"
      ></info-item>

      <!-- 周平均番茄 -->
      <info-item
        :value="weekAverageTomato"
        title="周平均番茄"
        width="33.16vw"
      ></info-item>

      <!-- 单周最多完成番茄 -->
      <info-item
        :value="theMostWeekTomato"
        title="单周最多完成番茄"
        width="33.16vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 本周工作时长 -->
      <info-item
        :value="thisWeekWorkingTime"
        title="本周工作时长"
        width="33.16vw"
      ></info-item>

      <!-- 周平均用时 -->
      <info-item
        :value="weekAverageWorkingTime"
        title="周平均工作时长"
        width="33.16vw"
      ></info-item>

      <!-- 单周最长工作时间 -->
      <info-item
        :value="theMostWeekWorkingTime"
        title="单周最长工作时间"
        width="33.16vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <month-bar-chart></month-bar-chart>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 最佳工作月 -->
    <info-item
      :value="bestMonthInYear"
      title="最佳工作月份"
      width="100vw"
    ></info-item>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 本周番茄数 -->
      <info-item
        :value="thisMonthTomatoNumber"
        title="本月番茄数"
        width="33.16vw"
      ></info-item>

      <!-- 周平均番茄 -->
      <info-item
        :value="monthAverageTomato"
        title="月平均番茄"
        width="33.16vw"
      ></info-item>

      <!-- 单周最多完成番茄 -->
      <info-item
        :value="theMostMonthTomato"
        title="单月最多完成番茄"
        width="33.16vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 横向 -->
    <div class="horizontal-container">
      <!-- 本周工作时长 -->
      <info-item
        :value="thisMonthWorkingTime"
        title="本月工作时长"
        width="33.16vw"
      ></info-item>

      <!-- 周平均用时 -->
      <info-item
        :value="mongthAverageWorkingTime"
        title="月平均工作时长"
        width="33.16vw"
      ></info-item>

      <!-- 单周最长工作时间 -->
      <info-item
        :value="theMostMonthWorkingTime"
        title="单月最长工作时间"
        width="33.16vw"
      ></info-item>
    </div>

    <!-- 占位 -->
    <div style="height:15vh"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  inject,
  Ref,
  computed,
  watchEffect,
  onMounted
} from "@vue/composition-api";
import AverageScatterDiagram from "../components/AverageScatterDiagram.vue";
import TotalScatterDiagram from "../components/TotalScatterDiagram.vue";
import PeriodBarChart from "../components/PeriodBarChart.vue";
import WeekBarChart from "../components/WeekBarChart.vue";
import MonthBarChart from "../components/TomatoMonthBarChart.vue";
import InfoItem from "../components/InfoItem.vue";
import Store from "@/store";
import AV from "leancloud-storage";
import { StatPage } from "@/lib/vue-viewmodels";
import { TwoChronotype } from "../../../../lib/types/vue-viewmodels";
import { UI } from "@/lib/vue-utils";

export default defineComponent({
  components: {
    AverageScatterDiagram,
    InfoItem,
    PeriodBarChart,
    WeekBarChart,
    MonthBarChart,
    TotalScatterDiagram
  },
  setup(props, context) {
    // 外部注入的番茄列表
    const tomatoListWithDateRange: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 本年的番茄列表
    const thisYearTomatoList: Ref<AV.Object[]> = inject(
      Store.thisYearTomatoList,
      ref([])
    );

    // 真正使用的数据，由番茄列表映射而来（用户选择）
    const statDateList = computed(() =>
      StatPage.mapStatDate(tomatoListWithDateRange.value)
    );

    // 真正使用的数据，由番茄列表映射而来（本年）
    const thisYearStatDateList = computed(() =>
      StatPage.mapStatDate(thisYearTomatoList.value)
    );

    // 二类时型分析
    const twoChronotype = computed(() =>
      StatPage.getTwoChronotype(tomatoListWithDateRange.value)
    );

    // 四类时型分析
    const fourChronotype = computed(() =>
      StatPage.getFourChronotype(tomatoListWithDateRange.value)
    );

    // 时型分析
    const chronotype = computed(() =>
      StatPage.getChronotype(twoChronotype.value, fourChronotype.value)
    );

    // 线性回归表达式，由 regressionData
    const averageLinearRegressionExpression = inject(
      Store.averageLinearRegressionExpression,
      ref("")
    );

    // 线性回归表达式，由 regressionData
    const totalLinearRegressionExpression = inject(
      Store.totalLinearRegressionExpression,
      ref("")
    );

    // 线性回归表达式，由 regressionData
    const totalLinearRegressionExpressionTime = inject(
      Store.totalLinearRegressionExpressionTime,
      ref("")
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    // 每日平均番茄
    const averageDailyTomato = computed(() =>
      StatPage.getAverageDailyTomato(
        tomatoListWithDateRange.value.length,
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

    // 今日工作番茄数
    const todayTomatoNumber = computed(() =>
      StatPage.getTodayTomatoNumber(statDateList.value)
    );

    // 今日工作时长
    const todayWorkingTime = computed(() =>
      StatPage.getTodayWorkingTime(statDateList.value)
    );

    // 平均番茄效率
    const averageTomatoEfficiency = computed(() =>
      StatPage.getTomatoEfficiency(statDateList.value)
    );

    // 今日用时效率
    const todayTomatoEfficiency = computed(() => {
      if (statDateList.value.length !== 0) {
        return StatPage.getTomatoEfficiency([statDateList.value[0]]);
      } else {
        return StatPage.getTomatoEfficiency([]);
      }
    });

    // 平均用时效率
    const averageTimeEfficiency = computed(() =>
      StatPage.getTimeEfficiency(statDateList.value)
    );

    // 今日用时效率
    const todayTimeEfficiency = computed(() => {
      if (statDateList.value.length !== 0) {
        return StatPage.getTimeEfficiency([statDateList.value[0]]);
      } else {
        return StatPage.getTimeEfficiency([]);
      }
    });

    // 平均时间效率标准差
    const averageTimeStandardDeviation = computed(() =>
      UI.formatTimeHourMinute(
        StatPage.getTimeStandardDeviation(statDateList.value) / 1000
      )
    );

    // 今日时间效率标准差
    const todayTimeStandardDeviation = computed(() => {
      if (statDateList.value.length !== 0) {
        return UI.formatTimeHourMinute(
          StatPage.getTimeStandardDeviation([statDateList.value[0]]) / 1000
        );
      } else {
        return UI.formatTimeHourMinute(
          StatPage.getTimeStandardDeviation([]) / 1000
        );
      }
    });

    // 平均番茄效率标准差
    const averageTomatoStandardDeviation = computed(() =>
      StatPage.getTomatoStandardDeviation(statDateList.value).toFixed(2)
    );

    // 今日番茄效率标准差
    const todayTomatoStandardDeviation = computed(() => {
      if (statDateList.value.length !== 0) {
        return StatPage.getTomatoStandardDeviation([
          statDateList.value[0]
        ]).toFixed(2);
      } else {
        return StatPage.getTomatoStandardDeviation([]).toFixed(2);
      }
    });

    // 平均分时段番茄
    const averagePeriodTomato = computed(
      () => StatPage.getPeriodTomato(statDateList.value).toFixed(2) + " 番茄"
    );

    // 今日分时段番茄
    const todayPeriodTomato = computed(() => {
      if (statDateList.value.length !== 0) {
        return StatPage.getPeriodTomato([statDateList.value[0]]).toFixed(2);
      } else {
        return StatPage.getPeriodTomato([]).toFixed(2);
      }
    });

    // 平均分时段用时
    const averagePeriodTime = computed(() =>
      UI.formatTimeHourMinute(StatPage.getPeriodTime(statDateList.value) / 1000)
    );

    // 今日分时段用时
    const todayPeriodTime = computed(() => {
      if (statDateList.value.length !== 0) {
        return UI.formatTimeHourMinute(
          StatPage.getPeriodTime([statDateList.value[0]]) / 1000
        );
      } else {
        return UI.formatTimeHourMinute(StatPage.getPeriodTomato([]));
      }
    });

    // 标准差率
    const coefficientOfVariation = computed(
      () =>
        (
          (StatPage.getTimeStandardDeviation(statDateList.value) /
            StatPage.getPeriodTime(statDateList.value)) *
          100
        ).toFixed(2) + "%"
    );

    // 整体时间
    const totalTime = inject(Store.totalTime, ref("0 小时"));

    // 整体番茄
    const totalTomatoNumber = inject(Store.totalTomatoNumber, ref("0 番茄"));

    // 一万小时定律
    const tenThousandHourDate = computed(() =>
      StatPage.get10000HoursDate(
        dateRange.value[0].getTime(),
        StatPage.getLinearRegressionSlop(
          totalLinearRegressionExpressionTime.value
        ),
        StatPage.getLinearRegressionIntercept(
          totalLinearRegressionExpressionTime.value
        )
      )
    );

    // 本周番茄数
    const thisWeekTomatoNumber = computed(() =>
      StatPage.getThisWeekTomatoNumber(statDateList.value)
    );

    // 周平均番茄
    const weekAverageTomato = computed(() =>
      StatPage.getWeekAverageTomato(statDateList.value)
    );

    // 单周最多完成番茄
    const theMostWeekTomato = computed(() =>
      StatPage.getTheMostWeekTomato(statDateList.value)
    );

    // 本周工作时长
    const thisWeekWorkingTime = computed(() =>
      StatPage.getThisWeekWorkingTime(statDateList.value)
    );

    // 周平均用时
    const weekAverageWorkingTime = computed(() =>
      StatPage.getWeekAverageWorkingTime(statDateList.value)
    );

    // 单周最长工作时间
    const theMostWeekWorkingTime = computed(() =>
      StatPage.getTheMostWeekWorkingTime(statDateList.value)
    );

    // 最佳工作日
    const bestDayInWeek: Ref<string> = inject(Store.bestDayInWeek, ref(""));

    // 最佳月份
    const bestMonthInYear: Ref<string> = inject(Store.bestMonthInYear, ref(""));

    // 本月番茄数
    const thisMonthTomatoNumber = computed(() =>
      StatPage.getThisMonthTomatoNumber(thisYearStatDateList.value)
    );

    // 本月的工作时长
    const thisMonthWorkingTime = computed(() =>
      StatPage.getThisMonthWorkingTime(thisYearStatDateList.value)
    );

    // 最多的月番茄数
    const theMostMonthTomato = computed(() =>
      StatPage.getTheMostMonthTomato(thisYearStatDateList.value)
    );

    // 最多的月工作时长
    const theMostMonthWorkingTime = computed(() =>
      StatPage.getTheMostMonthWorkingTime(thisYearStatDateList.value)
    );

    // 月平均番茄
    const monthAverageTomato = computed(() =>
      StatPage.getMonthAverageTomato(thisYearStatDateList.value)
    );

    // 月平均工作时长
    const mongthAverageWorkingTime = computed(() =>
      StatPage.getMonthAverageWorkingTime(thisYearStatDateList.value)
    );

    return {
      averageLinearRegressionExpression,
      totalLinearRegressionExpression,
      averageDailyTomato,
      maximumDailyTomato,
      averageDailyTime,
      maximumDailyTime,
      todayTomatoNumber,
      todayWorkingTime,
      chronotype,
      averageTimeEfficiency,
      todayTimeEfficiency,
      todayTomatoEfficiency,
      averageTomatoEfficiency,
      averageTimeStandardDeviation,
      todayTimeStandardDeviation,
      averageTomatoStandardDeviation,
      todayTomatoStandardDeviation,
      averagePeriodTomato,
      todayPeriodTomato,
      averagePeriodTime,
      todayPeriodTime,
      coefficientOfVariation,
      totalTomatoNumber,
      totalTime,
      tenThousandHourDate,
      thisWeekTomatoNumber,
      weekAverageTomato,
      theMostWeekTomato,
      thisWeekWorkingTime,
      weekAverageWorkingTime,
      theMostWeekWorkingTime,
      bestDayInWeek,
      bestMonthInYear,
      thisMonthTomatoNumber,
      thisMonthWorkingTime,
      theMostMonthTomato,
      theMostMonthWorkingTime,
      monthAverageTomato,
      mongthAverageWorkingTime
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
