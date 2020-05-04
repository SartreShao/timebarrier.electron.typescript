<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 头部布局 -->
    <section class="header-container">
      <me-personal-info
        class="personal-info"
        avatar-url="https://timebarrier.file.hearfresh.cn/4a90b2f4ea0c8130d78f/avatar.png"
        :isVip="true"
        name="邵励治"
        description="shaolizhi@tipchou.com"
      ></me-personal-info>

      <div class="button">编辑个人资料</div>
    </section>

    <!-- 睡眠、清醒与用时习惯 -->
    <me-option
      class="icon-sleep"
      :icon="assets.icon_sleep"
      name="睡眠、清醒与用时习惯"
      description="8点起床"
      :notification="0"
      icon-width="4.41vw"
      icon-height="2.44vh"
      icon-margin-left="4.53vw"
    ></me-option>

    <!-- 成就与勋章 -->
    <me-option
      class="icon-regular"
      :icon="assets.icon_achievement"
      name="成就与勋章"
      description="已达成 11 项成就"
      :notification="0"
      icon-width="3.83vw"
      icon-height="2.60vh"
      icon-margin-left="4.79vw"
    ></me-option>

    <!-- 清晨计划 -->
    <me-option
      class="icon-regular"
      :icon="assets.icon_morning"
      name="清晨计划"
      description="暂未开放"
      :notification="0"
      icon-width="4.92vw"
      icon-height="2.63vh"
      icon-margin-left="4.27vw"
    ></me-option>

    <!-- 煤气灯酒吧 -->
    <me-option
      class="icon-regular"
      :icon="assets.icon_bar"
      name="煤气灯酒吧"
      :notification="1"
      icon-width="5.33vw"
      icon-height="2.60vh"
      icon-margin-left="4.07vw"
    ></me-option>

    <!-- 设置 -->
    <me-option
      class="icon-setting"
      :icon="assets.icon_me_setting"
      name="设置"
      :notification="0"
      icon-width="2.60vh"
      icon-height="2.60vh"
      icon-margin-left="4.41vw"
    ></me-option>

    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script>
import { defineComponent } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
import MeOption from "./components/MeOption.vue";
import MePersonalInfo from "./components/MePersonalInfo.vue";
import icon_sleep from "../../assets/icon_sleep.svg";
import icon_achievement from "../../assets/icon_achievement.svg";
import icon_morning from "../../assets/icon_morning.svg";
import icon_bar from "../../assets/icon_bar.svg";
import icon_me_setting from "../../assets/icon_me_setting.svg";
export default defineComponent({
  components: { TopBar, BottomBar, MeOption, MePersonalInfo },
  setup(props, context) {
    return {
      assets: {
        icon_sleep,
        icon_achievement,
        icon_morning,
        icon_bar,
        icon_me_setting
      }
    };
  }
});
</script>
<style lang="stylus" scoped>
.container {
  width 100%
  height 100vh
  display flex
  flex-direction column
  background #F5F5F5
}
.header-container {
  margin-top 7.52vh
  height 32.83vh
  background white
  width 100%
  display flex
  flex-direction column
  align-items center
}
.icon-sleep {
  margin-top 3.45vh
}
.icon-regular {
  margin-top 0.15vh
}
.icon-setting {
  margin-top 2.02vh
}
.personal-info {
  margin-top 3.45vh
}
.button {
  width 60.53vw
  height 5.55vh
  border-radius 0.67vh
  background-color #222a36
  display flex
  align-items center
  justify-content center
  font-size 2.1vh
  font-weight bold
  font-stretch normal
  font-style normal
  line-height 1.43
  letter-spacing 0.02vh
  color #ffffff
  margin-top 2.47vh
}
</style>
