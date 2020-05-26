<template>
  <div
    class="target-charts-item-container"
    :id="id"
    v-if="isShow && mode === `detail`"
  ></div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  computed,
  watchEffect,
  ref,
  Ref,
  onUpdated,
  inject
} from "@vue/composition-api";
import echarts from "echarts";
import AV from "leancloud-storage";
import _ from "lodash";
import Store from "@/store";
import { UI } from "@/lib/vue-utils";

export default defineComponent({
  props: {
    statTargetList: Array,
    mode: String
  },
  setup(props, context) {
    const id = String(_.random(0, Number.MAX_VALUE, true));

    const statTargetList = computed(() => props.statTargetList as AV.Object[]);

    const isShow: Ref<boolean> = ref(true);

    const colormapForChart: string[] = inject(Store.colormapForChart, []);

    const legend = computed(() => {
      const data: any[] = [];
      statTargetList.value.forEach(statTarget => {
        if (statTarget.attributes.todayTotalTime) {
          data.push(statTarget.attributes.name);
        }
      });

      return {
        bottom: 10,
        left: "center",
        data: data
      };
    });

    const series = computed(() => {
      const data: { value: number; name: string }[] = [];
      statTargetList.value.forEach(statTarget => {
        if (statTarget.attributes.todayTotalTime) {
          data.push({
            value: statTarget.attributes.todayTotalTime,
            name: statTarget.attributes.name
          });
        }
      });

      if (data.length === 0) {
        isShow.value = false;
      }

      return [
        {
          type: "pie",
          // radius: ["55%", "57%"],
          radius: "57%",
          center: ["50%", "40%"],
          selectMode: "single",
          avoidLabelOverlap: true,
          label: {
            normal: {
              show: true,
              position: "inner",
              // formatter: "{b}\n{c}, {d}%",
              formatter: (params: Object) => {
                return (params as any).percent + "%";
              },

              textStyle: {
                align: "center",
                baseline: "middle",
                // fontFamily: "微软雅黑",
                // fontSize: 15,
                fontWeight: "bolder"
              }
            },
            emphasis: {
              show: true,
              position: "inner",
              // formatter: "{b}\n{c}, {d}%",
              formatter: (params: Object) => {
                return (
                  (params as any).name +
                  "\n" +
                  UI.formatTimeHourMinute((params as any).value / 1000) +
                  ", " +
                  (params as any).percent +
                  "%"
                );
              },
              textStyle: {
                align: "center",
                baseline: "middle",
                // fontFamily: "微软雅黑",
                // fontSize: 15,
                fontWeight: "bolder"
              }
            }
          },
          data: data
        }
      ];
    });

    onUpdated(() => {
      const charts = document.getElementById(id) as HTMLDivElement;
      const myChart = charts ? echarts.init(charts) : null;
      // 指定图表的配置项和数据
      const option = {
        // tooltip: {
        //   position: ["16%", "55%"],
        //   formatter: (params: Object) => {
        //     return (params as any).name + ", " + (params as any).percent + "%";
        //   }
        // },
        legend: legend.value,
        series: series.value,
        color: colormapForChart
      };
      if (myChart !== null) {
        myChart.setOption(option as any);
      }
      if (myChart !== null) {
        myChart.resize();
      }
    });

    onMounted(() => {
      const charts = document.getElementById(id) as HTMLDivElement;
      const myChart = charts ? echarts.init(charts) : null;
      // 指定图表的配置项和数据
      const option = {
        tooltip: {
          position: ["16%", "55%"],
          formatter: (params: Object) => {
            return (params as any).name + ", " + (params as any).percent + "%";
          }
        },
        legend: legend.value,
        series: series.value,
        color: colormapForChart
      };
      if (myChart !== null) {
        myChart.setOption(option as any);
      }
      if (myChart !== null) {
        myChart.resize();
      }
    });

    return {
      id,
      series,
      isShow
    };
  }
});
</script>

<style lang="stylus" scoped>
.target-charts-item-container {
  width 100%
  height 36.36vh
  background white
}
</style>
