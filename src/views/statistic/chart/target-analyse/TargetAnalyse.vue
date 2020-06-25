<template>
  <div class="container">
    <rectangular-tree type="target"></rectangular-tree>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import RectangularTree from "../components/RectangularTree.vue";

export default defineComponent({
  components: {
    RectangularTree
  }
});
</script>

<style lang="stylus" scoped>
.flip-list-move {
  transition transform 0.5s
}
.container {
  display flex
  flex-direction column
  height 75.31vh
  width 100%
  overflow scroll
  -ms-overflow-style none
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display none
  }
}
.horizontal-container {
  width 100%
  height 7.8vh
  display flex
  justify-content space-between
  background #F5F5F5
}
.vertical-container {
  width 100%
  display flex
  flex-direction column
  background #F5F5F5
}
.month-container {
  cursor pointer
  position relative
  width 100%
  height 5.55vh
  display flex
  align-items center
  justify-content center
  font-size 1.8vh
  color white
  font-weight bold
  .icon-downward {
    position absolute
    width 2.35vw
    height 0.65vh
    opacity 1
    right 5.52vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
  .icon-leftward {
    position absolute
    width 1.16vw
    height 1.32vh
    right 6.12vw
    opacity 1
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
}
.el-carousel__item h3 {
  color #475669
  font-size 18px
  opacity 0.75
  margin 0
}
</style>
