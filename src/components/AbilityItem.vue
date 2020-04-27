<template>
  <div class="container">
    <!-- 升级进度条 -->
    <aside bind:style="{ width: widthPercent }"></aside>

    <!-- 主体容器 -->
    <div class="body-container">
      <!-- tomatoNumber 系列 -->
      <div class="tomato-container">
        {{ ability.attributes.levelPercent }} ·
        {{ ability.attributes.levelName }} · 累计
        {{ ability.attributes.tomatoNumber }} 个番茄
      </div>

      <!-- Ability 名称 -->
      <div class="ability-name">{{ ability.attributes.name }}</div>

      <!-- 训练计划 -->
      <div
        class="plan-title"
        v-if="ability.attributes.planListOfAbility.length !== 0"
      >
        训练计划
      </div>

      <div
        class="plan-item"
        v-for="plan in ability.attributes.planListOfAbility"
        v-bind:key="plan.id"
      >
        · {{ plan.attributes.name }}
      </div>

      <div
        style="height:1.5vh"
        v-if="ability.attributes.targetListOfAbility.length !== 0"
      ></div>

      <!-- 相关目标 -->
      <div
        class="target-title"
        v-if="ability.attributes.targetListOfAbility.length !== 0"
      >
        相关目标
      </div>

      <div
        class="target-item"
        v-for="target in ability.attributes.targetListOfAbility"
        v-bind:key="target.id"
      >
        · {{ target.attributes.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from "@vue/composition-api";
import AV from "leancloud-storage";
export default defineComponent({
  props: {
    ability: AV.Object
  },
  setup(props, context) {
    const widthPercent = computed(() => {
      if (props.ability !== undefined) {
        return String(props.ability.attributes.levelPercent * 100 + 2) + "%";
      } else {
        return "2%";
      }
    });
    return {
      widthPercent
    };
  }
});
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
