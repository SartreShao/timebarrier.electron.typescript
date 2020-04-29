import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";
import { PlanType } from "./types/vue-viewmodels";

const Plan = AV.Object.extend("Plan");
const Tomato = AV.Object.extend("Tomato");
const TomatoPlan = AV.Object.extend("TomatoPlan");
const Ability = AV.Object.extend("Ability");
const AbilityPlan = AV.Object.extend("AbilityPlan");
const TargetSubject = AV.Object.extend("TargetSubject");
const Target = AV.Object.extend("Target");
const AbilityTarget = AV.Object.extend("AbilityTarget");
const LevelRule = AV.Object.extend("LevelRule");

export default {
  init: () => {
    AV.init({
      appId: "1vrLSxhVS6DqUox0scqmyhCt-gzGzoHsz",
      appKey: "ywrEEUSG5sE0OyMuXXvW7w8M",
      serverURLs: "https://timebarrier.api.hearfresh.cn"
    });
  },
  /**
   * 获取当前的 LeanCloud User
   * @remark 通用函数
   * @returns { AV.User | null } 如果登录了，返回 AV.User 的实例；如果未登录，返回 null 值
   */
  getCurrentUser: () => {
    const currentUser = AV.User.current();
    Log.success("getCurrentUser", currentUser);
    return currentUser;
  },
  /**
   * 判断当前用户是否已登录 LeanCloud
   * @remark 通用函数
   * @returns { boolean } 当用户登录时，返回 true；未登录时返回 false
   */
  isLoggedIn(): boolean {
    const result = this.getCurrentUser() !== null;
    Log.success("isLoggedIn", result);
    return result;
  },
  /**
   * 使用用户名、验证码登录
   * @remark 通用函数
   * @param phoneNumber 手机号
   * @param verificationCode 验证码
   *
   * @returns { AV.User | Error }
   */
  loginWithVerificationCode: (
    phoneNumber: string,
    verificationCode: string
  ): Promise<AV.User> =>
    new Promise(async (resolve, reject) => {
      try {
        const user = await AV.User.signUpOrlogInWithMobilePhone(
          phoneNumber,
          verificationCode
        );
        Log.success("loginWithVerificationCode", user);
        resolve(user);
      } catch (error) {
        Log.error("loginWithVerificationCode", error);
        reject(error);
      }
    }),
  /**
   * 发送验证码
   * @remark 通用函数
   * @param phoneNumber 手机号
   * @returns { undefined | Error }
   */
  sendSmsVerifyCode: (phoneNumber: string) =>
    new Promise(async (resolve, reject) => {
      try {
        await AV.Cloud.requestSmsCode(phoneNumber);
        Log.success("sendSmsVerifyCode");
        resolve();
      } catch (error) {
        Log.error("sendSmsVerifyCode", error);
        reject(error);
      }
    }),
  /**
   * 保存所有的 PlanList
   */
  savePlanList: (objectList: AV.Object[]) =>
    new Promise(async (resolve, reject) => {
      try {
        await AV.Object.saveAll(objectList);
        Log.success("savePlanList", objectList);
        resolve(objectList);
      } catch (error) {
        Log.error("savePlanList", error);
        reject(error);
      }
    }),
  /**
   * 保存所有的 TargetList
   */
  saveTargetList: (objectList: AV.Object[]) =>
    new Promise(async (resolve, reject) => {
      try {
        await AV.Object.saveAll(objectList);
        Log.success("saveTargetList", objectList);
        resolve(objectList);
      } catch (error) {
        Log.error("savePlanList", error);
        reject(error);
      }
    }),
  /**
   * 保存所有的 TargetSubjectList
   */
  saveTargetSubjectList: (objectList: AV.Object[]) =>
    new Promise(async (resolve, reject) => {
      try {
        await AV.Object.saveAll(objectList);
        Log.success("saveTargetSubjectList", objectList);
        resolve(objectList);
      } catch (error) {
        Log.error("saveTargetSubjectList", error);
        reject(error);
      }
    }),
  /**
   * 获取计划（Plan）列表
   * @remark 「时间壁垒」专用函数
   * @param planType 需要获取的计划类型：临时计划 temporary | 每日计划 daily | 已完成的计划 completed
   * @param user 计划所属的用户
   * @param currentPage 可选参数，当前页码（从 1 开始）
   * @param pageSize 可选参数，每页加载数量（1-1000）
   *
   * @returns { Promise<AV.Object[]> | Error }
   */
  fetchPlanList: (
    user: AV.User,
    planType: PlanType | "completed",
    currentPage?: number,
    pageSize?: number
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const query = new AV.Query(Plan)
          .skip(
            currentPage ? (currentPage - 1) * (pageSize ? pageSize : 1000) : 0
          )
          .limit(pageSize ? pageSize : 1000)
          .equalTo("user", user)
          .ascending("order")
          .addDescending("createdAt");

        switch (planType) {
          case "temporary": {
            query.equalTo("type", "temporary");
            query.equalTo("isFinished", false);
            break;
          }
          case "daily": {
            query.equalTo("type", "daily");
            query.equalTo("isFinished", false);
            break;
          }
          case "completed": {
            query.equalTo("isFinished", true);
            break;
          }
        }
        const planList = await query.find();

        // 查询 plan 相关的 ability
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .include("plan")
          .include("ability")
          .containedIn("plan", planList)
          .find();

        // 添加属性：abilityListOfPlan - Plan 对应的 AbilityList
        // 添加属性：selected
        planList.forEach(plan => {
          plan.attributes.abilityListOfPlan = [];
          plan.attributes.selected = false;

          abilityPlanList.forEach(abilityPlan => {
            if (plan.id === abilityPlan.attributes.plan.id) {
              plan.attributes.abilityListOfPlan.push(
                abilityPlan.attributes.ability
              );
            }
          });
        });

        Log.success(`fetchPlanList ${planType}`, planList);
        resolve(planList);
      } catch (error) {
        Log.error(`fetchPlanList ${planType}`, error);
        reject(error);
      }
    }),
  /**
   * 创建 Plan
   *
   * @remark 时间壁垒专用函数
   * @param name 计划名称
   * @param type 计划类型
   * @param user 创建计划的人
   */
  createPlan: (
    name: string,
    type: PlanType,
    user: AV.User
  ): Promise<AV.Object> =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new Plan()
          .set("name", name)
          .set("type", type)
          .set("isFinished", false)
          .set("user", user)
          .set("order", 0)
          .save();
        Log.success("createPlan", plan);
        resolve(plan);
      } catch (error) {
        Log.error("createPlan", error);
        reject(error);
      }
    }),
  /**
   * 完成 Plan
   *
   * @remark 时间壁垒专用函数
   * @param planId 需要被标记为「完成」的 Plan 的 objectId
   */
  completePlan: (planId: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new AV.Query(Plan).get(planId);
        plan.set("isFinished", true);
        await plan.save();
        Log.success("completePlan", plan);
        resolve(plan);
      } catch (error) {
        Log.error("completePlan", error);
        reject(error);
      }
    }),
  /**
   * 取消完成 Plan
   *
   * @remark 时间壁垒专用函数
   * @param planId 需要被取消标记为「完成」的 Plan 的 objectId
   */
  cancelCompletePlan: (planId: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new AV.Query(Plan).get(planId);
        await plan.set("isFinished", false).save();
        Log.success("cancelCompletePlan", plan);
        resolve(plan);
      } catch (error) {
        Log.error("cancelCompletePlan", error);
        reject(error);
      }
    }),

  /**
   * 编辑 Plan
   *
   * @remark 时间壁垒专用函数
   * @param planId 计划的 objectId
   * @param name 计划的名称
   * @param type 计划的类型
   * @param description 计划的描述
   * @param isActived 计划是否被激活
   * @param isFinished 计划是否已经结束
   */
  editPlan: (
    planId: string,
    name: string,
    target: number,
    type: PlanType,
    description: string,
    isActived: boolean,
    isFinished: boolean,
    abilityIdList: string[]
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new AV.Query(Plan).get(planId);
        await plan
          .set("name", name)
          .set("target", target)
          .set("type", type)
          .set("description", description)
          .set("isActived", isActived)
          .set("isFinished", isFinished)
          .save();

        // 删除所有的相关的中间表
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .equalTo("plan", plan)
          .find();

        await AV.Object.destroyAll(abilityPlanList);

        // 添加所有的相关的中间表
        const list: AV.Object[] = [];
        abilityIdList.forEach(abilityId => {
          list.push(
            new AbilityPlan()
              .set("plan", AV.Object.createWithoutData(Plan, planId))
              .set("ability", AV.Object.createWithoutData(Ability, abilityId))
          );
        });

        await AV.Object.saveAll(list);
        Log.success("editPlan", plan);
        resolve(plan);
      } catch (error) {
        Log.error("editPlan", error);
        reject(error);
      }
    }),

  /**
   * 删除 Plan
   * @remark 时间壁垒专用函数
   * @param planId 计划的 objectId
   */
  deletePlan: (planId: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new AV.Query(Plan).get(planId);
        await plan.destroy();
        Log.success("deletePlan");
        resolve();
      } catch (error) {
        Log.error("deletePlan", error);
        reject(error);
      }
    }),
  /**
   * 创建 Tomato
   *
   * @remark 时间壁垒专用函数
   * @param name 番茄的名字
   * @param descending 番茄的描述
   * @param user 番茄的创建者
   */
  createTomato: (
    name: string,
    description: string,
    user: AV.User,
    startTime: Date
  ): Promise<AV.Object> =>
    new Promise(async (resolve, reject) => {
      try {
        const tomato = await new Tomato()
          .set("name", name)
          .set("user", user)
          .set("description", description)
          .set("startTime", startTime)
          .save();
        Log.success("createTomato", tomato);
        resolve(tomato);
      } catch (error) {
        Log.error("createTomato", error);
        reject(error);
      }
    }),
  /**
   * 创建 TomatoPlan
   *
   * @remark 时间壁垒专用函数
   * @param totamtoId 番茄的 objectId
   * @param planIdList 提交的 plan 的 id List
   */
  createTomatoPlan: (
    tomatoId: string,
    planIdList: string[]
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const tomatoPlanList: AV.Object[] = [];
        planIdList.forEach(planId => {
          const tomatoPlan = new TomatoPlan()
            .set("tomato", AV.Object.createWithoutData("Tomato", tomatoId))
            .set("plan", AV.Object.createWithoutData("Plan", planId));
          tomatoPlanList.push(tomatoPlan);
        });
        await AV.Object.saveAll(tomatoPlanList);
        Log.success("createTomatoPlan", tomatoPlanList);
        resolve(tomatoPlanList);
      } catch (error) {
        Log.error("createTomatoPlan", error);
        reject(error);
      }
    }),
  /**
   * 创建能力
   * @param name 能力名称
   * @param description 能力描述
   * @param isFinished 能力是否训练完毕
   * @param isActived 能力是否正在激活状态
   */
  createAbility: (
    name: string,
    user: AV.User,
    description: string,
    isFinished: boolean,
    isActived: boolean,
    colormap: string[]
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        // 本次的颜色
        let color: string = colormap[0];

        // 查询上一个颜色
        try {
          const lastAbility = await new AV.Query(Ability)
            .equalTo("user", user)
            .descending("createdAt")
            .first();

          if (lastAbility === undefined) {
            throw "lastAbility is undefined";
          }

          colormap.forEach((item, index) => {
            if (item === lastAbility.attributes.color) {
              color = colormap[(index + 1) % colormap.length];
            }
          });
        } catch (error) {
          // 没查到
        }

        const ability = await new Ability()
          .set("name", name)
          .set("user", user)
          .set("description", description)
          .set("isFinished", isFinished)
          .set("isActived", isActived)
          .set("color", color)
          .save();
        Log.success("createAbility", ability);
        resolve(ability);
      } catch (error) {
        Log.error("createAbility", error);
        reject(error);
      }
    }),
  /**
   * 请求 Ability 列表
   * @param user 用户名称
   * @param isFinished 计划是否已经被完成
   * @param isActived 计划是否被激活
   */
  fetchAbilityList: (
    user: AV.User,
    isFinished: boolean,
    isActived?: boolean,
    levelRuleList?: AV.Object[],
    fetchTargetList?: boolean,
    fetchPlanList?: boolean
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const query = await new AV.Query(Ability)
          .equalTo("user", user)
          .equalTo("isFinished", isFinished)
          .ascending("order")
          .addDescending("createdAt");

        if (isActived !== undefined) {
          query.equalTo("isActived", isActived);
        }

        const abilityList = await query.find();
        abilityList.forEach(ability => {
          ability.attributes.selected = false;
        });

        if (levelRuleList !== undefined) {
          abilityList.forEach(ability => {
            try {
              levelRuleList.forEach((levelRule, index) => {
                // 初始条件
                if (
                  index === 0 &&
                  ability.attributes.tomatoNumber <=
                    levelRule.attributes.tomatoNumber
                ) {
                  ability.attributes.levelPercent =
                    ability.attributes.tomatoNumber /
                    levelRule.attributes.tomatoNumber;

                  ability.attributes.levelName = levelRule.attributes.name;

                  ability.attributes.levelNumber = levelRule.attributes.level;
                  throw "level forEach break!";
                }
                // 正常情况
                else if (
                  index !== 0 &&
                  ability.attributes.tomatoNumber <=
                    levelRule.attributes.tomatoNumber
                ) {
                  ability.attributes.levelPercent =
                    ability.attributes.tomatoNumber /
                    (levelRule.attributes.tomatoNumber -
                      levelRuleList[index - 1].attributes.tomatoNumber);

                  ability.attributes.levelName = levelRule.attributes.name;

                  ability.attributes.levelNumber = levelRule.attributes.level;
                  throw "level forEach break!";
                }
              });
            } catch (error) {}
          });
        }

        if (fetchTargetList !== undefined && fetchTargetList === true) {
          // 获取相关 Target: targetListOfAbility
          const abilityTargetList = await new AV.Query(AbilityTarget)
            .include("target")
            .containedIn("ability", abilityList)
            .find();

          abilityList.forEach(ability => {
            ability.attributes.targetListOfAbility = [];
            abilityTargetList.forEach(abilityTarget => {
              if (ability.id === abilityTarget.attributes.ability.id) {
                ability.attributes.targetListOfAbility.push(
                  abilityTarget.attributes.target
                );
              }
            });
          });
        }

        if (fetchPlanList !== undefined && fetchPlanList === true) {
          // 获取相关 Plan: planListOfAbility
          const abilityPlanList = await new AV.Query(AbilityPlan)
            .include("plan")
            .containedIn("ability", abilityList)
            .find();

          abilityList.forEach(ability => {
            ability.attributes.planListOfAbility = [];
            abilityPlanList.forEach(abilityPlan => {
              if (ability.id === abilityPlan.attributes.ability.id) {
                ability.attributes.planListOfAbility.push(
                  abilityPlan.attributes.plan
                );
              }
            });
          });
        }

        Log.success("fetchAbilityList", abilityList);
        resolve(abilityList);
      } catch (error) {
        Log.error("fetchAbilityList", error);
        reject(error);
      }
    }),
  /**
   * 请求 AbilityPlan 列表
   * @param abilityId 能力 Id，可选参数
   * @param planId 计划 Id，可选参数
   */
  fetchAbilityPlanList: (
    abilityId: string | null,
    planId: string | null
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const query = new AV.Query(AbilityPlan)
          .include("plan")
          .include("ability");
        if (abilityId !== null) {
          query.equalTo(
            "ability",
            AV.Object.createWithoutData(Ability, abilityId)
          );
        }
        if (planId !== null) {
          query.equalTo("plan", AV.Object.createWithoutData(Plan, planId));
        }
        const abilityPlanList = await query.find();
        Log.success("fetchAbilityPlanList", abilityPlanList);
        resolve(abilityPlanList);
      } catch (error) {
        Log.error("fetchAbilityPlanList", error);
        reject(error);
      }
    }),
  /**
   * 请求 Ability 列表并且其中加入 selected 表示用户是否选择了该计划
   */
  fetchAbilityListWithPlanSelect: (planId: string): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const plan: AV.Object = await new AV.Query(Plan).get(planId);
        const user: string = plan.attributes.user;
        const abilityList = await new AV.Query(Ability)
          .equalTo("user", user)
          .equalTo("isFinished", false)
          .find();
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .equalTo("plan", AV.Object.createWithoutData(Plan, planId))
          .containedIn("ability", abilityList)
          .find();
        abilityList.forEach(ability => {
          ability.attributes.selected = false;
        });

        abilityPlanList.forEach(abilityPlan => {
          abilityList.forEach(ability => {
            if (abilityPlan.attributes.ability.id === ability.id) {
              ability.attributes.selected = true;
            }
          });
        });
        Log.success("fetchAbilityListWithPlanSelect", abilityList);
        resolve(abilityList);
      } catch (error) {
        console.log(error);
        Log.error("fetchAbilityListWithPlanSelect", error);
        reject(error);
      }
    }),
  /**
   * 请求 Ability 列表并且其中加入 selected 属性，表明该 Ability 是否被传入的 Target 关联
   */
  fetchAbilityListWithTargetSelect: (targetId: string): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const target: AV.Object = await new AV.Query(Target).get(targetId);
        const user: AV.User = target.attributes.user;
        const abilityList = await new AV.Query(Ability)
          .equalTo("user", user)
          .equalTo("isFinished", false)
          .find();
        const abilityTargetList = await new AV.Query(AbilityTarget)
          .equalTo("target", AV.Object.createWithoutData(Target, targetId))
          .containedIn("ability", abilityList)
          .find();
        abilityList.forEach(ability => {
          ability.attributes.selected = false;
        });
        abilityTargetList.forEach(abilityTarget => {
          abilityList.forEach(ability => {
            if (abilityTarget.attributes.ability.id === ability.id) {
              ability.attributes.selected = true;
            }
          });
        });
        Log.success("fetchAbilityListWithTargetSelect", abilityList);
        resolve(abilityList);
      } catch (error) {
        Log.error("fetchAbilityListWithTargetSelect", error);
        reject(error);
      }
    }),
  /**
   * 请求 TargetSubject
   * @param user 当前登录的用户
   */
  fetchTargetSubjectList: (user: AV.User): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        // 获取 TargetSubject 列表：目标目录列表
        const targetSubjectList = await new AV.Query(TargetSubject)
          .equalTo("user", user)
          .ascending("order")
          .addDescending("createdAt")
          .find();

        // 获取 TargetList 列表：目标列表
        const targetList = await new AV.Query(Target)
          .equalTo("user", user)
          .equalTo("isFinished", false)
          .containedIn("targetSubject", targetSubjectList)
          .include("targetSubject")
          .ascending("order")
          .addDescending("createdAt")
          .find();

        // 向 TargetSubjectList 中添加两个属性：
        // 1. targetListOfTargetSubject - 每个 targetSubject 关联的 TargetList
        // 2. showSubjectList - 是否要展示这些 TargetList
        targetSubjectList.forEach(targetSubject => {
          targetSubject.attributes.targetListOfTargetSubject = [];
          targetSubject.attributes.showSubjectList = true;
          targetList.forEach(target => {
            if (
              target.attributes.targetSubject !== undefined &&
              target.attributes.targetSubject !== null &&
              target.attributes.targetSubject.id === targetSubject.id
            ) {
              targetSubject.attributes.targetListOfTargetSubject.push(target);
            }
          });
        });

        // 下面要玩一个很牛逼的操作.....查询 TargetSubjectList 上的 TargetList 的关联的 AbilityList 都有什么

        // 首先获取 targetIdList
        const targetIdList: string[] = [];
        targetSubjectList.forEach(targetSubject => {
          targetSubject.attributes.targetListOfTargetSubject.forEach(
            (target: AV.Object) => {
              if (target.id !== undefined) {
                targetIdList.push(target.id);
              }
            }
          );
        });

        // 接下来请求关联的 abilityTargetList
        const abilityTargetList = await new AV.Query(AbilityTarget)
          .include("ability")
          .include("target")
          .containedIn(
            "target",
            targetIdList.map(targetId =>
              AV.Object.createWithoutData("Target", targetId)
            )
          )
          .find();

        // 接下来将它们组合到一起
        targetSubjectList.forEach(targetSubject => {
          targetSubject.attributes.targetListOfTargetSubject.forEach(
            (target: AV.Object) => {
              target.attributes.abilityListOfTarget = [];
              abilityTargetList.forEach(abilityTarget => {
                if (abilityTarget.attributes.target.id === target.id) {
                  target.attributes.abilityListOfTarget.push(
                    abilityTarget.attributes.ability
                  );
                }
              });
            }
          );
        });
        Log.success("fetchTargetSubjectList", targetSubjectList);
        resolve(targetSubjectList);
      } catch (error) {
        console.log(error);
        Log.error("fetchTargetSubjectList", error);
        reject(error);
      }
    }),
  /**
   * 请求 Target 列表
   */
  fetchTargetList: (
    user: AV.User,
    targetType: "completed" | "unsubjective"
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const targetListQuery = new AV.Query(Target)
          .equalTo("user", user)
          .ascending("order")
          .addDescending("createdAt")
          .include("targetSubject");

        if (targetType === "completed") {
          targetListQuery.equalTo("isFinished", true);
        } else if (targetType === "unsubjective") {
          targetListQuery.equalTo("targetSubject", null);
          targetListQuery.equalTo("isFinished", false);
        }

        // 获取 targetList
        const targetList = await targetListQuery.find();

        // 获取 abilityTargetLIst
        const abilityTargetList = await new AV.Query(AbilityTarget)
          .include("target")
          .include("ability")
          .containedIn("target", targetList)
          .find();

        // 将 abilityTargetList 存入 targetList 中
        targetList.forEach(target => {
          target.attributes.abilityListOfTarget = [];
          abilityTargetList.forEach(abilityTarget => {
            if (target.id === abilityTarget.attributes.target.id) {
              target.attributes.abilityListOfTarget.push(
                abilityTarget.attributes.ability
              );
            }
          });
        });

        Log.success("fetchTargetList", targetList);
        resolve(targetList);
      } catch (error) {
        Log.error("fetchTargetList", error);
        reject(error);
      }
    }),
  /**
   * 创建目标
   */
  createTarget: (
    user: AV.User,
    targetSubjectId: string | null,
    name: string,
    description: string,
    validityType: "time-bound" | "indefinite",
    validity: Date | null,
    abilityList: { id: string; name: string }[],
    isActived: boolean,
    isFinished: boolean,
    colormap: string[]
  ): Promise<AV.Object> =>
    new Promise(async (resolve, reject) => {
      try {
        // 查询上一个的颜色
        let color: string = colormap[0];

        try {
          const lastTarget = await new AV.Query(Target)
            .equalTo("user", user)
            .descending("createdAt")
            .first();
          if (lastTarget === undefined) {
            throw "lastTarget is undefined";
          }
          colormap.forEach((item, index) => {
            if (item === lastTarget.attributes.color) {
              color = colormap[(index + 1) % colormap.length];
            }
          });
        } catch (error) {
          // 没查到
        }

        const target = new Target()
          .set("user", user)
          .set("name", name)
          .set("description", description)
          .set("validityType", validityType)
          .set("validity", validity)
          .set("isActived", isActived)
          .set("color", color)
          .set("isFinished", isFinished);

        if (targetSubjectId !== null) {
          target.set(
            "targetSubject",
            AV.Object.createWithoutData("TargetSubject", targetSubjectId)
          );
        }

        await target.save();

        const abilityTargetList: AV.Object[] = [];

        abilityList.forEach(ability => {
          const abilityTarget = new AbilityTarget()
            .set("ability", AV.Object.createWithoutData("Ability", ability.id))
            .set("target", target);
          abilityTargetList.push(abilityTarget);
        });

        if (abilityTargetList.length !== 0) {
          await AV.Object.saveAll(abilityTargetList);
        }

        Log.success("createTarget", target);
        resolve(target);
      } catch (error) {
        Log.error("createTarget", error);
        reject(error);
      }
    }),

  /**
   * 创建目标类别
   */
  createTargetSubject: (user: AV.User, name: string): Promise<AV.Object> =>
    new Promise(async (resolve, reject) => {
      try {
        const targetSubject = await new TargetSubject()
          .set("user", user)
          .set("name", name)
          .save();
        Log.success("createTargetSubject", targetSubject);
        resolve(targetSubject);
      } catch (error) {
        Log.error("createTargetSubject", error);
        reject(error);
      }
    }),

  /**
   * 删除目标
   */
  deleteTarget: (targetId: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const target = await new AV.Query(Target).get(targetId);
        await target.destroy();
        Log.success("deleteTarget");
        resolve();
      } catch (error) {
        Log.error("deleteTarget", error);
        reject(error);
      }
    }),
  /**
   * 删除目标目录
   */
  deleteTargetSubject: (targetSubjectId: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const targetSubject = await new AV.Query(TargetSubject).get(
          targetSubjectId
        );
        await targetSubject.destroy();
        Log.success("deleteTargetSubject");
        resolve();
      } catch (error) {
        Log.error("deleteTargetSubject", error);
        reject(error);
      }
    }),
  /**
   * 保存目标
   */
  saveTarget: (
    targetId: string,
    user: AV.User,
    targetSubjectId: string | null,
    name: string,
    description: string,
    validityType: "time-bound" | "indefinite",
    validity: Date | null,
    abilityList: { id: string; name: string }[],
    isActived: boolean,
    isFinished: boolean
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const target = await new AV.Query(Target).get(targetId);
        target
          .set("user", user)
          .set("name", name)
          .set("description", description)
          .set("validityType", validityType)
          .set("validity", validity)
          .set("isActived", isActived)
          .set("isFinished", isFinished);

        if (targetSubjectId !== null) {
          target.set(
            "targetSubject",
            AV.Object.createWithoutData("TargetSubject", targetSubjectId)
          );
        } else {
          target.set("targetSubject", null);
        }

        await target.save();

        // 删除所有的相关的中间表
        const abilityTargetListToDelete = await new AV.Query(AbilityTarget)
          .equalTo("target", AV.Object.createWithoutData("Target", targetId))
          .find();

        AV.Object.destroyAll(abilityTargetListToDelete);

        // 保存新的中间表
        const abilityTargetList: AV.Object[] = [];

        abilityList.forEach(ability => {
          const abilityTarget = new AbilityTarget()
            .set("ability", AV.Object.createWithoutData("Ability", ability.id))
            .set("target", target);
          abilityTargetList.push(abilityTarget);
        });

        if (abilityTargetList.length !== 0) {
          await AV.Object.saveAll(abilityTargetList);
        }

        Log.success("saveTarget", target);
        resolve(target);
      } catch (error) {
        Log.error("saveTarget", error);
        reject(error);
      }
    }),
  /**
   * 保存目标目录
   */
  saveTargetSubject: (targetSubjectId: string, user: AV.User, name: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const targetSubject = await new AV.Query(TargetSubject).get(
          targetSubjectId
        );
        targetSubject.set("name", name).set("user", user);
        await targetSubject.save();
        Log.success("saveTargetSubject", targetSubject);
        resolve(targetSubject);
      } catch (error) {
        Log.error("saveTargetSubject", error);
        reject(error);
      }
    }),
  /**
   * 完成目标
   */
  finishTarget: (targetId: string, isFinished: boolean) =>
    new Promise(async (resolve, reject) => {
      try {
        const target = await new AV.Query(Target).get(targetId);
        target.set("isFinished", isFinished);
        await target.save();
        Log.success("finishTarget", target);
        resolve(target);
      } catch (error) {
        Log.error("finishTarget", error);
        reject(error);
      }
    }),
  /**
   * 获取 LevelRuleList
   */
  fetchLevelRuleList: (): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const levelRuleList = await new AV.Query(LevelRule)
          .ascending("level")
          .find();
        Log.success("fetchLevelRuleList", levelRuleList);
        resolve(levelRuleList);
      } catch (error) {
        Log.error("fetchLevelRuleList", error);
        reject(error);
      }
    }),
  /**
   * 删除 Ability
   */
  deleteAbility: (abilityId: string) =>
    new Promise(async (resolve, reject) => {
      try {
        const ability = await new AV.Query(Ability).get(abilityId);
        await ability.destroy();
        Log.success("deleteAbility");
        resolve();
      } catch (error) {
        Log.error("deleteAbility", error);
        reject(error);
      }
    })
};
