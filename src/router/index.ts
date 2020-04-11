import Vue from "vue";
import VueRouter from "vue-router";
import Welcome from "../views/welcome/Welcome.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "welcome",
    component: Welcome
  },
  {
    path: "/plan",
    name: "plan",
    component: () => import("../views/plan/Plan.vue")
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/Login.vue")
  },
  {
    path: "/target-ability",
    name: "target-ability",
    component: () => import("../views/target-ability/TargetAbility.vue")
  },
  {
    path: "/statistic",
    name: "statistic",
    component: () => import("../views/statistic/Statistic.vue")
  },
  {
    path: "/me",
    name: "me",
    component: () => import("../views/me/Me.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
