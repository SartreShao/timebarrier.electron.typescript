<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>
    <!-- Tab 容器 -->
    <div class="tab-container">
      <div
        :class="
          currentTab === `target` ? `tab-target` : `tab-target-unselected`
        "
        @click="currentTab = `target`"
      >
        我的目标
      </div>
      <div
        :class="
          currentTab === `ability` ? `tab-ability` : `tab-ability-unselected`
        "
        @click="currentTab = `ability`"
      >
        能力训练
      </div>
    </div>
    <!-- 主要界面 -->
    <main>
      <target v-if="currentTab === `target`"></target>
      <ability v-if="currentTab === `ability`"></ability>
    </main>
    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
import Target from "./target/Target.vue";
import Ability from "./ability/Ability.vue";
import { TargetAbilityTabType } from "@/lib/types/vue-viewmodels";

export default defineComponent({
  components: { TopBar, BottomBar, Target, Ability },
  setup() {
    // 当前的 TAB：Ability｜Target
    const currentTab: Ref<TargetAbilityTabType> = ref("target");

    return {
      currentTab
    };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3
  .tab-container {
    position fixed
    width 100%
    top 7.52vh
    height 5.17vh
    display flex
    flex-direction row
    .tab-target {
      width 50vw
      height 5.17vh
      display flex
      justify-content center
      align-items center
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      text-align center
      color #434343
      &-unselected {
        width 50vw
        height 5.17vh
        display flex
        justify-content center
        align-items center
        font-size 2.02vh
        font-weight 500
        font-stretch normal
        font-style normal
        line-height 1.44
        letter-spacing 0.02vh
        text-align center
        color #cecece
      }
    }
    .tab-ability {
      width 50vw
      height 5.17vh
      display flex
      justify-content center
      align-items center
      font-size 2.02vh
      font-weight 500
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      text-align center
      color #434343
      &-unselected {
        width 50vw
        height 5.17vh
        display flex
        justify-content center
        align-items center
        font-size 2.02vh
        font-weight 500
        font-stretch normal
        font-style normal
        line-height 1.44
        letter-spacing 0.02vh
        text-align center
        color #cecece
      }
    }
  }
  main {
    position fixed
    top 12.77vh
    height 80.41vh
    overflow scroll
    width 100%
    background #F5F5F5
    display flex
    flex-direction column
    align-items center
  }
}
</style>
