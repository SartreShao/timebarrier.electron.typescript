<template>
  <!-- 顶边栏 -->
  <header>
    <!-- 状态栏占位 -->
    <div style="height:1vh"></div>
    <!-- 标题与刷新按钮 -->
    <section class="title">
      <img :src="assets.icon_logo" alt="icon_logo" />
      <h1>时间壁垒</h1>
    </section>
  </header>
</template>

<script lang="ts">
import icon_logo from "../assets/icon_logo.svg";
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {
    return {
      assets: { icon_logo }
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
    img {
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
</style>
