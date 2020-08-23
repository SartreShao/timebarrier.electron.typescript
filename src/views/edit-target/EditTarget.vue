<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要页面 -->
    <main class="main" ref="mainElement">
      <!-- 顶部提示语 -->
      <top-tips
        :title="`编辑目标：${input_editingTarget.name}`"
        sub-title="创建目标 + 制定计划 + 每日执行 = 得偿所愿"
      ></top-tips>

      <!-- 目标类别 -->
      <section class="section section-6">
        <h1 class="h-1">Step 1：目标类别——您的目标属于哪个类别？</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="目标无所属类别"
            v-model="input_editingTarget.subjectName"
          />
        </div>
        <h2 class="h-2">不输入目标类别，目标即为「无类别」</h2>
      </section>

      <!-- 目标名称 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：目标名称——您希望达成什么目标？</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入目标名称（必填）"
            v-model="input_editingTarget.name"
          />
        </div>
        <h2 class="h-2">例如：减肥 30 斤、百米 11 秒、体悟瑜伽与冥想</h2>
      </section>

      <!-- 截止日期 -->
      <section class="section section-5">
        <h1 class="h-1">Step 2：目标截止日期——最晚什么时候完成目标？</h1>
        <div class="button">
          <span v-if="input_editingTarget.validity.length === 0">
            请选择一个日期（选填）
          </span>

          <span v-else>{{ targetValidityFormat }}</span>
          <el-date-picker
            class="date-picker"
            v-model="input_editingTarget.validity"
            type="date"
          >
          </el-date-picker>
        </div>
        <h2 class="h-2">例如：2020 年 1 月 1 日</h2>
      </section>

      <!-- 关联计划 -->
      <section class="section section-2">
        <h1 class="h-1">Step 3：关联计划——为完成目标，您需要制定一个计划</h1>
        <div
          class="button"
          @click="click_relatePlan"
          v-if="input_editingTarget.planList.length === 0"
        >
          点击关联计划（选填）
        </div>

        <div class="button" @click="click_relatePlan" v-else>
          <span>{{
            "相关计划：" +
              input_editingTarget.planList.map(plan => plan.name).join("、")
          }}</span>
        </div>
        <h2 class="h-2">
          例如：减肥 30 斤——每天跑步 2 公里<br />
          提高语文成绩——每天训练语文习题 1 小时<br />
          阅读一百本书——每日阅读 1 小时
        </h2>
      </section>
    </main>

    <create-button @click="click_createTargetButton"></create-button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  inject,
  ref,
  Ref,
  computed,
  onMounted,
  onUnmounted,
  watch
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import TopTips from "../../components/TopTips.vue";
import CreateButton from "./components/CreateButton.vue";
import { InputTargetType } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import PlaceHolder from "./components/PlaceHolder.vue";
import MileStoneItem from "./components/MileStoneItem.vue";
import { TargetPage } from "@/lib/vue-viewmodels";
import draggable from "vuedraggable";
import { Router, UI } from "@/lib/vue-utils";
import AV from "leancloud-storage";

