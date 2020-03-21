import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";
import { PlanType } from "./types/vue-viewmodels";

const Plan = AV.Object.extend("Plan");

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
    planType: PlanType,
    currentPage?: number,
    pageSize?: number
  ): Promise<AV.Object[]> =>
    new Promise(async (resolve, reject) => {
      try {
        const query = new AV.Query<AV.Object>("Plan")
          .skip(
            currentPage ? (currentPage - 1) * (pageSize ? pageSize : 1000) : 0
          )
          .limit(pageSize ? pageSize : 1000)
          .equalTo("user", user)
          .descending("updatedAt");

        switch (planType) {
          case "temporary": {
            query.equalTo("isTemporary", true);
            query.equalTo("isFinished", false);
            break;
          }
          case "daily": {
            query.equalTo("isTemporary", false);
            query.equalTo("isFinished", false);
            break;
          }
          case "completed": {
            query.equalTo("isFinished", true);
            break;
          }
        }
        const planList = await query.find();
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
   * @param isTemporary 该计划是否为临时计划
   * @param user 创建计划的人
   */
  createPlan: (name: string, isTemporary: boolean, user: AV.User) =>
    new Promise(async (resolve, reject) => {
      try {
        const plan = await new Plan()
          .set("name", name)
          .set("isTemporary", isTemporary)
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
        const plan = await new AV.Query("Plan").get(planId);
        plan.set("isFinished", true);
        await plan.save();
        Log.success("completePlan", plan);
        resolve(plan);
      } catch (error) {
        Log.error("completePlan", error);
        reject(error);
      }
    })
};
