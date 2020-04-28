<template>
  <div class="container">
    <div style="height:2.62vh"></div>
    <ability-item
      class="ability-item"
      v-for="ability in abilityList"
      :key="ability.id"
      :ability="ability"
      v-longclick="() => click_abilityItem(ability)"
    ></ability-item>
    <tb-drawer isShow="ture">
      <tb-input></tb-input>
    </tb-drawer>
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
import AbilityItem from "@/components/AbilityItem.vue";
import TbInput from "@/lib/components/TbInput.vue";
import TbDrawer from "@/lib/components/TbDrawer.vue";
import { InputAbilityType } from "@/lib/types/vue-viewmodels";
export default defineComponent({
  setup(props, context) {
    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

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

    // 用户输入：编辑能力
    const input_editingAbility: InputAbilityType = inject(
      Store.input_editingAbility,
      reactive(
        reactive({
          id: "",
          name: "",
          targetList: [],
          planList: [],
          isActived: true,
          isFinished: false
        })
      )
    );

    // 点击事件：点击能力单项
    const click_abilityItem = (ability: AV.Object) => {
      AbilityPage.openAbilityEditDrawer(
        isEditAbilityDrawerDisplayed,
        input_editingAbility,
        ability
      );
    };

    // 生命周期：初始化
    onMounted(() => {
      console.log("levelRuleList", levelRuleList);
      AbilityPage.init(context.root, abilityList, levelRuleList);
    });

    return { abilityList };
  },
  components: { draggable, AbilityItem, TbInput, TbDrawer }
});
</script>

<style lang="stylus" scoped>
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
</style>
