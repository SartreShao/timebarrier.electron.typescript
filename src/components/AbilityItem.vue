<template>
  <div class="container">
    <!-- 升级进度条 -->
    <aside></aside>

    <!-- 主体容器 -->
    <div class="body-container">
      <!-- tomatoNumber 系列 -->
      <div class="tomato-container">
        50% · 青铜 I · 累计 300 个番茄
      </div>

      <!-- Ability 名称 -->
      <div class="ability-name">提高英语能力</div>

      <!-- 训练计划 -->
      <div class="plan-title">训练计划</div>

      <div class="plan-item">· 打卡扇贝单词</div>
      <div class="plan-item">· 打卡扇贝单词</div>

      <div style="height:1.5vh"></div>

      <!-- 相关目标 -->
      <div class="target-title">相关目标</div>

      <div class="target-item">· 打卡扇贝单词</div>
      <div class="target-item">· 打卡扇贝单词</div>
    </div>
  </div>
</template>

<script lang="ts">
export default {};
</script>

<style lang="stylus" scoped>
.container {
  width 91.2vw
  border-radius 1.57vh
  box-shadow 0 0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
  background #222a36
  position relative
  overflow hidden
  aside {
    border-radius 1.57vh 9vh 1.57vh 1.57vh
    position absolute
    height 100%
    width 2%
    background #ff5050
  }
  .body-container {
    width 100%
    margin-right 7.6vw
    margin-left 7.6vw
    margin-top 2.77vh
    margin-bottom 2.77vh
    display flex
    flex-direction column
    .tomato-container {
      z-index 1
      display flex
      flex-direction row
      height 2.4vh
      font-size 1.65vh
      font-stretch normal
      font-style normal
      line-height 1.45
      letter-spacing 0.01vh
      text-align left
      color #ffffff
    }
    .ability-name {
      z-index 1
      margin-top 1.35vh
      margin-bottom 2.1vh
      height 5.33vw
      font-size 2.1vh
      font-stretch normal
      font-style normal
      line-height 1.43
      letter-spacing 0.02vh
      text-align left
      color #ffffff
    }
    .plan-title {
      z-index 1
      height 2.55vh
      font-size 1.72vh
      font-stretch normal
      font-style normal
      line-height 1.48
      letter-spacing 0.01vh
      text-align left
      color #f4f4f8
      margin-bottom 0.82vh
    }
    .plan-item {
      z-index 1
      height 2.55vh
      font-size 1.72vh
      font-weight 300
      font-stretch normal
      font-style normal
      line-height 1.48
      letter-spacing 0.01vh
      text-align left
      color #f4f4f8
      margin-bottom 0.6vh
      opacity 0.9
    }
    .target-title {
      z-index 1
      height 2.55vh
      font-size 1.72vh
      font-stretch normal
      font-style normal
      line-height 1.48
      letter-spacing 0.01vh
      text-align left
      color #f4f4f8
      margin-bottom 0.82vh
    }
    .target-item {
      z-index 1
      height 2.55vh
      font-size 1.72vh
      font-weight 300
      font-stretch normal
      font-style normal
      line-height 1.48
      letter-spacing 0.01vh
      text-align left
      color #f4f4f8
      margin-bottom 0.6vh
      opacity 0.9
    }
  }
}
</style>
