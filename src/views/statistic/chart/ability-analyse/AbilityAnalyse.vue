<template>
  <div class="container">
    <!-- 树图 -->
    <rectangular-tree type="ability"></rectangular-tree>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 树图列表 -->
    <el-carousel
      indicator-position="none"
      :autoplay="false"
      height="15.75vh"
      ref="treeCarousel"
    >
      <el-carousel-item v-for="(item, index) in treeTotalStatData" :key="index">
        <div class="vertical-container">
          <info-item
            title="能力名称"
            :value="`No.` + (index + 1) + `：` + item.name"
            width="100vw"
          ></info-item>

          <!-- 占位 -->
          <div style="height:0.15vh"></div>

          <!-- 横向 -->
          <div class="horizontal-container">
            <!-- 每日平均用时 -->
            <info-item
              :value="item.totalTomatoNumber + ` 番茄`"
              title="总番茄个数"
              width="49.87vw"
            ></info-item>

            <!-- 每日平均用时 -->
            <info-item
              :value="item.totalTime + ` 小时`"
              title="总工作时长"
              width="49.87vw"
            ></info-item>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 日均图 -->
    <daily-line-chart type="ability"></daily-line-chart>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 日均图列表 -->
    <el-carousel indicator-position="none" :autoplay="false" height="15.75vh">
      <el-carousel-item
        v-for="(item, index) in averageDailyStatData"
        :key="index"
      >
        <div class="vertical-container">
          <info-item
            title="能力名称"
            :value="`No.` + (index + 1) + `：` + item.name"
            width="100vw"
          ></info-item>

          <!-- 占位 -->
          <div style="height:0.15vh"></div>

          <!-- 横向 -->
          <div class="horizontal-container">
            <!-- 每日平均用时 -->
            <info-item
              :value="item.averageDailyTomatoNumber + ` 番茄`"
              title="每日平均番茄"
              width="49.87vw"
            ></info-item>

            <!-- 每日平均用时 -->
            <info-item
              :value="item.averageDailyTime + ` 小时`"
              title="每日平均工作时长"
              width="49.87vw"
            ></info-item>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 整体涨势图 -->
    <total-line-chart type="ability"></total-line-chart>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 整体涨势图列表：一万小时预测 -->
    <el-carousel indicator-position="none" :autoplay="false" height="15.75vh">
      <el-carousel-item
        v-for="(item, index) in tenThousandHoursPrediction"
        :key="index"
      >
        <div class="vertical-container">
          <info-item
            title="计划名称"
            :value="`No.` + (index + 1) + `：` + item.name"
            width="100vw"
          ></info-item>

          <!-- 占位 -->
          <div style="height:0.15vh"></div>

          <info-item
            title="「10,000 小时定律」达成日期预测"
            :value="item.prediction"
            width="100vw"
          ></info-item>
        </div>
      </el-carousel-item>
    </el-carousel>


    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <!-- 分月数据 -->
    <month-bar-chart type="target"></month-bar-chart>

    <!--分月数据列表 -->
    <transition-group type="transition" name="flip-list">
      <div v-for="(item, index) in monthStatData" :key="index">
        <div class="vertical-container">
          <!-- 占位 -->
          <div style="height:0.15vh"></div>

          <div
            class="month-container"
            :style="{
              background: item.isShow ? item.color : `#fff`,
              color: item.isShow ? `#fff` : `#222a36`
            }"
            @click="item.isShow = !item.isShow"
          >
            {{ item.month }}｜完成 {{ item.value.length }} 项目标

            <svg
              v-if="item.isShow === true"
              class="icon-downward"
              xmlns="http://www.w3.org/2000/svg"
              width="17.598"
              height="8.653"
              viewBox="0 0 17.598 8.653"
            >
              <path
                id="路径_409"
                data-name="路径 409"
                d="M266.787,437.453a.534.534,0,0,1-.436-.145l-8-7.272a.72.72,0,0,1,1.018-1.018l7.563,6.835,7.563-6.835a.72.72,0,0,1,1.018,1.018l-8,7.272A1.946,1.946,0,0,1,266.787,437.453Z"
                transform="translate(-258.133 -428.8)"
                fill="#fff"
                opacity="0.5"
              />
            </svg>

            <svg
              v-else
              class="icon-leftward"
              xmlns="http://www.w3.org/2000/svg"
              width="8.653"
              height="17.598"
              viewBox="0 0 8.653 17.598"
            >
              <path
                id="路径_410"
                data-name="路径 410"
                d="M266.787,437.453a.534.534,0,0,1-.436-.145l-8-7.272a.72.72,0,0,1,1.018-1.018l7.563,6.835,7.563-6.835a.72.72,0,0,1,1.018,1.018l-8,7.272A1.946,1.946,0,0,1,266.787,437.453Z"
                transform="translate(437.453 -258.133) rotate(90)"
                fill="#fff"
                opacity="0.5"
              />
            </svg>
          </div>

          <div
            class="vertical-container"
            v-for="(value, index) in item.value"
            :key="index"
          >
            <!-- 占位 -->
            <div style="height:0.15vh" v-if="item.isShow"></div>

            <month-item
              v-if="item.isShow"
              :name="value.name"
              :tomatoNumber="value.totalTomatoNumber"
              :currentTime="value.totalTime"
              :percent="value.percent"
              mode="simple"
              :color="colormap[index % colormap.length]"
            ></month-item>
          </div>
        </div>
      </div>
    </transition-group>
    <!-- 占位 -->
    <div style="height:15vh"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  inject,
  Ref,
  computed,
  watchEffect,
  onMounted,
  watch
} from "@vue/composition-api";
import RectangularTree from "../components/RectangularTree.vue";
import Store from "@/store";
import AV from "leancloud-storage";
import { Carousel } from "element-ui/types/element-ui";
import InfoItem from "../components/InfoItem.vue";
import DailyLineChart from "../components/DailyLineChart.vue";
import TotalLineChart from "../components/TotalLineChart.vue";
import MonthBarChart from "../components/MonthBarChart.vue";
import MonthItem from "../components/MonthItem.vue";
import { StatPage } from "@/lib/vue-viewmodels";
import { UI } from "@/lib/vue-utils";

