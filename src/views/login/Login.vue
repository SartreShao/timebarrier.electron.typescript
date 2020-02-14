<template>
  <div class="container">
    <div style="height: 8.70vh"></div>
    <img
      class="welcome_icon"
      src="https://timebarrier.file.hearfresh.cn/3f0168f9348c1b7e2854.png"
      alt="icon"
    />
    <h1>欢迎来到「时间壁垒」</h1>
    <h2>
      我们将与您一起制定目标、培养能力、完成计划，并通过美丽的图表追溯这一切
    </h2>

    <!-- 输入手机号 -->
    <div class="input-container" style="margin-top:7.20vh">
      <img
        class="phone-icon"
        src="https://timebarrier.file.hearfresh.cn/e8f487338fb1ef0c615a.svg"
        alt="cellphone_icon"
      />
      <input
        type="text"
        placeholder="请输入手机号"
        v-model="input_phoneNumber"
      />
    </div>

    <!-- 请输入验证码 -->
    <div class="input-container" style="margin-top:2.10vh">
      <img
        class="lock-icon"
        src="https://timebarrier.file.hearfresh.cn/f71aa6ac3d5b98e6c9da.svg"
        alt="lock_icon"
      />
      <input
        type="text"
        placeholder="请输入验证码"
        style="margin-left:3.73vw"
        v-model="input_verificationCode"
      />
      <div class="placeholder"></div>
      <send-sms-button class="send"></send-sms-button>
    </div>

    <!-- 按钮 -->
    <div class="button" @click="click_loginButton">注册或登录</div>

    <!-- 分割线 -->
    <div class="separator-container">
      <div></div>
      <span>或者</span>
      <div></div>
    </div>

    <!-- 微信登录和 Github 登录 -->
    <div class="third-party-login-container">
      <div class="wechat-button">
        <img
          src="https://timebarrier.file.hearfresh.cn/48363e160222ffdbaa32.svg"
          alt="wechat-icon"
        />
        <span>微信登录</span>
      </div>
      <div class="github-button">
        <img
          src="https://timebarrier.file.hearfresh.cn/e4bdd92f88f95c375a85.svg"
          alt="github-icon"
        />
        <span>Github</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onUpdated,
  onUnmounted,
  createComponent
} from "@vue/composition-api";

export default createComponent({
  setup() {}
});
</script>

<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  align-items center
  width 100%
  img.welcome_icon {
    width 23.07vw
    height 23.07vw
    margin-top 3.52vh
  }
  h1 {
    margin-top 2.02vh
    font-size 3vh
    font-weight bold
    color rgba(0, 0, 0, 1)
    opacity 1
  }
  h2 {
    width 86.67vw
    font-size 2.17vh
    font-weight 400
    color rgba(149, 149, 149, 1)
    opacity 1
    text-align center
    margin-top 1.2vh
    line-height 3.5vh
  }
  .input-container {
    display flex
    flex-direction row
    align-items center
    width 89.6vw
    height 7.05vh
    background rgba(244, 244, 248, 1)
    opacity 1
    border-radius 0.82vh
    img.phone-icon {
      width 2.8vw
      height 2.25vh
      margin-left 4.13vw
    }
    img.lock-icon {
      margin-left 4.13vw
      width 3.33vw
      height 2.17vh
    }
    input {
      margin-left 4vw
      background none
      outline none
      border none
      font-size 2.25vh
      font-weight 400
      color black
      opacity 1
      flex auto
    }
    input:focus {
      border none
    }
    input::-webkit-input-placeholder {
      font-size 2.25vh
      font-weight 400
      color rgba(149, 149, 149, 1)
      opacity 1
    }
    .placeholder {
      width 1px
      height 3.3vh
      background #959595
      opacity 0.4
    }
    .send {
      cursor pointer
      flex auto
      height 100%
      display flex
      justify-content center
      align-items center
      font-size 2.25vh
      font-weight 400
      color rgba(149, 149, 149, 1)
    }
  }
  .button {
    cursor pointer
    margin-top 7.2vh
    width 89.6vw
    height 8.77vh
    background #3846CF
    opacity 1
    border-radius 0.82vh
    display flex
    justify-content center
    align-items center
    font-size 2.62vh
    font-weight bold
    color rgba(255, 255, 255, 1)
    opacity 1
  }
  .separator-container {
    margin-top 5.55vh
    display flex
    align-items center
    div {
      width 38.27vw
      height 1px
      background #707070
      opacity 0.4
    }
    span {
      width 7.73vw
      font-size 2.17vh
      font-weight bold
      color rgba(227, 227, 227, 1)
      margin-left 2.67vw
      margin-right 2.67vw
      opacity 1
    }
  }
  .third-party-login-container {
    margin-top 2.1vh
    display flex
    justify-content space-between
    width 90vw
    flex-direction row
    .wechat-button {
      cursor pointer
      width 43.2vw
      height 7.57vh
      background rgba(255, 255, 255, 1)
      border 0.15vh solid rgba(149, 149, 149, 1)
      opacity 1
      border-radius 0.82vh
      display flex
      flex-direction row
      align-items center
      img {
        width 4.8vw
        height 2.32vh
        opacity 1
        width 8.93vw
        margin-left 6.93vw
      }
      span {
        margin-left 1.6vw
        font-size 2.17vh
        font-weight 400
        color rgba(149, 149, 149, 1)
        opacity 1
      }
    }
    .github-button {
      cursor pointer
      width 43.2vw
      height 7.57vh
      background rgba(255, 255, 255, 1)
      border 0.15vh solid rgba(149, 149, 149, 1)
      opacity 1
      border-radius 0.82vh
      display flex
      flex-direction row
      align-items center
      img {
        width 2.7vh
        height 2.7vh
        opacity 1
        width 8.93vw
        margin-left 6.93vw
      }
      span {
        margin-left 1.6vw
        font-size 2.17vh
        font-weight 400
        color rgba(149, 149, 149, 1)
        opacity 1
      }
    }
  }
}
</style>
