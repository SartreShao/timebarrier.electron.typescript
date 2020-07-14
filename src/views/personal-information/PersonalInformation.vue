<template>
  <div class="personal-information-container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 顶边栏占位符 -->
    <div style="height:7.52vh"></div>

    <!-- 头像 -->
    <avatar-item style="margin-top:2.32vh;margin-bottom:2.32vh;"></avatar-item>

    <!-- 名字 -->
    <info-item
      title="名字"
      :content="nickName"
      @click="click_editNameButton"
    ></info-item>

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
      :content="signature"
      style="margin-top:4.57vh"
      @click="click_editSignature"
    ></info-item>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import AvatarItem from "./components/AvatarItem.vue";
import InfoItem from "./components/InfoItem.vue";
import { Router } from "@/lib/vue-utils";
import { PersonalInformation } from "@/lib/vue-viewmodels";

export default defineComponent({
  components: { TopBar, AvatarItem, InfoItem },
  setup(props, context) {
    // 昵称
    const nickName: Ref<string> = ref("");

    // 个性签名
    const signature: Ref<string> = ref("");

    // 获取用户信息（请求网络）
    PersonalInformation.fetchUserInformation(context.root, nickName, signature);

    onMounted(() => {
      // 获取用户信息（不请求网络）
      PersonalInformation.getUserInformation(context.root, nickName, signature);
    });

    // 点击编辑姓名
    const click_editNameButton = () => {
      Router.pushWithParams(context.root.$router, "edit-personal-information", {
        name: "名字",
        currentValue: nickName.value,
        attributeKey: "nickName"
      });
    };

    // 点击编辑个人签名
    const click_editSignature = () => {
      Router.pushWithParams(context.root.$router, "edit-personal-information", {
        name: "个人签名",
        currentValue: signature.value,
        attributeKey: "signature"
      });
    };

    return { click_editNameButton, click_editSignature, nickName, signature };
  }
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
