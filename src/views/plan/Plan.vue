<template>
  <div class="container">
    <header>
      <section class="title">
        <h1>时间壁垒</h1>
      </section>

      <section class="create-plan">
        <input
          type="text"
          placeholder="点击添加一个临时任务"
          @keyup.enter="keyUpEnter_planInputBox"
          v-model="input_plan"
        />
      </section>
    </header>

    <main>
      <section class="temporary">
        <div
          class="item-container"
          v-for="item in temporaryPlanList"
          v-bind:key="item.id"
        >
          <h2>临时任务</h2>
          <div class="placeholder"></div>
          <h3>{{ item.attributes.name }}</h3>
          <div
            class="finished-button"
            @click="click_completePlanButton(item)"
          ></div>
        </div>
      </section>

      <section class="training"></section>

      <div class="completed-container" @click="click_completedPlanListButton">
        已完成
      </div>
    </main>
    <el-drawer
      title="已完成的番茄"
      :visible.sync="isCompletedPlanDrawerDisplayed"
      direction="btt"
      size="69.64%"
    >
      <section class="temporary"></section>
    </el-drawer>
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  onMounted,
  inject
} from "@vue/composition-api";
import AV from "leancloud-storage";
import BottomBar from "../../components/BottomBar.vue";
import { PlanPage } from "@/lib/vue-viewmodels";
import Store from "../../store";

export default defineComponent({
  components: { BottomBar },
  setup(props, context) {
    // 用户输入：创建的「计划」的名称
    const input_plan: Ref<string> = ref("");
    // 服务器拉取的数据：临时计划的列表
    // 依赖注入=》全局状态
    const temporaryPlanList: Ref<AV.Object[]> = inject(
      Store.temporaryPlanList,
      ref<AV.Object[]>([])
    );
    // 服务器拉取的数据：每日计划的列表
    // 依赖注入=》全局状态
    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref<AV.Object[]>([])
    );
    // 服务器拉取的数据：已完成计划的列表
    // 依赖注入=》全局状体
    const completedPlanList: Ref<AV.Object[]> = inject(
      Store.completedPlanList,
      ref<AV.Object[]>([])
    );
    // 「展示 `已完成的计划列表` 的抽屉」是否已经打开
    const isCompletedPlanDrawerDisplayed: Ref<Boolean> = ref(false);
    // 在计划输入框回车：创建计划
    const keyUpEnter_planInputBox = () => {
      console.log(input_plan.value);
    };
    // 点击事件：点击「完成计划」按钮
    const click_completePlanButton = (item: AV.Object) => {};
    // 点击事件：点击「已完成的计划列表」按钮
    const click_completedPlanListButton = () => {
      isCompletedPlanDrawerDisplayed.value = true;
    };

    onMounted(() => {
      PlanPage.init(
        context.root,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList
      );
    });

    return {
      input_plan,
      temporaryPlanList,
      isCompletedPlanDrawerDisplayed,
      keyUpEnter_planInputBox,
      click_completePlanButton,
      click_completedPlanListButton
    };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3
  header {
    width 100%
    display flex
    flex-direction column
    background white
    position fixed
    top 0
    section.title {
      height 6.52vh
      display flex
      justify-content center
      align-items center
      background white
      h1 {
        font-family SourceHanSansSC
        font-size 2.62vh
        font-weight bold
        font-stretch normal
        font-style normal
        letter-spacing -0.03vh
        text-align center
        color #1b1d2e
      }
    }
    section.create-plan {
      display flex
      justify-content center
      height 5.25vh
      opacity 0.54
      input {
        margin-top 0.3vh
        width 92.67vw
        height 3.9vh
        background-color #e9e9e9
        border-radius 1.95vh
        border none
        text-align center
      }
      input::-webkit-input-placeholder {
        font-size 2.02vh
        font-weight normal
        font-stretch normal
        font-style normal
        letter-spacing 0.03vw
        text-align center
        color #959595
      }
    }
  }
  main {
    position fixed
    top 11.77vh
    height 81.41vh
    overflow scroll
    width 100%
    background #f0f1f3
    display flex
    flex-direction column
    align-items center
    section.temporary {
      margin-top 2.1vh
      margin-bottom 2.1vh
      width 95.73vw
      display flex
      flex-direction column
      div.item-container {
        width 95.73vw
        height 7.2vh
        background white
        display flex
        align-items center
        position relative
        margin-bottom 7px
        h2 {
          font-size 2.02vh
          font-weight 500
          font-stretch normal
          font-style normal
          line-height 1.44
          letter-spacing 0.02vh
          color #434343
          margin-left 4.67vw
          margin-right 3.27vw
        }
        div.placeholder {
          width 0.13vw
          height 2.92vh
          background #707070
        }
        h3 {
          font-size 2.02vh
          font-weight 500
          font-stretch normal
          font-style normal
          line-height 1.44
          letter-spacing 0.02vh
          color #434343
          margin-left 3.27vw
          width 57.73vw
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
        }
        div.finished-button {
          cursor pointer
          width 4.8vw
          height 4.8vw
          border-radius 2.4vw
          border solid 0.15vw #959595
          background-color #ffffff
          position absolute
          right 4.13vw
        }
      }
    }
    section.training {
      width 95.73vw
      display flex
      flex-direction column
    }
    div.completed-container {
      cursor pointer
      margin-top 3.75vh
      width 30.27vw
      height 5.17vh
      border-radius 3.15vh
      background-color #e8e8e8
      display flex
      justify-content center
      align-items center
      font-size 1.95vh
      color #D1D1D1
      letter-spacing 0.03vw
    }
  }
}
</style>
