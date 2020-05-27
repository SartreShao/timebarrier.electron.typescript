<template>
  <div class="container" v-infinite-scroll="loadMore">
    <transition-group type="transition" name="flip-list">
      <div v-for="(statDate, index) in statDateList" :key="index">
        <div v-if="index !== 0" style="height:0.15vh"></div>

        <date-item
          :date="statDate.date"
          :totalTime="statDate.totalTime"
          :color="colormap[index % colormap.length]"
          :todayAbilityNumber="statDate.statAbilityList.length"
          type="ability"
        ></date-item>

        <ability-charts
          :mode="abilityStatStatusMode"
          style="margin-top:0.15vh"
          :statAbilityList="statDate.statAbilityList"
        ></ability-charts>

        <ability-item
          v-for="(ability, abilityIndex) in statDate.statAbilityList"
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
    <div style="height:12.32vh"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  inject,
  onMounted,
  computed
} from "@vue/composition-api";
import DateItem from "../components/DateItem.vue";
import AbilityCharts from "../components/AbilityCharts.vue";
import AbilityItem from "../components/AbilityItem.vue";
import { StatStatusMode } from "@/lib/types/vue-viewmodels";
import Store from "@/store";
import AV from "leancloud-storage";
import { StatPage } from "@/lib/vue-viewmodels/index";

export default defineComponent({
  components: { DateItem, AbilityCharts, AbilityItem },
  setup(props, context) {
    const tomatoList: Ref<AV.Object[]> = inject(Store.tomatoList, ref([]));

    const statDateList = computed(() => StatPage.mapStatDate(tomatoList.value));

    const abilityStatStatusMode: Ref<StatStatusMode> = inject(
      Store.abilityStatStatusMode,
      ref("simple")
    );

    const colormap: string[] = inject(Store.colormap, []);

    const loadMore = () => {
      StatPage.loadMore(context.root, tomatoList);
    };

    onMounted(() => {
      StatPage.initTomatoList(context.root, tomatoList);
    });

    return {
      abilityStatStatusMode,
      colormap,
      statDateList,
      loadMore
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
