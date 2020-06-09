import { Ref, ref } from "@vue/composition-api";
import {
  StatStatusMode,
  StatDate,
  ChartMode,
  TwoChronotype,
  FourChronotype,
  TotalStatDate,
  TotalStat
} from "@/lib/types/vue-viewmodels";
import { ElementVue } from "@/lib/types/vue-viewmodels";
import { UI, Mathematic } from "@/lib/vue-utils";
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
  mapTotalStat: (statDateList: readonly StatDate[]): TotalStat => {
    console.log("statDateList", statDateList);
    let totalStatDateList: TotalStat;

    const tomatoTotalStatDateList: TotalStatDate[] = [];

    const statDateListAsc = _.reverse(statDateList);

    statDateListAsc.forEach((statDate, index) => {
      let tomatoTotalStatDate: TotalStatDate;
      if (index === 0) {
        tomatoTotalStatDate = getTomatoTotalStatDate(statDate);
      } else {
        tomatoTotalStatDate = getTomatoTotalStatDate(
          statDate,
          tomatoTotalStatDateList[index - 1]
        );
      }
      tomatoTotalStatDateList.push(tomatoTotalStatDate);
    });

    totalStatDateList = { tomatoTotalStatDateList: tomatoTotalStatDateList };

    function getTomatoTotalStatDate(
      statDate: StatDate,
      lastTomatoTotalStatDate?: TotalStatDate
    ): TotalStatDate {
      if (statDate.totalTime === undefined) {
        throw "statDate.totaltTime is undefined";
      }

      const date = statDate.date;
      const timeStamp = statDate.timeStamp;
      const totalTime =
        lastTomatoTotalStatDate === undefined
          ? statDate.tomatoList[statDate.tomatoList.length - 1].attributes
              .totalTime
          : statDate.totalTime + lastTomatoTotalStatDate.totalTime;
      const totalTomatoNumber =
        lastTomatoTotalStatDate === undefined
          ? statDate.tomatoList[statDate.tomatoList.length - 1].attributes
              .totalTomatoNumber
          : statDate.tomatoList.length +
            lastTomatoTotalStatDate.totalTomatoNumber;
      const type = "tomato";
      return { date, timeStamp, totalTime, totalTomatoNumber, type };
    }

    return totalStatDateList;
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
   * 获取整体的番茄涨势数据
   */
  mapTotalStatToTomatoList: (
    totalStat: TotalStat,
    chartMode: ChartMode
  ): number[][] =>
    totalStat.tomatoTotalStatDateList.map(tomatoTotalStatDate => {
      if (chartMode === "tomato") {
        return [
          UI.getTodayStartTimestamp(tomatoTotalStatDate.timeStamp),
          tomatoTotalStatDate.totalTomatoNumber
        ];
      } else {
        return [
          UI.getTodayStartTimestamp(tomatoTotalStatDate.timeStamp),
          UI.timeStampToHour(tomatoTotalStatDate.totalTime as number)
        ];
      }
    }),
  /**
   * 初始化全部走势散点图
   */
  initTotalScatterChart: function(
    id: string,
    totalStat: TotalStat,
    chartMode: ChartMode,
    colormap: string[],
    symbolSize: Ref<number>
  ) {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    const data = this.mapTotalStatToTomatoList(totalStat, chartMode);

    // See https://github.com/ecomfe/echarts-stat
    var linearRegression = ecStat.regression("linear", data, 0);

    linearRegression.points.sort(function(a: any, b: any) {
      return a[0] - b[0];
    });

    const option = {
      grid: {
        left: "3.2%",
        right: "12%",
        bottom: "10%",
        containLabel: true
      },
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
        min:
          totalStat.tomatoTotalStatDateList.length === 0
            ? 0
            : chartMode === "tomato"
            ? totalStat.tomatoTotalStatDateList[0].totalTomatoNumber
            : UI.timeStampToHour(
                totalStat.tomatoTotalStatDateList[0].totalTime
              ),
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
          type: "line",
          smooth: true,
          emphasis: {
            label: {
              show: true,
              position: "left",
              color: "blue",
              fontSize: 16
            }
          },
          symbolSize: symbolSize.value,
          symbol: "circle",
          data: data,
          itemStyle: {
            color: (params: any) => {
              return colormap[params.dataIndex % colormap.length];
            }
          },
          lineStyle: {
            color: "#552FB9"
          }
        }
        // {
        //   name: "line",
        //   type: "line",
        //   showSymbol: false,
        //   smooth: true,
        //   data: linearRegression.points,
        //   itemStyle: { color: "#552FB9" },
        //   markPoint: {
        //     itemStyle: {
        //       color: "transparent"
        //     },
        //     data: [
        //       {
        //         coord:
        //           linearRegression.points[linearRegression.points.length - 1]
        //       }
        //     ]
        //   }
        // }
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
        if (symbolSize.value === 1) {
          symbolSize.value = 8;
        } else {
          symbolSize.value = 1;
        }
      });
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
   * 获取分时数据
   */
  getEachPeriodData: (
    todayTomatoList: AV.Object[],
    chartMode: ChartMode
  ): number[] => {
    // 今日的七组数据
    let deepNight = 0;
    let earlyMorning = 0;
    let morning = 0;
    let noon = 0;
    let afternoon = 0;
    let dusk = 0;
    let evening = 0;

    if (chartMode === "tomato") {
      // 获取今日番茄分时数据
      todayTomatoList.forEach(tomato => {
        const hour = UI.getHour(tomato.attributes.startTime.getTime());

        if (0 <= hour && hour < 6) {
          deepNight++;
        }
        if (6 <= hour && hour < 8) {
          earlyMorning++;
        }
        if (8 <= hour && hour < 12) {
          morning++;
        }
        if (12 <= hour && hour < 14) {
          noon++;
        }
        if (14 <= hour && hour < 18) {
          afternoon++;
        }
        if (18 <= hour && hour < 20) {
          dusk++;
        }
        if (20 <= hour && hour < 24) {
          evening++;
        }
      });
    } else {
      // 获取今日总时长分时数据
      todayTomatoList.forEach(tomato => {
        const hour = UI.getHour(tomato.attributes.startTime.getTime());

        if (tomato.createdAt === undefined) {
          throw "tomato.createdAt is undefined";
        }

        const duration =
          (tomato.createdAt.getTime() - tomato.attributes.startTime.getTime()) /
          (3600 * 1000);

        if (0 <= hour && hour < 6) {
          deepNight += duration;
        }
        if (6 <= hour && hour < 8) {
          earlyMorning += duration;
        }
        if (8 <= hour && hour < 12) {
          morning += duration;
        }
        if (12 <= hour && hour < 14) {
          noon += duration;
        }
        if (14 <= hour && hour < 18) {
          afternoon += duration;
        }
        if (18 <= hour && hour < 20) {
          dusk += duration;
        }
        if (20 <= hour && hour < 24) {
          evening += duration;
        }
      });
    }

    return [evening, dusk, afternoon, noon, morning, earlyMorning, deepNight];
  },
  /**
   * 获取分时数据名称
   */
  getNowPeriodName: (): string[] => {
    const date = new Date();
    const hour = UI.getHour(date.getTime());

    if (0 <= hour && hour < 6) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 6 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["凌晨", less];
    } else if (6 <= hour && hour < 8) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 8 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["清晨", less];
    } else if (8 <= hour && hour < 12) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 12 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["上午", less];
    } else if (12 <= hour && hour < 14) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 14 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["中午", less];
    } else if (14 <= hour && hour < 18) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 18 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["下午", less];
    } else if (18 <= hour && hour < 20) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 20 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["傍晚", less];
    } else if (20 <= hour && hour < 24) {
      const endTimestamp =
        UI.getTodayStartTimestamp(date.getTime()) + 24 * 3600 * 1000;
      const less = UI.formatTimeHourMinute(
        (endTimestamp - date.getTime()) / 1000
      );
      return ["夜晚", less];
    } else {
      return ["数据错误", ""];
    }
  },
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
   * 初始化散点图
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
   * 初始化柱状图
   */
  initPeriodBarChart: (
    id: string,
    todayBarChartData: readonly number[],
    totalBarChartData: readonly number[],
    chartMode: ChartMode,
    colormap: string[],
    labelShow: Ref<boolean>
  ) => {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    const option = {
      // tooltip: {
      //   trigger: "axis",
      //   axisPointer: {
      //     type: "shadow"
      //   },
      //   formatter: (params: any) => {
      //     // 总时长
      //     let totalTime = 0;
      //     // 选中的 Y 轴名称：如「凌晨...」、「上午...」等
      //     const yAxisName = params[0].name;
      //     switch (yAxisName) {
      //       case "凌晨\n00:00-06:00":
      //         totalTime = 6;
      //         break;
      //       case "清晨\n06:00-08:00":
      //         totalTime = 2;
      //         break;
      //       case "上午\n08:00-12:00":
      //         totalTime = 4;
      //         break;
      //       case "中午\n12:00-14:00":
      //         totalTime = 2;
      //         break;
      //       case "下午\n14:00-18:00":
      //         totalTime = 4;
      //         break;
      //       case "傍晚\n18:00-20:00":
      //         totalTime = 2;
      //         break;
      //       case "夜晚\n20:00-24:00":
      //         totalTime = 4;
      //         break;
      //     }
      //     const totalTomato = totalTime * 2;
      //     // 系列 1 的名称：今日
      //     const today = params[0].seriesName;
      //     // 系列 2 的名称：平均
      //     const average = params[1].seriesName;

      //     // 今日传入数据
      //     const todayData = params[0].data;

      //     // 平均传入数据
      //     const averageData = params[1].data;

      //     if (chartMode === "time") {
      //       return `${yAxisName}
      //       <br />时段总时长: ${totalTime + " 小时"}
      //         <br />${today}: ${todayData.toFixed(2)} ${"小时"} (${(
      //         (todayData / totalTime) *
      //         100
      //       ).toFixed(2) + "%"})
      //       <br />${average}: ${averageData.toFixed(2)} ${"小时"} (${(
      //         (averageData / totalTime) *
      //         100
      //       ).toFixed(2) + "%"})`;
      //     } else {
      //       return `${yAxisName}
      //       <br />番茄容纳量: ${totalTomato + " 番茄"}
      //         <br />${today}: ${todayData.toFixed(2)} ${"番茄"} (${(
      //         (todayData / totalTomato) *
      //         100
      //       ).toFixed(2) + "%"})
      //       <br />${average}: ${averageData.toFixed(2)} ${"番茄"} (${(
      //         (averageData / totalTomato) *
      //         100
      //       ).toFixed(2) + "%"})`;
      //     }
      //   }
      // },
      label: {
        show: labelShow.value,
        position: "insideLeft",
        fontSize: 11,
        distance: 10,
        formatter: (params: any) => {
          if (params.data !== undefined && params.data !== 0) {
            // 总时长
            let totalTime = 0;
            // 选中的 Y 轴名称：如「凌晨...」、「上午...」等
            const yAxisName = params.name;
            switch (yAxisName) {
              case "凌晨\n00:00-06:00":
                totalTime = 6;
                break;
              case "清晨\n06:00-08:00":
                totalTime = 2;
                break;
              case "上午\n08:00-12:00":
                totalTime = 4;
                break;
              case "中午\n12:00-14:00":
                totalTime = 2;
                break;
              case "下午\n14:00-18:00":
                totalTime = 4;
                break;
              case "傍晚\n18:00-20:00":
                totalTime = 2;
                break;
              case "夜晚\n20:00-24:00":
                totalTime = 4;
                break;
            }
            const data = params.data;
            const totalTomato = totalTime * 2;
            const percent =
              chartMode === "time" ? data / totalTime : data / totalTomato;

            const totalForUI =
              chartMode === "time"
                ? totalTime.toFixed(2) + " 小时"
                : totalTomato.toFixed(2) + " 番茄";
            // return dataForUI + " " + (percent * 100).toFixed(2) + "%";
            return (
              params.seriesName +
              ": " +
              data.toFixed(2) +
              " / " +
              totalForUI +
              ", " +
              (percent * 100).toFixed(2) +
              "%"
            );
          } else {
            return "";
          }
        }
      },
      // legend: {
      //   data: ["今日", "平均"],
      //   bottom: 30,
      //   left: "center"
      // },
      grid: {
        left: "2%",
        right: "14%",
        bottom: "10%",
        containLabel: true
      },
      yAxis: {
        type: "category",
        data: [
          "夜晚\n20:00-24:00",
          "傍晚\n18:00-20:00",
          "下午\n14:00-18:00",
          "中午\n12:00-14:00",
          "上午\n08:00-12:00",
          "清晨\n06:00-08:00",
          "凌晨\n00:00-06:00"
        ],
        axisLabel: {
          margin: 10,
          color: "#222A36",
          fontSize: 10,
          rotate: 0
        },
        splitLine: {
          lineStyle: {
            type: "dashed"
          }
        }
      },
      xAxis: {
        name: chartMode === "tomato" ? "番茄数 y" : "小时 y",
        nameLocation: "end",
        nameGap: 6,
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
      barGap: "5%",
      barWidth: "45%",
      series: [
        {
          name: "今日",
          data: todayBarChartData,
          type: "bar",
          showBackground: true,
          itemStyle: {
            color: (params: any) => {
              return "#F9385E";
            }
          },
          backgroundStyle: {
            color: "rgba(220, 220, 220, 0.2)"
          }
        },
        {
          name: "平均",
          data: totalBarChartData,
          type: "bar",
          showBackground: true,
          itemStyle: {
            color: (params: any) => {
              return "#222A36";
            }
          },
          backgroundStyle: {
            color: "rgba(220, 220, 220, 0.2)"
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
    if (myChart !== null) {
      myChart.off("click");
      myChart.on("click", function(params: any) {
        if (labelShow.value == true) {
          labelShow.value = false;
        } else {
          labelShow.value = true;
        }
      });
    }
  },
  /**
   * 初始化周数据
   */
  initWeekBarChart: (
    id: string,
    weekStatDate: readonly number[],
    todayTomatoNumber: number,
    todayTotalTime: number,
    chartMode: ChartMode,
    colormap: string[],
    labelShow: Ref<boolean>
  ) => {
    const charts = document.getElementById(id) as HTMLDivElement;
    const myChart = charts ? echarts.init(charts) : null;

    const option = {
      label: {
        show: labelShow.value
      },
      xAxis: {
        // name: "日期 x",
        type: "category",
        data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        nameLocation: "end",
        nameGap: 6,
        nameTextStyle: {
          color: "#222A36",
          fontSize: 10
        },
        axisLine: { lineStyle: { color: "#99A8B8" } },
        axisLabel: { margin: 20, color: "#222A36", fontSize: 10 },
        splitLine: {
          lineStyle: {
            type: "dashed"
          }
        }
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
          data: weekStatDate,
          type: "bar",
          showBackground: true,
          backgroundStyle: {
            color: "rgba(220, 220, 220, 0.2)"
          },
          itemStyle: {
            color: (params: any) => {
              return colormap[params.dataIndex % colormap.length];
            }
          },
          markLine: {
            symbol: "none",
            lineStyle: {
              type: "dotted"
            },
            data: [
              {
                name: "今日数据",
                yAxis:
                  chartMode === "tomato" ? todayTomatoNumber : todayTotalTime,
                itemStyle: {
                  color: "#222A36"
                },
                label: {
                  textStyle: {
                    fontSize: 10,
                    lineHeight: 12
                  },
                  formatter: (params: any) => {
                    return (
                      "今日\n" +
                      (chartMode === "tomato"
                        ? params.value.toFixed(2)
                        : params.value.toFixed(2))
                    );
                  }
                }
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
    if (myChart !== null) {
      myChart.off("click");
      myChart.on("click", function(params: any) {
        if (labelShow.value == true) {
          labelShow.value = false;
        } else {
          labelShow.value = true;
        }
      });
    }
  },
  /**
   * 获取「线性回归表达式」的斜率 slop
   */
  getLinearRegressionSlop: (expression: string): number => {
    const regex: RegExp = /^y = (.*)x \+ .*$/;
    const execArray = regex.exec(expression);
    if (execArray !== null && execArray[1] !== null) {
      return Number(execArray[1]);
    } else {
      return 0;
    }
  },
  /**
   * 获取散点图的评论信息
   */
  getLinearRegressionTip: (slop: number): string => {
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
  getWeekStatTip: (weekStatData: readonly number[]) => {
    let max = 0;
    let tIndex = 0;
    weekStatData.forEach((weekStat, index) => {
      if (max <= weekStat) {
        max = weekStat;
        tIndex = index;
      }
    });
    let result;
    switch (tIndex) {
      case 0:
        result = "星期一";
        break;
      case 1:
        result = "星期二";
        break;
      case 2:
        result = "星期三";
        break;
      case 3:
        result = "星期四";
        break;
      case 4:
        result = "星期五";
        break;
      case 5:
        result = "星期六";
        break;
      case 6:
        result = "星期日";
        break;
    }
    return result;
  },
  /**
   * 获取每日平均番茄数
   */
  getAverageDailyTomato: (
    totalTomatoNumber: number,
    startTime: Date,
    endTime: Date
  ) => {
    const tempTotalDays =
      (UI.getTodayStartTimestamp(endTime.getTime()) -
        UI.getTodayStartTimestamp(startTime.getTime())) /
      (3600 * 1000 * 24);

    const totalDays = tempTotalDays === 0 ? 1 : tempTotalDays;
    return (totalTomatoNumber / totalDays).toFixed(2);
  },
  /**
   * 获取单日最多完成番茄
   */
  getMaximumDailyTomato: (statDateList: readonly StatDate[]) => {
    let max = 0;
    statDateList.forEach(statDate => {
      if (max < statDate.tomatoList.length) {
        max = statDate.tomatoList.length;
      }
    });
    return String(max);
  },
  /**
   * 获取每日平均用时
   */
  getAverageDailyTime: (
    statDateList: readonly StatDate[],
    startTime: Date,
    endTime: Date
  ) => {
    const tempTotalDays =
      (UI.getTodayStartTimestamp(endTime.getTime()) -
        UI.getTodayStartTimestamp(startTime.getTime())) /
      (3600 * 1000 * 24);

    const totalDays = tempTotalDays === 0 ? 1 : tempTotalDays;

    let totalTime = 0;
    statDateList.forEach(statDate => {
      if (statDate.totalTime !== undefined) {
        totalTime += statDate.totalTime;
      }
    });

    return UI.formatTimeHourMinute(totalTime / totalDays / 1000);
  },
  /**
   * 获取单日最长工作时间
   */
  getMaximumDailyTime: (statDateList: readonly StatDate[]) => {
    let max = 0;
    statDateList.forEach(statDate => {
      if (statDate.totalTime !== undefined) {
        if (max < statDate.totalTime) {
          max = statDate.totalTime;
        }
      }
    });
    return UI.formatTimeHourMinute(max / 1000);
  },
  /**
   * 获取今日番茄数
   */
  getTodayTomatoNumber: (statDateList: readonly StatDate[]) => {
    if (statDateList.length !== 0) {
      return String(statDateList[0].tomatoList.length);
    } else {
      return "0";
    }
  },
  /**
   * 获取今日工作时长
   */
  getTodayWorkingTime: (statDateList: readonly StatDate[]) => {
    if (statDateList.length !== 0 && statDateList[0].totalTime !== undefined) {
      return UI.formatTimeHourMinute(statDateList[0].totalTime / 1000);
    } else {
      return "0 小时";
    }
  },
  /**
   * 获取两类时型
   */
  getTwoChronotype: (tomatoList: AV.Object[]): TwoChronotype => {
    let earlyBird = 0;
    let nightHawk = 0;

    tomatoList.forEach(tomato => {
      const startTime = tomato.attributes.startTime.getTime();
      const endTime = (tomato.createdAt as Date).getTime();
      const startTimeHour = UI.getHour(startTime);

      // 夜鹰型
      if (0 <= startTimeHour && startTimeHour < 4) {
        nightHawk += endTime - startTime;
      }

      // 早鸟型
      else if (4 <= startTimeHour && startTimeHour < 16) {
        earlyBird += endTime - startTime;
      }

      // 夜鹰型
      else if (16 <= startTimeHour && startTimeHour < 24) {
        nightHawk += endTime - startTime;
      }
    });

    if (earlyBird > nightHawk) {
      return "早鸟型";
    } else if (earlyBird < nightHawk) {
      return "夜鹰型";
    } else {
      return "极度罕见的平衡型";
    }
  },
  /**
   * 获取四类时型
   */
  getFourChronotype: (tomatoList: AV.Object[]): FourChronotype => {
    let dolphin = 0;
    let lion = 0;
    let bear = 0;
    let wolf = 0;

    tomatoList.forEach(tomato => {
      const startTime = tomato.attributes.startTime.getTime();
      const endTime = (tomato.createdAt as Date).getTime();
      const startTimeHour = UI.getHour(startTime);

      // 狼型
      if (0 <= startTimeHour && startTimeHour < 2) {
        wolf += endTime - startTime;
      }

      // 狼型
      if (18 <= startTimeHour && startTimeHour < 24) {
        wolf += endTime - startTime;
      }

      // 狮子
      if (6 <= startTimeHour && startTimeHour < 14) {
        lion += endTime - startTime;
      }

      // 熊型
      if (12 <= startTimeHour && startTimeHour < 20) {
        bear += endTime - startTime;
      }

      // 海豚型
      if (8 <= startTimeHour && startTimeHour < 1) {
        dolphin += endTime - startTime;
      }

      // 海豚型
      if (16 <= startTimeHour && startTimeHour < 18) {
        dolphin += endTime - startTime;
      }

      // 海豚型
      if (20 <= startTimeHour && startTimeHour < 23) {
        dolphin += endTime - startTime;
      }
    });

    const result = [dolphin, lion, bear, wolf].sort((a, b) => b - a);

    let fourChronotype: FourChronotype;

    switch (result[0]) {
      case dolphin:
        fourChronotype = "海豚型";
        break;
      case lion:
        fourChronotype = "狮子型";
        break;
      case bear:
        fourChronotype = "熊型";
        break;
      case wolf:
        fourChronotype = "狼型";
        break;
      default:
        fourChronotype = "数据出错";
        break;
    }

    return fourChronotype;
  },
  /**
   * 获取时型分析
   */
  getChronotype: (
    twoChronotype: TwoChronotype,
    fourChronotype: FourChronotype
  ): string => {
    let description = "";
    switch (fourChronotype) {
      case "海豚型":
        description = "敏感聪慧、注重细节的完美主义者";
        break;
      case "熊型":
        description = "值得信赖、思维开阔的合作者";
        break;
      case "狮子型":
        description = "思维缜密、精力充沛的领导者";
        break;
      case "狼型":
        description = "情感强烈的创造者、冒险家";
        break;
    }

    return twoChronotype + " · " + fourChronotype + "｜" + description;
  },

  /**
   * 获取用时效率
   */
  getTimeEfficiency: (statDateList: readonly StatDate[]) => {
    let totalTime = 0;
    let totalDay = statDateList.length;
    statDateList.forEach(statDate => {
      if (statDate.totalTime !== undefined) {
        totalTime += statDate.totalTime;
      }
    });
    if (totalDay === 0) {
      return "0%";
    } else {
      return (
        ((totalTime / (totalDay * 18 * 3600 * 1000)) * 100).toFixed(2) + "%"
      );
    }
  },

  /**
   * 获取番茄效率
   */
  getTomatoEfficiency: (statDateList: readonly StatDate[]) => {
    let totalTomatoNumber = 0;
    let totalDay = statDateList.length;
    statDateList.forEach(statDate => {
      totalTomatoNumber += statDate.tomatoList.length;
    });
    if (totalDay === 0) {
      return "0%";
    } else {
      return ((totalTomatoNumber / (totalDay * 18 * 2)) * 100).toFixed(2) + "%";
    }
  },

  /**
   * 获取番茄效率标准差
   */
  getTomatoStandardDeviation: (statDateList: readonly StatDate[]) => {
    // 今日的七组数据
    let deepNight = 0;
    let earlyMorning = 0;
    let morning = 0;
    let noon = 0;
    let afternoon = 0;
    let dusk = 0;
    let evening = 0;

    statDateList.forEach(statDate => {
      statDate.tomatoList.forEach(tomato => {
        const hour = UI.getHour(tomato.attributes.startTime.getTime());

        if (0 <= hour && hour < 6) {
          deepNight++;
        }
        if (6 <= hour && hour < 8) {
          earlyMorning++;
        }
        if (8 <= hour && hour < 12) {
          morning++;
        }
        if (12 <= hour && hour < 14) {
          noon++;
        }
        if (14 <= hour && hour < 18) {
          afternoon++;
        }
        if (18 <= hour && hour < 20) {
          dusk++;
        }
        if (20 <= hour && hour < 24) {
          evening++;
        }
      });
    });

    deepNight = deepNight / statDateList.length;
    earlyMorning = earlyMorning / statDateList.length;
    morning = morning / statDateList.length;
    noon = noon / statDateList.length;
    afternoon = afternoon / statDateList.length;
    dusk = dusk / statDateList.length;
    evening = evening / statDateList.length;

    return Mathematic.standardDeviation([
      evening,
      dusk,
      afternoon,
      noon,
      morning,
      earlyMorning,
      deepNight
    ]);
  },

  /**
   * 获取时间效率标准差
   */
  getTimeStandardDeviation: (statDateList: readonly StatDate[]): number => {
    // 今日的七组数据
    let deepNight = 0;
    let earlyMorning = 0;
    let morning = 0;
    let noon = 0;
    let afternoon = 0;
    let dusk = 0;
    let evening = 0;

    statDateList.forEach(statDate => {
      statDate.tomatoList.forEach(tomato => {
        const hour = UI.getHour(tomato.attributes.startTime.getTime());

        if (tomato.createdAt === undefined) {
          throw "tomato.createdAt is undefined";
        }

        const duration =
          tomato.createdAt.getTime() - tomato.attributes.startTime.getTime();

        if (0 <= hour && hour < 6) {
          deepNight += duration;
        }
        if (6 <= hour && hour < 8) {
          earlyMorning += duration;
        }
        if (8 <= hour && hour < 12) {
          morning += duration;
        }
        if (12 <= hour && hour < 14) {
          noon += duration;
        }
        if (14 <= hour && hour < 18) {
          afternoon += duration;
        }
        if (18 <= hour && hour < 20) {
          dusk += duration;
        }
        if (20 <= hour && hour < 24) {
          evening += duration;
        }
      });
    });

    deepNight = deepNight / statDateList.length;
    earlyMorning = earlyMorning / statDateList.length;
    morning = morning / statDateList.length;
    noon = noon / statDateList.length;
    afternoon = afternoon / statDateList.length;
    dusk = dusk / statDateList.length;
    evening = evening / statDateList.length;

    const list = [
      evening,
      dusk,
      afternoon,
      noon,
      morning,
      earlyMorning,
      deepNight
    ];

    const result = Mathematic.standardDeviation(list);

    return result;
  },

  // 时段平均
  getPeriodTime: (statDateList: readonly StatDate[]) => {
    // 今日的七组数据
    let deepNight = 0;
    let earlyMorning = 0;
    let morning = 0;
    let noon = 0;
    let afternoon = 0;
    let dusk = 0;
    let evening = 0;

    statDateList.forEach(statDate => {
      statDate.tomatoList.forEach(tomato => {
        const hour = UI.getHour(tomato.attributes.startTime.getTime());

        if (tomato.createdAt === undefined) {
          throw "tomato.createdAt is undefined";
        }

        const duration =
          tomato.createdAt.getTime() - tomato.attributes.startTime.getTime();

        if (0 <= hour && hour < 6) {
          deepNight += duration;
        }
        if (6 <= hour && hour < 8) {
          earlyMorning += duration;
        }
        if (8 <= hour && hour < 12) {
          morning += duration;
        }
        if (12 <= hour && hour < 14) {
          noon += duration;
        }
        if (14 <= hour && hour < 18) {
          afternoon += duration;
        }
        if (18 <= hour && hour < 20) {
          dusk += duration;
        }
        if (20 <= hour && hour < 24) {
          evening += duration;
        }
      });
    });

    deepNight = deepNight / statDateList.length;
    earlyMorning = earlyMorning / statDateList.length;
    morning = morning / statDateList.length;
    noon = noon / statDateList.length;
    afternoon = afternoon / statDateList.length;
    dusk = dusk / statDateList.length;
    evening = evening / statDateList.length;

    return Mathematic.average([
      evening,
      dusk,
      afternoon,
      noon,
      morning,
      earlyMorning,
      deepNight
    ]);
  },
  getPeriodTomato: (statDateList: readonly StatDate[]) => {
    // 今日的七组数据
    let deepNight = 0;
    let earlyMorning = 0;
    let morning = 0;
    let noon = 0;
    let afternoon = 0;
    let dusk = 0;
    let evening = 0;

    statDateList.forEach(statDate => {
      statDate.tomatoList.forEach(tomato => {
        const hour = UI.getHour(tomato.attributes.startTime.getTime());

        if (0 <= hour && hour < 6) {
          deepNight++;
        }
        if (6 <= hour && hour < 8) {
          earlyMorning++;
        }
        if (8 <= hour && hour < 12) {
          morning++;
        }
        if (12 <= hour && hour < 14) {
          noon++;
        }
        if (14 <= hour && hour < 18) {
          afternoon++;
        }
        if (18 <= hour && hour < 20) {
          dusk++;
        }
        if (20 <= hour && hour < 24) {
          evening++;
        }
      });
    });

    deepNight = deepNight / statDateList.length;
    earlyMorning = earlyMorning / statDateList.length;
    morning = morning / statDateList.length;
    noon = noon / statDateList.length;
    afternoon = afternoon / statDateList.length;
    dusk = dusk / statDateList.length;
    evening = evening / statDateList.length;

    return Mathematic.average([
      evening,
      dusk,
      afternoon,
      noon,
      morning,
      earlyMorning,
      deepNight
    ]);
  },

  /**
   * 获取周数据
   */
  getWeekStatData: (
    statDateList: readonly StatDate[],
    chartMode: ChartMode
  ) => {
    let monday: number = 0;
    let tuesday: number = 0;
    let wednesday: number = 0;
    let thursday: number = 0;
    let friday: number = 0;
    let saturday: number = 0;
    let sunday: number = 0;

    let mondayNumber: number = 0;
    let tuesdayNumber: number = 0;
    let wednesdayNumber: number = 0;
    let thursdayNumber: number = 0;
    let fridayNumber: number = 0;
    let saturdayNumber: number = 0;
    let sundayNumber: number = 0;

    statDateList.forEach(statDate => {
      if (statDate.totalTime !== undefined) {
        const dayOfWeek = new Date(statDate.timeStamp).getDay();
        switch (dayOfWeek) {
          case 0:
            sunday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            sundayNumber++;
            break;
          case 1:
            monday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            mondayNumber++;
            break;
          case 2:
            tuesday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            tuesdayNumber++;
            break;
          case 3:
            wednesday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            wednesdayNumber++;
            break;
          case 4:
            thursday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            thursdayNumber++;
            break;
          case 5:
            friday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            fridayNumber++;
            break;
          case 6:
            saturday +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime / (1000 * 3600);
            saturdayNumber++;
            break;
        }
      }
    });

    return [
      Mathematic.keepDecimal(monday / mondayNumber, 2),
      Mathematic.keepDecimal(tuesday / tuesdayNumber, 2),
      Mathematic.keepDecimal(wednesday / wednesdayNumber, 2),
      Mathematic.keepDecimal(thursday / thursdayNumber, 2),
      Mathematic.keepDecimal(friday / fridayNumber, 2),
      Mathematic.keepDecimal(saturday / saturdayNumber, 2),
      Mathematic.keepDecimal(sunday / sundayNumber, 2)
    ];
  },

  /**
   * 获取月数据
   */
  getMonthStatData: (
    statDateList: readonly StatDate[],
    chartMode: ChartMode
  ) => {
    let january: number = 0;
    let february: number = 0;
    let march: number = 0;
    let april: number = 0;
    let may: number = 0;
    let june: number = 0;
    let july: number = 0;
    let auguest: number = 0;
    let september: number = 0;
    let october: number = 0;
    let november: number = 0;
    let december: number = 0;

    statDateList.forEach(statDate => {
      if (statDate.totalTime !== undefined) {
        const month = new Date(statDate.timeStamp).getMonth() + 1;
        switch (month) {
          case 1:
            january +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 2:
            february +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 3:
            march +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 4:
            april +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 5:
            may +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 6:
            june +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 7:
            july +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 8:
            auguest +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 9:
            september +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 10:
            october +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 11:
            november +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
          case 12:
            december +=
              chartMode === "tomato"
                ? statDate.tomatoList.length
                : statDate.totalTime;
            break;
        }
      }
    });

    return [
      january,
      february,
      march,
      april,
      may,
      june,
      july,
      auguest,
      september,
      october,
      november,
      december
    ];
  }
};
