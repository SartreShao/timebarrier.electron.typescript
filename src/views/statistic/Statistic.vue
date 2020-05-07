<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- Tab View -->
    <tab-view
      :tabRouteList="tabRouteList"
      style="position:fixed;top:7.52vh;"
    ></tab-view>

    <main>
      <router-view />
    </main>

    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
import TabView from "../../components/TabView.vue";

export default defineComponent({
  setup(props, context) {
    // Tab 的名称
    const tabRouteList = [
      { route: "/statistic/tomato", name: "番茄记录" },
      { route: "/statistic/chart", name: "数据图表" }
    ];

    return {
      tabRouteList
    };
  },
  components: { TopBar, BottomBar, TabView }
});
</script>
<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3
}
main {
  position fixed
  top 12.77vh
  height 80.41vh
  width 100%
  background #F5F5F5
  display flex
  flex-direction column
  align-items center
}
</style>
