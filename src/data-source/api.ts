import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";

export default {
  /**
   * 获取当前的 LeanCloud User
   *
   * @returns { AV.User | null } 如果登录了，返回 AV.User 的实例；如果未登录，返回 null 值
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
