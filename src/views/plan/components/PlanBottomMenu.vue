<template>
  <div
    @click="$emit('click-background')"
    class="background"
    :style="{
      background: isShow ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
      height: isShow ? '100%' : '0'
    }"
  >
    <section class="section" :style="{ height: isShow ? '39.58vh' : `0` }">
      <div class="item item-1" v-darked-when-click>查看子任务：22 / 30</div>
      <div class="item" @click="$emit('click-edit')" v-darked-when-click>
        编辑计划
      </div>
      <div class="item" v-darked-when-click>转变为「未激活」状态</div>
      <div
        class="item item-4"
        @click="$emit('click-delete')"
        v-darked-when-click
      >
        删除计划
      </div>
      <div class="item" @click="$emit('click-cancel')" v-darked-when-click>
        取消
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    isShow: Boolean
  }
});
</script>

<style lang="stylus" scoped>
.background {
  z-index 1
  width 100%
  height 100%
  position fixed
  top 0
  bottom 0
  left 0
  right 0
  background rgba(0, 0, 0, 0.5)
  transition all 0s ease
}

.section {
  width 100%
  border-radius 1.65vh 1.65vh 0 0
  position fixed
  bottom 0
  left 0
  right 0
  background #F6F7F8
  display flex
  flex-direction column
  transition all 0.4s ease
}

.item {
  cursor pointer
  height 7.65vh
  width 100%
  background white
  display flex
  align-items center
  justify-content center
  color #222A36
  font-size 2.17vh
  margin-bottom 0.15vh
}

.item-1 {
  border-radius 1.65vh 1.65vh 0 0
}

.item-4 {
  color #F9385E
  margin-bottom 0.9vh
}
</style>
