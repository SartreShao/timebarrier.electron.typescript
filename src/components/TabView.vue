<template>
  <div class="tab-container">
    <div
      v-for="(item, index) in tabRouteList"
      :key="index"
      @click="click_tabItem(item)"
      :class="
        currentRoute.startsWith(item.route) ? `tab-item` : `tab-item-unselected`
      "
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script lang="ts">
/**
 * 传输数据：
 * @param tabRouteList 类型：{ route: string; name: string }[]
 */
import { defineComponent, ref, computed } from "@vue/composition-api";
import { Router } from "@/lib/vue-utils";
import * as _ from "lodash";
export default defineComponent({
  setup(props, context) {
    const click_tabItem = (item: { route: string; name: string }) => {
      Router.replace(context.root.$router, item.route);
    };

    const currentRoute = computed(() => context.root.$route.fullPath);

    return {
      click_tabItem,
      currentRoute
    };
  },
  props: {
    tabRouteList: {
      type: Array
    }
  }
});
</script>

<style lang="stylus" scoped>
.tab-container {
  width 100%
  height 5.17vh
  display flex
  flex-direction row
  .tab-item {
    cursor pointer
    width 50vw
    height 5.17vh
    display flex
    justify-content center
    align-items center
    font-size 2.02vh
    font-weight 500
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align center
    color #434343
    &-unselected {
      cursor pointer
      width 50vw
      height 5.17vh
      display flex
      justify-content center
      align-items center
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      text-align center
      color #cecece
    }
  }
}
</style>
