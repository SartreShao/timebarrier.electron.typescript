<template>
  <div
    @click="$emit('click-background')"
    class="background"
    :style="{
      background: isShow ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
      height: isShow ? '100%' : '0'
    }"
  >
    <section
      class="section"
      :class="{
        'show-section': isShow,
        'hide-section': !isShow && isShowChangeTimes !== 1
      }"
      @click.stop="doingNothing"
    >
      <h1 class="h-1">自定义「目标类别」</h1>

      <div class="input-container">
        <input
          class="input"
          type="text"
          placeholder="请输入目标类别名称"
          v-model="input_creatingTarget.subjectName"
          @keyup.enter="$emit('commit-subject-name')"
        />

        <svg
          class="img"
          xmlns="http://www.w3.org/2000/svg"
          width="17.787"
          height="15.563"
          viewBox="0 0 17.787 15.563"
        >
          <path
            id="路径_778"
            data-name="路径 778"
            d="M72.452,124.893H63.558v4.447l-6.67-5.558,6.67-5.558v4.447h8.893v-8.893h2.223v11.117Z"
            transform="translate(-56.888 -113.777)"
          />
        </svg>
      </div>

      <h3 class="h-3">例如：项目目标、爱情目标、科研目标</h3>
    </section>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  watch,
  watchEffect,
  ref,
  inject,
  reactive
} from "@vue/composition-api";
import Store from "@/store";
import { InputTargetType } from "@/lib/types/vue-viewmodels";

export default defineComponent({
  props: {
    isShow: Boolean
  },
  setup(props, context) {
    const isShowChangeTimes = ref(0);

    // 创建目标的数据容器
    const input_creatingTarget: InputTargetType = inject(
      Store.input_creatingTarget,
      reactive({
        id: undefined,
        subjectName: "",
        name: "",
        description: "",
        validityType: "",
        validity: "",
        planList: [],
        isActived: true,
        isFinished: false,
        mileStoneList: []
      })
    );

    const doingNothing = () => {};

    watch(
      () => props.isShow,
      value => {
        isShowChangeTimes.value++;
      }
    );

    return {
      isShowChangeTimes,
      input_creatingTarget,
      doingNothing
    };
  }
});
</script>

<style lang="stylus" scoped>
.background {
  z-index 1
  width 100%
  height 100%
  position fixed
  top 0
  bottom 0
  left 0
  right 0
  background rgba(0, 0, 0, 0.5)
  transition all 0s ease
}

.section {
  width 89.55vw
  height 21.86vh
  border-radius 0.75vh
  position fixed
  bottom 39.16vh
  background #FFFFFF
  display flex
  flex-direction column
  align-items center
  right -(89.55vw)
}

@keyframes show {
  0% {
    right -(89.55vw)
  }

  70% {
    right 9vw
  }

  100% {
    right 5.225vw
  }
}

.show-section {
  animation-name show
  animation-duration 0.5s
  animation-iteration-count 1
  animation-fill-mode forwards
  animation-play-state pause
  animation-timing-function ease-in-out
}

@keyframes hide {
  0% {
    right 5.225vw
  }

  30% {
    right 9vw
  }

  100% {
    right -(89.55vw)
  }
}

.hide-section {
  animation-timing-function ease-in-out
  animation-name hide
  animation-duration 1s
  animation-iteration-count 1
  animation-fill-mode forwards
  animation-play-state pause
}

.h-1 {
  margin-top 2.92vh
  line-height 2.92vh
  font-size 2.02vh
  margin-bottom 1.87vh
  font-weight bold
  color #222A36
}

.input-container {
  border-radius 0.67vh
  background #F4F4F8
  position relative
  width 81.07vw
  height 6.22vh
}

.input {
  position absolute
  left 0
  right 0
  top 0
  bottom 0
  color #222A36
  font-size 1.87vh
  width 100%
  height 100%
  outline none
  border none
  background #F4F4F8
  border-radius 0.67vh
  padding-left 5.47vw
  padding-right 5.47vw
  box-sizing border-box
}

.img {
  width 2.37vw
  height 1.17vh
  position absolute
  right 4.11vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
}

.h-3 {
  margin-top 1.2vh
  margin-bottom 0vh
  line-height 2.62vh
  font-size 1.8vh
  opacity 0.8
  color #222A36
  font-weight lighter
}
</style>
