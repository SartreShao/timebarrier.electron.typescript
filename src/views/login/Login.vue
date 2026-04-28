<template>
  <div class="page">
    <section class="panel">
      <div class="mark">TB</div>
      <h1>时间壁垒</h1>
      <p>输入一个用户 ID，本地 MySQL 会自动创建或载入对应数据。</p>

      <label class="field">
        <span>用户 ID</span>
        <input
          type="text"
          placeholder="例如 demo"
          v-model="input_userId"
          @keyup.enter="click_loginButton"
        />
      </label>

      <button class="button" @click="click_loginButton">进入应用</button>
    </section>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, Ref, inject } from "@vue/composition-api";
import { LoginPage } from "../../lib/vue-viewmodels";
import Store from "@/store";

export default defineComponent({
  setup(props, context) {
    const input_userId: Ref<string> = ref("demo");
    const isLoginSuccess: Ref<boolean> = inject(
      Store.isLoginSuccess,
      ref(false)
    );

    const click_loginButton = () => {
      LoginPage.login(
        context.root,
        "local",
        input_userId.value,
        "",
        "plan",
        isLoginSuccess
      );
    };

    return {
      input_userId,
      click_loginButton
    };
  }
});
</script>

<style lang="stylus" scoped>
.page {
  width 100%
  min-height 100vh
  background #F4F4F8
  display flex
  align-items center
  justify-content center
}

.panel {
  width 89.6vw
  display flex
  flex-direction column
  align-items center
}

.mark {
  width 12vh
  height 12vh
  border-radius 50%
  background #222A36
  color white
  display flex
  align-items center
  justify-content center
  font-size 3.6vh
  font-weight bold
  margin-bottom 3vh
}

h1 {
  font-size 3.2vh
  line-height 4vh
  color #222A36
  margin-bottom 1.2vh
}

p {
  width 82vw
  margin 0 0 5vh
  text-align center
  line-height 3vh
  font-size 2vh
  color #7A8290
}

.field {
  width 89.6vw
  display flex
  flex-direction column
  margin-bottom 2.4vh

  span {
    font-size 1.8vh
    color #606A78
    margin-bottom 1vh
  }

  input {
    box-sizing border-box
    width 100%
    height 7vh
    border none
    border-radius 0.82vh
    background white
    padding 0 4.8vw
    font-size 2.2vh
    color #222A36
  }
}

.button {
  width 89.6vw
  height 8.77vh
  border none
  border-radius 0.82vh
  background #222A36
  color white
  font-size 2.32vh
  font-weight bold
  cursor pointer
}
</style>
