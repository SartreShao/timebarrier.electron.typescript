<template>
  <div
    class="target-subject-item"
    :style="{ background: color }"
    @click="$emit('click')"
  >
    <img class="icon" :src="icon" alt="icon" />

    <div class="title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    color: String,
    icon: String,
    title: String
  }
};
</script>

<style lang="stylus" scoped>
.target-subject-item {
  width 50vw
  height 25.6vh
  display flex
  flex-direction column
  cursor pointer
  align-items center
}

.icon {
  height 2.87vh
  margin-top 9.3vh
  margin-bottom 4.75vh
}

.title {
  line-height 2.62vh
  font-size 1.8vh
  color white
  font-weight bold
}
</style>
