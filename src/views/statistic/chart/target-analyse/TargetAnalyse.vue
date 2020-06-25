<template>
  <div class="container">
    <rectangular-tree type="target"></rectangular-tree>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>

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

    <daily-line-chart type="target"></daily-line-chart>

    <!-- 占位 -->
    <div style="height:0.15vh"></div>
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


export default defineComponent({
  components: {
    RectangularTree,
    DailyLineChart,
    InfoItem
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

    return {
      treeTotalStatData,
      treeCarousel
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
