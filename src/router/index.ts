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
    component: () => import("../views/target-ability/TargetAbility.vue"),
    children: [
      {
        path: "target",
        name: "target",
        component: () => import("../views/target-ability/target/Target.vue")
      },
      {
        path: "ability",
        name: "ability",
        component: () => import("../views/target-ability/ability/Ability.vue")
      }
    ],
    redirect: { name: "target" }
  },
  {
    path: "/statistic",
    name: "statistic",
    component: () => import("../views/statistic/Statistic.vue"),
    children: [
      {
        path: "tomato",
        name: "tomato",
        component: () => import("../views/statistic/tomato/Tomato.vue")
      },
      {
        path: "chart",
        name: "chart",
        component: () => import("../views/statistic/chart/Chart.vue")
      }
    ],
    redirect: { name: "tomato" }
  },
  {
    path: "/me",
    name: "me",
    component: () => import("../views/me/Me.vue")
  },
  {
    path: "/setting",
    name: "setting",
    component: () => import("../views/setting/Setting.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
