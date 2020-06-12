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
import icon_personal from "@/assets/icon_personal.svg";
import icon_plan_tab from "@/assets/icon_plan_tab.svg";
import icon_tomato_tab from "@/assets/icon_tomato_tab.svg";

export default defineComponent({
  components: { TbSelect },
  setup(props, context) {
    const selectOptions: Ref<{
      name: string;
      icon: string;
      route: string;
    }[]> = ref([
      {
        name: "整体统计",
        icon: icon_personal,
        route: "/statistic/chart/multiple-analyse"
      },
      {
        name: "计划统计",
        icon: icon_plan_tab,
        route: "/statistic/chart/plan-analyse"
      },
      {
        name: "目标统计",
        icon: icon_target_tab,
        route: "/statistic/chart/target-analyse"
      },
      {
        name: "能力统计",
        icon: icon_ability_tab,
        route: "/statistic/chart/ability-analyse"
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
