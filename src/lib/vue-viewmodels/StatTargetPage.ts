import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import { ElementVue, StatTargetDate } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";
export default {
  init: async (vue: ElementVue, statTargetDateList: Ref<StatTargetDate[]>) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取目标记录...");

    try {
      const statTargetList = await Api.fetchStatTargetList(user);

      statTargetDateList.value = await addPlanListOfStatTargetList(
        addStatTargetList(getStatTargetDateList(statTargetList))
      );

      console.log("statTargetDateList", statTargetDateList.value);

      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取统计目标列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }

    function getStatTargetDateList(
      statTargetList: AV.Object[]
    ): StatTargetDate[] {
      const statTargetDateList: StatTargetDate[] = [];
      let tDate: string = "";

      statTargetList.forEach(statTarget => {
        if (
          tDate !==
          UI.dateToYearMonthDay(
            statTarget.attributes.tomatoOfTarget.attributes.startTime
          )
        ) {
          tDate = UI.dateToYearMonthDay(
            statTarget.attributes.tomatoOfTarget.attributes.startTime
          );
          statTargetDateList.push({
            date: tDate,
            todayTargetNumber: 1,
            totalTime:
              (statTarget.attributes.tomatoOfTarget
                .createdAt as Date).getTime() -
              statTarget.attributes.tomatoOfTarget.attributes.startTime.getTime(),
            targetList: [statTarget]
          });
        } else {
          let isStatExist = false;
          statTargetDateList[statTargetDateList.length - 1].targetList.forEach(
            oldStatTarget => {
              if (
                oldStatTarget.attributes.name === statTarget.attributes.name
              ) {
                isStatExist = true;
              }
            }
          );

          if (!isStatExist) {
            statTargetDateList[statTargetDateList.length - 1]
              .todayTargetNumber++;
          }

          let isSameTime = false;
          statTargetDateList[statTargetDateList.length - 1].targetList.forEach(
            oldStatTarget => {
              if (
                oldStatTarget.attributes.tomatoOfTarget.attributes.startTime ===
                  statTarget.attributes.tomatoOfTarget.attributes.startTime &&
                oldStatTarget.attributes.tomatoOfTarget.createdAt ===
                  statTarget.attributes.tomatoOfTarget.createdAt
              ) {
                isSameTime = true;
              }
            }
          );
          if (!isSameTime) {
            statTargetDateList[statTargetDateList.length - 1].totalTime +=
              (statTarget.attributes.tomatoOfTarget
                .createdAt as Date).getTime() -
              statTarget.attributes.tomatoOfTarget.attributes.startTime.getTime();
          }

          statTargetDateList[statTargetDateList.length - 1].targetList.push(
            statTarget
          );
        }
      });
      return statTargetDateList;
    }

    function addStatTargetList(statTargetDateList: StatTargetDate[]) {
      statTargetDateList.forEach(statTargetDate => {
        statTargetDate.statTargetList = [];
        statTargetDate.targetList.forEach(target => {
          // 判断 target 是否已经被加入到 statTargetDate.statTargetList 中
          let isTargetInStatTargetList = false;
          // 记录 target 在 statTargetDate.statTargetList 中的位置信息
          let tIndex = -1;

          if (statTargetDate.statTargetList === undefined) {
            throw "statTargetDate.statTargetList is undefined";
          }

          statTargetDate.statTargetList.forEach((statTarget, index) => {
            if (statTarget.id === target.id) {
              isTargetInStatTargetList = true;
              tIndex = index;
            }
          });

          if (isTargetInStatTargetList) {
            statTargetDate.statTargetList[tIndex].attributes
              .todayTomatoNumber++;
            statTargetDate.statTargetList[
              tIndex
            ].attributes.todayTotalTime += target.attributes.tomatoOfTarget
              .attributes.duration
              ? target.attributes.tomatoOfTarget.attributes.duration
              : target.attributes.tomatoOfTarget.createdAt.getTime() -
                target.attributes.tomatoOfTarget.attributes.startTime.getTime();
          } else {
            target.attributes.todayTomatoNumber = 1;
            target.attributes.todayTotalTime = target.attributes.tomatoOfTarget
              .attributes.duration
              ? target.attributes.tomatoOfTarget.attributes.duration
              : target.attributes.tomatoOfTarget.createdAt.getTime() -
                target.attributes.tomatoOfTarget.attributes.startTime.getTime();
            statTargetDate.statTargetList.push(target);
          }
        });
      });
      return statTargetDateList;
    }

    async function addPlanListOfStatTargetList(
      statTargetDateList: StatTargetDate[]
    ) {
      const tempTargetList: AV.Object[] = [];
      statTargetDateList.forEach(statTargetDate => {
        if (statTargetDate.statTargetList !== undefined) {
          statTargetDate.statTargetList.forEach(statTarget => {
            let isTargetInList = false;
            tempTargetList.forEach(tempTarget => {
              if (tempTarget.id === statTarget.id) {
                isTargetInList = true;
              }
            });
            if (!isTargetInList) {
              tempTargetList.push(statTarget);
            }
          });
        }
      });
      await Api.fetchPlanListOfTargetList(tempTargetList);
      statTargetDateList.forEach(statTargetDate => {
        if (statTargetDate.statTargetList !== undefined) {
          statTargetDate.statTargetList.forEach(statTarget => {
            tempTargetList.forEach(tempTarget => {
              if (statTarget.id === tempTarget.id) {
                statTarget.attributes.targetTomatoNumber =
                  tempTarget.attributes.targetTomatoNumber;
              }
            });
          });
        }
      });
      return statTargetDateList;
    }
  }
};
