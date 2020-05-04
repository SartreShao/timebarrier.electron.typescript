<template>
  <div class="me-personal-info-container">
    <div class="avatar-qrcode-container">
      <!-- 头像与 VIP -->
      <div class="avatar-container">
        <img :src="avatarUrl" alt="avatar" class="avatar" />
        <img v-if="isVip" :src="assets.icon_vip" alt="icon_vip" class="vip" />
      </div>

      <!-- 二维码 -->
      <img :src="assets.icon_qrcode" alt="icon_qrcode" class="qrcode" />
    </div>

    <div class="name">{{ name }}</div>

    <div class="description">{{ description }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import icon_qrcode from "@/assets/icon_qrcode.svg";
import icon_vip from "@/assets/icon_vip.svg";
export default defineComponent({
  props: {
    avatarUrl: String,
    isVip: Boolean,
    qrcode: String,
    name: String,
    description: String
  },
  setup(props, context) {
    return { assets: { icon_qrcode, icon_vip } };
  }
});
</script>

<style lang="stylus" scoped>
.me-personal-info-container {
  width 100%
  display flex
  flex-direction column
  align-items center
  .avatar-qrcode-container {
    display flex
    flex-direction row
    justify-content center
    align-items center
    position relative
    width 100%
    .avatar-container {
      position relative
      height 8.55vh
      .avatar {
        width 8.55vh
        height 8.55vh
        border-radius 0.82vh
        background gray
      }
      .vip {
        position absolute
        width 5.84vw
        height 1.64vh
        top -0.3vh
        right -1.33vw
      }
    }
    .qrcode {
      width 2.12vh
      height 2.12vh
      position absolute
      right 8.15vw
      top 2.51vh
    }
  }
  .name {
    margin-top 2.47vh
    font-size 2.25vh
    font-weight bold
    font-stretch normal
    font-style normal
    line-height 1.47
    letter-spacing 0.02vh
    text-align center
    color #222a36
  }
  .description {
    font-size 2.1vh
    font-weight 300
    font-stretch normal
    font-style normal
    line-height 1.43
    letter-spacing 0.02vh
    text-align left
    color #222a36
  }
}
</style>
