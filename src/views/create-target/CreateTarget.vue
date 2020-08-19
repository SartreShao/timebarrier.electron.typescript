<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要页面 -->
    <main class="main" ref="mainElement">
      <!-- 顶部提示语 -->
      <top-tips
        :title="`创建一个「${input_creatingTarget.subjectName}」`"
        sub-title="创建目标 + 制定计划 + 每日执行 = 得偿所愿"
      ></top-tips>

      <!-- 目标名称 -->
      <section class="section section-1">
        <h1 class="h-1">Step 1：目标名称——您希望达成什么目标？</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入目标名称（必填）"
            v-model="input_creatingTarget.name"
          />
        </div>
        <h2 class="h-2">例如：减肥 30 斤、百米 11 秒、体悟瑜伽与冥想</h2>
      </section>

      <!-- 关联计划 -->
      <section class="section section-2">
        <h1 class="h-1">Step 2：关联计划——为完成目标，您需要制定一个计划</h1>
        <div
          class="button"
          @click="click_relatePlan"
          v-if="input_creatingTarget.planList.length === 0"
        >
          点击关联计划（选填）
        </div>

        <div class="button" @click="click_relatePlan" v-else>
          <span>{{
            "相关计划：" +
              input_creatingTarget.planList.map(plan => plan.name).join("、")
          }}</span>
        </div>
        <h2 class="h-2">
          例如：减肥 30 斤——每天跑步 2 公里<br />
          提高语文成绩——每天训练语文习题 1 小时<br />
          阅读一百本书——每日阅读 1 小时
        </h2>
      </section>

      <!-- 创建里程碑 -->
      <section class="section section-3" ref="stickyElement">
        <h1 class="h-1">Step 3：创建「目标里程碑」——解构大目标为小目标</h1>
        <div class="input-container">
          <input
            class="input"
            type="text"
            placeholder="请输入里程碑名称（选填）"
            v-model="input_milestoneName"
            @keyup.enter="keyUpEnter_milestoneName"
          />

          <svg
            class="enter-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17.787"
            height="15.563"
            viewBox="0 0 17.787 15.563"
          >
            <path
              id="路径_778"
              data-name="路径 778"
              d="M72.452,124.893H63.558v4.447l-6.67-5.558,6.67-5.558v4.447h8.893v-8.893h2.223v11.117Z"
              transform="translate(-56.888 -113.777)"
            />
          </svg>
        </div>

        <h2 class="h-2" v-if="mileStoneTipIsShow">
          例如：目标是「获取产品经理 offer」，即可设置里程碑：<br />
          1. 获取「产品」项目经验<br />
          2. 学习「产品经理」相关知识<br />
          3. 参加「创业比赛」<br />
          4. 完成「产品经理」实习
        </h2>

        <div style="height:4.57vh" v-else></div>
      </section>

      <!-- 里程碑列表 -->
      <section class="section section-4">
        <h1 class="h-1" style="color:#222A36">
          Step 4：查看「目标里程碑」列表
        </h1>
        <h2 class="h-2" style="color:#222A36;font-weight:lighter;">
          可以在这里调整里程碑的名称和优先级
        </h2>

        <place-holder
          tip="您还没有创建「里程碑」，请在 Step 3 中创建"
          v-if="input_creatingTarget.mileStoneList.length === 0"
        ></place-holder>

        <draggable
          class="draggable"
          :options="draggableOptions"
          v-model="input_creatingTarget.mileStoneList"
          ghost-class="ghost"
          @end="dragend_mileStone"
        >
          <transition-group type="transition" name="flip-list">
            <mile-stone-item
              v-for="(mileStone, index) in input_creatingTarget.mileStoneList"
              :key="index"
              :name="mileStone.name"
              :order="index"
              :color="mileStone.color"
              @click-delete="click_deleteMileStone(index)"
            ></mile-stone-item>
          </transition-group>
        </draggable>

        <div
          style="height:9.22vh"
          v-if="input_creatingTarget.mileStoneList.length !== 0"
        ></div>
      </section>
    </main>

    <create-button></create-button>
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
import { Router } from "@/lib/vue-utils";

export default defineComponent({
  components: {
    draggable,
    TopBar,
    TopTips,
    CreateButton,
    PlaceHolder,
    MileStoneItem
  },
  setup(props, context) {
    // 创建目标的数据容器
    const input_creatingTarget: InputTargetType = inject(
      Store.input_creatingTarget,
      reactive({
        id: undefined,
        subjectName: "",
        name: "",
        description: "",
        validityType: "",
        validity: null,
        planList: [],
        isActived: true,
        isFinished: false,
        mileStoneList: []
      })
    );

    const click_relatePlan = () => {
      Router.pushWithParams(context.root.$router, "target-relate-plan", {
        isCreateTarget: true
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
        input_creatingTarget,
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
        input_creatingTarget,
        index,
        mainElement
      );
    };

    // 拖拽结束
    const dragend_mileStone = () => {};

    // 这是那个输入框
    const stickyElement: Ref<HTMLElement | null> = ref(null);

    // 是否显示提示语（当 Sticky 粘贴到顶部就不显示了）
    const mileStoneTipIsShow = computed(() => {
      return input_creatingTarget.mileStoneList.length === 0;
    });

    return {
      input_creatingTarget,
      input_milestoneName,
      click_relatePlan,
      click_deleteMileStone,
      draggableOptions,
      mainElement,
      keyUpEnter_milestoneName,
      dragend_mileStone,
      mileStoneTipIsShow,
      stickyElement
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
