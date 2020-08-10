<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要容器 -->
    <section class="section">
      <div class="container container-1" @click="click_temporaryPlanButton">
        <h1 class="h-1">创建一个「临时计划」</h1>
        <h2 class="h-2">例如：帮妈妈买菜、完成语文作业、参加同学聚会</h2>
        <svg
          class="icon-click"
          xmlns="http://www.w3.org/2000/svg"
          width="26.344"
          height="39"
          viewBox="0 0 26.344 39"
        >
          <g id="组_1858" data-name="组 1858" transform="translate(-166.4)">
            <path
              id="路径_675"
              data-name="路径 675"
              d="M195.166,13.528l.122-.122a7.528,7.528,0,0,0,0-7.191,7.113,7.113,0,0,0-6.216-3.534,7.345,7.345,0,0,0-3.534.975A6.915,6.915,0,0,0,182,8.166a6.616,6.616,0,0,0,.853,5.241l.122.244h-3.047v-.122a9.808,9.808,0,0,1,0-7.434A9.979,9.979,0,0,1,189.072,0a10.4,10.4,0,0,1,3.778.731,9.449,9.449,0,0,1,5.363,5.241,9.087,9.087,0,0,1,0,7.556v.122h-3.047Z"
              transform="translate(-12.312)"
              fill="#ffe751"
            />
            <path
              id="路径_676"
              data-name="路径 676"
              d="M192.6,218.694a2.7,2.7,0,0,0-2.437-2.194,2.132,2.132,0,0,0-1.706.853v-.244a2.455,2.455,0,0,0-2.316-2.559,2.538,2.538,0,0,0-2.316,2.559v-1.341a2.455,2.455,0,0,0-2.316-2.559,2.538,2.538,0,0,0-2.316,2.559v-8.409a2.273,2.273,0,1,0-4.509,0v14.869a1.253,1.253,0,0,1-1.219,1.341H173.1l-3.291-1.462c-.366-.244-.731-.122-1.1-.244-1.219-.366-2.316,1.219-2.316,2.559a4.556,4.556,0,0,0,1.462,2.438l8.9,9.141h13.65c.366-1.706,1.706-8.166,2.194-12.188A23.766,23.766,0,0,0,192.6,218.694Z"
              transform="translate(0 -197)"
              fill="#ffa01a"
            />
          </g>
        </svg>
      </div>

      <div class="container container-2" @click="click_dailyPlanButton">
        <h1 class="h-1">创建一个「每日计划」</h1>
        <h2 class="h-2">例如：阅读一小时、撰写我的小说《xxx》、慢跑半小时</h2>
        <svg
          class="icon-click"
          xmlns="http://www.w3.org/2000/svg"
          width="26.344"
          height="39"
          viewBox="0 0 26.344 39"
        >
          <g id="组_1858" data-name="组 1858" transform="translate(-166.4)">
            <path
              id="路径_675"
              data-name="路径 675"
              d="M195.166,13.528l.122-.122a7.528,7.528,0,0,0,0-7.191,7.113,7.113,0,0,0-6.216-3.534,7.345,7.345,0,0,0-3.534.975A6.915,6.915,0,0,0,182,8.166a6.616,6.616,0,0,0,.853,5.241l.122.244h-3.047v-.122a9.808,9.808,0,0,1,0-7.434A9.979,9.979,0,0,1,189.072,0a10.4,10.4,0,0,1,3.778.731,9.449,9.449,0,0,1,5.363,5.241,9.087,9.087,0,0,1,0,7.556v.122h-3.047Z"
              transform="translate(-12.312)"
              fill="#ffe751"
            />
            <path
              id="路径_676"
              data-name="路径 676"
              d="M192.6,218.694a2.7,2.7,0,0,0-2.437-2.194,2.132,2.132,0,0,0-1.706.853v-.244a2.455,2.455,0,0,0-2.316-2.559,2.538,2.538,0,0,0-2.316,2.559v-1.341a2.455,2.455,0,0,0-2.316-2.559,2.538,2.538,0,0,0-2.316,2.559v-8.409a2.273,2.273,0,1,0-4.509,0v14.869a1.253,1.253,0,0,1-1.219,1.341H173.1l-3.291-1.462c-.366-.244-.731-.122-1.1-.244-1.219-.366-2.316,1.219-2.316,2.559a4.556,4.556,0,0,0,1.462,2.438l8.9,9.141h13.65c.366-1.706,1.706-8.166,2.194-12.188A23.766,23.766,0,0,0,192.6,218.694Z"
              transform="translate(0 -197)"
              fill="#ffa01a"
            />
          </g>
        </svg>
      </div>

      <div class="container container-3">
        <h1 class="h-1">迷茫，不知道我该做什么计划</h1>
        <h2 class="h-2">也许，我们应该从发掘您的「目标」开始做起</h2>
        <svg
          class="icon-click"
          xmlns="http://www.w3.org/2000/svg"
          width="26.344"
          height="39"
          viewBox="0 0 26.344 39"
        >
          <g id="组_1858" data-name="组 1858" transform="translate(-166.4)">
            <path
              id="路径_675"
              data-name="路径 675"
              d="M195.166,13.528l.122-.122a7.528,7.528,0,0,0,0-7.191,7.113,7.113,0,0,0-6.216-3.534,7.345,7.345,0,0,0-3.534.975A6.915,6.915,0,0,0,182,8.166a6.616,6.616,0,0,0,.853,5.241l.122.244h-3.047v-.122a9.808,9.808,0,0,1,0-7.434A9.979,9.979,0,0,1,189.072,0a10.4,10.4,0,0,1,3.778.731,9.449,9.449,0,0,1,5.363,5.241,9.087,9.087,0,0,1,0,7.556v.122h-3.047Z"
              transform="translate(-12.312)"
              fill="#ffe751"
            />
            <path
              id="路径_676"
              data-name="路径 676"
              d="M192.6,218.694a2.7,2.7,0,0,0-2.437-2.194,2.132,2.132,0,0,0-1.706.853v-.244a2.455,2.455,0,0,0-2.316-2.559,2.538,2.538,0,0,0-2.316,2.559v-1.341a2.455,2.455,0,0,0-2.316-2.559,2.538,2.538,0,0,0-2.316,2.559v-8.409a2.273,2.273,0,1,0-4.509,0v14.869a1.253,1.253,0,0,1-1.219,1.341H173.1l-3.291-1.462c-.366-.244-.731-.122-1.1-.244-1.219-.366-2.316,1.219-2.316,2.559a4.556,4.556,0,0,0,1.462,2.438l8.9,9.141h13.65c.366-1.706,1.706-8.166,2.194-12.188A23.766,23.766,0,0,0,192.6,218.694Z"
              transform="translate(0 -197)"
              fill="#ffa01a"
            />
          </g>
        </svg>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, reactive } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import { Router } from "@/lib/vue-utils";
