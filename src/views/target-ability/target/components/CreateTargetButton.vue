<template>
  <div class="create-target-container">
    <!-- button 的容器 -->
    <div class="click-button-container">
      <!-- 用于新手教程的外边的圈儿 -->
      <svg
        class="outline"
        xmlns="http://www.w3.org/2000/svg"
        width="148"
        height="148"
        viewBox="0 0 148 148"
        v-if="
          unSubjectiveTargetList.length === 0 &&
            completedTargetList.length === 0 &&
            targetSubjectList.length === 0
        "
      >
        <g
          id="椭圆_129"
          data-name="椭圆 129"
          fill="none"
          stroke="#222a36"
          stroke-width="2"
          stroke-dasharray="5"
        >
          <circle cx="74" cy="74" r="74" stroke="none" />
          <circle cx="74" cy="74" r="73" fill="none" />
        </g>
      </svg>

      <!-- 创建 Plan 的按钮 -->
      <div class="click-button" @click="$emit('click')">
        <svg
          class="add-icon"
          id="组_1328"
          data-name="组 1328"
          xmlns="http://www.w3.org/2000/svg"
          width="27.401"
          height="27.401"
          viewBox="0 0 27.401 27.401"
        >
          <rect
            id="矩形_271"
            data-name="矩形 271"
            width="27.401"
            height="4.567"
            rx="2.283"
            transform="translate(0 11.417)"
            fill="#222a36"
          />
          <rect
            id="矩形_272"
            data-name="矩形 272"
            width="27.401"
            height="4.567"
            rx="2.283"
            transform="translate(15.984 0) rotate(90)"
            fill="#222a36"
          />
        </svg>
      </div>
    </div>

    <!-- 右箭头 -->
    <svg
      v-if="
        unSubjectiveTargetList.length === 0 &&
          completedTargetList.length === 0 &&
          targetSubjectList.length === 0
      "
      class="right-arrow"
      xmlns="http://www.w3.org/2000/svg"
      width="26.281"
      height="26.281"
      viewBox="0 0 26.281 26.281"
    >
      <g
        id="组_1852"
        data-name="组 1852"
        transform="translate(122.606 -96.323) rotate(90)"
      >
        <path
          id="路径_669"
          data-name="路径 669"
          d="M110.46,457.108a1.384,1.384,0,0,0-.488-.323,1.665,1.665,0,0,0-.2-.043,1.381,1.381,0,0,0-.309-.057,1.331,1.331,0,0,0-.306.057,1.479,1.479,0,0,0-.2.044,1.4,1.4,0,0,0-.493.322L96.738,469.186a1.439,1.439,0,0,0-.028,1.992,1.343,1.343,0,0,0,1.935-.028l10.819-11.136,10.819,11.138a1.343,1.343,0,0,0,1.935.027,1.438,1.438,0,0,0-.027-1.991Z"
          transform="translate(0 -348.972)"
          fill="#2c2c2c"
        />
        <path
          id="路径_670"
          data-name="路径 670"
          d="M98.655,110.791l10.819-11.137L120.3,110.791a1.339,1.339,0,0,0,1.933.03,1.435,1.435,0,0,0-.03-1.991L110.464,96.749a1.391,1.391,0,0,0-.487-.322.809.809,0,0,0-.2-.044,1.266,1.266,0,0,0-.306-.058,1.321,1.321,0,0,0-.3.057,1.469,1.469,0,0,0-.2.044,1.383,1.383,0,0,0-.493.32L96.746,108.825a1.441,1.441,0,0,0-.025,1.992,1.346,1.346,0,0,0,1.935-.026Z"
          transform="translate(-0.01)"
          fill="#2c2c2c"
        />
      </g>
    </svg>

    <!-- 提示语句 -->
    <div
      class="tip"
      v-if="
        unSubjectiveTargetList.length === 0 &&
          completedTargetList.length === 0 &&
          targetSubjectList.length === 0
      "
    >
      点击它，创建您的第一个目标
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, inject, ref } from "@vue/composition-api";
import Store from "@/store";
import AV from "leancloud-storage";

export default defineComponent({
  setup(props, context) {
    // 未分组的「目标」的列表
    const unSubjectiveTargetList: Ref<AV.Object[]> = inject(
      Store.unSubjectiveTargetList,
      ref([])
    );

    //「目标类别」的列表
    const targetSubjectList: Ref<AV.Object[]> = inject(
      Store.targetSubjectList,
      ref([])
    );

    // 已完成的「目标」列表
    const completedTargetList: Ref<AV.Object[]> = inject(
      Store.completedTargetList,
      ref([])
    );

    return {
      unSubjectiveTargetList,
      targetSubjectList,
      completedTargetList
    };
  }
});
</script>

<style lang="stylus" scoped>
.create-target-container {
  width 100%
  height 11.09vh
  display flex
  flex-direction row-reverse
  align-items center
}

.click-button-container {
  width 11.09vh
  height 11.09vh
  position relative
  margin-right 2vw
}

.outline {
  position absolute
  width 11.09vh
  height 11.09vh
  top 0
  bottom 0
  left 0
  right 0
}

.click-button {
  cursor pointer
  width 7.5vh
  height 7.5vh
  display flex
  align-items center
  justify-content center
  border-radius 3.75vh
  box-shadow 0 0.22vh 0.44vh rgba(0, 0, 0, 0.16)
  position absolute
  top 0
  bottom 0
  left 0
  right 0
  margin auto
  background white
}

.add-icon {
  height 2.05vh
  width 2.05vh
}

.right-arrow {
  width 1.97vh
  height 1.97vh
  margin-right 4.33vw
}

.tip {
  font-size 1.8vh
  line-height 2.62vh
  font-weight lighter
  margin-right 4.43vw
}
</style>
