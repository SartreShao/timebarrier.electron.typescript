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
  TomatoStatStatusMode,
  ChartMode
} from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { StatPage, StatTomatoPage } from "@/lib/vue-viewmodels/index";
import { UI } from "@/lib/vue-utils";

export default defineComponent({
  setup(props, context) {
    // 番茄列表：带日期范围
    const tomatoListWithDateRange = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

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

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    const dateTip: Ref<string> = ref("15 日");

    watchEffect(() => {
      if (dateRange.value.length === 2) {
        const startTime = dateRange.value[0];
        const endTime = dateRange.value[1];
        dateTip.value = StatPage.getDateTip(startTime, endTime);
        StatPage.initTomatoListWithDateRange(
          context.root,
          tomatoListWithDateRange,
          startTime,
          endTime
        );
      }
    });

    const pickerOptions = {
      shortcuts: [
        {
          text: "7日数据",
          onClick(picker: any) {
            dateTip.value = "7日";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(end.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "15日数据",
          onClick(picker: any) {
            dateTip.value = "15日";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(end.getTime() - 3600 * 1000 * 24 * 15);

            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "30日数据",
          onClick(picker: any) {
            dateTip.value = "30日";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(end.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "180日数据",
          onClick(picker: any) {
            dateTip.value = "180日";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(end.getTime() - 3600 * 1000 * 24 * 180);

            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "365日数据",
          onClick(picker: any) {
            dateTip.value = "365日";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(end.getTime() - 3600 * 1000 * 24 * 365);

            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本周数据",
          onClick(picker: any) {
            dateTip.value = "本周";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            console.log("end", UI.dateToYearMonthDay(end));
            const start = new Date(
              UI.getWeekStartTimestamp(new Date().getTime())
            );
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本月数据",
          onClick(picker: any) {
            dateTip.value = "本月";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(
              UI.getMonthStartTimestamp(new Date().getTime())
            );
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "本年数据",
          onClick(picker: any) {
            dateTip.value = "本年";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date(
              UI.getYearStartTimestamp(new Date().getTime())
            );
            picker.$emit("pick", [start, end]);
          }
        },
        {
          text: "全部数据",
          onClick(picker: any) {
            dateTip.value = "全部";
            const end = new Date(
              UI.getTodayStartTimestamp(new Date().getTime())
            );
            const start = new Date("2020/01/01");
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
