<template>
  <div class="container">
    <plan-rectangular-tree></plan-rectangular-tree>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <el-carousel
      indicator-position="none"
      :autoplay="false"
      height="15.75vh"
      ref="planTreeCarousel"
    >
      <el-carousel-item v-for="(item, index) in totalStatData" :key="index">
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
              title="番茄个数"
              width="49.87vw"
            ></info-item>

            <!-- 每日平均用时 -->
            <info-item
              :value="item.totalTime + ` 小时`"
              title="工作时长"
              width="49.87vw"
            ></info-item>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

    <plan-line-chart></plan-line-chart>

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
import AverageScatterDiagram from "../components/AverageScatterDiagram.vue";
import TotalScatterDiagram from "../components/TotalScatterDiagram.vue";
import PeriodBarChart from "../components/PeriodBarChart.vue";
import WeekBarChart from "../components/WeekBarChart.vue";
import MonthBarChart from "../components/MonthBarChart.vue";
import InfoItem from "../components/InfoItem.vue";
import Store from "@/store";
import AV from "leancloud-storage";
import { StatPage } from "@/lib/vue-viewmodels";
import { TwoChronotype } from "../../../../lib/types/vue-viewmodels";
import { UI } from "@/lib/vue-utils";
import PlanRectangularTree from "../components/PlanRectangularTree.vue";
import PlanLineChart from "../components/PlanLineChart.vue";
import { Carousel } from "element-ui/types/element-ui";
export default defineComponent({
  components: { PlanRectangularTree, PlanLineChart, InfoItem },
  setup(props, context) {
    // 外部注入的番茄列表
    const tomatoList: Ref<AV.Object[]> = inject(
      Store.tomatoListWithDateRange,
      ref([])
    );

    // 用户选择的日期范围
    const dateRange: Ref<Date[]> = inject(Store.dateRange, ref([]));

    const totalStatData: Ref<{
      name: string;
      totalTomatoNumber: number;
      totalTime: number;
    }[]> = inject(Store.planTotalStatData, ref([]));

    // 用于指示计划
    const planTotalStatDataIndex: Ref<number> = inject(
      Store.planTotalStatDataIndex,
      ref(0)
    );

    const planTreeCarousel: Ref<Carousel | null> = ref(null);

    watch(planTotalStatDataIndex, newValue => {
      if (planTreeCarousel.value !== null) {
        planTreeCarousel.value.setActiveItem(newValue);
      }
    });

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
    });

    return { totalStatData, planTreeCarousel };
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
.el-carousel__item h3 {
  color #475669
  font-size 18px
  opacity 0.75
  margin 0
}
</style>
