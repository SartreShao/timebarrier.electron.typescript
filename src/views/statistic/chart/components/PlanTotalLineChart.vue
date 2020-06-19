<template>
  <div class="total-line-chart-container">
    <h1>计划每日趋势图</h1>
    <h2>期间共执行计划：{{ averageDailyStatData.length }} 项</h2>
    <div class="change-date-container" @click="click_changeChartMode">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17.955"
        height="17.955"
        viewBox="0 0 17.955 17.955"
      >
        <path
          id="路径_615"
          data-name="路径 615"
          d="M72.908,63.33a8.978,8.978,0,1,0,8.977,8.978A8.978,8.978,0,0,0,72.908,63.33Zm-5.536,7.53s0-.009,0-.013l-.006-.023s0-.008,0-.011l-.006-.025c0-.006,0-.009,0-.013s0-.017,0-.025,0-.009,0-.015,0-.015,0-.023a.069.069,0,0,1,0-.019.073.073,0,0,1,0-.021.234.234,0,0,1,0-.038c0-.013,0-.025,0-.038s0-.013,0-.019,0-.013,0-.019a.1.1,0,0,1,0-.023c0-.006,0-.009,0-.015a.107.107,0,0,1,0-.025c0-.006,0-.01,0-.013l.006-.025a.025.025,0,0,1,0-.011l.006-.023s0-.01,0-.013a.188.188,0,0,0,.008-.021l.006-.015c0-.006.006-.013.008-.019l.006-.017c0-.006.006-.011.008-.017a.081.081,0,0,1,.008-.019.051.051,0,0,0,.008-.013.089.089,0,0,1,.01-.021.038.038,0,0,0,.008-.011l.011-.021a.038.038,0,0,0,.008-.011c0-.008.009-.013.013-.021s.006-.008.008-.011l.015-.021.01-.011a.11.11,0,0,1,.013-.017c0-.006.01-.01.013-.015l.011-.013.027-.029L69.4,68.246a.783.783,0,0,1,1.107,1.107l-.5.5h7.631a.784.784,0,0,1,0,1.568H68.122l-.038,0-.017,0-.019,0a.089.089,0,0,1-.023,0l-.015,0a.107.107,0,0,1-.025,0l-.013,0-.025-.006-.013,0-.023-.006-.013,0-.021-.008-.015-.006-.019-.008-.017-.006-.017-.008a.079.079,0,0,1-.019-.008.048.048,0,0,0-.013-.008.089.089,0,0,1-.021-.01.038.038,0,0,0-.011-.008l-.021-.011a.038.038,0,0,0-.011-.008c-.008,0-.013-.009-.021-.013l-.011-.008-.021-.015-.011-.01a.11.11,0,0,1-.017-.013c-.006,0-.01-.01-.015-.013l-.013-.011-.029-.027-.027-.029-.011-.013c0-.006-.01-.01-.013-.015l-.013-.017-.01-.011a.14.14,0,0,1-.015-.021s-.006-.008-.008-.011-.009-.013-.013-.021a.038.038,0,0,1-.008-.011l-.011-.021A.038.038,0,0,1,67.431,71a.11.11,0,0,0-.01-.021.047.047,0,0,1-.008-.013c0-.006-.006-.013-.008-.019s-.006-.011-.008-.017l-.006-.017c0-.006-.006-.013-.008-.019s0-.01-.006-.015A.066.066,0,0,1,67.372,70.86Zm11.1,3.159c0,.008,0,.013,0,.019s0,.013,0,.019a.1.1,0,0,1,0,.023c0,.006,0,.009,0,.015a.107.107,0,0,1,0,.025c0,.006,0,.01,0,.013l-.006.025a.023.023,0,0,1,0,.011l-.006.023s0,.01,0,.013a.207.207,0,0,0-.008.021l-.006.015c0,.006-.006.013-.008.019l-.006.017c0,.006-.006.011-.008.017a.079.079,0,0,1-.008.019.048.048,0,0,0-.008.013.1.1,0,0,1-.009.021.037.037,0,0,0-.008.011l-.011.021a.042.042,0,0,0-.008.011c0,.008-.01.013-.013.021s-.006.008-.008.011l-.015.021-.009.011a.108.108,0,0,1-.013.017l-.015.017-.011.013-.027.029-1.834,1.834A.783.783,0,0,1,75.3,75.262l.5-.5H68.165a.784.784,0,0,1,0-1.568h9.526l.038,0,.017,0,.019,0a.091.091,0,0,1,.023,0l.015,0a.119.119,0,0,1,.025,0l.013,0,.025.006.013,0,.023.006.013,0,.021.008.015.006.019.008.017.006.017.008a.089.089,0,0,1,.019.008.048.048,0,0,0,.013.008.1.1,0,0,1,.021.01.038.038,0,0,0,.011.008l.021.011a.038.038,0,0,0,.011.008c.008,0,.013.009.021.013l.011.008.021.015.011.01a.108.108,0,0,1,.017.013c.006,0,.01.01.015.013l.013.011.029.027.027.029.011.013c0,.006.01.01.013.015l.013.017.009.011a.155.155,0,0,1,.015.021s.006.008.008.011.009.013.013.021a.038.038,0,0,1,.008.011l.011.021a.043.043,0,0,1,.008.011.1.1,0,0,0,.009.021.045.045,0,0,1,.008.013c0,.006.006.013.008.019s.006.011.008.017l.006.017c0,.006.006.013.008.019l.006.015a.07.07,0,0,1,.008.021s0,.01,0,.013l.006.023a.023.023,0,0,0,0,.011l.006.025c0,.006,0,.01,0,.013s0,.017,0,.025,0,.009,0,.015,0,.015,0,.023a.063.063,0,0,1,0,.019.076.076,0,0,1,0,.019.234.234,0,0,1,0,.038C78.474,73.994,78.472,74.006,78.472,74.019Z"
          transform="translate(-63.93 -63.33)"
          fill="#ff5050"
        />
      </svg>

      <div>
        {{ chartMode === `tomato` ? `切换为时间视图` : `切换为番茄视图` }}
      </div>
    </div>

    <div class="scatter-diagram" :id="id"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUpdated,
  Ref,
  inject,
  ref,
  computed,
  watchEffect,
  watch
} from "@vue/composition-api";
import echarts from "echarts";
import ecStat from "echarts-stat";
import _ from "lodash";
import Store from "@/store";
import AV from "leancloud-storage";
import { StatPage } from "@/lib/vue-viewmodels";
import { UI } from "@/lib/vue-utils";
import { ChartMode } from "@/lib/types/vue-viewmodels";
import StatPagePlanAbilityTarget from "@/lib/vue-viewmodels/StatPagePlanAbilityTarget";

