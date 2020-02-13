import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";

export default {
  /**
   * Get current LeanCloud user
   *
   * @returns { AV.User } currentUser 登录状态下返回
   * @returns { null } null 未登录状态下返回
   */
  getCurrentUser: () => {
    const currentUser = AV.User.current();
    Log.success("getCurrentUser", currentUser);
    return currentUser;
  },
  /**
   * 判断当前用户是否已登录 LeanCloud
   *
   * @returns { boolean } 当用户登录时，返回 true；未登录时返回 false
   */
  isLoggedIn() {
    const result = this.getCurrentUser() !== null;
    Log.success("isLoggedIn", result);
    return result;
  }
};
