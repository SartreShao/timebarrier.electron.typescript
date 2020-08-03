<template>
  <div class="container">
    <div style="height:2.62vh"></div>
    <draggable
      :options="draggableOptions"
      v-model="abilityList"
      ghost-class="ghost"
      @end="dragend_abilityList"
    >
      <transition-group type="transition" name="flip-list">
        <ability-item
          v-splash-when-click
          class="ability-item"
          v-for="ability in abilityList"
          :key="ability.id"
          :ability="ability"
          @click="click_abilityItem(ability)"
        ></ability-item>
      </transition-group>
    </draggable>

    <!-- 创建 Ability 的按钮 -->
    <div class="create-ability-container" @click="click_createAbilityButton">
      <img :src="assets.icon_plus" alt="icon_plus" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  watch,
  inject,
  Ref,
  onMounted
} from "@vue/composition-api";
import draggable from "vuedraggable";
import Store from "../../../store";
import AV from "leancloud-storage";
import { AbilityPage } from "@/lib/vue-viewmodels";
import AbilityItem from "./components/AbilityItem.vue";
import TbInput from "@/lib/components/TbInput.vue";
import TbDrawer from "@/lib/components/TbDrawer.vue";
import { InputAbilityType } from "@/lib/types/vue-viewmodels";
import icon_plus from "@/assets/icon_plus.svg";
export default defineComponent({
  setup(props, context) {
    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

    // 配置信息
    const draggableOptions = inject(Store.draggableOptions, {});

    // 能力等级列表
    const levelRuleList: Ref<AV.Object[]> = inject(
      Store.levelRuleList,
      ref([])
    );

    // 控制变量：编辑能力抽屉
    const isEditAbilityDrawerDisplayed: Ref<boolean> = inject(
      Store.isEditAbilityDrawerDisplayed,
      ref(false)
    );

    // 控制变量：创建能力抽屉
    const isCreateAbilityDrawerDisplayed: Ref<boolean> = inject(
      Store.isCreateAbilityDrawerDisplayed,
      ref(false)
    );

    // 用户输入：编辑能力
    const input_editingAbility: InputAbilityType = inject(
      Store.input_editingAbility,
      reactive({
        id: "",
        name: "",
        targetList: [],
        planList: [],
        isActived: true,
        isFinished: false
      })
    );

    // 用户输入：创建能力
    const input_creatingAbility: InputAbilityType = inject(
      Store.input_creatingAbility,
      reactive({
        id: undefined,
        name: "",
        targetList: [],
        planList: [],
        isActived: true,
        isFinished: false
      })
    );

    // 点击事件：点击能力单项
    const click_abilityItem = (ability: AV.Object) => {
      AbilityPage.openAbilityEditDrawer(
        isEditAbilityDrawerDisplayed,
        input_editingAbility,
        ability
      );
    };

    // 点击事件：点击创建能力
    const click_createAbilityButton = () => {
      AbilityPage.openAbilityCreateDrawer(
        isCreateAbilityDrawerDisplayed,
        input_creatingAbility
      );
    };

    // 拖动结束：能力列表
    const dragend_abilityList = () => {
      AbilityPage.changeAbilityListOrder(abilityList.value);
    };

    return {
      abilityList,
      draggableOptions,
      isEditAbilityDrawerDisplayed,
      click_abilityItem,
      click_createAbilityButton,
      dragend_abilityList,
      assets: { icon_plus }
    };
  },
  components: { draggable, AbilityItem, TbInput, TbDrawer }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}

.container {
  height 100%
  width 100%
  background #F5F5F5
  overscroll-behavior none
  overflow scroll
  display flex
  flex-direction column
  align-items center
}

.ability-item {
  margin-bottom 1.57vh
}

.create-ability-container {
  background white
  z-index 999
  cursor pointer
  width 7.5vh
  height 7.5vh
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  background-color #f4f4f8
  display flex
  align-items center
  justify-content center
  position fixed
  border-radius 50%
  right 5.07vw
  bottom 3vh + 6.82vh

  img {
    cursor pointer
    width 2.05vh
    height 2.05vh
  }
}
</style>
