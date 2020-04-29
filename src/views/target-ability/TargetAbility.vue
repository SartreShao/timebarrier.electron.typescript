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
    <tb-drawer
      :title="
        input_creatingTargetOrTargetSubject.inputType === `target`
          ? `创建目标`
          : `创建目标类别`
      "
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
      <tb-input
        v-if="input_creatingTargetOrTargetSubject.inputType === `targetSubject`"
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
      <tb-input
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
        placeholder="输入目标名称"
        v-model="input_creatingTargetOrTargetSubject.target.name"
      />

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 输入框：输入目标名称 -->
      <tb-input
        v-if="input_creatingTargetOrTargetSubject.inputType === `target`"
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
        @click="click_relatedAbilityCreateTargetButton"
        v-darked-when-click
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
          v-darked-when-click
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
          v-darked-when-click
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
          v-darked-when-click
          class="delete-button"
          @click="isCreateTargetDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：保存计划 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_createTargetOrTargetSubject"
        >
          创建
        </div>
      </div>
    </tb-drawer>

    <!-- 抽屉菜单：编辑目标或目录 -->
    <tb-drawer
      :title="
        input_editingTargetOrTargetSubject.inputType === `target`
          ? `编辑目标`
          : `编辑目标类别`
      "
      :visible.sync="isEditTargetDrawerDisplayed"
    >
      <!-- 下面是创建目标类别 -->
      <!-- 输入框：输入目标类别名称 -->
      <tb-input
        v-if="input_editingTargetOrTargetSubject.inputType === `targetSubject`"
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
      <tb-input
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
        placeholder="输入目标名称"
        v-model="input_editingTargetOrTargetSubject.target.name"
      />

      <!-- 占位框 -->
      <div
        style="height:2.4vh"
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
      ></div>

      <!-- 输入框：输入目标名称 -->
      <tb-input
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
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
        v-darked-when-click
        v-if="input_editingTargetOrTargetSubject.inputType === `target`"
        @click="click_relatedAbilityEditTargetButton"
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
          v-darked-when-click
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
          v-darked-when-click
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
        <div
          class="delete-button"
          v-darked-when-click
          @click="click_deleteTargetOrTargetSubject"
        >
          删除
        </div>

        <!-- 按钮：保存计划 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_saveTargetOrTargetSubject"
        >
          保存
        </div>
      </div>
    </tb-drawer>

    <!-- 抽屉菜单：Target 关联相关 Ability -->
    <tb-drawer
      title="关联相关能力"
      :visible.sync="isTargetRelateAbilityDrawerDisplayed"
    >
      <!-- 输入框：创建新能力 -->
      <div class="input-ability-name-container">
        <input
          type="text"
          placeholder="创建一个新能力"
          class="input-ability-name"
          @keyup.enter="keyUpEnter_abilityInputBox"
          v-model="input_abilityName"
        />

        <img :src="assets.icon_enter" alt="icon_enter" />
      </div>

      <!-- 包含框 -->
      <section class="ability-container">
        <div
          class="ability-item"
          v-for="item in input_abilityListOfTarget"
          v-bind:key="item.id"
          @click="click_abilityItemSelector(item)"
        >
          <span>{{ item.attributes.name }}</span>
          <img
            v-if="item.attributes.selected"
            :src="assets.icon_finished"
            alt="icon_finished"
          />
          <img v-else src="" alt="" />
        </div>
      </section>

      <div class="button-container">
        <!-- 按钮：取消计划 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="isTargetRelateAbilityDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：选择计划 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_saveAbilityOfTargetButton"
        >
          选择
        </div>
      </div>
    </tb-drawer>

    <!-- 抽屉菜单：编辑能力 -->
    <tb-drawer title="编辑能力" :visible.sync="isEditAbilityDrawerDisplayed">
      <!-- 输入框：输入能力名称 -->
      <tb-input
        placeholder="输入能力名称"
        v-model="input_editingAbility.name"
      ></tb-input>

      <!-- 占位框 -->
      <div style="height:2.4vh"></div>

      <!-- 关联 Target 按钮 -->
      <div
        class="related-ability"
        v-darked-when-click
        @click="click_relatedTargetEditButton"
      >
        <img
          :src="assets.icon_add"
          alt="icon_add"
          v-if="input_editingAbility.targetList.length === 0"
        />
        <span v-if="input_editingAbility.targetList.length === 0"
          >关联相关能力</span
        >
        <span v-else>{{
          "相关能力：" +
            input_editingAbility.targetList
              .map(target => target.name)
              .join("、")
        }}</span>
      </div>

      <!-- 占位框 -->
      <div style="height:2.4vh"></div>

      <!-- 关联 Plan 按钮 -->
      <div
        class="related-ability"
        v-darked-when-click
        @click="click_relatedPlanEditButton"
      >
        <img
          :src="assets.icon_add"
          alt="icon_add"
          v-if="input_editingAbility.planList.length === 0"
        />
        <span v-if="input_editingAbility.planList.length === 0"
          >关联相关能力</span
        >
        <span v-else>{{
          "相关能力：" +
            input_editingAbility.planList.map(plan => plan.name).join("、")
        }}</span>
      </div>

      <!-- 占位框 -->
      <div style="height:2.4vh"></div>

      <div class="button-container">
        <!-- 按钮：删除能力 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="click_deleteAbilityButton"
        >
          删除
        </div>

        <!-- 按钮：保存能力 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_saveAbilityButton"
        >
          保存
        </div>
      </div>
    </tb-drawer>

    <!-- 抽屉菜单：Ability 关联相关 Target -->
    <tb-drawer
      title="关联相关能力"
      :visible.sync="isAbilityRelatedTargetDrawerDisplayed"
    >
      <!-- 输入框：创建新 Target -->
      <div class="input-ability-name-container">
        <input
          type="text"
          placeholder="创建一个新能力"
          class="input-ability-name"
          @keyup.enter="keyUpEnter_targetInputBox"
          v-model="input_targetName"
        />

        <img :src="assets.icon_enter" alt="icon_enter" />
      </div>

      <!-- 包含框 -->
      <section class="ability-container">
        <div
          class="ability-item"
          v-for="item in input_targetListOfAbility"
          v-bind:key="item.id"
          @click="click_targetItemSelector(item)"
        >
          <span>{{ item.attributes.name }}</span>
          <img
            v-if="item.attributes.selected"
            :src="assets.icon_finished"
            alt="icon_finished"
          />
          <img v-else src="" alt="" />
        </div>
      </section>

      <div class="button-container">
        <!-- 按钮：取消计划 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="isAbilityRelatedTargetDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：选择计划 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_saveTargetOfAbilityButton"
        >
          选择
        </div>
      </div>
    </tb-drawer>

    <!-- 抽屉菜单：Ability 关联相关 Plan -->
    <tb-drawer
      title="关联相关能力"
      :visible.sync="isAbilityRelatedPlanDrawerDisplayed"
    >
      <!-- 输入框：创建新 Target -->
      <div class="input-ability-name-container">
        <input
          type="text"
          placeholder="创建一个新能力"
          class="input-ability-name"
          @keyup.enter="keyUpEnter_planInputBox"
          v-model="input_planName"
        />

        <img :src="assets.icon_enter" alt="icon_enter" />
      </div>

      <!-- 包含框 -->
      <section class="ability-container">
        <div
          class="ability-item"
          v-for="item in input_planListOfAbility"
          v-bind:key="item.id"
          @click="click_planItemSelector(item)"
        >
          <span>{{ item.attributes.name }}</span>
          <img
            v-if="item.attributes.selected"
            :src="assets.icon_finished"
            alt="icon_finished"
          />
          <img v-else src="" alt="" />
        </div>
      </section>

      <div class="button-container">
        <!-- 按钮：取消计划 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="isAbilityRelatedPlanDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：选择计划 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_savePlanOfAbilityButton"
        >
          选择
        </div>
      </div>
    </tb-drawer>

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
  InputTargetOrTargetSubjectType,
  InputAbilityType
} from "@/lib/types/vue-viewmodels";
import Store from "../../store";
import AV from "leancloud-storage";
import icon_add from "../../assets/icon_add.svg";
import icon_selected from "../../assets/selected_icon.svg";
import icon_unselected from "../../assets/unselected_icon.svg";
import icon_enter from "../../assets/icon_enter.svg";
import icon_finished from "../../assets/icon_finished.svg";
import TbDrawer from "@/lib/components/TbDrawer.vue";
import TbInput from "@/lib/components/TbInput.vue";
import { TargetPage, AbilityPage } from "../../lib/vue-viewmodels";

