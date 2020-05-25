import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import {
  ElementVue,
  StatTomatoDate,
  TomatoStatStatusMode
} from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";

export default {
  init: async (
    vue: ElementVue,
    statTomatoDateList: Ref<StatTomatoDate[]>,
    dailyPlanList: Ref<AV.Object[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取番茄列表...");

    try {
      if (dailyPlanList.value.length === 0) {
        dailyPlanList.value = await Api.fetchPlanList(user, "daily");
      }

      const tomatoList = await Api.fetchTomatoList(user);

      const targetTomatoNumber = getTargetTomatoNumber(dailyPlanList);

      statTomatoDateList.value = addStatTomatoList(
        getStatTomatoDateList(tomatoList, targetTomatoNumber)
      );

      console.log("statTomatoDateList", statTomatoDateList.value);

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

    function addStatTomatoList(statTomatoDateList: StatTomatoDate[]) {
      statTomatoDateList.forEach(statTomatoDate => {
        statTomatoDate.statTomatoList = [];
        statTomatoDate.tomatoList.forEach(tomato => {
          // 判断 tomato 是否已经被加入到 statTomatoDate.statTomatoList 中
          let isTomatoInStatTomatoList = false;
          // 记录 tomato 在 statTomatoDate.statTomatoList 中的位置信息
          let tIndex = -1;

          if (statTomatoDate.statTomatoList === undefined) {
            throw "statTomatoDate.statTomatoList is undefined";
          }

          statTomatoDate.statTomatoList.forEach((statTomato, index) => {
            if (statTomato.attributes.name === tomato.attributes.name) {
              isTomatoInStatTomatoList = true;
              tIndex = index;
            }
          });

          if (isTomatoInStatTomatoList) {
            statTomatoDate.statTomatoList[tIndex].attributes
              .todayTomatoNumber++;
            statTomatoDate.statTomatoList[tIndex].attributes.todayTotalTime +=
              (tomato.createdAt as Date).getTime() -
              tomato.attributes.startTime.getTime();
          } else {
            tomato.attributes.todayTomatoNumber = 1;
            tomato.attributes.todayTotalTime =
              (tomato.createdAt as Date).getTime() -
              tomato.attributes.startTime.getTime();
            statTomatoDate.statTomatoList.push(tomato);
          }
        });
      });
      return statTomatoDateList;
    }

    function getStatTomatoDateList(
      tomatoList: AV.Object[],
      targetTomatoNumber: number
    ): StatTomatoDate[] {
      const statTomatoDateList: StatTomatoDate[] = [];
      let tDate: string = "";
      tomatoList.forEach(tomato => {
        if (tDate !== UI.dateToYearMonthDay(tomato.attributes.startTime)) {
          tDate = UI.dateToYearMonthDay(tomato.attributes.startTime);
          statTomatoDateList.push({
            date: tDate,
            timeStamp: tomato.attributes.startTime.getTime(),
            todayTomatoNumber: 1,
            targetTomatoNumber: targetTomatoNumber,
            totalTime:
              (tomato.createdAt as Date).getTime() -
              tomato.attributes.startTime.getTime(),
            tomatoList: [tomato]
          });
        } else {
          statTomatoDateList[statTomatoDateList.length - 1].todayTomatoNumber++;
          statTomatoDateList[statTomatoDateList.length - 1].totalTime +=
            (tomato.createdAt as Date).getTime() -
            tomato.attributes.startTime.getTime();
          statTomatoDateList[statTomatoDateList.length - 1].tomatoList.push(
            tomato
          );
        }
      });
      return statTomatoDateList;
    }

    function getTargetTomatoNumber(dailyPlanList: Ref<AV.Object[]>): number {
      let targetTomatoNumber = 0;
      dailyPlanList.value.forEach(plan => {
        if (
          plan.attributes.target !== undefined &&
          plan.attributes.target !== null
        ) {
          targetTomatoNumber += plan.attributes.target;
        }
      });
      return targetTomatoNumber;
    }
  },
  changeStatStatusMode: (statStatusMode: Ref<TomatoStatStatusMode>) => {
    switch (statStatusMode.value) {
      case "detail":
        statStatusMode.value = "stat";
        break;
      case "simple":
        statStatusMode.value = "detail";
        break;
      case "stat":
        statStatusMode.value = "date";
        break;
      case "date":
        statStatusMode.value = "simple";
        break;
    }
  }
};
