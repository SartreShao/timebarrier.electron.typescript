<template>
  <div>
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 主要界面 -->
    <main style="margin-top: 7.52vh; overflow:scroll; height: 92.48vh;">
      <!-- 顶部提示语 -->
      <top-tips
        title="Step 0：请选择一个「目标类别」"
        sub-title="您希望创建哪个方向的目标？"
      >
      </top-tips>

      <div class="target-subject-container">
        <target-subject-item
          v-for="item in targetSubjectList"
          :key="item.title"
          :icon="item.icon"
          :color="item.color"
          :title="item.title"
          @click="click_targetSubject(item.title)"
        ></target-subject-item>
      </div>
    </main>

    <custom-target-subject
      :isShow="isCustomTargetSubjectShow"
      @click-background="isCustomTargetSubjectShow = false"
    ></custom-target-subject>
  </div>
</template>

<script lang="ts">
import TopTips from "@/components/TopTips.vue";
import TopBar from "@/components/TopBar.vue";
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted,
  reactive
} from "@vue/composition-api";
import TargetSubjectItem from "./components/TargetSubjectItem.vue";
import icon_body from "@/assets/icon_body.svg";
import icon_brain from "@/assets/brain_icon.svg";
import icon_school from "@/assets/icon_school.svg";
import icon_work from "@/assets/icon_work.svg";
import icon_money from "@/assets/icon_money.svg";
import icon_create from "@/assets/icon_create.svg";
import Store from "@/store";
import console from "console";
import { InputTargetType } from "@/lib/types/vue-viewmodels";
import CustomTargetSubject from "./components/CustomTargetSubject.vue";

export default defineComponent({
  components: { TopTips, TopBar, TargetSubjectItem, CustomTargetSubject },
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
        abilityList: [],
        planList: [],
        isActived: true,
        isFinished: false
      })
    );

    // 可以选择的 subject 名称
    const targetSubjectList: Ref<[]> = ref([
      { icon: icon_body, color: "#DA4B6E", title: "身体目标" },
      { icon: icon_brain, color: "#053D75", title: "精神目标" },
      { icon: icon_school, color: "#5F4B8B", title: "学业目标" },
      { icon: icon_work, color: "#222A36", title: "职业目标" },
      { icon: icon_money, color: "#AE5B99", title: "财务目标" },
      { icon: icon_create, color: "#59596F", title: "自定义目标" }
    ]);

    // 创建自定义目标类别是否显示
    const isCustomTargetSubjectShow = ref(false);

    // 点击事件：点击目标类别
    const click_targetSubject = (subjectName: string) => {
      if (subjectName === "自定义目标") {
        isCustomTargetSubjectShow.value = true;
      } else {
        console.log(subjectName);
      }
    };

    // 初始化
    onMounted(() => {
      input_creatingTarget.id = undefined;
      input_creatingTarget.subjectName = "";
      input_creatingTarget.name = "";
      input_creatingTarget.description = "";
      input_creatingTarget.validityType = "";
      input_creatingTarget.validity = null;
      input_creatingTarget.abilityList = [];
      input_creatingTarget.planList = [];
      input_creatingTarget.isActived = true;
      input_creatingTarget.isFinished = false;
    });

    return {
      targetSubjectList,
      click_targetSubject,
      isCustomTargetSubjectShow
    };
  }
});
</script>

<style lang="stylus" scoped>
.target-subject-container {
  display flex
  flex-wrap wrap
  width 100%
  height 75.26vh
}
</style>
