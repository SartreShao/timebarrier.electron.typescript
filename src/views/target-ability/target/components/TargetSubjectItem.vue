<template>
  <!-- 目标目录 -->
  <div class="target-subject-container" @click="click_isShowButton">
    {{ name }} <span v-if="length">({{ length }})</span>
    <img
      class="icon-downward"
      :src="assets.icon_downward"
      alt="icon_downward"
      v-if="_isShow === true"
    />
    <img
      class="icon-leftward"
      :src="assets.icon_leftward"
      alt="icon_leftward"
      v-else
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import icon_downward from "@/assets/icon_downward.svg";
import icon_leftward from "@/assets/icon_leftward.svg";

export default defineComponent({
  props: {
    isShow: Boolean,
    name: String,
    length: Number
  },
  setup(props, context) {
    const _isShow: Ref<boolean> = ref(false);

    if (props.isShow !== undefined) {
      _isShow.value = props.isShow;
    }

    const click_isShowButton = () => {
      _isShow.value = !_isShow.value;
      context.emit("update:isShow", _isShow.value);
    };

    return {
      _isShow,
      click_isShowButton,
      assets: { icon_downward, icon_leftward }
    };
  }
});
</script>

<style lang="stylus" scoped>
.target-subject-container {
  cursor pointer
  user-select none
  margin-bottom 0.15vh
  position relative
  height 6.52vh
  width 100%
  flex-shrink 0
  background-color #fcfbfc
  display flex
  align-items center
  justify-content center
  font-size 2.02vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.44
  letter-spacing 0.02vh
  text-align left
  color #9a9a9a
  img.icon-downward {
    position absolute
    width 2.35vw
    height 0.65vh
    opacity 0.5
    right 5.52vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
  img.icon-leftward {
    position absolute
    width 1.16vw
    height 1.32vh
    right 6.12vw
    opacity 0.5
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
}
</style>
