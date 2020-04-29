<template>
  <el-drawer
    class="tb-drawer-container"
    :title="title"
    direction="btt"
    size="86.64%"
    :visible.sync="_visible"
  >
    <slot></slot>
  </el-drawer>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watchEffect,
  watch,
  Ref
} from "@vue/composition-api";

export default defineComponent({
  props: { title: String, visible: Boolean },
  setup(props, context) {
    const _visible: Ref<boolean> = ref(false);

    if (props.visible !== undefined) {
      _visible.value = props.visible;
    }

    watch(
      () => props.visible,
      (newVal, oldVal) => {
        if (newVal !== undefined) {
          _visible.value = newVal;
        }
      }
    );

    watch(_visible, (newVal, oldVal) => {
      context.emit("update:visible", newVal);
    });

    return {
      _visible
    };
  }
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
