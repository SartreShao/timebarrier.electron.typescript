<template>
  <!-- 顶边栏 -->
  <header>
    <!-- 状态栏占位 -->
    <div style="height:1vh"></div>
    <!-- 标题与刷新按钮 -->
    <section class="title">
      <img
        :src="assets.icon_logo"
        alt="icon_logo"
        v-if="isCurrentPageHome"
        class="icon-logo"
      />
      <div class="back" v-if="!isCurrentPageHome" @click="click_backButton">
        <img :src="assets.icon_back" alt="icon_back" class="icon-back" />
      </div>
      <div class="home" v-if="!isCurrentPageHome">
        <img :src="assets.icon_home" alt="icon_home" class="icon-home" />
      </div>
      <h1>时间壁垒</h1>
    </section>
  </header>
</template>

<script lang="ts">
import icon_logo from "../assets/icon_logo.svg";
import icon_home from "../assets/icon_home.svg";
import icon_back from "../assets/icon_back.svg";
import { defineComponent, watch, ref, inject } from "@vue/composition-api";
import Store from "@/store";
import { Router } from "@/lib/vue-utils";

export default defineComponent({
  setup(props, context) {
    const isCurrentPageHome = inject(Store.isCurrentPageHome, ref(false));

    // 点击事件：后退按钮
    const click_backButton = () => {
      Router.back(context.root.$router);
    };

    return {
      click_backButton,
      isCurrentPageHome,
      assets: { icon_logo, icon_home, icon_back }
    };
  }
});
</script>

<style lang="stylus" scoped>
// 背景颜色
$bacground-color = white
// 顶边栏高度
$top-bar-height = 6.52vh
// 标题字体大小
$title-font-size = 2.62vh
// 标题字体颜色
$title-font-color = #222A36
// 顶边栏的容器
header {
  width 100%
  display flex
  flex-direction column
  background $bacground-color
  position fixed
  top 0
  // 标题和按钮的容器
  section.title {
    height $top-bar-height
    display flex
    justify-content center
    align-items center
    background $bacground-color
    position relative
    h1 {
      font-size $title-font-size
      font-weight bold
      font-stretch normal
      font-style normal
      letter-spacing -0.03vh
      text-align center
      color $title-font-color
    }
    .icon-logo {
      cursor pointer
      top 0
      bottom 0
      margin-top auto
      margin-bottom auto
      left 6.06vw
      position absolute
      width 2.89vh
      height 2.89vh
    }
  }
}
.back {
  cursor pointer
  position absolute
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  width 10.53vw
  height 4.27vh
  left 1.73vw
  display flex
  align-items center
  justify-content center
}
.icon-back {
  width 1.92vw
  height 1.82vh
}
.home {
  cursor pointer
  position absolute
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  left 12.27vw
  width 10.53vw
  height 4.27vh
  display flex
  align-items center
  justify-content center
}
.icon-home {
  width 1.96vh
  height 1.94vh
}
</style>
