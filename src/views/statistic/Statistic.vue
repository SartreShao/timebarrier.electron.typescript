<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- Tab View -->
    <tab-view
      :tabRouteList="tabRouteList"
      style="position:fixed;top:7.52vh;"
    ></tab-view>

    <main>
      <router-view />
    </main>

    <div
      class="transition"
      @click="click_changeTomatoStatStatusMode"
      v-if="currentRoute.startsWith(`/statistic/tomato`)"
    >
      <img :src="assets.icon_transition" alt="icon_transition" />
    </div>

    <div
      class="select-date"
      @click="click_changeTomatoStatStatusMode"
      v-if="currentRoute.startsWith(`/statistic/chart`)"
    >
      <img :src="assets.icon_date_select" alt="icon_transition" />
      <span>{{ dateTip }}</span>

      <el-date-picker
        class="picker"
        v-model="dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        size="mini"
      >
      </el-date-picker>
    </div>

    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  Ref,
  inject,
  ref,
  computed,
  watchEffect
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
import TabView from "../../components/TabView.vue";
import icon_transition from "@/assets/icon_transition.svg";
import icon_date_select from "@/assets/icon_date_select.svg";
import {
  StatStatusMode,
  TomatoStatStatusMode
} from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { StatPage, StatTomatoPage } from "@/lib/vue-viewmodels/index";
import { UI } from "@/lib/vue-utils";

export default defineComponent({
  setup(props, context) {
    // Tab 的名称
    const tabRouteList = [
      { route: "/statistic/tomato", name: "番茄记录" },
      { route: "/statistic/chart", name: "数据图表" }
    ];

    const tomatoStatStatusMode: Ref<TomatoStatStatusMode> = inject(
      Store.tomatoStatStatusMode,
      ref("detail")
    );

    const planStatStatusMode: Ref<StatStatusMode> = inject(
      Store.planStatStatusMode,
      ref("simple")
    );

    const targetStatStatusMode: Ref<StatStatusMode> = inject(
      Store.targetStatStatusMode,
      ref("simple")
    );

    const abilityStatStatusMode: Ref<StatStatusMode> = inject(
      Store.abilityStatStatusMode,
      ref("simple")
    );

    // 当前页面的路由
    const currentRoute = computed(() => context.root.$route.fullPath);

    const dateRange: Ref<Date[]> = ref([]);

    const dateTip: Ref<string> = ref("自定义");

    watchEffect(() => {
      if (dateRange.value.length === 2) {
        const startTime = dateRange.value[0];
        const endTime = dateRange.value[1];
        // 本周
        if (
          startTime.getTime() ===
            UI.getWeekStartTimestamp(new Date().getTime()) &&
          endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
        ) {
          dateTip.value = "本周";
        }

        // 本月
        else if (
          startTime.getTime() ===
            UI.getMonthStartTimestamp(new Date().getTime()) &&
          endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
        ) {
          dateTip.value = "本月";
        }

        // 本年
        else if (
          startTime.getTime() ===
            UI.getYearStartTimestamp(new Date().getTime()) &&
          endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
        ) {
          dateTip.value = "本年";
        }

        // 全部
        else if (
          startTime.getTime() === new Date("1990/01/01").getTime() &&
          endTime.getTime() === UI.getTodayStartTimestamp(new Date().getTime())
        ) {
          dateTip.value = "全部";
        }

        // 自定义
        else {
          dateTip.value = "自定义";
        }
      }
    });

    const pickerOptions = {
      shortcuts: [
        {
          text: "本周数据",
          onClick(picker: any) {
            const end = new Date();
            end.setTime(UI.getTodayStartTimestamp(new Date().getTime()));
            const start = new Date();
            const week = UI.getWeekStartTimestamp(new Date().getTime());
            start.setTime(week);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本月数据",
          onClick(picker: any) {
            const end = new Date();
            end.setTime(UI.getTodayStartTimestamp(new Date().getTime()));
            const start = new Date();
            const month = UI.getMonthStartTimestamp(new Date().getTime());
            start.setTime(month);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本年数据",
          onClick(picker: any) {
            const end = new Date();
            end.setTime(UI.getTodayStartTimestamp(new Date().getTime()));
            const start = new Date();
            const year = UI.getYearStartTimestamp(new Date().getTime());
            start.setTime(year);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "全部数据",
          onClick(picker: any) {
            const end = new Date();
            end.setTime(UI.getTodayStartTimestamp(new Date().getTime()));
            const start = new Date("1990/01/01");
            picker.$emit("pick", [start, end]);
          }
        }
      ]
    };

    const click_changeTomatoStatStatusMode = () => {
      switch (currentRoute.value) {
        case "/statistic/tomato/statistic-tomato":
          StatTomatoPage.changeStatStatusMode(tomatoStatStatusMode);
          break;
        case "/statistic/tomato/statistic-plan":
          StatPage.changeStatStatusMode(planStatStatusMode);
          break;
        case "/statistic/tomato/statistic-target":
          StatPage.changeStatStatusMode(targetStatStatusMode);
          break;
        case "/statistic/tomato/statistic-ability":
          StatPage.changeStatStatusMode(abilityStatStatusMode);
          break;
      }
    };

    return {
      tabRouteList,
      currentRoute,
      click_changeTomatoStatStatusMode,
      dateRange,
      pickerOptions,
      dateTip,
      assets: { icon_transition, icon_date_select }
    };
  },
  components: { TopBar, BottomBar, TabView }
});
</script>
<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3
}
main {
  position fixed
  top 12.77vh
  height 80.41vh
  width 100%
  background #F5F5F5
  display flex
  flex-direction column
  align-items center
}
.transition {
  cursor pointer
  position fixed
  bottom 9vh
  right 5.07vw
  width 7.5vh
  height 7.5vh
  border-radius 50%
  background white
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  display flex
  justify-content center
  align-items center
  img {
    width 4.85vw
    height 2.16vh
  }
}
.select-date {
  cursor pointer
  position fixed
  bottom 9vh
  right 5.07vw
  width 7.5vh
  height 7.5vh
  border-radius 50%
  background white
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  display flex
  flex-direction column
  align-items center
  .picker {
    position absolute
    width 7.5vh
    height 7.5vh
    border-radius 50%
    opacity 0
    overflow hidden
  }
  img {
    margin-top 1.57vh
    width 2.23vh
    height 2.23vh
  }
  span {
    margin-top 0.54vh
    font-size 1.2vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.5
    letter-spacing normal
    text-align center
    color #222A36
  }
}
</style>
