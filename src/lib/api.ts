import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";
import { PlanType } from "./types/vue-viewmodels";
import { EROFS } from "constants";

const Plan = AV.Object.extend("Plan");
const Tomato = AV.Object.extend("Tomato");
const TomatoPlan = AV.Object.extend("TomatoPlan");
const Ability = AV.Object.extend("Ability");
const AbilityPlan = AV.Object.extend("AbilityPlan");

export default {
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
          .descending("updatedAt");

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

        // Plan 的临时属性，用于提交番茄
        planList.forEach((plan) => {
          plan.attributes.selected = false;
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
    isFinished: boolean
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
    user: AV.User
  ): Promise<AV.Object> =>
    new Promise(async (resolve, reject) => {
      try {
        const tomato = await new Tomato()
          .set("name", name)
          .set("user", user)
          .set("description", description)
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
        planIdList.forEach((planId) => {
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
    isActived: boolean
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const ability = await new Ability()
          .set("name", name)
          .set("user", user)
          .set("description", description)
          .set("isFinished", isFinished)
          .set("isActived", isActived)
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
  fetchAbilityList: (user: AV.User, isFinished: boolean, isActived?: boolean) =>
    new Promise(async (resolve, reject) => {
      try {
        const query = await new AV.Query(Ability)
          .equalTo("user", user)
          .equalTo("isFinished", isFinished);
        if (isActived !== undefined) {
          query.equalTo("isActived", isActived);
        }
        const abilityList = await query.find();
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
        const userId: string = plan.attributes.user.id;
        const abilityList = await new AV.Query(Ability)
          .equalTo("user", AV.Object.createWithoutData("_User", userId))
          .equalTo("isFinished", false)
          .find();
        const abilityPlanList = await new AV.Query(AbilityPlan)
          .equalTo("plan", AV.Object.createWithoutData(Plan, planId))
          .find();
        abilityPlanList.forEach((abilityPlan) => {
          abilityList.forEach((ability) => {
            if (abilityPlan.attributes.ability.id === ability.id) {
              ability.attributes.selected = true;
            } else {
              ability.attributes.selected = false;
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
};
