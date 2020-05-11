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

    <div class="transition">
      <img :src="assets.icon_transition" alt="icon_transition" />
    </div>

    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
import TabView from "../../components/TabView.vue";
import icon_transition from "@/assets/icon_transition.svg";

export default defineComponent({
  setup(props, context) {
    // Tab 的名称
    const tabRouteList = [
      { route: "/statistic/tomato", name: "番茄记录" },
      { route: "/statistic/chart", name: "数据图表" }
    ];

    return {
      tabRouteList,
      assets: { icon_transition }
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
.transition {
  cursor pointer
  position fixed
  bottom 9vh
  right 5.07vw
  width 7.5vh
  height 7.5vh
  border-radius 50%
  background white
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  display flex
  justify-content center
  align-items center
  img {
    width 4.85vw
    height 2.16vh
  }
}
</style>
