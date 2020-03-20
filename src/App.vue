<template>
  <div id="app">
    <router-view />
  </div>
</template>

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
  background-color #3846CF !important
  border-color #3846CF !important
}
.el-drawer__header {
  margin-bottom 3.9vh !important
}
</style>
