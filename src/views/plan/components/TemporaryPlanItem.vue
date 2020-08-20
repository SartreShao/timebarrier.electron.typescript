<template>
  <div
    class="temporary-plan-container"
    :id="plan.id"
    @click="$emit('edit-plan')"
    :title="plan.attributes.name"
  >
    <h2 class="h-2" style="pointer-events:none;">临时计划</h2>
    <div class="placeholder" style="pointer-events:none;"></div>
    <h3 class="h-3" style="pointer-events:none;">
      {{ plan.attributes.name }}
    </h3>
    <div class="finished-button" @click.stop="$emit('finish-plan')"></div>

    <div
      class="deadline"
      v-if="plan.attributes.deadline !== undefined"
      :style="{ background: color }"
    >
      {{ tip }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref, ref } from "@vue/composition-api";
import AV from "leancloud-storage";
import { UI } from "@/lib/vue-utils";
export default defineComponent({
  props: {
    plan: AV.Object
  },
  setup(props, context) {
    // 截止日期的文字
    const tip: Ref<string> = computed(() => {
      if (props.plan === undefined) {
        return "";
      }
      const deadline: Date = props.plan.attributes.deadline;
      const todayStartTime = UI.getTodayStartTimestamp(new Date().getTime());
      if (deadline === undefined) {
        return "";
      }
      const result = (deadline.getTime() - todayStartTime) / (1000 * 3600 * 24);
      if (result > 1) {
        return `剩余 ${parseInt(String(result))} 天`;
      } else if (result >= 0) {
        return `今日截止`;
      } else {
        return `过期 ${parseInt(String(-result)) + 1} 天`;
      }
    });

    // 截止日期的颜色
    const color: Ref<string> = computed(() => {
      if (props.plan === undefined) {
        return "";
      }
      const deadline: Date = props.plan.attributes.deadline;
      const todayStartTime = UI.getTodayStartTimestamp(new Date().getTime());
      if (deadline === undefined) {
        return "";
      }
      const result = (deadline.getTime() - todayStartTime) / (1000 * 3600 * 24);
      if (result > 1) {
        return `#039E7E`;
      } else if (result >= 0) {
        return `#6566A9`;
      } else {
        return `#D45070`;
      }
    });

    return {
      tip,
      color
    };
  }
});
</script>

<style lang="stylus" scoped>
.temporary-plan-container {
  user-select none
  cursor pointer
  width 95.73vw
  height 7.2vh
  background white
  display flex
  align-items center
  position relative
  margin-bottom 0.52vh
}

.deadline {
  position absolute
  right -0.67vw
  top -0.37vh
  display flex
  justify-content center
  align-items center
  background #F9385E
  height 2.17vh
  width 13.6vw
  font-size 1.27vh
  color white
  font-weight bold
  line-height 1.87vh
}

.h-2 {
  font-size 2.02vh
  font-weight 500
  font-stretch normal
  font-style normal
  line-height 1.44
  letter-spacing 0.02vh
  color #222a36
  margin-left 4.67vw
  margin-right 3.27vw
}

.placeholder {
  width 0.13vw
  height 2.92vh
  background #707070
  opacity 0.4
}

.h-3 {
  font-size 2.02vh
  font-weight 500
  font-stretch normal
  font-style normal
  line-height 1.44
  letter-spacing 0.02vh
  color #222a36
  margin-left 3.27vw
  width 57.73vw
  overflow hidden
  text-overflow ellipsis
  white-space nowrap
}

.finished-button {
  cursor pointer
  width 2.7vh
  height 2.7vh
  border-radius 50%
  opacity 0.5
  border solid 0.15vw #959595
  background-color #ffffff
  position absolute
  right 4.13vw
}
</style>
