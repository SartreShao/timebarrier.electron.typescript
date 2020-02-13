import * as AV from "leancloud-storage";
import { Log } from "../lib/vue-utils";

export default {
  getCurrentUser: () => {
    const currentUser = AV.User.current();
    Log.success("getCurrentUser", currentUser);
    return currentUser;
  }
};
