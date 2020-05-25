<template>
  <div class="scatter-diagram-item-container" :id="id"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated } from "@vue/composition-api";
import echarts from "echarts";
import ecStat from "echarts-stat";
import _ from "lodash";

export default defineComponent({
  props: {},
  setup(props, context) {
    const id = String(_.random(0, Number.MAX_VALUE, true));

    onMounted(() => {
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
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          }
        },
        xAxis: {
          name: "shit",
          nameLocation: "middle",
          nameGap: "32",
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          },
          splitNumber: 5
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
            symbolSize: 8,
            symbol: "circle",
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
  height 36.36vh
  background white
}
</style>
