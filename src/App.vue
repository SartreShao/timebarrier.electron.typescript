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