export default defineComponent({
  components: {
    RectangularTree,
    DailyLineChart,
    InfoItem,
    TotalLineChart,
    MonthBarChart,
    MonthItem
  },
  setup(props, context) {
    // 外部注入的番茄列表
    const tomatoList: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    // 用于树图的列表数据
    const treeTotalStatData: Ref<{
      name: string;
      totalTomatoNumber: number;
      totalTime: number;
    }[]> = inject(Store.treeTotalStatData, ref([]));

    // 树图实例
    const treeCarousel: Ref<Carousel | null> = ref(null);

    // 树图目前用户点的位置
    const treeTotalStatDataIndex: Ref<number> = inject(
      Store.treeTotalStatDataIndex,
      ref(0)
    );

    // 观察树图数据
    watch(treeTotalStatDataIndex, newValue => {
      if (treeCarousel.value !== null) {
        treeCarousel.value.setActiveItem(newValue);
      }
    });

    // 线性图用于展示列表的数据
    const averageDailyStatData: Ref<{
      name: string;
      averageDailyTomatoNumber: number;
      averageDailyTime: number;
    }[]> = inject(Store.averageDailyStatData, ref([]));

    // 一万小时预测数据
    const tenThousandHoursPrediction: Ref<{
      name: string;
      prediction: string;
    }[]> = inject(Store.tenThousandHoursPrediction, ref([]));

// 本年的番茄列表
    const thisYearTomatoList: Ref<AV.Object[]> = inject(
      Store.thisYearTomatoList,
      ref([])
    );

    // 月数据：将用于列表展示
    const monthStatData: Ref<{
      month: string;
      color: string;
      isShow: boolean;
      value: {
        totalTime: number;
        totalTomatoNumber: number;
        percent: number;
        name: string;
      }[];
    }[]> = inject(Store.monthStatData, ref([]));

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      if (dateRange.value.length === 2) {
        const startTime = dateRange.value[0];
        const endTime = dateRange.value[1];
        StatPage.initTomatoListWithDateRange(
          context.root,
          tomatoList,
          startTime,
          endTime
        );
      }

      StatPage.initTomatoListWithDateRange(
        context.root,
        thisYearTomatoList,
        new Date(UI.getYearStartTimestamp(new Date().getTime())),
        new Date(UI.getTodayStartTimestamp(new Date().getTime()))
      );
    });

    return {
      treeTotalStatData,
      treeCarousel,
      averageDailyStatData,
      tenThousandHoursPrediction,
      monthStatData,
      colormap
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  display flex
  flex-direction column
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
.horizontal-container {
  width 100%
  height 7.8vh
  display flex
  justify-content space-between
  background #F5F5F5
}
.vertical-container {
  width 100%
  display flex
  flex-direction column
  background #F5F5F5
}
.month-container {
  cursor pointer
  position relative
  width 100%
  height 5.55vh
  display flex
  align-items center
  justify-content center
  font-size 1.8vh
  color white
  font-weight bold
  .icon-downward {
    position absolute
    width 2.35vw
    height 0.65vh
    opacity 1
    right 5.52vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
  .icon-leftward {
    position absolute
    width 1.16vw
    height 1.32vh
    right 6.12vw
    opacity 1
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
}
.el-carousel__item h3 {
  color #475669
  font-size 18px
  opacity 0.75
  margin 0
}
</style>