export default defineComponent({
  components: { TopBar, BottomBar, Target, Ability, TbDrawer, TbInput },
  setup(props, context) {
    // 色彩表
    const colormap: string[] = inject(Store.colormap, []);

    // 一个临时变量，用于标明当前是在创建 Target 还是在编辑 Target
    const isCreateTarget: Ref<boolean> = ref(false);

    // 一个临时变量，用于标明当前是在创建 Ablity 还是在编辑 Ability
    const isCreateAbility: Ref<boolean> = ref(false);

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

    // 控制变量：「编辑能力」的抽屉菜单是否打开
    const isEditAbilityDrawerDisplayed: Ref<boolean> = inject(
      Store.isEditAbilityDrawerDisplayed,
      ref(false)
    );

    // 用户输入：创建「目标」或「目标类别」
    const input_creatingTargetOrTargetSubject: InputTargetOrTargetSubjectType = inject(
      Store.input_creatingTargetOrTargetSubject,
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

    // 用户输入：编辑「能力」
    const input_editingAbility: InputAbilityType = inject(
      Store.input_editingAbility,
      reactive({
        id: "",
        name: "",
        targetList: [],
        planList: [],
        isActived: true,
        isFinished: false
      })
    );

    // 用户输入：创建「能力」
    const input_creatingAbility: InputAbilityType = inject(
      Store.input_creatingAbility,
      reactive({
        id: "",
        name: "",
        targetList: [],
        planList: [],
        isActived: true,
        isFinished: false
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

    // 能力列表
    const abilityList: Ref<AV.Object[]> = inject(Store.abilityList, ref([]));

    // 能力等级列表
    const levelRuleList: Ref<AV.Object[]> = inject(
      Store.levelRuleList,
      ref([])
    );

    // 抽屉菜单控制器：Target 关联 Ability
    const isTargetRelateAbilityDrawerDisplayed: Ref<boolean> = ref(false);

    // 抽屉菜单控制器：Ability 关联 Target
    const isAbilityRelatedTargetDrawerDisplayed: Ref<boolean> = ref(false);

    // 抽屉菜单控制器：Ability 关联 Plan
    const isAbilityRelatedPlanDrawerDisplayed: Ref<boolean> = ref(false);

    // 用户输入：创建的「能力」的名称
    const input_abilityName: Ref<string> = ref("");

    // 用户输入：创建的「目标」的名称
    const input_targetName: Ref<string> = ref("");

    // 用户输入：创建的「计划」的名称
    const input_planName: Ref<string> = ref("");

    // 用户输入：需要关联到目标的能力列表
    const input_abilityListOfTarget: Ref<AV.Object[]> = ref([]);

    // 用户输入：需要关联到能力的目标列表
    const input_targetListOfAbility: Ref<AV.Object[]> = ref([]);

    // 用户输入：需要关联到能力的计划列表
    const input_planListOfAbility: Ref<AV.Object[]> = ref([]);

    // 回车事件：能力输入框
    const keyUpEnter_abilityInputBox = () => {
      if (isCreateTarget.value) {
        TargetPage.createAbility(
          context.root,
          input_abilityName,
          input_abilityListOfTarget,
          null,
          colormap
        );
      } else {
        TargetPage.createAbility(
          context.root,
          input_abilityName,
          input_abilityListOfTarget,
          input_editingTargetOrTargetSubject,
          colormap
        );
      }
    };

    // 回车事件：Target 输入框
    const keyUpEnter_targetInputBox = () => {
      if (isCreateAbility.value) {
        AbilityPage.createTarget(
          context.root,
          input_targetName,
          input_targetListOfAbility,
          null,
          colormap
        );
      } else {
        AbilityPage.createTarget(
          context.root,
          input_targetName,
          input_targetListOfAbility,
          input_editingAbility,
          colormap
        );
      }
    };

    // 回车事件：Plan 输入框
    const keyUpEnter_planInputBox = () => {};

    // 点击事件：创建目标或目标目录
    const click_createTargetOrTargetSubject = () => {
      TargetPage.createTargetOrTargetSubject(
        context.root,
        input_creatingTargetOrTargetSubject,
        isCreateTargetDrawerDisplayed,
        unSubjectiveTargetList,
        completedTargetList,
        targetSubjectList,
        colormap
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

    // 点击事件：关联相关能力按钮（创建目标）
    const click_relatedAbilityCreateTargetButton = () => {
      isCreateTarget.value = true;

      TargetPage.openRelateAbilityDrawer(
        context.root,
        isTargetRelateAbilityDrawerDisplayed,
        input_abilityListOfTarget,
        null,
        input_creatingTargetOrTargetSubject
      );
    };

    // 点击事件：关联相关能力按钮（编辑目标）
    const click_relatedAbilityEditTargetButton = () => {
      isCreateTarget.value = false;

      TargetPage.openRelateAbilityDrawer(
        context.root,
        isTargetRelateAbilityDrawerDisplayed,
        input_abilityListOfTarget,
        input_editingTargetOrTargetSubject,
        null
      );
    };

    // 点击事件：选择能力的单项（Target 关联相关能力）
    const click_abilityItemSelector = (ability: AV.Object) => {
      TargetPage.selectAbilityToCommit(ability);
    };

    // 点击事件：选择目标的单项（Ability 关联相关目标）
    const click_targetItemSelector = (target: AV.Object) => {
      AbilityPage.selectTargetItem(target);
    };

    // 点击事件：选择计划的单项（Ability 关联相关计划）
    const click_planItemSelector = (plan: AV.Object) => {
      AbilityPage.selectPlanItem(plan);
    };

    // 点击事件：保存选择好的 Ability
    const click_saveAbilityOfTargetButton = () => {
      TargetPage.saveSelectedAbilityToCreatingOrEditingTarget(
        isTargetRelateAbilityDrawerDisplayed,
        input_abilityListOfTarget,
        input_creatingTargetOrTargetSubject,
        input_editingTargetOrTargetSubject
      );
    };

    // 点击事件：保存选择好的 Target
    const click_saveTargetOfAbilityButton = () => {};

    // 点击事件：保存选择好的 Plan
    const click_savePlanOfAbilityButton = () => {};

    // 点击事件：编辑 Ability 时，关联 Target
    const click_relatedTargetEditButton = () => {
      isCreateAbility.value = false;
      AbilityPage.openRelateTargetDrawer(
        context.root,
        isAbilityRelatedTargetDrawerDisplayed,
        input_targetListOfAbility,
        input_editingAbility
      );
    };

    // 点击事件：编辑 Ability 时，关联 Plan
    const click_relatedPlanEditButton = () => {
      isCreateAbility.value = false;
    };

    // 点击事件：创建 Ability 时，关联 Target
    const click_relatedTargetCreateButton = () => {
      isCreateAbility.value = true;
      AbilityPage.openRelateTargetDrawer(
        context.root,
        isAbilityRelatedTargetDrawerDisplayed,
        input_targetListOfAbility,
        null
      );
    };

    // 点击事件：创建 Ability 时，关联 Plan
    const click_relatedPlanCreateButton = () => {
      isCreateAbility.value = true;
    };

    // 点击事件：删除 Ability 按钮
    const click_deleteAbilityButton = () => {
      AbilityPage.deleteAbility(
        context.root,
        isEditAbilityDrawerDisplayed,
        input_editingAbility,
        abilityList,
        levelRuleList
      );
    };

    // 点击事件：保存 Ability 按钮
    const click_saveAbilityButton = () => {
      AbilityPage.saveAbility(
        context.root,
        isEditAbilityDrawerDisplayed,
        input_editingAbility,
        abilityList,
        levelRuleList
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
      input_creatingAbility,
      input_editingAbility,
      targetSubjectList,
      isTargetRelateAbilityDrawerDisplayed,
      isEditAbilityDrawerDisplayed,
      isAbilityRelatedTargetDrawerDisplayed,
      isAbilityRelatedPlanDrawerDisplayed,
      keyUpEnter_abilityInputBox,
      keyUpEnter_targetInputBox,
      keyUpEnter_planInputBox,
      input_abilityName,
      input_targetName,
      input_planName,
      input_abilityListOfTarget,
      input_targetListOfAbility,
      input_planListOfAbility,
      click_abilityItemSelector,
      click_targetItemSelector,
      click_planItemSelector,
      click_saveAbilityOfTargetButton,
      click_saveTargetOfAbilityButton,
      click_savePlanOfAbilityButton,
      click_relatedAbilityCreateTargetButton,
      click_relatedAbilityEditTargetButton,
      click_relatedTargetEditButton,
      click_relatedPlanEditButton,
      click_relatedTargetCreateButton,
      click_relatedPlanCreateButton,
      click_deleteAbilityButton,
      click_saveAbilityButton,
      assets: {
        icon_add,
        icon_selected,
        icon_unselected,
        icon_enter,
        icon_finished
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
    width 100%
    background #F5F5F5
    display flex
    flex-direction column
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
.input-ability-name-container {
  position relative
  width 89.6vw
  height 6.9vh
  img {
    position absolute
    right 5.93vw
    top 0
    bottom 0
    margin-top auto
    margin-bottom auto
    width 3.27vw
    height 1.3vh
  }
  .input-ability-name {
    outline none
    -webkit-appearance none /* 去除系统默认的样式 */
    position absolute
    width 89.6vw
    height 6.9vh
    border-radius 0.67vh
    border solid 0.15vh #ebebf3
    padding-left 4.8vw
    padding-right 4.8vw
    box-sizing border-box
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
      letter-spacing 0.02vh
      text-align left
      color #969294
    }
  }
}
.ability-container {
  margin-top 2.4vh
  width 100%
  display flex
  flex-direction column
  align-items center
  .ability-item {
    cursor pointer
    width 89.6vw
    height 6.9vh
    border-radius 0.67vh
    background-color #f4f4f8
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    margin-bottom 1.5vh
    span {
      font-size 1.95vh
      font-weight normal
      font-stretch normal
      font-style normal
      line-height 1.42
      letter-spacing 0.02vh
      text-align left
      color #969294
      margin-left 4.8vw
    }
    img {
      height 2.7vh
      width 2.7vh
      background white
      border-radius 50%
      border solid 0.07vh #d5d5d5
      margin-right 5.87vw
    }
  }
}
</style>
