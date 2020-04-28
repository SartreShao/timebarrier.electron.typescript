<template>
  <el-drawer
    class="tb-drawer-container"
    :title="title"
    direction="btt"
    size="86.64%"
    :visible.sync="isShow"
  >
    <slot></slot>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: { title: String, isShow: Boolean }
});
</script>

<style lang="stylus" scoped>
.tb-drawer-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center
}
.tb-drawer-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }
  i {
    &:focus {
      outline 0
    }
  }
}
</style>
