<template>
  <div class="scatter-diagram-item-container">
    <h1>近期工作趋势</h1>
    <h2>逐渐变好</h2>
    <div class="change-date-container">
      <!-- <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17.009"
        height="17.009"
        viewBox="0 0 17.009 17.009"
      >
        <path
          id="路径_613"
          data-name="路径 613"
          d="M12.172,0a.59.59,0,0,1,.585.585V1.807h2.126a2.132,2.132,0,0,1,2.126,2.126V14.883a2.132,2.132,0,0,1-2.126,2.126H2.126A2.132,2.132,0,0,1,0,14.883V3.933A2.132,2.132,0,0,1,2.126,1.807H4.837V.585A.638.638,0,0,1,5.475,0a.59.59,0,0,1,.585.585V1.807h5.475V.585A.6.6,0,0,1,12.172,0Zm3.774,6.7H1.063v8.185a1.066,1.066,0,0,0,1.063,1.063H14.883a1.066,1.066,0,0,0,1.063-1.063ZM4.837,12.172a.585.585,0,0,1,0,1.169H3.667a.585.585,0,0,1,0-1.169Zm4.252,0a.585.585,0,0,1,0,1.169H7.867a.585.585,0,1,1,0-1.169Zm4.252,0a.585.585,0,0,1,0,1.169H12.119a.585.585,0,0,1,0-1.169Zm-8.5-3.083a.585.585,0,1,1,0,1.169H3.667a.585.585,0,1,1,0-1.169Zm4.252,0a.585.585,0,1,1,0,1.169H7.867a.585.585,0,1,1,0-1.169Zm4.252,0a.585.585,0,0,1,0,1.169H12.119a.585.585,0,1,1,0-1.169ZM4.837,2.87H2.126A1.066,1.066,0,0,0,1.063,3.933V5.475H15.946V3.933A1.066,1.066,0,0,0,14.883,2.87H12.757v.744a.6.6,0,0,1-.585.638.59.59,0,0,1-.585-.585V2.923H6.059v.744a.59.59,0,0,1-.585.585.638.638,0,0,1-.638-.585Z"
          fill="#99a8b8"
        />
      </svg> -->

      <div>（番茄/日期）</div>
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
  watchEffect
} from "@vue/composition-api";
import echarts from "echarts";
import ecStat from "echarts-stat";
import _ from "lodash";
import { StatTomatoDate } from "@/lib/types/vue-viewmodels";
import Store from "@/store";

export default defineComponent({
  props: {},
  setup(props, context) {
    const id = String(_.random(0, Number.MAX_VALUE, true));

    const colormap: string[] = inject(Store.colormap, []);

    const statTomatoDateList: Ref<StatTomatoDate[]> = inject(
      Store.statTomatoDateList,
      ref([])
    );

    const dataMap = computed(() => {
      return statTomatoDateList.value.map(statTomatoDate => {
        return [statTomatoDate.timeStamp, statTomatoDate.todayTomatoNumber];
      });
    });

    watchEffect(() => {
      console.log("1,", dataMap.value);
    });

    onMounted(() => {
      const charts = document.getElementById(id) as HTMLDivElement;
      const myChart = charts ? echarts.init(charts) : null;

      var data = dataMap.value;

      // See https://github.com/ecomfe/echarts-stat
      var myRegression = ecStat.regression(
        "exponential",
        data as number[][],
        0
      );

      myRegression.points.sort(function(a: any, b: any) {
        return a[0] - b[0];
      });

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        xAxis: {
          axisLine: { lineStyle: { color: "#99A8B8" } },
          axisLabel: { margin: 20, color: "#222A36", fontSize: 10 },
          // name: "x 轴：日期——y 轴：番茄数量",
          nameLocation: "middle",
          nameGap: "32",
          type: "time",
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          },
          splitNumber: 5
        },
        yAxis: {
          axisLine: { lineStyle: { color: "#99A8B8" } },
          axisLabel: { margin: 20, color: "#222A36", fontSize: 10 },
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          }
        },
        series: [
          {
            name: "scatter",
            type: "scatter",
            emphasis: {
              label: {
                show: true,
                position: "left",
                color: "blue",
                fontSize: 16
              }
            },
            symbolSize: 8,
            symbol: "circle",
            data: data,
            itemStyle: {
              color: (params: any) => {
                return colormap[params.dataIndex % colormap.length];
              }
            }
          },
          {
            name: "line",
            type: "line",
            showSymbol: false,
            smooth: true,
            data: myRegression.points,
            itemStyle: { color: "#F9385E" },
            markPoint: {
              itemStyle: {
                color: "transparent"
              },
              // label: {
              //   show: true,
              //   position: "left",
              //   formatter: myRegression.expression,
              //   color: "#333",
              //   fontSize: 14
              // },
              data: [
                {
                  coord: myRegression.points[myRegression.points.length - 1]
                }
              ]
            }
          }
        ]
      };

      if (myChart !== null) {
        myChart.setOption(option as any);
      }
      if (myChart !== null) {
        myChart.resize();
      }
    });

    onUpdated(() => {
      const charts = document.getElementById(id) as HTMLDivElement;
      const myChart = charts ? echarts.init(charts) : null;

      var data = [
        [1, 4862.4],
        [2, 5294.7],
        [3, 5934.5],
        [4, 7171.0],
        [5, 8964.4],
        [6, 10202.2],
        [7, 11962.5],
        [8, 14928.3],
        [9, 16909.2],
        [10, 18547.9],
        [11, 21617.8],
        [12, 26638.1],
        [13, 34634.4],
        [14, 46759.4],
        [15, 58478.1],
        [16, 67884.6],
        [17, 74462.6],
        [18, 79395.7]
      ];

      // See https://github.com/ecomfe/echarts-stat
      var myRegression = ecStat.regression("exponential", data, 0);

      myRegression.points.sort(function(a: any, b: any) {
        return a[0] - b[0];
      });

      const option = {
        title: {
          text: "1981 - 1998 gross domestic product GDP (trillion yuan)",
          subtext: "By ecStat.regression",
          sublink: "https://github.com/ecomfe/echarts-stat",
          left: "center"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        xAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          },
          splitNumber: 20
        },
        yAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          }
        },
        series: [
          {
            name: "scatter",
            type: "scatter",
            emphasis: {
              label: {
                show: true,
                position: "left",
                color: "blue",
                fontSize: 16
              }
            },
            symbolSize: 5,

            data: data
          },
          {
            name: "line",
            type: "line",
            showSymbol: false,
            smooth: true,
            data: myRegression.points,
            markPoint: {
              itemStyle: {
                color: "transparent"
              },
              label: {
                show: true,
                position: "left",
                formatter: myRegression.expression,
                color: "#333",
                fontSize: 14
              },
              data: [
                {
                  coord: myRegression.points[myRegression.points.length - 1]
                }
              ]
            }
          }
        ]
      };

      if (myChart !== null) {
        myChart.setOption(option as any);
      }
      if (myChart !== null) {
        myChart.resize();
      }
    });
    return { id };
  }
});
</script>

<style lang="stylus" scoped>
.scatter-diagram-item-container {
  width 100%
  height 42.19vh
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
    height 4.2vh
    font-size 2.92vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing normal
    text-align center
    color #222a36
  }
  .change-date-container {
    margin-top 0.52vh
    display flex
    flex-direction row
    align-items center
    svg {
      width 1.27vh
      height 1.27vh
      margin-right 1.84vw
    }
    div {
      height 2.02vh
      font-size 1.42vh
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
    width 92.93vw
    height 38vh
  }
}
</style>
