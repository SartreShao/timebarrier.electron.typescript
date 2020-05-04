<template>
  <div class="option-container" @click="$emit(`click`)">
    <img class="icon" :src="icon" alt="option_icon" :style="imgStyle" />
    <div class="name">{{ name }}</div>
    <span class="description" v-if="notification === 0">{{ description }}</span>
    <div class="notification-container" v-else>
      <span>{{ notification }}</span>
    </div>
    <img class="enter" :src="assets.icon_enter_right" alt="icon_enter" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import icon_enter_right from "@/assets/icon_enter_right.svg";
export default defineComponent({
  props: {
    icon: String,
    name: String,
    description: String,
    notification: Number,
    iconWidth: String,
    iconHeight: String,
    iconMarginLeft: String
  },
  setup(props, context) {
    const imgStyle = reactive({
      height: props.iconHeight,
      width: props.iconWidth,
      marginLeft: props.iconMarginLeft
    });
    return {
      imgStyle,
      assets: {
        icon_enter_right
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
.option-container {
  height 8.4vh
  width 100%
  background white
  position relative
  .icon {
    position absolute
    height 2.47vh
    width 2.47vh
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
  }
  .name {
    position absolute
    top 0
    left 14.67vw
    bottom 0
    margin-top auto
    margin-bottom auto
    height 3.3vh
    font-size 2.25vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.47
    letter-spacing 0.02vh
    text-align left
    color #222a36
  }
  .description {
    height 2.7vh
    position absolute
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    right 12.4vw
    opacity 0.36
    font-size 1.87vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.2px
    text-align right
    color #222a36
  }
  .notification-container {
    position absolute
    top 0
    bottom 0
    width 3vh
    height 3vh
    margin-top auto
    margin-bottom auto
    border-radius 50%
    background #ff5050
    right 12.4vw
    display flex
    align-items center
    justify-content center
    span {
      font-size 1.65vh
      font-weight bold
      font-stretch normal
      font-style normal
      line-height 1.45
      letter-spacing 0.01vh
      text-align left
      color #ffffff
    }
  }
  .enter {
    position absolute
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    width 1.13vw
    height 1.27vh
    right 4.93vw
  }
}
</style>
