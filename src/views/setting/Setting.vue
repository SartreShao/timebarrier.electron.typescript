<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <main class="option-container">
      <!-- 关于 -->
      <me-option
        class="about"
        :icon="assets.icon_about"
        name="关于「时间壁垒」"
        :notification="0"
        icon-width="2.48vh"
        icon-height="2.48vh"
        icon-margin-left="4.53vw"
      ></me-option>

      <!-- 语言 -->
      <me-option
        class="language"
        :icon="assets.icon_earth"
        name="语言"
        :notification="0"
        icon-width="2.35vh"
        icon-height="2.36vh"
        icon-margin-left="4.92vw"
      ></me-option>

      <!-- 主题 -->
      <me-option
        class="option-regular"
        :icon="assets.icon_theme"
        name="主题"
        :notification="0"
        icon-width="2.48vh"
        icon-height="2.54vh"
        icon-margin-left="4.80vw"
      ></me-option>

      <!-- 番茄背景音 -->
      <me-option
        class="option-regular"
        :icon="assets.icon_background_tomato"
        name="番茄背景音"
        :notification="0"
        icon-width="2.61vh"
        icon-height="2.61vh"
        icon-margin-left="4.67vw"
      ></me-option>

      <!-- 意见反馈 -->
      <me-option
        class="option-regular"
        :icon="assets.icon_question"
        name="意见反馈"
        :notification="0"
        icon-width="2.29vh"
        icon-height="2.21vh"
        icon-margin-left="4.67vw"
      ></me-option>

      <!-- 账户升级 -->
      <div class="setting-button" style="margin-top:4.35vh;">账户升级</div>

      <!-- 退出登录 -->
      <div
        class="setting-button"
        style="margin-top:2.32vh;"
        v-darked-when-click
        @click="click_logOutButton"
      >
        退出登录
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import MeOption from "../me/components/MeOption.vue";
import icon_about from "@/assets/icon_about.svg";
import icon_earth from "@/assets/icon_earth.svg";
import icon_theme from "@/assets/icon_theme.svg";
import icon_background_tomato from "@/assets/icon_background_tomato.svg";
import icon_question from "@/assets/icon_question.svg";
import { SettingPage } from "@/lib/vue-viewmodels";
export default defineComponent({
  components: { TopBar, MeOption },
  setup(props, context) {
    // 点击事件：登出
    const click_logOutButton = () => {
      SettingPage.logOut(context.root, "/");
    };

    return {
      click_logOutButton,
      assets: {
        icon_about,
        icon_earth,
        icon_theme,
        icon_background_tomato,
        icon_question
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
.option-container {
  width 100%
  display flex
  flex-direction column
  margin-top 7.52vh
}
.container {
  width 100%
  height 100vh
  display flex
  flex-direction column
  background #f5f5f5
}
.about {
  margin-top 2.32vh
}
.language {
  margin-top 2.32vh
}
.option-regular {
  margin-top 0.15vh
}
.setting-button {
  width 100%
  height 8.4vh
  background-color #ffffff
  display flex
  align-items center
  justify-content center
  font-size 2.25vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.47
  letter-spacing 0.02vh
  color #222a36
}
</style>
