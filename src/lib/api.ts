import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";
import { PlanType } from "./types/vue-viewmodels";
import _ from "lodash";

const Plan = AV.Object.extend("Plan");
const Tomato = AV.Object.extend("Tomato");
const TomatoPlan = AV.Object.extend("TomatoPlan");
const Ability = AV.Object.extend("Ability");
const AbilityPlan = AV.Object.extend("AbilityPlan");
const TargetSubject = AV.Object.extend("TargetSubject");
const Target = AV.Object.extend("Target");
const AbilityTarget = AV.Object.extend("AbilityTarget");
const LevelRule = AV.Object.extend("LevelRule");
const TargetPlan = AV.Object.extend("TargetPlan");

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
   * 登出
   */
  logOut: () =>
    new Promise(async (resolve, reject) => {
      try {
        await AV.User.logOut();
        Log.success("logOut");
        resolve();
      } catch (error) {
        Log.error("logOut", error);
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
   * 保存所有的 AbilityList
   */
  saveAbilityList: (objectList: AV.Object[]) =>
    new Promise(async (resolve, reject) => {
      try {
        await AV.Object.saveAll(objectList);
        Log.success("saveAbilityList", objectList);
        resolve(objectList);
      } catch (error) {
        Log.error("saveAbilityList", error);
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
          .equalTo("user", user);

        switch (planType) {
          case "temporary": {
            query
              .equalTo("isFinished", false)
              .ascending("order")
              .addDescending("createdAt")
              .equalTo("type", "temporary");
            break;
          }
          case "daily": {
            query
              .equalTo("isFinished", false)
              .ascending("order")
              .addDescending("createdAt")
              .equalTo("type", "daily");
            break;
          }
          case "completed": {
            query.equalTo("isFinished", true).descending("createdAt");
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

        // 查询 plan 相关的 target
        const targetPlanList = await new AV.Query(TargetPlan)
          .include("plan")
          .include("target")
          .containedIn("plan", planList)
          .find();

        planList.forEach(plan => {
          plan.attributes.targetListOfPlan = [];
          plan.attributes.selected = false;

          targetPlanList.forEach(targetPlan => {
            if (plan.id === targetPlan.attributes.plan.id) {
              plan.attributes.targetListOfPlan.push(
                targetPlan.attributes.target
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
        const plan = new Plan()
          .set("name", name)
          .set("type", type)
          .set("isFinished", false)
          .set("user", user)
          .set("order", 0);

        if (type === "daily") {
          plan.set("target", 2);
        }
        await plan.save();
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
    isActived: boolean,
    isFinished: boolean,
    abilityIdList: string[],
    targetIdList: string[]
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new AV.Query(Plan).get(planId);
        await plan
          .set("name", name)
          .set("target", target)
          .set("type", type)
          .set("isActived", isActived)
          .set("isFinished", isFinished)
          .save();

        // 删除所有的相关的中间表：AbilityPlan
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .equalTo("plan", plan)
          .find();

        await AV.Object.destroyAll(abilityPlanList);

        // 添加所有的相关的中间表：AbilityPlan
        let list: AV.Object[] = [];
        abilityIdList.forEach(abilityId => {
          list.push(
            new AbilityPlan()
              .set("plan", AV.Object.createWithoutData(Plan, planId))
              .set("ability", AV.Object.createWithoutData(Ability, abilityId))
          );
        });
        await AV.Object.saveAll(list);

        // 删除所有的相关的中间表：TargetPlan
        const targetPlanList = await new AV.Query(TargetPlan)
          .equalTo("plan", plan)
          .find();

        await AV.Object.destroyAll(targetPlanList);

        // 添加所有的相关的中间表：TargetPlan
        list = [];
        targetIdList.forEach(targetId => {
          list.push(
            new TargetPlan()
              .set("plan", AV.Object.createWithoutData(Plan, planId))
              .set("target", AV.Object.createWithoutData(Target, targetId))
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
    startTime: Date,
    colormap: string[]
  ): Promise<AV.Object> =>
    new Promise(async (resolve, reject) => {
      try {
        // 查询上一个的颜色
        let color: string = colormap[0];
        try {
          const lastTomato = await new AV.Query(Tomato)
            .equalTo("user", user)
            .descending("createdAt")
            .first();
          if (lastTomato === undefined) {
            throw "lastTomato is undefined";
          }
          colormap.forEach((item, index) => {
            if (item === lastTomato.attributes.color) {
              color = colormap[(index + 1) % colormap.length];
            }
          });
        } catch (error) {
          // 没查到
        }

        const now = new Date();
        const tomato = await new Tomato()
          .set("name", name)
          .set("user", user)
          .set("description", description)
          .set("startTime", startTime)
          .set("duration", now.getTime() - startTime.getTime())
          .set("color", color)
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
    colormap: string[],
    planList?: { id: string; name: string }[],
    targetList?: { id: string; name: string }[]
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

        // 保存中间表：AbilityPlan
        if (planList !== undefined) {
          const abilityPlanList: AV.Object[] = [];
          planList.forEach(plan => {
            const abilityPlan = new AbilityPlan()
              .set("ability", ability)
              .set("plan", AV.Object.createWithoutData(Plan, plan.id));
            abilityPlanList.push(abilityPlan);
          });
          await AV.Object.saveAll(abilityPlanList);
        }

        // 保存中间表：AbilityTarget
        if (targetList !== undefined) {
          const abilityTargetList: AV.Object[] = [];
          targetList.forEach(target => {
            const abilityTarget = new AbilityTarget()
              .set("ability", ability)
              .set("target", AV.Object.createWithoutData(Target, target.id));
            abilityTargetList.push(abilityTarget);
          });
          await AV.Object.saveAll(abilityTargetList);
        }

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
        // 构建请求 Ability 列表的 Query
        const query = await new AV.Query(Ability)
          .equalTo("user", user)
          .equalTo("isFinished", isFinished)
          .ascending("order")
          .addDescending("createdAt");

        if (isActived !== undefined) {
          query.equalTo("isActived", isActived);
        }

        // 请求 Ability 列表
        const abilityList = await query.find();

        // 将 AbilityList 设置为可选择的
        abilityList.forEach(ability => {
          ability.attributes.selected = false;
        });

        // 计算能力等级：levelNumber
        // 计算能力名称：levelName
        // 计算能力距离下一段的百分比：levelPercent
        if (levelRuleList !== undefined) {
          for (let i = 0; i <= abilityList.length - 1; i++) {
            for (let j = levelRuleList.length - 1; j >= 0; j--) {
              if (
                abilityList[i].attributes.tomatoNumber >=
                levelRuleList[j].attributes.tomatoNumber
              ) {
                abilityList[i].attributes.levelName =
                  levelRuleList[j].attributes.name;

                abilityList[i].attributes.levelNumber =
                  levelRuleList[j].attributes.level;

                abilityList[i].attributes.levelPercent =
                  (abilityList[i].attributes.tomatoNumber -
                    levelRuleList[j].attributes.tomatoNumber) /
                  (levelRuleList[j + 1].attributes.tomatoNumber -
                    levelRuleList[j].attributes.tomatoNumber);

                break;
              }
            }
          }
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
          .ascending("order")
          .addDescending("createdAt")
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

  fetchTargetListWithPlanSelect: (planId: string): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const plan: AV.Object = await new AV.Query(Plan).get(planId);
        const user: string = plan.attributes.user;
        const targetList = await new AV.Query(Target)
          .equalTo("user", user)
          .equalTo("isFinished", false)
          .ascending("order")
          .addDescending("createdAt")
          .find();

        const targetPlanList = await new AV.Query(TargetPlan)
          .equalTo("plan", AV.Object.createWithoutData(Plan, planId))
          .containedIn("target", targetList)
          .find();

        targetList.forEach(target => {
          target.attributes.selected = false;
        });

        targetPlanList.forEach(targetPlan => {
          targetList.forEach(target => {
            if (targetPlan.attributes.target.id === target.id) {
              target.attributes.selected = true;
            }
          });
        });

        Log.success("fetchTargetListWithPlanSelect", targetList);
        resolve(targetList);
      } catch (error) {
        Log.error("fetchTargetListWithPlanSelect", error);
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
          .ascending("order")
          .addDescending("createdAt")
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
   * 请求 Plan 列表
   */
  fetchPlanListWithTargetSelect: (targetId: string): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const target: AV.Object = await new AV.Query(Target).get(targetId);
        const user: AV.User = target.attributes.user;
        const planList = await new AV.Query(Plan)
          .equalTo("user", user)
          .equalTo("isFinished", false)
          .ascending("order")
          .addDescending("createdAt")
          .find();
        const targetPlanList = await new AV.Query(TargetPlan)
          .equalTo("target", AV.Object.createWithoutData(Target, targetId))
          .containedIn("plan", planList)
          .find();
        planList.forEach(plan => {
          plan.attributes.selected = false;
        });
        targetPlanList.forEach(targetPlan => {
          planList.forEach(plan => {
            if (targetPlan.attributes.plan.id === plan.id) {
              plan.attributes.selected = true;
            }
          });
        });
        Log.success("fetchPlanListWithTargetSelect", planList);
        resolve(planList);
      } catch (error) {
        Log.error("fetchPlanListWithTargetSelect", error);
        reject(error);
      }
    }),
  fetchPlanListWithSelect: (user: AV.User): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const planList = await new AV.Query(Plan)
          .equalTo("user", user)
          .equalTo("isFinished", false)
          .ascending("order")
          .addDescending("createdAt")
          .find();
        planList.forEach(plan => {
          plan.attributes.selected = false;
        });
        Log.success("fetchPlanListWithSelect", planList);
        resolve(planList);
      } catch (error) {
        Log.error("fetchPlanListWithSelect", error);
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

        // 获取 abilityTargetList
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

        // 获取 targetPlanList
        const targetPlanList = await new AV.Query(TargetPlan)
          .include("target")
          .include("plan")
          .containedIn("target", targetList)
          .find();

        // 将 targetPlanList 存入 targetList 中
        targetList.forEach(target => {
          target.attributes.planListOfTarget = [];
          targetPlanList.forEach(targetPlan => {
            if (target.id === targetPlan.attributes.target.id) {
              target.attributes.planListOfTarget.push(
                targetPlan.attributes.plan
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
    planList: { id: string; name: string }[],
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

        const targetPlanList: AV.Object[] = [];

        planList.forEach(plan => {
          const targetPlan = new TargetPlan()
            .set("target", target)
            .set("plan", AV.Object.createWithoutData("Plan", plan.id));
          targetPlanList.push(targetPlan);
        });

        if (targetPlanList.length !== 0) {
          await AV.Object.saveAll(targetPlanList);
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
    planList: { id: string; name: string }[],
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

        // 删除所有的相关的中间表
        const targetPlanListToDelete = await new AV.Query(TargetPlan)
          .equalTo("target", AV.Object.createWithoutData(Target, targetId))
          .find();

        AV.Object.destroyAll(targetPlanListToDelete);

        // 保存新的中间表
        const targetPlanList: AV.Object[] = [];

        planList.forEach(plan => {
          const targetPlan = new TargetPlan()
            .set("plan", AV.Object.createWithoutData("Plan", plan.id))
            .set("target", target);
          targetPlanList.push(targetPlan);
        });

        if (targetPlanList.length !== 0) {
          await AV.Object.saveAll(targetPlanList);
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
    }),
  /**
   * 保存 Ability
   */
  saveAbility: (
    abilityId: string,
    name: string,
    planIdList: string[],
    targetIdList: string[],
    isActived?: boolean,
    isFinished?: boolean
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        // 保存基础信息
        const ability = await new AV.Query(Ability).get(abilityId);

        if (isActived !== undefined) {
          ability.set("isActived", isActived);
        }

        if (isFinished !== undefined) {
          ability.set("isFinished", isFinished);
        }

        await ability.set("name", name).save();

        // 删除所有的相关的中间表
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .equalTo("ability", ability)
          .find();

        await AV.Object.destroyAll(abilityPlanList);

        const abilityTargetList = await new AV.Query(AbilityTarget)
          .equalTo("ability", ability)
          .find();

        await AV.Object.destroyAll(abilityTargetList);

        // 添加所有的中间表
        const creatingAbilityPlanList = planIdList.map(planId =>
          new AbilityPlan()
            .set("ability", ability)
            .set("plan", AV.Object.createWithoutData(Plan, planId))
        );

        await AV.Object.saveAll(creatingAbilityPlanList);

        const creatingAbilityTargetList = targetIdList.map(targetId =>
          new AbilityTarget()
            .set("ability", ability)
            .set("target", AV.Object.createWithoutData(Target, targetId))
        );

        await AV.Object.saveAll(creatingAbilityTargetList);

        Log.success("saveAbility", ability);
        resolve(ability);
      } catch (error) {
        Log.error("saveAbility", error);
        reject(error);
      }
    }),

  /**
   * 请求 TargetList 列表带着 Ability 的 selected
   */
  fetchTargetListWithAbilitySelect: (
    abilityId: string | null,
    user?: AV.User
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        if (abilityId !== null) {
          const ability: AV.Object = await new AV.Query(Ability).get(abilityId);

          const user: AV.User = ability.attributes.user;

          const targetList = await new AV.Query(Target)
            .equalTo("user", user)
            .equalTo("isFinished", false)
            .equalTo("isActived", true)
            .ascending("order")
            .addDescending("createdAt")
            .find();

          const abilityTargetList = await new AV.Query(AbilityTarget)
            .containedIn("target", targetList)
            .equalTo("ability", ability)
            .find();

          targetList.forEach(target => {
            target.attributes.selected = false;
          });

          abilityTargetList.forEach(abilityTarget => {
            targetList.forEach(target => {
              if (abilityTarget.attributes.target.id === target.id) {
                target.attributes.selected = true;
              }
            });
          });

          Log.success("fetchTargetListWithAbilitySelect", targetList);
          resolve(targetList);
        } else {
          if (user === undefined) {
            throw "user is undefined";
          }

          const targetList = await new AV.Query(Target)
            .equalTo("user", user)
            .equalTo("isFinished", false)
            .equalTo("isActived", true)
            .find();
          console.log("FUCK", targetList);

          targetList.forEach(target => {
            target.attributes.selected = false;
          });

          Log.success("fetchTargetListWithAbilitySelect", targetList);
          resolve(targetList);
        }
      } catch (error) {
        Log.error("fetchTargetListWithAbilitySelect", error);
        reject(error);
      }
    }),
  /**
   * 请求 PlanList with Ability .selected
   */
  fetchPlanListWithAbilitySelect: (
    abilityId: string | null,
    user?: AV.User
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        if (abilityId !== null) {
          const ability: AV.Object = await new AV.Query(Ability).get(abilityId);

          const user: AV.User = ability.attributes.user;

          const planList = await new AV.Query(Plan)
            .equalTo("user", user)
            .equalTo("isFinished", false)
            .equalTo("isActived", true)
            .ascending("order")
            .addDescending("createdAt")
            .find();

          const abilityPlanList = await new AV.Query(AbilityPlan)
            .containedIn("plan", planList)
            .equalTo("ability", ability)
            .find();

          planList.forEach(plan => {
            plan.attributes.selected = false;
          });

          abilityPlanList.forEach(abilityPlan => {
            planList.forEach(plan => {
              if (abilityPlan.attributes.plan.id === plan.id) {
                plan.attributes.selected = true;
              }
            });
          });

          Log.success("fetchPlanListWithAbilitySelect", planList);
          resolve(planList);
        } else {
          if (user === undefined) {
            throw "user is undefined";
          }

          const planList = await new AV.Query(Plan)
            .equalTo("user", user)
            .equalTo("isFinished", false)
            .equalTo("isActived", true)
            .find();

          planList.forEach(plan => {
            plan.attributes.selected = false;
          });

          Log.success("fetchPlanListWithAbilitySelect", planList);
          resolve(planList);
        }
      } catch (error) {
        Log.error("fetchPlanListWithAbilitySelect", error);
        reject(error);
      }
    }),

  /**
   * 请求番茄列表
   */
  fetchTomatoList: (user: AV.User): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        // 获取番茄列表
        const tomatoList = await new AV.Query(Tomato)
          .equalTo("user", user)
          .descending("startTime")
          .find();

        // 获取与番茄关联的计划
        const tomatoPlanList = await new AV.Query(TomatoPlan)
          .containedIn("tomato", tomatoList)
          .include("plan")
          .descending("createdAt")
          .find();

        // 将 planList 存入到 tomato.attributes.planListOfTomato
        tomatoList.forEach(tomato => {
          tomato.attributes.planListOfTomato = [];
          tomatoPlanList.forEach(tomatoPlan => {
            if (tomatoPlan.attributes.tomato.id === tomato.id) {
              tomato.attributes.planListOfTomato.push(
                tomatoPlan.attributes.plan
              );
            }
          });
        });

        // PlanList
        const planList = tomatoPlanList.map(
          tomatoPlan => tomatoPlan.attributes.plan
        );

        // 获取与 Plan 相关联的 Target
        const targetPlanList = await new AV.Query(TargetPlan)
          .containedIn("plan", planList)
          .include("target")
          .descending("createdAt")
          .find();

        // 获取与 Plan 相关的 Ability
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .containedIn("plan", planList)
          .include("ability")
          .descending("createdAt")
          .find();

        // 将 targetList 存入到 plan.attributes.targetListOfPlan
        planList.forEach(plan => {
          plan.attributes.targetListOfPlan = [];
          plan.attributes.abilityListOfPlan = [];

          targetPlanList.forEach(targetPlan => {
            if (targetPlan.attributes.plan.id === plan.id) {
              plan.attributes.targetListOfPlan.push(
                targetPlan.attributes.target
              );
            }
          });

          abilityPlanList.forEach(abilityPlan => {
            if (abilityPlan.attributes.plan.id === plan.id) {
              plan.attributes.abilityListOfPlan.push(
                abilityPlan.attributes.ability
              );
            }
          });
        });

        Log.success("fetchTomatoList", tomatoList);
        resolve(tomatoList);
      } catch (error) {
        Log.error("fetchTomatoList", error);
        reject(error);
      }
    }),

  /**
   * 请求统计目标列表
   */
  fetchStatTargetList(user: AV.User): Promise<AV.Object[]> {
    const Api = this;
    return new Promise(async (resolve, reject) => {
      try {
        const tomatoList = await Api.fetchTomatoList(user);

        const statTargetList: AV.Object[] = [];

        tomatoList.forEach((tomato, tomatoIndex) => {
          tomato.attributes.planListOfTomato.forEach(
            (plan: AV.Object, planIndex: number) => {
              plan.attributes.targetListOfPlan.forEach(
                (target: AV.Object, targetIndex: number) => {
                  const object = target.clone();
                  object.attributes.isStat = true;
                  object.attributes.tomatoOfTarget = tomato;
                  object.attributes.planOfTarget = plan;
                  statTargetList.push(object);
                }
              );
            }
          );
        });

        Log.success("fetchStatTargetList", statTargetList);
        resolve(statTargetList);
      } catch (error) {
        Log.error("fetchStatTargetList", error);
        reject(error);
      }
    });
  },

  /**
   * 请求计划列表
   * @param user
   */
  fetchStatPlanList(user: AV.User): Promise<AV.Object[]> {
    const Api = this;
    return new Promise(async (resolve, reject) => {
      try {
        const tomatoList = await Api.fetchTomatoList(user);

        const statPlanList: AV.Object[] = [];

        tomatoList.forEach(tomato => {
          tomato.attributes.planListOfTomato.forEach((plan: AV.Object) => {
            const object = _.cloneDeep(plan);
            object.attributes.tomatoOfPlan = tomato;
            statPlanList.push(object);
          });
        });

        Log.success("fetchStatPlanList", statPlanList);
        resolve(statPlanList);
      } catch (error) {
        Log.error("fetchStatPlanList", error);
        reject(error);
      }
    });
  }
};