export default defineComponent({
  components: {
    draggable,
    TopBar,
    TopTips,
    CreateButton,
    PlaceHolder
  },
  setup(props, context) {
    // 创建目标的数据容器
    const input_editingTarget: InputTargetType = inject(
      Store.input_editingTarget,
      reactive({
        id: undefined,
        subjectName: "",
        name: "",
        description: "",
        validityType: "",
        validity: "",
        planList: [],
        isActived: true,
        isFinished: false,
        mileStoneList: []
      })
    );

    // 服务器拉取的数据：临时计划的列表
    const temporaryPlanList: Ref<AV.Object[]> = inject(
      Store.temporaryPlanList,
      ref<AV.Object[]>([])
    );

    // 服务器拉取的数据：每日计划的列表
    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref<AV.Object[]>([])
    );

    // 服务器拉取的数据：已完成计划的列表
    const completedPlanList: Ref<AV.Object[]> = inject(
      Store.completedPlanList,
      ref<AV.Object[]>([])
    );

    //「目标类别」的列表
    const targetSubjectList: Ref<AV.Object[]> = inject(
      Store.targetSubjectList,
      ref([])
    );

    const click_relatePlan = () => {
      Router.pushWithParams(context.root.$router, "target-relate-plan", {
        isCreateTarget: false
      });
    };

    // 用户输入：里程碑的名称
    const input_milestoneName = ref("");

    const colormapForTreeChart: string[] = inject(
      Store.colormapForTreeChart,
      []
    );

    const mainElement: Ref<HTMLElement | null> = ref(null);

    // 回车事件：用户创建里程碑
    const keyUpEnter_milestoneName = () => {
      TargetPage.createMileStone(
        context.root,
        input_milestoneName,
        input_editingTarget,
        colormapForTreeChart,
        mainElement
      );
    };

    // 配置信息
    const draggableOptions = inject(Store.draggableOptions, {});

    // 删除选中的 MileStone
    const click_deleteMileStone = (index: number) => {
      TargetPage.deleteMileStone(
        context.root,
        input_editingTarget,
        index,
        mainElement
      );
    };

    // 拖拽结束
    const dragend_mileStone = () => {};

    // 这是那个输入框
    const stickyElement: Ref<HTMLElement | null> = ref(null);

    // 用户输入：创建 Target
    const click_createTargetButton = () => {
      TargetPage.saveTarget(
        context.root,
        input_editingTarget,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        targetSubjectList
      );
    };

    const targetValidityFormat = computed(() =>
      UI.dateToYearMonthDay(new Date(input_editingTarget.validity))
    );

    return {
      input_editingTarget,
      input_milestoneName,
      click_relatePlan,
      click_deleteMileStone,
      click_createTargetButton,
      draggableOptions,
      mainElement,
      keyUpEnter_milestoneName,
      dragend_mileStone,
      stickyElement,
      targetValidityFormat
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}

.ghost {
  opacity 0.7
}

.draggable {
  width 100%
  display flex
  flex-direction column
  align-items center
}

.main {
  margin-top 7.52vh
  overflow scroll
  height 92.48vh
  width 100%
}

.section {
  width 100%
  display flex
  flex-direction column
  align-items center
  justify-content center
}

.section-1 {
  background #5F4B8B
}

.section-2 {
  background #59596F
}

.section-3 {
  position sticky
  top 0
  background #252F3D
  z-index 999
}

.section-4 {
  background #FFFFFF
}

.section-5 {
  background #D45070
}

.section-6 {
  background #123456
}

.h-1 {
  line-height 2.92vh
  font-size 2.02vh
  color white
  font-weight bold
  margin-top 4.57vh
}

.h-2 {
  line-height 3vh
  font-size 1.8vh
  color white
  font-weight normal
  opacity 0.7
  margin-top 1.2vh
  margin-bottom 4.57vh
  text-align center
}

.input-container {
  position relative
  width 88.8vw
  height 6.22vh
  background white
  border-radius 0.67vh
  box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  margin-top 1.87vh
  display flex
  align-items center
}

.button {
  cursor pointer
  width 88.8vw
  height 6.22vh
  background white
  border-radius 0.67vh
  box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  margin-top 1.87vh
  display flex
  align-items center
  color #222A36
  font-size 1.87vh
  padding-left 5.47vw
  box-sizing border-box
  position relative

  span {
    width 100%
    white-space nowrap
    text-overflow ellipsis
    overflow hidden
  }
}

.date-picker {
  position absolute
  width 100%
  height 100%
  top 0
  bottom 0
  right 0
  left 0
  opacity 0
}

.input {
  width 100%
  height 100%
  outline none
  border none
  border-radius 0.67vh
  color #222A36
  font-size 1.87vh
  padding-left 5.47vw
  box-sizing border-box

  &::-webkit-input-placeholder {
    color #222A36
    font-size 1.87vh
    color #222A36
    opacity 0.3
  }
}

.enter-icon {
  position absolute
  width 2.37vw
  height 1.17vh
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  right 5.57vw
}
</style>
