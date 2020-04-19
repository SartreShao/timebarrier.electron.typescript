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

    <!-- 抽屉菜单：创建目标或目录 -->
    <el-drawer
      class="create-target-drawer"
      :title="
        input_creatingTargetOrTargetSubject.inputType === `target`
          ? `创建目标`
          : `创建目标类别`
      "
      direction="btt"
      size="86.64%"
      :visible.sync="isCreateTargetDrawerDisplayed"
    >
      <!-- 单选框：创建目标 or 目标类别 -->
      <el-select
        class="select-target"
        placeholder="创建目标 or 目标类别"
        v-model="input_creatingTargetOrTargetSubject.inputType"
      >
        <el-option label="创建目标" value="target"></el-option>
        <el-option label="创建目标类别" value="targetSubject"></el-option>
      </el-select>

      <!-- 占位框 -->
      <div style="height:2.4vh"></div>

      <!-- 下面是创建目标类别 -->
      <!-- 输入框：输入目标类别名称 -->
      <input
        v-if="input_creatingTargetOrTargetSubject.inputType === `targetSubject`"
        type="text"
        class="input-target"
        placeholder="输入目标类别名称"
        v-model="input_creatingTargetOrTargetSubject.targetSubject.name"
      />

      <!-- 下面是创建目标 -->

      <!-- 单选框：目标的类别 -->
      <el-select
        class="select-target"
        placeholder="请选择目标所属类别"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
        v-model="input_creatingTargetOrTargetSubject.target.targetSubjectId"
      >
        <el-option label="无" :value="null"></el-option>

        <el-option
          v-for="targetSubject in targetSubjectList"
          v-bind:key="targetSubject.id"
          :label="targetSubject.attributes.name"
          :value="targetSubject.id"
        ></el-option>
      </el-select>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 输入框：输入目标名称 -->
      <input
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
        type="text"
        class="input-target"
        placeholder="输入目标名称"
        v-model="input_creatingTargetOrTargetSubject.target.name"
      />

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 输入框：输入目标名称 -->
      <input
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
        type="text"
        class="input-target"
        placeholder="输入目标达成条件 or 目标详情"
        v-model="input_creatingTargetOrTargetSubject.target.description"
      />

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 单选框：创建目标 or 目标类别 -->
      <el-select
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
        class="select-target"
        placeholder="选择目标有效期"
        v-model="input_creatingTargetOrTargetSubject.target.validityType"
      >
        <el-option label="长期目标" value="indefinite"></el-option>
        <el-option label="时限目标" value="time-bound"></el-option>
      </el-select>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 日期选择器：目标时限 -->
      <div
        class="date-select-target"
        v-if="
          input_creatingTargetOrTargetSubject.inputType === `target` &&
            input_creatingTargetOrTargetSubject.target.validityType ===
              `time-bound`
        "
      >
        <el-date-picker
          class="data-select-picker-item"
          v-model="input_creatingTargetOrTargetSubject.target.validity"
          type="date"
          placeholder="预计达成目标的日期"
        >
        </el-date-picker>
      </div>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="
          input_creatingTargetOrTargetSubject.inputType === `target` &&
            input_creatingTargetOrTargetSubject.target.validityType ===
              `time-bound`
        "
      ></div>

      <!-- 按钮：关联相关能力 -->
      <div
        class="related-ability"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      >
        <img
          :src="assets.icon_add"
          alt="icon_add"
          v-if="
            input_creatingTargetOrTargetSubject.target.abilityList.length === 0
          "
        />
        <span
          v-if="
            input_creatingTargetOrTargetSubject.target.abilityList.length === 0
          "
          >关联相关能力</span
        >
        <span v-else>{{
          "相关能力：" +
            input_creatingTargetOrTargetSubject.target.abilityList
              .map(ability => ability.name)
              .join("、")
        }}</span>
      </div>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 按钮：激活与完成 -->
      <div
        class="radio-container"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      >
        <!-- 选择器：激活计划 -->
        <div
          @click="
            input_creatingTargetOrTargetSubject.target.isActived = !input_creatingTargetOrTargetSubject
              .target.isActived
          "
        >
          <span>激活该目标</span
          ><img
            :src="
              input_creatingTargetOrTargetSubject.target.isActived
                ? assets.icon_selected
                : assets.icon_unselected
            "
            alt="icon_selected"
          />
        </div>

        <!-- 选择器：完成计划 -->
        <div
          @click="
            input_creatingTargetOrTargetSubject.target.isFinished = !input_creatingTargetOrTargetSubject
              .target.isFinished
          "
        >
          <span>完成该目标</span
          ><img
            :src="
              input_creatingTargetOrTargetSubject.target.isFinished
                ? assets.icon_selected
                : assets.icon_unselected
            "
            alt="icon_unselected"
          />
        </div>
      </div>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 占位框 -->
      <div style="height: 9.25vh"></div>

      <div class="button-container">
        <!-- 按钮：删除计划 -->
        <div
          class="delete-button"
          @click="isCreateTargetDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：保存计划 -->
        <div class="save-button" @click="click_createTargetOrTargetSubject">
          创建
        </div>
      </div>
    </el-drawer>

    <!-- 抽屉菜单：编辑目标或目录 -->
    <el-drawer
      class="create-target-drawer"
      :title="
        input_editingTargetOrTargetSubject.inputType === `target`
          ? `编辑目标`
          : `编辑目标类别`
      "
      direction="btt"
      size="86.64%"
      :visible.sync="isEditTargetDrawerDisplayed"
    >
      <!-- 下面是创建目标类别 -->
      <!-- 输入框：输入目标类别名称 -->
      <input
        v-if="input_editingTargetOrTargetSubject.inputType === `targetSubject`"
        type="text"
        class="input-target"
        placeholder="输入目标类别名称"
        v-model="input_editingTargetOrTargetSubject.targetSubject.name"
      />

      <!-- 下面是创建目标 -->

      <!-- 单选框：目标的类别 -->
      <el-select
        class="select-target"
        placeholder="请选择目标所属类别"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
        v-model="input_editingTargetOrTargetSubject.target.targetSubjectId"
      >
        <el-option label="无" :value="null"></el-option>

        <el-option
          v-for="targetSubject in targetSubjectList"
          v-bind:key="targetSubject.id"
          :label="targetSubject.attributes.name"
          :value="targetSubject.id"
        ></el-option>
      </el-select>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 输入框：输入目标名称 -->
      <input
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
        type="text"
        class="input-target"
        placeholder="输入目标名称"
        v-model="input_editingTargetOrTargetSubject.target.name"
      />

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 输入框：输入目标名称 -->
      <input
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
        type="text"
        class="input-target"
        placeholder="输入目标达成条件 or 目标详情"
        v-model="input_editingTargetOrTargetSubject.target.description"
      />

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 单选框：创建目标 or 目标类别 -->
      <el-select
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
        class="select-target"
        placeholder="选择目标有效期"
        v-model="input_editingTargetOrTargetSubject.target.validityType"
      >
        <el-option label="长期目标" value="indefinite"></el-option>
        <el-option label="时限目标" value="time-bound"></el-option>
      </el-select>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 日期选择器：目标时限 -->
      <div
        class="date-select-target"
        v-if="
          input_editingTargetOrTargetSubject.inputType === `target` &&
            input_editingTargetOrTargetSubject.target.validityType ===
              `time-bound`
        "
      >
        <el-date-picker
          class="data-select-picker-item"
          v-model="input_editingTargetOrTargetSubject.target.validity"
          type="date"
          placeholder="预计达成目标的日期"
        >
        </el-date-picker>
      </div>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="
          input_editingTargetOrTargetSubject.inputType === `target` &&
            input_editingTargetOrTargetSubject.target.validityType ===
              `time-bound`
        "
      ></div>

      <!-- 按钮：关联相关能力 -->
      <div
        class="related-ability"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      >
        <img
          :src="assets.icon_add"
          alt="icon_add"
          v-if="
            input_editingTargetOrTargetSubject.target.abilityList.length === 0
          "
        />
        <span
          v-if="
            input_editingTargetOrTargetSubject.target.abilityList.length === 0
          "
          >关联相关能力</span
        >
        <span v-else>{{
          "相关能力：" +
            input_editingTargetOrTargetSubject.target.abilityList
              .map(ability => ability.name)
              .join("、")
        }}</span>
      </div>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 按钮：激活与完成 -->
      <div
        class="radio-container"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      >
        <!-- 选择器：激活计划 -->
        <div
          @click="
            input_editingTargetOrTargetSubject.target.isActived = !input_editingTargetOrTargetSubject
              .target.isActived
          "
        >
          <span>激活该目标</span
          ><img
            :src="
              input_editingTargetOrTargetSubject.target.isActived
                ? assets.icon_selected
                : assets.icon_unselected
            "
            alt="icon_selected"
          />
        </div>

        <!-- 选择器：完成计划 -->
        <div
          @click="
            input_editingTargetOrTargetSubject.target.isFinished = !input_editingTargetOrTargetSubject
              .target.isFinished
          "
        >
          <span>完成该目标</span
          ><img
            :src="
              input_editingTargetOrTargetSubject.target.isFinished
                ? assets.icon_selected
                : assets.icon_unselected
            "
            alt="icon_unselected"
          />
        </div>
      </div>

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 占位框 -->
      <div style="height: 9.25vh"></div>

      <div class="button-container">
        <!-- 按钮：删除计划 -->
        <div class="delete-button" @click="click_deleteTargetOrTargetSubject">
          删除
        </div>

        <!-- 按钮：保存计划 -->
        <div class="save-button" @click="click_saveTargetOrTargetSubject">
          保存
        </div>
      </div>
    </el-drawer>

    <!-- 底边栏 -->
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  inject,
  reactive
} from "@vue/composition-api";
import TopBar from "../../components/TopBar.vue";
import BottomBar from "../../components/BottomBar.vue";
import Target from "./target/Target.vue";
import Ability from "./ability/Ability.vue";
import {
  TargetAbilityTabType,
  InputTargetOrTargetSubjectType
} from "@/lib/types/vue-viewmodels";
import Store from "../../store";
import AV from "leancloud-storage";
import icon_add from "../../assets/icon_add.svg";
import icon_selected from "../../assets/selected_icon.svg";
import icon_unselected from "../../assets/unselected_icon.svg";
import { TargetPage } from "../../lib/vue-viewmodels";

