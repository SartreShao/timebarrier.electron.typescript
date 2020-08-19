<template>
  <div
    class="background"
    @click="$emit('cancel-commit')"
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
      <h1 class="h-1">用时目标——您计划每天训练它多久？</h1>

      <div class="input-container">
        <input
          class="input"
          type="number"
          placeholder="请输入每日训练目标番茄数"
          v-bind:value="value"
          v-on:input="$emit('input', $event.target.value)"
          @keyup.enter="$emit('commit')"
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

      <h3 class="h-3">说明：1 个番茄 = 25 分钟，请在上面输入纯数字</h3>

      <div class="button-container">
        <div class="button-1" @click="$emit('cancel-commit')">
          不想设定用时目标
        </div>

        <div class="button-2" @click="$emit('commit')">确定用时目标</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "@vue/composition-api";
export default defineComponent({
  props: {
    isShow: Boolean,
    value: String
  },
  setup(props, context) {
    const isShowChangeTimes = ref(0);

    const input_planTarget = ref(0);

    watch(
      () => props.isShow,
      value => {
        isShowChangeTimes.value++;
      }
    );

    const doingNothing = () => {};

    return {
      isShowChangeTimes,
      input_planTarget,
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
  height 29.63vh
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

.button-container {
  width 81.07vw
  display flex
  justify-content space-between
  margin-top 2.77vh
}

.button-1 {
  cursor pointer
  width 39.73vw
  height 6.45vh
  border-radius 0.75vh
  display flex
  align-items center
  justify-content center
  color white
  font-weight bold
  font-size 1.5vh
  background #CECECE
}

.button-2 {
  cursor pointer
  width 39.73vw
  height 6.45vh
  border-radius 0.75vh
  display flex
  align-items center
  justify-content center
  color white
  font-weight bold
  font-size 1.5vh
  background #222A36
}
</style>
