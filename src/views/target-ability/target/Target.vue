<template>
  <div class="container">
    <!-- 添加「目标」按钮 -->
    <div class="add-button">
      <img :src="assets.icon_create_target" alt="icon_create_target" />
    </div>

    <!-- 目标目录 -->
    <div class="target-subject-container">
      职业目标
      <img :src="assets.icon_downward" alt="icon_downward" />
    </div>

    <!-- 目标 -->
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
    <div class="target-item-container">
      <!-- 完成目标 -->
      <div class="finished-button-container">
        <img
          class="finished-button"
          :src="assets.icon_red_finished_button"
          alt="icon_red_finished_button"
        />
      </div>

      <!-- 占位符 -->
      <div class="placeholder"></div>

      <!-- 目标主体 -->
      <div class="target-body-container">
        <div class="target-type">长期计划</div>
        <div class="target-name">拥有强健的身体</div>
        <div class="target-description">
          体重保持在 160 斤，每天锻炼一小时，早睡早起，按时吃饭
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import icon_create_target from "../../../assets/icon_create_target.svg";
import icon_downward from "../../../assets/icon_downward.svg";
import icon_red_finished_button from "../../../assets/icon_red_finished_button.svg";

export default defineComponent({
  setup() {
    return {
      assets: { icon_create_target, icon_downward, icon_red_finished_button }
    };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  height 73.66vh
  overflow scroll
  width 100%
  background #F5F5F5
  display flex
  flex-direction column
  align-items center
  margin-top 6.75vh
  .add-button {
    z-index 99999
    position fixed
    top 12.77vh
    flex-shrink 0
    width 100%
    height 6.45vh
    background white
    margin-top 0.15vh
    display flex
    justify-content center
    align-items center
    img {
      width 2.1vh
      height 2.1vh
    }
  }
  .target-subject-container {
    position relative
    height 6.52vh
    width 100%
    flex-shrink 0
    background-color #fcfbfc
    display flex
    align-items center
    justify-content center
    font-size 2.02vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.44
    letter-spacing 0.02vh
    text-align left
    color #9a9a9a
    img {
      position absolute
      width 2.35vw
      height 0.65vh
      opacity 0.5
      right 5.52vw
      top 0
      bottom 0
      margin-top auto
      margin-bottom auto
    }
  }
  .target-item-container {
    height 16.94vh
    width 100%
    display flex
    flex-direction row
    margin-top 0.15vh
    flex-shrink 0
    .finished-button-container {
      width 19.6vw
      height 16.94vh
      background-color #fcfbfc
      display flex
      justify-content center
      align-items center
      .finished-button {
        width 2.1vh
        height 2.1vh
      }
    }
    .placeholder {
      width 0.15vh
    }
    .target-body-container {
      width 80.13vw
      height 16.94vh
      background-color #ffffff
      box-sizing border-box
      padding-left 8.53vw
      padding-right 8.53vw
      padding-top 2.32vh
      padding-bottom 2.4vh
      .target-type {
        height 2.4vh
        opacity 0.4
        font-size 1.65vh
        font-weight normal
        font-stretch normal
        font-style normal
        line-height 1.45
        letter-spacing 0.01vh
        text-align left
        color #222a36
      }
      .target-name {
        margin-top 0.52vh
        height 3.15vh
        font-size 2.17vh
        font-weight 500
        font-stretch normal
        font-style normal
        line-height 1.45
        letter-spacing 0.02vh
        text-align left
        color #222a36
      }
      .target-description {
        margin-top 0.75vh
        height 5.4vh
        width 63.07vw
        opacity 0.4
        font-size 1.87vh
        font-weight normal
        font-stretch normal
        font-style normal
        line-height 1.44
        letter-spacing 0.01vh
        text-align left
        color #222a36
      }
    }
  }
}
</style>
