import AV from "leancloud-storage";
import { Ref } from "@vue/composition-api";
import { UI } from "@/lib/vue-utils";
import { ElementVue, StatAbilityDate } from "@/lib/types/vue-viewmodels";
import Api from "@/lib/api";
export default {
  init: async (
    vue: ElementVue,
    statAbilityDateList: Ref<StatAbilityDate[]>
  ) => {
    // 获取传入参数
    const user = Api.getCurrentUser();

    // 如果未登录，提示用户请先登录
    if (user === null) {
      UI.showNotification(vue.$notify, "尚未登录", "请先去登录", "warning");
      return;
    }

    const loadingInstance = UI.showLoading(vue.$loading, "正在获取能力记录...");

    try {
      const statAbilityList = await Api.fetchStatAbilityList(user);

      statAbilityDateList.value = await addPLanListOfStatAbilityList(
        addStatAbilityList(getStatAbilityDateList(statAbilityList))
      );

      console.log("statAbilityDateList", statAbilityDateList.value);
      UI.hideLoading(loadingInstance);
    } catch (error) {
      UI.hideLoading(loadingInstance);
      UI.showNotification(
        vue.$notify,
        "获取统计能力列表失败",
        `错误原因：${error.message}`,
        "error"
      );
    }

    function getStatAbilityDateList(
      statAbilityList: AV.Object[]
    ): StatAbilityDate[] {
      const statAbilityDateList: StatAbilityDate[] = [];
      let tDate: string = "";

      statAbilityList.forEach(statAbility => {
        if (
          tDate !==
          UI.dateToYearMonthDay(
            statAbility.attributes.tomatoOfAbility.attributes.startTime
          )
        ) {
          tDate = UI.dateToYearMonthDay(
            statAbility.attributes.tomatoOfAbility.attributes.startTime
          );
          statAbilityDateList.push({
            date: tDate,
            todayAbilityNumber: 1,
            totalTime:
              (statAbility.attributes.tomatoOfAbility
                .createdAt as Date).getTime() -
              statAbility.attributes.tomatoOfAbility.attributes.startTime.getTime(),
            abilityList: [statAbility]
          });
        } else {
          let isStatExist = false;
          statAbilityDateList[
            statAbilityDateList.length - 1
          ].abilityList.forEach(oldStatAbility => {
            if (
              oldStatAbility.attributes.name === statAbility.attributes.name
            ) {
              isStatExist = true;
            }
          });

          if (!isStatExist) {
            statAbilityDateList[statAbilityDateList.length - 1]
              .todayAbilityNumber++;
          }

          let isSameTime = false;
          statAbilityDateList[
            statAbilityDateList.length - 1
          ].abilityList.forEach(oldStatAbility => {
            if (
              oldStatAbility.attributes.tomatoOfAbility.attributes.startTime ===
                statAbility.attributes.tomatoOfAbility.attributes.startTime &&
              oldStatAbility.attributes.tomatoOfAbility.createdAt ===
                statAbility.attributes.tomatoOfAbility.createdAt
            ) {
              isSameTime = true;
            }
          });

          if (!isSameTime) {
            statAbilityDateList[statAbilityDateList.length - 1].totalTime +=
              (statAbility.attributes.tomatoOfAbility
                .createdAt as Date).getTime() -
              statAbility.attributes.tomatoOfAbility.attributes.startTime.getTime();
          }

          statAbilityDateList[statAbilityDateList.length - 1].abilityList.push(
            statAbility
          );
        }
      });
      return statAbilityDateList;
    }

    function addStatAbilityList(statAbilityDateList: StatAbilityDate[]) {
      statAbilityDateList.forEach(statAbilityDate => {
        statAbilityDate.statAbilityList = [];
        statAbilityDate.abilityList.forEach(ability => {
          // 判断 ability 是否已经被加入到 statAbilityDate.statAbilityList 中
          let isAbilityInStatAbilityList = false;
          // 记录 ability 在 statAbilityDate.statAbilityList 中的位置信息
          let tIndex = -1;

          if (statAbilityDate.statAbilityList === undefined) {
            throw "statAbilityDate.statAbilityList is undefined";
          }

          statAbilityDate.statAbilityList.forEach((statAbility, index) => {
            if (statAbility.id === ability.id) {
              isAbilityInStatAbilityList = true;
              tIndex = index;
            }
          });

          if (isAbilityInStatAbilityList) {
            statAbilityDate.statAbilityList[tIndex].attributes
              .todayTomatoNumber++;
            statAbilityDate.statAbilityList[tIndex].attributes.todayTotalTime +=
              ability.attributes.tomatoOfAbility.createdAt.getTime() -
              ability.attributes.tomatoOfAbility.attributes.startTime.getTime();
          } else {
            ability.attributes.todayTomatoNumber = 1;
            ability.attributes.todayTotalTime =
              ability.attributes.tomatoOfAbility.createdAt.getTime() -
              ability.attributes.tomatoOfAbility.attributes.startTime.getTime();
            statAbilityDate.statAbilityList.push(ability);
          }
        });
      });
      return statAbilityDateList;
    }

    async function addPLanListOfStatAbilityList(
      statAbilityDateList: StatAbilityDate[]
    ) {
      const tempAbilityList: AV.Object[] = [];
      statAbilityDateList.forEach(statAbilityDate => {
        if (statAbilityDate.statAbilityList !== undefined) {
          statAbilityDate.statAbilityList.forEach(statAbility => {
            let isAbilityInList = false;
            tempAbilityList.forEach(tempAbility => {
              if (tempAbility.id === statAbility.id) {
                isAbilityInList = true;
              }
            });
            if (!isAbilityInList) {
              tempAbilityList.push(statAbility);
            }
          });
        }
      });
      await Api.fetchPlanListOfAbilityList(tempAbilityList);
      statAbilityDateList.forEach(statAbilityDate => {
        if (statAbilityDate.statAbilityList !== undefined) {
          statAbilityDate.statAbilityList.forEach(statAbility => {
            tempAbilityList.forEach(tempAbility => {
              if (statAbility.id === tempAbility.id) {
                statAbility.attributes.targetTomatoNumber =
                  tempAbility.attributes.targetTomatoNumber;
              }
            });
          });
        }
      });
      return statAbilityDateList;
    }
  }
};
