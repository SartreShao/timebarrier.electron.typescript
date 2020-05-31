import { Ref } from "@vue/composition-api";
import {
  StatStatusMode,
  StatDate,
  ChartMode
} from "@/lib/types/vue-viewmodels";
import { ElementVue } from "@/lib/types/vue-viewmodels";
import { UI } from "@/lib/vue-utils";
import AV from "leancloud-storage";
import Api from "@/lib/api";
import _ from "lodash";
import ecStat from "echarts-stat";
import echarts from "echarts";

export default {
  /**
   * 加载 TomatoList 的前 100 条，越靠后创建的，越先加载出来
   */
  initTomatoList: async (vue: ElementVue, tomatoList: Ref<AV.Object[]>) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取番茄列表");

    try {
      tomatoList.value = await Api.fetchTomatoList(user);
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取番茄列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 加载更多
   */
  loadMore: async (vue: ElementVue, tomatoList: Ref<AV.Object[]>) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // const loadingInstance = UI.showLoading(vue.$loading, "正在加载更多");

    try {
      const oldTomatoList = tomatoList.value;
      const lastTomato = _.last(oldTomatoList);
      const newTomatoList = await Api.fetchTomatoList(
        user,
        lastTomato === undefined ? new Date() : lastTomato.attributes.startTime
      );
      tomatoList.value = _.concat(oldTomatoList, newTomatoList);
      // UI.hideLoading(loadingInstance);
    } catch (error) {
      // UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "加载更多记录失败",
        `错误原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 加载指定日期范围的 tomatoList
   */
  initTomatoListWithDateRange: async (
    vue: ElementVue,
    tomatoListWithDateRange: Ref<AV.Object[]>,
    startTime: Date,
    endTime: Date
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }
    const loadingInstance = UI.showLoading(vue.$loading, "正在获取番茄列表");

    try {
      tomatoListWithDateRange.value = await Api.fetchTomatoListWithDateRange(
        user,
        startTime,
        endTime
      );
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取番茄列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 将 tomatoList 转换成 StatDateList
   */
  mapStatDate: (tomatoList: AV.Object[]): StatDate[] => {
    const statDateList: StatDate[] = [];

    // 将 tomatoList 转换为 statDateList
    let tDate: string = "";
    tomatoList.forEach(tomato => {
      if (tDate !== UI.dateToYearMonthDay(tomato.attributes.startTime)) {
        tDate = UI.dateToYearMonthDay(tomato.attributes.startTime);
        const statDate = createStatDate(tomato);
        statDateList.push(statDate);
      } else {
        statDateList[statDateList.length - 1].tomatoList.push(tomato);
      }
    });

    function createStatDate(tomato: AV.Object): StatDate {
      return {
        date: UI.dateToYearMonthDay(tomato.attributes.startTime),
        timeStamp: tomato.attributes.startTime.getTime(),
        tomatoList: [tomato]
      };
    }
    /**
     * 解析 statDateList.tomatoList 属性，获取其它相关属性
     * @param statDateList
     */
    function parseTomatoList(statDateList: StatDate[]) {
      const getDuration = (tomato: AV.Object) =>
        (tomato.createdAt as Date).getTime() -
        tomato.attributes.startTime.getTime();

      const getTotalTime = (tomatoList: AV.Object[]) => {
        let totalTime = 0;
        tomatoList.forEach(tomato => {
          totalTime += getDuration(tomato);
        });
        return totalTime;
      };

      /**
       * @return statTomatoList
       * statTomato.attributes.todayTomatoNumber - 今日番茄数量
       * statTomato.attributes.todayTotalTime - 今日番茄时间
       */
      const getStatTomatoList = (tomatoList: AV.Object[]): AV.Object[] => {
        const statTomatoList: AV.Object[] = [];
        tomatoList.forEach(tomato => {
          let tIndex = -1;

          statTomatoList.forEach((statTomato, index) => {
            if (statTomato.attributes.name === tomato.attributes.name) {
              tIndex = index;
            }
          });

          if (tIndex === -1) {
            const statTomato = _.cloneDeep(tomato);
            statTomato.attributes.todayTomatoNumber = 1;
            statTomato.attributes.todayTotalTime = getDuration(tomato);
            statTomatoList.push(statTomato);
          } else {
            statTomatoList[tIndex].attributes.todayTomatoNumber++;
            statTomatoList[tIndex].attributes.todayTotalTime += getDuration(
              tomato
            );
          }
        });
        return statTomatoList;
      };

      const getStatPlanList = (tomatoList: AV.Object[]): AV.Object[] => {
        const statPlanList: AV.Object[] = [];
        tomatoList.forEach(tomato => {
          tomato.attributes.planListOfTomato.forEach((plan: AV.Object) => {
            let tIndex = -1;

            statPlanList.forEach((statPlan, index) => {
              if (statPlan.id === plan.id) {
                tIndex = index;
              }
            });

            if (tIndex === -1) {
              const statPlan = _.cloneDeep(plan);
              statPlan.attributes.todayTomatoNumber = 1;
              statPlan.attributes.todayTotalTime = getDuration(tomato);
              statPlanList.push(statPlan);
            } else {
              statPlanList[tIndex].attributes.todayTomatoNumber++;
              statPlanList[tIndex].attributes.todayTotalTime += getDuration(
                tomato
              );
            }
          });
        });
        return statPlanList;
      };

      const getStatAbilityList = (tomatoList: AV.Object[]): AV.Object[] => {
        const statAbilityList: AV.Object[] = [];
        tomatoList.forEach(tomato => {
          tomato.attributes.planListOfTomato.forEach((plan: AV.Object) => {
            plan.attributes.abilityListOfPlan.forEach((ability: AV.Object) => {
              let tIndex = -1;

              statAbilityList.forEach((statAbility, index) => {
                if (statAbility.id === ability.id) {
                  tIndex = index;
                }
              });

              if (tIndex === -1) {
                const statAbility = _.cloneDeep(ability);
                statAbility.attributes.todayTomatoNumber = 1;
                statAbility.attributes.todayTotalTime = getDuration(tomato);
                statAbilityList.push(statAbility);
              } else {
                statAbilityList[tIndex].attributes.todayTomatoNumber++;
                statAbilityList[
                  tIndex
                ].attributes.todayTotalTime += getDuration(tomato);
              }
            });
          });
        });
        return statAbilityList;
      };

      const getStatTargetList = (tomatoList: AV.Object[]): AV.Object[] => {
        const statTargetList: AV.Object[] = [];
        tomatoList.forEach(tomato => {
          tomato.attributes.planListOfTomato.forEach((plan: AV.Object) => {
            plan.attributes.targetListOfPlan.forEach((target: AV.Object) => {
              let tIndex = -1;

              statTargetList.forEach((statTarget, index) => {
                if (statTarget.id === target.id) {
                  tIndex = index;
                }
              });

              if (tIndex === -1) {
                const statTarget = _.cloneDeep(target);
                statTarget.attributes.todayTomatoNumber = 1;
                statTarget.attributes.todayTotalTime = getDuration(tomato);
                statTargetList.push(statTarget);
              } else {
                statTargetList[tIndex].attributes.todayTomatoNumber++;
                statTargetList[tIndex].attributes.todayTotalTime += getDuration(
                  tomato
                );
              }
            });
          });
        });
        return statTargetList;
      };

      statDateList.forEach(statDate => {
        statDate.totalTime = getTotalTime(statDate.tomatoList);
        statDate.statTomatoList = getStatTomatoList(statDate.tomatoList);
        statDate.statPlanList = getStatPlanList(statDate.tomatoList);
        statDate.statAbilityList = getStatAbilityList(statDate.tomatoList);
        statDate.statTargetList = getStatTargetList(statDate.tomatoList);
      });
    }

    parseTomatoList(statDateList);

    return statDateList;
  },
  /**
   * 初始化 DailyTomatoList，这主要是用用来获取 totalTargetTomatoNumber 的
   */
  initDailyTomatoList: async (
    vue: ElementVue,
    dailyPlanList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    // 显示 loading
    const loadingInstance = UI.showLoading(vue.$loading, "正在获取计划列表");

    // 尝试获取计划列表
    try {
      // 获取每日计划列表
      if (dailyPlanList !== null) {
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      // 获取列表成功
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取计划列表失败",
        `失败原因：${error.message}`,
        "error"
      );
    }
  },
  /**
   * 点击「转换」按钮，改变数据呈现样式
   */
  changeStatStatusMode: (statStatusMode: Ref<StatStatusMode>) => {
    switch (statStatusMode.value) {
      case "detail":
        statStatusMode.value = "date";
        break;
      case "simple":
        statStatusMode.value = "detail";
        break;
      case "date":
        statStatusMode.value = "simple";
        break;
    }
  },
  changeChartMode: (chartMode: Ref<ChartMode>) => {
    if (chartMode.value === "time") {
      chartMode.value = "tomato";
    } else {
      chartMode.value = "time";
    }
  },
  /**
   * DateTip 是关于提示用户当前时间范围的函数
   * 如「本周」、「本月」、「本年」、「全部」、「自定义」
   */
  getDateTip: (startTime: Date, endTime: Date) => {
    // 近 7 日
    if (
      startTime.getTime() === endTime.getTime() - 3600 * 1000 * 24 * 7 &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "7 日";
    }

    // 近 15 日
    else if (
      startTime.getTime() === endTime.getTime() - 3600 * 1000 * 24 * 15 &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "15 日";
    }

    // 近 30 日
    else if (
      startTime.getTime() === endTime.getTime() - 3600 * 1000 * 24 * 30 &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "30 日";
    }

    // 近 180 日
    else if (
      startTime.getTime() === endTime.getTime() - 3600 * 1000 * 24 * 180 &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "180 日";
    }

    // 近 365 日
    else if (
      startTime.getTime() === endTime.getTime() - 3600 * 1000 * 24 * 365 &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "365 日";
    }

    // 本周
    else if (
      startTime.getTime() === UI.getWeekStartTimestamp(new Date().getTime()) &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "本周";
    }

    // 本月
    else if (
      startTime.getTime() === UI.getMonthStartTimestamp(new Date().getTime()) &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "本月";
    }

    // 本年
    else if (
      startTime.getTime() === UI.getYearStartTimestamp(new Date().getTime()) &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "本年";
    }

    // 全部
    else if (
      startTime.getTime() === new Date("1990/01/01").getTime() &&
      endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
    ) {
      return "全部";
    }

    // 自定义
    else {
      return "自定义";
    }
  },

  /**
   * 获取画点的数据
   */
  getScatterData: (
    statDateList: readonly StatDate[],
    chartMode: ChartMode
  ): number[][] =>
    statDateList.map(statDate => {
      if (chartMode === "tomato") {
        return [
          UI.getTodayStartTimestamp(statDate.timeStamp),
          statDate.tomatoList.length
        ];
      } else {
        return [
          UI.getTodayStartTimestamp(statDate.timeStamp),
          UI.timeStampToHour(statDate.totalTime as number)
        ];
      }
    }),
  /**
   * 获得「线性回归」的表达式
   */
  getLinearRegressionExpression: (
    scatterData: readonly number[][],
    chartMode: ChartMode
  ) => {
    const getRegressionData = (scatterData: readonly number[][]): number[][] =>
      scatterData.map(item => {
        // 获取最小的 date item
        const minDateItem = _.last(scatterData);
        if (minDateItem !== undefined) {
          const minDate = minDateItem[0];
          const date = item[0];
          const index = (date - minDate) / 86400000;
          return [index, item[1]];
        } else {
          return [item[0], item[1]];
        }
      });

    const regressionData = getRegressionData(scatterData);

    const regression = ecStat.regression("linear", regressionData, 0);

    regression.points.sort(function(a: any, b: any) {
      return a[0] - b[0];
    });

    const unit: string =
      chartMode === "tomato" ? "｜番茄 ∝ 日期" : "｜小时 ∝ 日期";
    return regression.expression + unit;
  },
  /**
   * 初始化表格
   */
  initScatterChart: (
    id: string,
    scatterData: readonly number[][],
    chartMode: ChartMode,
    colormap: string[]
  ) => {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    // See https://github.com/ecomfe/echarts-stat
    var linearRegression = ecStat.regression(
      "linear",
      scatterData as number[][],
      0
    );

    linearRegression.points.sort(function(a: any, b: any) {
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
          data: scatterData,
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
          data: linearRegression.points,
          itemStyle: { color: "#F9385E" },
          markPoint: {
            itemStyle: {
              color: "transparent"
            },
            data: [
              {
                coord:
                  linearRegression.points[linearRegression.points.length - 1]
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
  },
  /**
   * 获取「线性回归表达式」的斜率 slop
   */
  getLinearRegressionSlop: (expression: string): number => {
    const regex: RegExp = /^y = (.*)x \+ .*$/;
    const execArray = regex.exec(expression);
    console.log("execArray", execArray);
    if (execArray !== null && execArray[1] !== null) {
      return Number(execArray[1]);
    } else {
      return 0;
    }
  },
  /**
   * 获取散点图的评论信息
   */
  getTip: (slop: number): string => {
    console.log("slop", slop);
    if (slop === 0) {
      return "保持平稳";
    } else if (slop > 0 && slop <= 0.2) {
      return "稳步上升";
    } else if (slop < 0 && slop >= -0.2) {
      return "平稳回落"; //水落归槽
    } else if (slop > 0.2) {
      return "突飞猛进";
    } else if (slop < -0.2) {
      return "飞转直下";
    } else {
      return "等待分析";
    }
  },
  /**
   * 获取每日平均番茄数
   */
  getAverageDailyTomato: (
    totalTomatoNumber: number,
    startTime: Date,
    endTime: Date
  ) => {
    const totalDays =
      (UI.getTodayStartTimestamp(endTime.getTime()) -
        UI.getTodayStartTimestamp(startTime.getTime())) /
      (3600 * 1000 * 24);
    return (totalTomatoNumber / totalDays).toFixed(2);
  }
};
