<template>
  <div class="edit-personal-information-container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 顶边栏占位符 -->
    <div style="height:7.52vh"></div>

    <!-- 标题 -->
    <div class="title">设置{{ name }}</div>

    <!-- 分割线 -->
    <div class="top-line"></div>

    <!-- 输入框 -->
    <input
      class="input"
      type="text"
      v-model="input"
      :placeholder="`请输入` + (name === undefined ? `` : name)"
    />

    <!-- 分割线 -->
    <div class="bottom-line"></div>

    <!-- 副标题 -->
    <span class="sub-title">设置后，点击完成按钮保存。</span>

    <div
      class="button"
      @click="click_saveButton"
      :style="{
        background: input.length === 0 ? `#F1F2F3` : `#222A36`,
        color: input.length === 0 ? `#C0C1C2` : `#ffffff`
      }"
      v-darked-when-click
    >
      完成
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import { EditPersonalInformation } from "../../lib/vue-viewmodels";

export default defineComponent({
  components: { TopBar },
  props: {
    name: String,
    currentValue: String,
    attributeKey: String
  },
  setup(props, context) {
    // 用户输入内容
    const input: Ref<string> = ref("");

    // 初始化用户输入内容
    input.value = props.currentValue === undefined ? "" : props.currentValue;

    // 点击事件：点击保存按钮
    const click_saveButton = () => {
      console.log("shit");
      EditPersonalInformation.savePersonalInformation(
        context.root,
        input,
        props.name as string,
        props.attributeKey as string
      );
    };

    return {
      input,
      click_saveButton
    };
  }
});
</script>

<style lang="stylus" scoped>
.edit-personal-information-container {
  width 100%
  height 100vh
  display flex
  flex-direction column
  align-items center
  background #ffffff
}
.title {
  font-size 2.85vh
  font-weight bold
  font-stretch normal
  font-style normal
  letter-spacing 0.02vh
  text-align center
  color #222a36
  margin-top 7.2vh
}
.top-line {
  margin-top 5.43vh
  margin-bottom 2.14vh
  width 84.67vw
  height 0.13vh
  opacity 0.1
  background #222a36
}
.bottom-line {
  margin-top 2.14vh
  width 84.67vw
  height 0.13vh
  opacity 0.1
  background #222a36
}
.input {
  background none
  outline none
  border none
  width 84.67vw
  height 3.37vh
  font-size 2.32vh
  letter-spacing 0.02vh
  text-align left
  color #222a36
  &::placeholder {
    font-size 2.32vh
    letter-spacing 0.02vh
    text-align left
    opacity 0.5
  }
}
.sub-title {
  width 84.67vw
  margin-top 1vh
  opacity 0.4
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.02vh
  text-align left
  color #808182
}
.button {
  transition all 0.2s linear
  cursor pointer
  margin-top 9.75vh
  display flex
  align-items center
  justify-content center
  width 44.67vw
  height 5.47vh
  border-radius 0.6vh
  background #f1f2f3
  font-size 2.25vh
  font-weight normal
  font-stretch normal
  font-style bold
  letter-spacing 0.02vh
  text-align left
  color #c0c1c2
}
</style>
