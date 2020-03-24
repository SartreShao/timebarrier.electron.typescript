<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { defineComponent } from "@vue/composition-api";
import Store from "./store";
export default defineComponent({
  setup() {
    // 提供依赖注入
    Store.useProvider();
  }
});
</script>
<style lang="stylus">
@import './public/public.stylus'
#app {
  width 100%
  height 100%
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
</style>
