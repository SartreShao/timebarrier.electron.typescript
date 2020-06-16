import { ElementVue, StatDate, ChartMode } from "../types/vue-viewmodels";
import AV from "leancloud-storage";
import ecStat from "echarts-stat";
import echarts from "echarts";
import { UI } from "../vue-utils";
import { Ref } from "@vue/composition-api";
import _ from "lodash";

export default {
  /**
   * 初始化「矩形树图」
   */
  initRectangularTree: async (
    id: string,
    data: readonly { name: string; value: number }[],
    colormap: string[],
    planTreeDataIndex: Ref<number>
  ) => {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    const option = {
      color: colormap,
      series: [
        {
          top: "5%",
          left: "5%",
          right: "5%",
          bottom: "12%",
          type: "treemap",
          data: data,
          roam: false
        }
      ]
    };

    if (myChart !== null) {
      myChart.setOption(option as any);
    }
    if (myChart !== null) {
      myChart.resize();
    }
    if (myChart !== null) {
      myChart.off("click");
      myChart.on("click", function(params: any) {
        planTreeDataIndex.value = params.dataIndex - 1;
      });
    }
  },
  /**
   * 获取矩形树图的数据
   */
  mapRectangularTreeData: (
    map: Map<string, AV.Object>,
    chartMode: ChartMode
  ) => {
    const data: { name: string; value: number }[] = [];
    map.forEach(value => {
      data.push({
        name: value.attributes.name,
        value:
          chartMode === "tomato"
            ? value.attributes.todayTomatoNumber
            : UI.timeStampToHour(value.attributes.todayTotalTime)
      });
    });
    return data.sort((a, b) => b.value - a.value);
  },
  /**
   * 获取折线图的 Plan 的数据
   */
  mapLineChartData: (
    statDateList: readonly StatDate[],
    type: "plan" | "target" | "ability",
    chartMode: ChartMode
  ): Map<string, number[][]> => {
    const map: Map<string, number[][]> = new Map();

    statDateList.forEach(statDate => {
      let statList: AV.Object[] = [];
      if (type === "plan") {
        statList = statDate.statPlanList as AV.Object[];
      } else if (type === "target") {
        statList = statDate.statTargetList as AV.Object[];
      } else if (type === "ability") {
        statList = statDate.statAbilityList as AV.Object[];
      }
      statList.forEach(object => {
        map.set(object.attributes.name as string, []);
      });
    });

    statDateList.forEach(statDate => {
      let statList: AV.Object[] = [];
      if (type === "plan") {
        statList = statDate.statPlanList as AV.Object[];
      } else if (type === "target") {
        statList = statDate.statTargetList as AV.Object[];
      } else if (type === "ability") {
        statList = statDate.statAbilityList as AV.Object[];
      }
      map.forEach((objectList, name) => {
        objectList.push([UI.getTodayStartTimestamp(statDate.timeStamp), 0]);
        statList.forEach(statObject => {
          if (statObject.attributes.name === name) {
            objectList[objectList.length - 1] = [
              UI.getTodayStartTimestamp(statDate.timeStamp),
              chartMode === "tomato"
                ? statObject.attributes.todayTomatoNumber
                : UI.timeStampToHour(statObject.attributes.todayTotalTime)
            ];
          }
        });
      });
    });

    return map;
  },
  initLineChart: (
    id: string,
    lineChartData: Map<string, number[][]>,
    chartMode: ChartMode,
    colormap: string[]
  ) => {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    const series: {
      name: string;
      type: string;
      smooth: boolean;
      data: number[][];
      symbolSize: number;
      stack?: string;
      areaStyle?: {};
    }[] = [];

    const legend: string[] = [];

    lineChartData.forEach((data, name) => {
      series.push({
        name: name,
        type: "line",
        smooth: false,
        areaStyle: {},
        data: data,
        symbolSize: 1
      });

      legend.push(name);
    });

    // // See https://github.com/ecomfe/echarts-stat
    // var linearRegression = ecStat.regression("linear", data, 0);

    // linearRegression.points.sort(function(a: any, b: any) {
    //   return a[0] - b[0];
    // });

    const option = {
      color: colormap,
      grid: {
        left: "3.2%",
        right: "12%",
        bottom: "13%",
        containLabel: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross"
        }
      },
      legend: {
        data: legend,
        type: "scroll",
        bottom: "0%",
        left: "2.5%",
        right: "2.5%",
        textStyle: {
          fontSize: 11
        }
      },
      xAxis: {
        name: "日期 x",
        nameLocation: "end",
        nameGap: 6,
        nameTextStyle: {
          color: "#222A36",
          fontSize: 10
        },
        axisLine: { lineStyle: { color: "#99A8B8" } },
        axisLabel: { margin: 20, color: "#222A36", fontSize: 10 },
        type: "time",
        splitLine: {
          lineStyle: {
            type: "dashed"
          }
        },
        splitNumber: 5
      },
      yAxis: {
        name: chartMode === "tomato" ? "番茄数 y" : "小时 y",
        nameLocation: "end",
        nameTextStyle: {
          color: "#222A36",
          fontSize: 10
        },
        axisLine: { lineStyle: { color: "#99A8B8" } },
        axisLabel: {
          margin: 20,
          color: "#222A36",
          fontSize: 10
        },
        type: "value",
        splitLine: {
          lineStyle: {
            type: "dashed"
          }
        }
      },
      series: series
    };

    if (myChart !== null) {
      myChart.setOption(option as any, true);
    }
    if (myChart !== null) {
      myChart.resize();
    }
  },
  /**
   * 获取矩形树图的数据，并且按照 chartMode 进行降序排列；
   * 这将用于展示数据列表
   */
  getTotalStatData: (
    map: Map<string, AV.Object>,
    chartMode: ChartMode
  ): {
    name: string;
    totalTomatoNumber: number;
    totalTime: number;
  }[] => {
    const data: {
      name: string;
      totalTomatoNumber: number;
      totalTime: number;
    }[] = [];

    map.forEach(value => {
      data.push({
        name: value.attributes.name,
        totalTomatoNumber: value.attributes.todayTomatoNumber,
        totalTime: UI.timeStampToHour(value.attributes.todayTotalTime)
      });
    });

    return chartMode === "tomato"
      ? data.sort((a, b) => b.totalTomatoNumber - a.totalTomatoNumber)
      : data.sort((a, b) => b.totalTime - a.totalTime);
  },
  /**
   * 获取矩形树图的 Tip：
   * 1. name：该段时间，总时间 / 总番茄数值量最大的 Plan / Ability / Target 的名字
   * 2. percent：其占据总体的百分比
   */
  getRectangularTreeTip: (
    treeData: {
      name: string;
      totalTomatoNumber: number;
      totalTime: number;
    }[],
    chartMode: ChartMode
  ): { name: string; percent: string } => {
    let totalTime = 0;
    let totalTomatoNumber = 0;
    let maxTime = 0;
    let maxTomatoNumber = 0;
    let maxTimeName = "";
    let maxTomatoNumberName = "";
    treeData.forEach(item => {
      totalTime += item.totalTime;
      totalTomatoNumber += item.totalTomatoNumber;
      if (maxTime <= item.totalTime) {
        maxTime = item.totalTime;
        maxTimeName = item.name;
      }
      if (maxTomatoNumber <= item.totalTomatoNumber) {
        maxTomatoNumber = item.totalTomatoNumber;
        maxTomatoNumberName = item.name;
      }
    });
    return chartMode === "tomato"
      ? {
          name: maxTomatoNumberName,
          percent: ((maxTomatoNumber / totalTomatoNumber) * 100).toFixed(2)
        }
      : {
          name: maxTimeName,
          percent: ((maxTime / totalTime) * 100).toFixed(2)
        };
  },
  /**
   * 获取 Ability 用于矩形树图
   */
  fetchStatAbilityList: (
    statDateList: readonly StatDate[]
  ): Map<string, AV.Object> => {
    const abilityMap = new Map();
    statDateList.forEach(statDate => {
      if (statDate.statAbilityList === undefined) {
        throw "statDate.statAbilityList === undefined";
      }
      statDate.statAbilityList.forEach(ability => {
        if (abilityMap.has(ability.id)) {
          const oldAbility = abilityMap.get(ability.id);
          oldAbility.attributes.todayTotalTime +=
            ability.attributes.todayTotalTime;
          oldAbility.attributes.todayTomatoNumber +=
            ability.attributes.todayTomatoNumber;
        } else {
          abilityMap.set(ability.id, ability);
        }
      });
    });
    return abilityMap;
  },
  /**
   * 获取 Plan 用于矩形树图
   */
  fetchStatPlanList: (
    statDateList: readonly StatDate[]
  ): Map<string, AV.Object> => {
    const planMap = new Map();
    statDateList.forEach(statDate => {
      if (statDate.statPlanList === undefined) {
        throw "statDate.statPlanList === undefined";
      }
      statDate.statPlanList.forEach(plan => {
        if (planMap.has(plan.id)) {
          const oldPlan = planMap.get(plan.id);
          oldPlan.attributes.todayTotalTime += plan.attributes.todayTotalTime;
          oldPlan.attributes.todayTomatoNumber +=
            plan.attributes.todayTomatoNumber;
        } else {
          planMap.set(plan.id, plan);
        }
      });
    });
    return planMap;
  },
  /**
   * 获取 Target 用于矩形树图
   */
  fetchStatTargetList: (
    statDateList: readonly StatDate[]
  ): Map<string, AV.Object> => {
    const targetMap = new Map();
    statDateList.forEach(statDate => {
      if (statDate.statTargetList === undefined) {
        throw "statDate.statTargetList === undefined";
      }
      statDate.statTargetList.forEach(target => {
        if (targetMap.has(target.id)) {
          const oldTarget = targetMap.get(target.id);
          oldTarget.attributes.todayTotalTime +=
            target.attributes.todayTotalTime;
          oldTarget.attributes.todayTomatoNumber +=
            target.attributes.todayTomatoNumber;
        } else {
          targetMap.set(target.id, target);
        }
      });
    });
    return targetMap;
  }
};
