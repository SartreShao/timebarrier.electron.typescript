import { ElementVue, StatDate, ChartMode } from "../types/vue-viewmodels";
import AV from "leancloud-storage";
import ecStat from "echarts-stat";
import echarts from "echarts";
import { UI } from "../vue-utils";

export default {
  /**
   * 初始化「矩形树图」
   */
  initRectangularTree: async (
    id: string,
    data: readonly { name: string; value: number }[],
    colormap: string[]
  ) => {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    const option = {
      visualMap: {
        //这种写法才是目前主流的写法
        color: colormap
      },
      series: [
        {
          type: "treemap",
          data: data,
          itemStyle: {
            color: (params: any) => {
              console.log("params", params.dataIndex);
              return colormap[params.dataIndex % colormap.length];
            }
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
    return data;
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
