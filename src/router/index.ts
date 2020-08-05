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
        component: () => import("../views/statistic/tomato/Tomato.vue"),
        redirect: { name: "statistic-tomato" },
        children: [
          {
            path: "statistic-tomato",
            name: "statistic-tomato",
            component: () =>
              import(
                "../views/statistic/tomato/statistic-tomato/StatisticTomato.vue"
              )
          },
          {
            path: "statistic-plan",
            name: "statistic-plan",
            component: () =>
              import(
                "../views/statistic/tomato/statistic-plan/StatisticPlan.vue"
              )
          },
          {
            path: "statistic-target",
            name: "statistic-target",
            component: () =>
              import(
                "../views/statistic/tomato/statistic-target/StatisticTarget.vue"
              )
          },
          {
            path: "statistic-ability",
            name: "statistic-ability",
            component: () =>
              import(
                "../views/statistic/tomato/statistic-ability/StatisticAbility.vue"
              )
          }
        ]
      },
      {
        path: "chart",
        name: "chart",
        component: () => import("../views/statistic/chart/Chart.vue"),
        redirect: { name: "multiple-analyse" },
        children: [
          {
            path: "multiple-analyse",
            name: "multiple-analyse",
            component: () =>
              import(
                "../views/statistic/chart/multiple-analyse/MultipleAnalyse.vue"
              )
          },
          {
            path: "tomato-analyse",
            name: "tomato-analyse",
            component: () =>
              import(
                "../views/statistic/chart/tomato-analyse/TomatoAnalyse.vue"
              )
          },
          {
            path: "plan-analyse",
            name: "plan-analyse",
            component: () =>
              import("../views/statistic/chart/plan-analyse/PlanAnalyse.vue")
          },
          {
            path: "target-analyse",
            name: "target-analyse",
            component: () =>
              import(
                "../views/statistic/chart/target-analyse/TargetAnalyse.vue"
              )
          },
          {
            path: "ability-analyse",
            name: "ability-analyse",
            component: () =>
              import(
                "../views/statistic/chart/ability-analyse/AbilityAnalyse.vue"
              )
          }
        ]
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
  },
  {
    path: "/personal-information",
    name: "personal-information",
    component: () =>
      import("../views/personal-information/PersonalInformation.vue")
  },
  {
    path: "/edit-personal-information",
    name: "edit-personal-information",
    component: () =>
      import("../views/edit-personal-information/EditPersonalInformation.vue"),
    props: true
  },
  {
    path: "/choose-plan-type",
    name: "choose-plan-type",
    component: () => import("../views/create-plan/ChoosePlanType.vue")
  },
  {
    path: "/create-temporary-plan",
    name: "create-temporary-plan",
    component: () => import("../views/create-plan/CreateTemporaryPlan.vue")
  },
  {
    path: "/plan-relate-ability",
    name: "plan-relate-ability",
    component: () => import("../views/create-plan/PlanRelateAbility.vue")
  },
  {
    path: "/plan-relate-target",
    name: "plan-relate-target",
    component: () => import("../views/create-plan/PlanRelateTarget.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
