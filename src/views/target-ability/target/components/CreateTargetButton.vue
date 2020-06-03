<template>
  <!-- 添加「目标」按钮 -->
  <div class="add-button" @click="click_createTargetButton">
    <div v-darked-when-click>
      <img :src="assets.icon_create_target" alt="icon_create_target" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  inject,
  ref,
  reactive
} from "@vue/composition-api";
import icon_create_target from "@/assets/icon_create_target.svg";
import { TargetPage } from "@/lib/vue-viewmodels";
import Store from "@/store";
import { InputTargetOrTargetSubjectType } from "@/lib/types/vue-viewmodels";

export default defineComponent({
  setup(props, context) {
    // 控制变量：「创建目标」的抽屉菜单是否打开
    const isCreateTargetDrawerDisplayed: Ref<boolean> = inject(
      Store.isCreateTargetDrawerDisplayed,
      ref(false)
    );

    // 用户输入：创建「目标」或「目标类别」
    const input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType = inject(
      Store.input_creatingTargetOrTargetSubject,
      reactive({
        inputType: "target", // 默认选择：目标
        target: {
          id: "",
          targetSubjectId: "", //默认：不选择
          name: "",
          description: "",
          validityType: "",
          validity: null,
          abilityList: [],
          planList: [],
          isActived: true,
          isFinished: false
        },
        targetSubject: {
          id: "",
          name: ""
        }
      })
    );

    // 点击事件：创建目标
    const click_createTargetButton = () => {
      TargetPage.openTargetSubjectCreateDrawer(
        isCreateTargetDrawerDisplayed,
        input_creatingTargetOrTargetSubject
      );
    };
    return { click_createTargetButton, assets: { icon_create_target } };
  }
});
</script>

<style lang="stylus" scoped>
.add-button {
  cursor pointer
  flex-shrink 0
  width 100%
  height 6.45vh
  background white
  div {
    height 100%
    width 100%
    display flex
    justify-content center
    align-items center
    img {
      width 2.1vh
      height 2.1vh
    }
  }
}
</style>
