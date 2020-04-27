<template>
  <div class="container">
    <div style="height:2.62vh"></div>
    <ability-item
      class="ability-item"
      v-for="ability in abilityList"
      v-bind:key="ability.id"
      v-bind:ability="ability"
    ></ability-item>
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
import AbilityItem from "../../../components/AbilityItem.vue";
export default defineComponent({
  setup(props, context) {
    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

    // 能力等级列表
    const levelRuleList: Ref<AV.Object[]> = inject(
      Store.levelRuleList,
      ref([])
    );

    // 生命周期：初始化
    onMounted(() => {
      console.log("levelRuleList", levelRuleList);
      AbilityPage.init(context.root, abilityList, levelRuleList);
    });

    return { abilityList };
  },
  components: { draggable, AbilityItem }
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
