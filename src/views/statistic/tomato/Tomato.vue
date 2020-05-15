<template>
  <div class="container">
    <tb-select
      :select-options="selectOptions"
      style="margin-top:0.15vh;"
    ></tb-select>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import TbSelect from "@/lib/components/TbSelect.vue";
import icon_ability_tab from "@/assets/icon_ability_tab.svg";
import icon_target_tab from "@/assets/icon_target_tab.svg";
import icon_tomato_tab from "@/assets/icon_tomato_tab.svg";
import icon_plan_tab from "@/assets/icon_plan_tab.svg";

export default defineComponent({
  components: { TbSelect },
  setup(props, context) {
    const selectOptions: Ref<{
      name: string;
      icon: string;
      route: string;
    }[]> = ref([
      {
        name: "番茄视图",
        icon: icon_tomato_tab,
        route: "/statistic/tomato/statistic-tomato"
      },
      {
        name: "计划视图",
        icon: icon_plan_tab,
        route: "/statistic/tomato/statistic-plan"
      },
      {
        name: "目标视图",
        icon: icon_target_tab,
        route: "/statistic/tomato/statistic-target"
      },
      {
        name: "能力视图",
        icon: icon_ability_tab,
        route: "/statistic/tomato/statistic-ability"
      }
    ]);

    return {
      selectOptions
    };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  width 100%
}
main {
  position fixed
  top 18.66vh
  width 100%
  background #F5F5F5
  display flex
  flex-direction column
  align-items center
}
</style>
