<template>
  <div
    class="plan-charts-item-container"
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
import { StatPlanDate } from "@/lib/types/vue-viewmodels";
import AV from "leancloud-storage";
import _ from "lodash";
import Store from "@/store";

export default defineComponent({
  props: {
    statPlanDateList: Array,
    mode: String
  },
  setup(props, context) {
    const id = String(_.random(0, Number.MAX_VALUE, true));

    const statPlanList = computed(() => props.statPlanDateList as AV.Object[]);

    const isShow: Ref<boolean> = ref(true);

    const colormap: string[] = inject(Store.colormap, []);

    const legend = computed(() => {
      const data: any[] = [];
      statPlanList.value.forEach(statPlan => {
        if (statPlan.attributes.todayTotalTime) {
          data.push(statPlan.attributes.name);
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
      statPlanList.value.forEach(statPlan => {
        if (statPlan.attributes.todayTotalTime) {
          data.push({
            value: statPlan.attributes.todayTotalTime,
            name: statPlan.attributes.name
          });
        }
      });

      if (data.length === 0) {
        isShow.value = false;
      }

      return [
        {
          type: "pie",
          radius: "57%",
          center: ["50%", "40%"],
          selectMode: "single",
          data: data
        }
      ];
    });

    onUpdated(() => {
      const charts = document.getElementById(id) as HTMLDivElement;
      const myChart = charts ? echarts.init(charts) : null;
      // 指定图表的配置项和数据
      const option = {
        tooltip: {
          position: ["16%", "55%"]
        },
        legend: legend.value,
        series: series.value,
        color: colormap
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
.plan-charts-item-container {
  width 100%
  height 36.36vh
  background white
}
</style>