import Store from "@/store";
import { InputPlanType } from "@/lib/types/vue-viewmodels";
import { PlanPage } from "@/lib/vue-viewmodels";
export default defineComponent({
  components: { TopBar },
  setup(props, context) {
    // 正在创建的计划
    const input_creatingPlan: InputPlanType = inject(
      Store.input_creatingPlan,
      reactive({
        id: undefined,
        name: "",
        abilityList: [],
        targetList: [],
        type: "temporary",
        target: "",
        isActived: false,
        isFinished: false,
        deadline: ""
      })
    );

    // 点击事件：创建临时计划
    const click_temporaryPlanButton = () => {
      PlanPage.openCreateTemporaryPlanPage(context.root, input_creatingPlan);
    };

    // 点击事件：创建每日计划
    const click_dailyPlanButton = () => {
      PlanPage.openCreateDailyPlanPage(context.root, input_creatingPlan);
    };

    return {
      click_temporaryPlanButton,
      click_dailyPlanButton
    };
  }
});
</script>

<style lang="stylus" scoped>
.section {
  margin-top 7.52vh
  display flex
  flex-direction column
  height 100%
  width 100%
}

.container {
  cursor pointer
  height 30.82666vh
  width 100vw
  display flex
  flex-direction column
  align-items center
}

.container-1 {
  background #F9385E
}

.container-2 {
  background #222A36
}

.container-3 {
  background #552FB9
}

.h-1 {
  line-height 2.92vh
  margin-top 11.32vh
  margin-bottom 0
  font-size 2.02vh
  font-weight bold
  color white
}

.h-2 {
  line-height 2.62vh
  margin-top 1.2vh
  margin-bottom 0
  font-size 1.8vh
  font-weight normal
  color white
  opacity 0.8
}

.icon-click {
  margin-top 4.12vh
  width 3.51vw
  height 2.92vh
}
</style>