export default defineComponent({
  components: { TopBar, BottomBar, Target, Ability },
  setup(props, context) {
    // 当前的 TAB：Ability｜Target
    const currentTab: Ref<TargetAbilityTabType> = ref("target");

    // 控制变量：「创建目标」的抽屉菜单是否打开
    const isCreateTargetDrawerDisplayed: Ref<boolean> = inject(
      Store.isCreateTargetDrawerDisplayed,
      ref(false)
    );

    // 控制变量：「编辑目标」的抽屉菜单是否打开
    const isEditTargetDrawerDisplayed: Ref<boolean> = inject(
      Store.isEditTargetDrawerDisplayed,
      ref(false)
    );

    // 用户输入：创建「目标」或「目标类别」
    const input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType = reactive(
      {
        inputType: "target", // 默认选择：目标
        target: {
          id: "",
          targetSubjectId: "", //默认：不选择
          name: "",
          description: "",
          validityType: "",
          validity: null,
          abilityList: [],
          isActived: true,
          isFinished: false
        },
        targetSubject: {
          id: "",
          name: ""
        }
      }
    );

    // 用户输入：编辑「目标」或「目标类别」
    const input_editingTargetOrTargetSubject: InputTargetOrTargetSubjectType = inject(
      Store.input_editingTargetOrTargetSubject,
      reactive({
        inputType: "target", // 默认选择：目标
        target: {
          id: "",
          targetSubjectId: "", //默认：不选择
          name: "",
          description: "",
          validityType: "",
          validity: null,
          abilityList: [],
          isActived: true,
          isFinished: false
        },
        targetSubject: {
          id: "",
          name: ""
        }
      })
    );

    //「目标」的列表
    const unSubjectiveTargetList: Ref<AV.Object[]> = inject(
      Store.unSubjectiveTargetList,
      ref([])
    );

    // 已完成的「目标」列表
    const completedTargetList: Ref<AV.Object[]> = inject(
      Store.completedTargetList,
      ref([])
    );

    //「目标类别」的列表
    const targetSubjectList: Ref<AV.Object[]> = inject(
      Store.targetSubjectList,
      ref([])
    );

    // 点击事件：创建目标或目标目录
    const click_createTargetOrTargetSubject = () => {
      TargetPage.createTargetOrTargetSubject(
        context.root,
        input_creatingTargetOrTargetSubject,
        isCreateTargetDrawerDisplayed,
        unSubjectiveTargetList,
        completedTargetList,
        targetSubjectList
      );
    };

    // 点击事件：删除目标或目标目录
    const click_deleteTargetOrTargetSubject = () => {
      TargetPage.deleteTargetOrTargetSubject(
        context.root,
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    };

    // 点击事件：保存目标或目标目录
    const click_saveTargetOrTargetSubject = () => {
      TargetPage.saveTargetOrTargetSubject(
        context.root,
        isEditTargetDrawerDisplayed,
        input_editingTargetOrTargetSubject,
        unSubjectiveTargetList,
        targetSubjectList,
        completedTargetList
      );
    };

    return {
      currentTab,
      click_createTargetOrTargetSubject,
      click_deleteTargetOrTargetSubject,
      click_saveTargetOrTargetSubject,
      isCreateTargetDrawerDisplayed,
      isEditTargetDrawerDisplayed,
      input_creatingTargetOrTargetSubject,
      input_editingTargetOrTargetSubject,
      targetSubjectList,
      assets: {
        icon_add,
        icon_selected,
        icon_unselected
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
.container {
  display flex
  flex-direction column
  background #f0f1f3
  // 顶部的 TAB 栏
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
  // 主要界面
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
  // 抽屉菜单：创建目标或目录
  .create-target-drawer >>> .el-drawer__body {
    display flex
    flex-direction column
    overflow scroll
    align-items center
  }
  // 抽屉菜单 item：选择框
  .select-target >>> .el-input__inner {
    flex-shrink 0
    width 89.6vw
    height 6.9vh
    border-radius 0.67vh
    border solid 0.15vh #ebebf3
    padding-left 4.8vw
    padding-right 4.8vw
    font-size 1.95vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.21px
    text-align left
    color #363636
    &::-webkit-input-placeholder {
      font-size 1.95vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.42
      letter-spacing 0.21px
      text-align left
      color #969294
    }
  }
  // 抽屉菜单 item：输入框
  .input-target {
    flex-shrink 0
    width 89.6vw
    height 6.9vh
    border-radius 0.67vh
    border solid 0.15vh #ebebf3
    padding-left 4.8vw
    padding-right 4.8vw
    font-size 1.95vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.21px
    text-align left
    color #363636
    &::-webkit-input-placeholder {
      font-size 1.95vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.42
      letter-spacing 0.21px
      text-align left
      color #969294
    }
  }
  // 抽屉菜单 item：日期选择器
  .date-select-target >>> .el-date-editor.el-input, .el-date-editor.el-input__inner {
    flex-shrink 0
    width 89.6vw
    height 6.9vh
  }
  .date-select-target >>> .el-input__inner {
    flex-shrink 0
    width 89.6vw
    height 6.9vh
    border-radius 0.67vh
    border solid 0.15vh #ebebf3
    padding-left 11.07vw
    padding-right 4.8vw
    font-size 1.95vh
    font-weight normal
    font-stretch normal
    font-style normal
    line-height 1.42
    letter-spacing 0.21px
    text-align left
    color #363636
    &::-webkit-input-placeholder {
      font-size 1.95vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.42
      letter-spacing 0.21px
      text-align left
      color #969294
    }
  }
  .data-select-picker-item >>> .el-input__prefix {
    left 4.8vw
  }
  .data-select-picker-item >>> .el-input__icon {
    width 3.41vw
    height 100%
    line-height 7vh
  }
  // 按钮：关联相关能力
  .related-ability {
    flex-shrink 0
    width 89.6vw
    height 6.9vh
    border-radius 0.67vh
    background-color #F4F4F8
    display flex
    align-items center
    cursor pointer
    padding-left 3.92vw
    img {
      width 1.92vh
      height 1.92vh
      margin-right 2.8vw
      opacity 0.5
    }
    span {
      opacity 0.5
      font-size 1.95vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.44
      letter-spacing 0.02vh
      text-align left
      color #636971
    }
  }
  // 按钮：保存与删除
  .button-container {
    flex-shrink 0
    position fixed
    bottom 0
    width 100%
    height 9.25vh
    box-shadow 0 -0.22vh 0.44vh 0 rgba(0, 0, 0, 0.16)
    background-color #ffffff
    display flex
    justify-content space-between
    align-items center
  }
  .delete-button {
    width 46.8vw
    height 6.82vh
    border-radius 0.75vh
    background-color #959595
    font-size 1.8vh
    font-weight bold
    font-stretch normal
    font-style normal
    line-height 1.5
    letter-spacing 0.04vh
    text-align center
    color #ffffff
    display flex
    justify-content center
    align-items center
    margin-left 2.13vw
    cursor pointer
  }
  .save-button {
    width 46.8vw
    height 6.82vh
    border-radius 0.75vh
    background-color #222a36
    font-size 1.8vh
    font-weight bold
    font-stretch normal
    font-style normal
    line-height 1.5
    letter-spacing 0.04vh
    text-align center
    color #ffffff
    display flex
    justify-content center
    align-items center
    margin-right 2.13vw
    cursor pointer
  }
  .radio-container {
    flex-shrink 0
    display flex
    width 89.6vw
    justify-content space-between
    div {
      cursor pointer
      width 42.93vw
      height 6.9vh
      border-radius 0.67vh
      background-color #f4f4f8
      display flex
      align-items center
      span {
        opacity 0.3
        font-size 2.02vh
        font-weight normal
        font-stretch normal
        font-style normal
        line-height 1.44
        letter-spacing 0.02vh
        text-align center
        color #222a36
        margin-left 4.8vw
      }
      img {
        width 2.1vh
        height 2.1vh
        margin-left 12.27vw
      }
    }
  }
}
</style>
