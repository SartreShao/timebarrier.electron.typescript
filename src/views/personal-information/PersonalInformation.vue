<template>
  <div class="personal-information-container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 顶边栏占位符 -->
    <div style="height:7.52vh"></div>

    <!-- 头像 -->
    <avatar-item style="margin-top:2.32vh;margin-bottom:2.32vh;"></avatar-item>

    <!-- 名字 -->
    <info-item title="名字" content="邵励治"></info-item>

    <!-- 邮箱 -->
    <info-item
      title="邮箱"
      content="shaolizhi@tipchou.com"
      style="margin-top:0.15vh"
    ></info-item>

    <!-- 邮箱 -->
    <info-item
      title="绑定微信号"
      content="login950518"
      style="margin-top:0.15vh"
    ></info-item>

    <!-- 手机号 -->
    <info-item
      title="绑定手机号"
      content="13501287916"
      style="margin-top:0.15vh"
    ></info-item>

    <!-- 手机号 -->
    <info-item
      title="个人签名"
      content="存在先于本质"
      style="margin-top:4.57vh"
    ></info-item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import AvatarItem from "./components/AvatarItem.vue";
import InfoItem from "./components/InfoItem.vue";

export default defineComponent({
  components: { TopBar, AvatarItem, InfoItem }
});
</script>

<style lang="stylus" scoped>
.personal-information-container {
  width 100%
  height 100vh
  display flex
  flex-direction column
  background #f5f5f5
}
</style>