export default defineComponent({
  setup(props, context) {
    // 随机的 id，用于给 ScatterDiagram 绑定图表
    const id = String(_.random(0, Number.MAX_VALUE, true));

    // 外部注入的番茄列表
    const tomatoList: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 真正使用的数据，由番茄列表映射而来
    const statDateList = computed(() => StatPage.mapStatDate(tomatoList.value));

    // 表示图表中显示的是时间，还是番茄
    const chartMode: Ref<ChartMode> = ref("tomato");

    // 颜色表
    const colormap: string[] = inject(Store.colormapForChart, []);

    // 折线图的数据
    const lineChartData = computed(() =>
      StatPagePlanAbilityTarget.mapTotalStatData(
        statDateList.value,
        "plan",
        chartMode.value
      )
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    // 线性图用于展示列表的数据
    const averageDailyStatData: Ref<{
      name: string;
      averageDailyTomatoNumber: number;
      averageDailyTime: number;
    }[]> = inject(Store.planAverageDailyStatData, ref([]));

    const statList = computed(() =>
      StatPagePlanAbilityTarget.fetchStatPlanList(statDateList.value)
    );

    const plan10000HoursPrediction: Ref<{
      name: string;
      prediction: string;
    }[]> = inject(Store.plan10000HoursPrediction, ref([]));

    watch(lineChartData, newValue => {
      plan10000HoursPrediction.value = StatPagePlanAbilityTarget.map10000HoursPrediction(
        newValue as Map<string, number[][]>,
        dateRange.value[0].getTime()
      );
    });

    watch(dateRange, newValue => {
      plan10000HoursPrediction.value = StatPagePlanAbilityTarget.map10000HoursPrediction(
        lineChartData.value as Map<string, number[][]>,
        newValue[0].getTime()
      );
    });

    watch(statList, newValue => {
      averageDailyStatData.value = StatPagePlanAbilityTarget.getAverageDailyStatData(
        newValue as Map<string, AV.Object>,
        dateRange.value,
        chartMode.value
      );
    });

    watch(dateRange, newValue => {
      averageDailyStatData.value = StatPagePlanAbilityTarget.getAverageDailyStatData(
        statList.value as Map<string, AV.Object>,
        newValue,
        chartMode.value
      );
    });

    watch(chartMode, newValue => {
      averageDailyStatData.value = StatPagePlanAbilityTarget.getAverageDailyStatData(
        statList.value as Map<string, AV.Object>,
        dateRange.value,
        newValue
      );
    });

    watchEffect(() => {
      StatPagePlanAbilityTarget.initLineChart(
        id,
        lineChartData.value as Map<string, number[][]>,
        chartMode.value,
        colormap,
        true,
        false
      );
    });

    onMounted(() => {
      StatPagePlanAbilityTarget.initLineChart(
        id,
        lineChartData.value as Map<string, number[][]>,
        chartMode.value,
        colormap,
        true,
        false
      );
    });

    onUpdated(() => {
      StatPagePlanAbilityTarget.initLineChart(
        id,
        lineChartData.value as Map<string, number[][]>,
        chartMode.value,
        colormap,
        true,
        false
      );
    });

    // 点击事件：点击更改图标模式
    const click_changeChartMode = () => {
      StatPage.changeChartMode(chartMode);
    };

    return {
      id,
      chartMode,
      click_changeChartMode,
      averageDailyStatData
    };
  }
});
</script>

<style lang="stylus" scoped>
.total-line-chart-container {
  width 100%
  height 46.19vh
  background white
  display flex
  flex-direction column
  align-items center
  h1 {
    margin-top 2.02vh
    height 1.95vh
    font-size 1.35vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing normal
    text-align center
    color #99a8b8
  }
  h2 {
    margin-top 0.52vh
    font-size 2.3vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing normal
    text-align center
    color #222a36
  }
  h3 {
    margin-top 0.52vh
    height 1.95vh
    font-size 1.35vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing normal
    text-align center
    color #99a8b8
  }
  .change-date-container {
    cursor pointer
    margin-top 1vh
    display flex
    flex-direction row
    align-items center
    height 2.02vh
    z-index 999
    svg {
      cursor pointer
      width 1.35vh
      height 1.35vh
      margin-right 1.73vw
    }
    div {
      cursor pointer
      font-size 1.6vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.42
      letter-spacing normal
      text-align center
      color #99a8b8
    }
  }
  .scatter-diagram {
    margin-top -6vh
    width 100vw
    height 41vh
  }
}
</style>
