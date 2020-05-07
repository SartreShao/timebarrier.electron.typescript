<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { defineComponent, inject, watch, Ref, ref } from "@vue/composition-api";
import Store from "./store";
import * as _ from "lodash";
export default defineComponent({
  setup(props, context) {
    // 提供依赖注入
    Store.useProvider();

    // 监听全局路由
    const homePagePathList: string[] = [
      "/plan",
      "/target-ability",
      "/statistic/",
      "/me"
    ];

    const isCurrentPageHome: Ref<boolean> = inject(
      Store.isCurrentPageHome,
      ref(false)
    );

    watch(
      () => context.root.$route,
      (to, from) => {
        for (let homePagePath of homePagePathList) {
          if (_.startsWith(to.fullPath, homePagePath)) {
            isCurrentPageHome.value = true;
            break;
          } else {
            isCurrentPageHome.value = false;
          }
        }
      }
    );
  }
});
</script>
<style lang="stylus">
@import './public/public.stylus'
* {
  flex-shrink 0
  -webkit-tap-highlight-color rgba(0, 0, 0, 0) /* 点击高亮的颜色 */
}
#app {
  width 100%
  height 100%
}
input {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
}
body, h1, h2, h3, h4, h5, h6 {
  margin 0
  margin-block-start 0
  margin-block-end 0
  margin-inline-start 0
  margin-inline-end 0
}
::-webkit-scrollbar {
  display none
}
.el-message-box {
  width 85% !important
  max-width 420px
}
.el-button--primary {
  background-color #222A36 !important
  border-color #222A36 !important
}
.el-drawer__header {
  margin-bottom 3.9vh !important
}
.draggable-drag {
}
.draggable-ghost {
  opacity 0
}
.draggable-chosen {
  box-shadow 0.75vh 0.75vh 0.37vh -0.07vh rgba(0, 0, 0, 0.05)
}
</style>
