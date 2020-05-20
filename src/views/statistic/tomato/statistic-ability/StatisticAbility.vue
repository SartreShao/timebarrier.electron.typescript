<template>
  <div class="container">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statAbilityDate, index) in statAbilityDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>

        <date-item
          :date="statAbilityDate.date"
          :totalTime="statAbilityDate.totalTime"
          :color="colormap[index % colormap.length]"
          :todayAbilityNumber="statAbilityDate.todayAbilityNumber"
          type="ability"
        ></date-item>

        <ability-charts
          :mode="abilityStatStatusMode"
          style="margin-top:0.15vh"
          :statAbilityList="statAbilityDate.statAbilityList"
        ></ability-charts>

        <ability-item
          v-for="(ability, abilityIndex) in statAbilityDate.statAbilityList"
          :key="abilityIndex"
          :name="ability.attributes.name"
          style="margin-top:0.15vh"
          :tomato-number="ability.attributes.todayTomatoNumber"
          :target-tomato-number="ability.attributes.targetTomatoNumber"
          :totalTime="ability.attributes.totalTime"
          :currentTime="ability.attributes.todayTotalTime"
          :total-tomato-number="ability.attributes.tomatoNumber"
          :color="colormap[abilityIndex % colormap.length]"
          :mode="abilityStatStatusMode"
        ></ability-item>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted
} from "@vue/composition-api";
import DateItem from "../components/DateItem.vue";
import AbilityCharts from "../components/AbilityCharts.vue";
import AbilityItem from "../components/AbilityItem.vue";
import { StatAbilityDate, StatStatusMode } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import { StatAbilityPage } from "@/lib/vue-viewmodels";

export default defineComponent({
  components: { DateItem, AbilityCharts, AbilityItem },
  setup(props, context) {
    const statAbilityDateList: Ref<StatAbilityDate[]> = ref([]);

    const abilityStatStatusMode: Ref<StatStatusMode> = inject(
      Store.abilityStatStatusMode,
      ref("simple")
    );

    const colormap: string[] = inject(Store.colormap, []);

    onMounted(() => {
      StatAbilityPage.init(context.root, statAbilityDateList);
    });

    return {
      statAbilityDateList,
      abilityStatStatusMode,
      colormap
    };
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
</style>
