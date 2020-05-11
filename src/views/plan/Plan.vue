<template>
  <div class="container">
    <!-- 顶边栏 -->
    <top-bar></top-bar>

    <!-- 创建新计划的输入框 -->

    <section class="new-plan-input-container">
      <input
        type="text"
        placeholder="点击添加一个临时计划"
        @keyup.enter="keyUpEnter_planInputBox"
        v-model="input_planName"
      />
    </section>

    <!-- 主界面 -->
    <main>
      <div style="height:2.1vh;flex-shrink:0"></div>
      <!-- 临时计划列表 -->
      <section class="temporary" v-if="temporaryPlanList.length !== 0">
        <draggable
          :options="draggableOptions"
          v-model="temporaryPlanList"
          ghost-class="ghost"
          @end="dragend_templayPlanItem"
        >
          <transition-group type="transition" name="flip-list">
            <div
              v-splash-when-click
              class="item-container"
              :id="item.id"
              v-for="(item, index) in temporaryPlanList"
              :key="item.id"
              v-longclick="() => longclick_editPlanButton(item, index)"
              :title="item.attributes.name"
            >
              <h2 style="pointer-events:none;">临时计划</h2>
              <div class="placeholder" style="pointer-events:none;"></div>
              <h3 style="pointer-events:none;">{{ item.attributes.name }}</h3>
              <div
                class="finished-button"
                @click.stop="click_completePlanButton(item)"
              ></div>
            </div>
          </transition-group>
        </draggable>
      </section>

      <!-- 每日计划 -->
      <section class="daily">
        <draggable
          :options="draggableOptions"
          v-model="dailyPlanList"
          ghost-class="ghost"
          @end="dragend_dailyPlanItem"
        >
          <transition-group type="transition" name="flip-list">
            <div
              :id="item.id"
              class="item-container"
              v-for="(item, index) in dailyPlanList"
              v-bind:key="item.id"
              v-longclick="() => longclick_editPlanButton(item, index)"
              v-splash-when-click
              :title="item.attributes.name"
            >
              <div class="plan-container">
                <h2>每日计划</h2>
                <div class="placeholder"></div>
                <h3>{{ item.attributes.name }}</h3>
                <img
                  @click.stop="click_startTomatoButton(item)"
                  class="start-button"
                  :src="assets.icon_start"
                  alt="icon_start"
                />
              </div>
              <div class="plan-detail-container">
                <span v-if="item.attributes.abilityListOfPlan.length !== 0">{{
                  "提升" +
                    item.attributes.abilityListOfPlan[0].attributes.name +
                    " · 已累计 " +
                    item.attributes.tomatoNumber / 2 +
                    " 个小时"
                }}</span>
                <span v-else>{{
                  "已累计 " + item.attributes.tomatoNumber / 2 + " 个小时"
                }}</span>
                <div>
                  {{
                    `${item.attributes.todayTomatoNumber} / ${item.attributes.target} 个番茄`
                  }}
                </div>
              </div>
            </div>
          </transition-group>
        </draggable>
      </section>

      <!-- 「已完成」按钮 -->
      <div
        class="completed-container"
        v-darked-when-click
        @click="click_completedPlanListButton"
      >
        已完成 · {{ completedPlanList.length }}
      </div>
    </main>

    <!-- 抽屉菜单：已完成的番茄 -->
    <el-drawer
      class="finished-plan-container"
      title="已完成的番茄"
      :visible.sync="isCompletedPlanDrawerDisplayed"
      direction="btt"
      size="69.64%"
    >
      <!-- 临时计划 -->
      <section class="finished">
        <div
          v-splash-when-click
          class="item-container"
          v-for="(item, index) in completedPlanList"
          v-bind:key="item.id"
          v-longclick="() => longclick_editPlanButton(item, index)"
          :title="item.attributes.name"
        >
          <h2>
            {{ item.attributes.type === "daily" ? "每日计划" : "临时计划" }}
          </h2>
          <div class="placeholder"></div>
          <h3>{{ item.attributes.name }}</h3>
          <img
            :src="assets.icon_finished"
            class="cancel-finished-button"
            @click.stop="click_cancelCompletePlanButton(item)"
          />
        </div>
      </section>
    </el-drawer>

    <!-- 抽屉菜单：编辑计划 -->
    <el-drawer
      class="edit-plan-container"
      title="编辑计划"
      direction="btt"
      size="86.64%"
      :visible.sync="isPlanEditorDrawerDisplayed"
    >
      <!-- 输入框：计划名称 -->
      <input
        type="text"
        class="input-plan-name"
        placeholder="输入计划名称"
        v-model="input_editingPlan.name"
      />

      <!-- 单选框：计划类别 -->
      <el-select
        placeholder="选择计划类型"
        class="input-plan-type"
        v-model="input_editingPlan.type"
      >
        <el-option label="临时计划" value="temporary"></el-option>
        <el-option label="每日计划" value="daily"></el-option>
      </el-select>

      <!-- 输入框：目标番茄 -->
      <input
        :hidden="input_editingPlan.type === `temporary`"
        :disabled="input_editingPlan.type === `temporary`"
        class="input-plan-target"
        v-bind:class="{ opacity40: input_editingPlan.type === `temporary` }"
        type="number"
        placeholder="每日目标番茄（0-48）"
        v-model="input_editingPlan.target"
      />

      <!-- 按钮：关联相关能力 -->
      <div
        class="add-plan-related"
        v-darked-when-click
        @click="click_relatedAbilityButton"
      >
        <img
          :src="assets.icon_add"
          alt="icon_add"
          v-if="input_editingPlan.abilityList.length === 0"
        />
        <span v-if="input_editingPlan.abilityList.length === 0"
          >关联相关能力</span
        >
        <span v-else>{{
          "相关能力：" +
            input_editingPlan.abilityList
              .map(ability => ability.name)
              .join("、")
        }}</span>
      </div>

      <!-- 按钮：关联相关目标 -->
      <div
        class="add-plan-related"
        v-darked-when-click
        @click="click_relatedTargetButton"
      >
        <img
          :src="assets.icon_add"
          alt="icon_add"
          v-if="input_editingPlan.targetList.length === 0"
        />
        <span v-if="input_editingPlan.targetList.length === 0"
          >关联相关目标</span
        >
        <span v-else>{{
          "相关目标：" +
            input_editingPlan.targetList.map(target => target.name).join("、")
        }}</span>
      </div>

      <div class="radio-container">
        <!-- 选择器：激活计划 -->
        <div
          v-darked-when-click
          @click="input_editingPlan.isActived = !input_editingPlan.isActived"
        >
          <span>激活该计划</span
          ><img
            :src="
              input_editingPlan.isActived
                ? assets.icon_selected
                : assets.icon_unselected
            "
            alt="icon_selected"
          />
        </div>

        <!-- 选择器：完成计划 -->
        <div
          v-darked-when-click
          @click="input_editingPlan.isFinished = !input_editingPlan.isFinished"
        >
          <span>完成该计划</span
          ><img
            :src="
              input_editingPlan.isFinished
                ? assets.icon_selected
                : assets.icon_unselected
            "
            alt="icon_unselected"
          />
        </div>
      </div>

      <div class="button-container">
        <!-- 按钮：删除计划 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="click_deletePlanButton"
        >
          删除
        </div>

        <!-- 按钮：保存计划 -->
        <div
          class="save-button"
          v-darked-when-click
          @click="click_savePlanButton"
        >
          保存
        </div>
      </div>
    </el-drawer>

    <!-- 抽屉菜单：关联相关能力 -->
    <el-drawer
      class="related-ability-container"
      title="关联相关能力"
      direction="btt"
      size="86.64%"
      :visible.sync="isPlanRelateAbilityDrawerDisplayed"
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

      <!-- 包含框：能力 Ability -->
      <section class="ability-container">
        <div
          class="ability-item"
          v-for="item in input_abilityListOfPlan"
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
        <div style="height:10vh"></div>
      </section>

      <div class="button-container">
        <!-- 按钮：取消计划 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="isPlanRelateAbilityDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：选择计划 -->
        <div class="save-button" v-darked-when-click @click="click_saveAbility">
          选择
        </div>
      </div>
    </el-drawer>

    <!-- 抽屉菜单：关联相关目标 -->
    <el-drawer
      class="related-ability-container"
      title="关联相关目标"
      direction="btt"
      size="86.64%"
      :visible.sync="isPlanRelateTargetDrawerDisplayed"
    >
      <!-- 输入框：创建新能力 -->
      <div class="input-ability-name-container">
        <input
          type="text"
          placeholder="创建一个新目标"
          class="input-ability-name"
          @keyup.enter="keyUpEnter_targetInputBox"
          v-model="input_targetName"
        />

        <img :src="assets.icon_enter" alt="icon_enter" />
      </div>

      <!-- 包含框：目标 Target -->
      <section class="ability-container">
        <div
          class="ability-item"
          v-for="item in input_targetListOfPlan"
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
        <div style="height:10vh"></div>
      </section>

      <div class="button-container">
        <!-- 按钮：取消计划 -->
        <div
          class="delete-button"
          v-darked-when-click
          @click="isPlanRelateTargetDrawerDisplayed = false"
        >
          取消
        </div>

        <!-- 按钮：选择计划 -->
        <div class="save-button" v-darked-when-click @click="click_saveTarget">
          选择
        </div>
      </div>
    </el-drawer>
    <bottom-bar></bottom-bar>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  onMounted,
  inject,
  reactive
} from "@vue/composition-api";
import AV from "leancloud-storage";
import BottomBar from "../../components/BottomBar.vue";
import TopBar from "../../components/TopBar.vue";
import { PlanPage, TomatoTimerPage } from "@/lib/vue-viewmodels";
import Store from "../../store";
import icon_finished from "../../assets/icon_finished.svg";
import icon_logo from "../../assets/icon_logo.svg";
import icon_add from "../../assets/icon_add.svg";
import icon_selected from "../../assets/selected_icon.svg";
import icon_unselected from "../../assets/unselected_icon.svg";
import icon_enter from "../../assets/icon_enter.svg";
import icon_start from "../../assets/icon_start.svg";
import {
  PlanType,
  InputPlanType,
  TomatoCloudStatus
} from "@/lib/types/vue-viewmodels";
import Draggable from "vuedraggable";

export default defineComponent({
  components: { BottomBar, TopBar, Draggable },
  setup(props, context) {
    // 用户输入：创建的「计划」的名称
    const input_planName: Ref<string> = ref("");

    // 用户输入：创建的「能力」的名称
    const input_abilityName: Ref<string> = ref("");

    // 用户输入：创建的「目标」的名称
    const input_targetName: Ref<string> = ref("");

    // 用户输入：当前编辑的「计划」
    const input_editingPlan: InputPlanType = reactive({
      id: undefined,
      name: "",
      abilityList: [],
      targetList: [],
      type: "temporary",
      target: "",
      isActived: false,
      isFinished: false
    });

    // 用户输入：需要关联到计划的能力列表
    const input_abilityListOfPlan: Ref<AV.Object[]> = ref([]);

    // 用户输入：需要关联到计划的目标列表
    const input_targetListOfPlan: Ref<AV.Object[]> = ref([]);

    // 服务器拉取的数据：临时计划的列表
    const temporaryPlanList: Ref<AV.Object[]> = inject(
      Store.temporaryPlanList,
      ref<AV.Object[]>([])
    );

    // 服务器拉取的数据：每日计划的列表
    const dailyPlanList: Ref<AV.Object[]> = inject(
      Store.dailyPlanList,
      ref<AV.Object[]>([])
    );

    // 服务器拉取的数据：已完成计划的列表
    const completedPlanList: Ref<AV.Object[]> = inject(
      Store.completedPlanList,
      ref<AV.Object[]>([])
    );

    // 倒计时器 instance
    const tomatoClockInterval: Ref<NodeJS.Timeout | null> = inject(
      Store.tomatoClockInterval,
      ref(null)
    );

    // 倒计时表盘值
    const countDown: Ref<number> = inject(Store.countDown, ref(1500));

    // 番茄时钟的状态值
    const tomatoCloudStatus: Ref<TomatoCloudStatus> = inject(
      Store.tomatoCloudStatus,
      ref<TomatoCloudStatus>("prepared")
    );

    // 番茄开始的时间
    const tomatoStartTime: Ref<Date> = inject(
      Store.tomatoStartTime,
      ref<Date>(Date())
    );

    // 「展示 `已完成的计划列表` 的抽屉」是否已经打开
    const isCompletedPlanDrawerDisplayed: Ref<Boolean> = ref(false);

    // 「展示 `编辑计划` 的抽屉」是否已经打开
    const isPlanEditorDrawerDisplayed: Ref<boolean> = ref(false);

    // 「展示 `关联相关能力` 的抽屉」是否已经打开
    const isPlanRelateAbilityDrawerDisplayed: Ref<boolean> = ref(false);

    // 「展示 `关联相关目标` 的抽屉」是否已经打开
    const isPlanRelateTargetDrawerDisplayed: Ref<boolean> = ref(false);

    // 颜色表
    const colormap = inject(Store.colormap, []);

    // 在计划输入框回车：创建计划
    const keyUpEnter_planInputBox = () => {
      PlanPage.createPlan(
        context.root,
        input_planName,
        "temporary",
        temporaryPlanList,
        dailyPlanList
      );
    };

    // 在能力输入框回车：创建能力
    const keyUpEnter_abilityInputBox = () => {
      PlanPage.createAbility(
        context.root,
        input_abilityName,
        input_abilityListOfPlan,
        input_editingPlan,
        colormap
      );
    };

    // 在目标输入框回车：创建目标
    const keyUpEnter_targetInputBox = () => {
      PlanPage.createTarget(
        context.root,
        input_targetName,
        input_targetListOfPlan,
        input_editingPlan,
        colormap
      );
    };

    // 点击事件：点击「完成计划」按钮
    const click_completePlanButton = (plan: AV.Object) => {
      if (plan.id !== undefined) {
        PlanPage.completePlan(
          context.root,
          plan.id,
          plan.attributes.type,
          temporaryPlanList,
          dailyPlanList,
          completedPlanList
        );
      }
    };

    // 点击时间：点击「取消完成计划」按钮
    const click_cancelCompletePlanButton = (plan: AV.Object) => {
      if (plan.id !== undefined) {
        PlanPage.cancelCompletePlan(
          context.root,
          plan.id,
          plan.attributes.type,
          temporaryPlanList,
          dailyPlanList,
          completedPlanList
        );
      }
    };

    // 点击事件：点击「已完成的计划列表」按钮
    const click_completedPlanListButton = () => {
      isCompletedPlanDrawerDisplayed.value = true;
    };

    // 点击事件：点击「编辑计划」按钮
    const longclick_editPlanButton = (plan: AV.Object, index: number) => {
      PlanPage.editPlan(isPlanEditorDrawerDisplayed, input_editingPlan, plan);
    };

    // 点击事件：点击「保存计划」按钮
    const click_savePlanButton = () => {
      PlanPage.savePlan(
        context.root,
        isPlanEditorDrawerDisplayed,
        input_editingPlan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList
      );
    };

    // 点击事件：点击「删除计划」按钮
    const click_deletePlanButton = () => {
      PlanPage.deletePlan(
        context.root,
        isPlanEditorDrawerDisplayed,
        input_editingPlan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList
      );
    };

    // 点击事件：点击「关联相关能力」按钮
    const click_relatedAbilityButton = () => {
      PlanPage.relatedAbility(
        context.root,
        isPlanRelateAbilityDrawerDisplayed,
        input_abilityListOfPlan,
        input_editingPlan
      );
    };

    // 点击事件：点击「关联相关目标」按钮
    const click_relatedTargetButton = () => {
      PlanPage.relatedTarget(
        context.root,
        isPlanRelateTargetDrawerDisplayed,
        input_targetListOfPlan,
        input_editingPlan
      );
    };

    // 点击事件：点击选择 Ability 的项目
    const click_abilityItemSelector = (ability: AV.Object) => {
      PlanPage.selectAbilityToCommit(ability);
    };

    const click_targetItemSelector = (target: AV.Object) => {
      PlanPage.selectTargetToComit(target);
    };

    // 点击事件：保存选择后的 Ability 结果
    const click_saveAbility = () => {
      PlanPage.saveSelectedAblityToEditingPlan(
        isPlanRelateAbilityDrawerDisplayed,
        input_abilityListOfPlan,
        input_editingPlan
      );
    };

    const click_saveTarget = () => {
      PlanPage.saveSelectedTargetToEditingPlan(
        isPlanRelateTargetDrawerDisplayed,
        input_targetListOfPlan,
        input_editingPlan
      );
    };

    // 点击事件：点击「每日计划」上的开始按钮
    const click_startTomatoButton = (plan: AV.Object) => {
      TomatoTimerPage.clickTomatoClock(
        context.root,
        tomatoCloudStatus,
        tomatoClockInterval,
        countDown,
        null,
        null,
        plan,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList,
        tomatoStartTime
      );
    };

    // 当用户拖动「临时计划」列表完毕时，执行
    const dragend_templayPlanItem = (event: any) => {
      PlanPage.changePlanListOrder(temporaryPlanList);
    };

    // 当用户拖动「每日计划」列表完毕
    const dragend_dailyPlanItem = (event: any) => {
      PlanPage.changePlanListOrder(dailyPlanList);
    };

    // 生命周期：初始化
    onMounted(() => {
      PlanPage.init(
        context.root,
        temporaryPlanList,
        dailyPlanList,
        completedPlanList
      );
    });

    // 配置信息
    const draggableOptions = inject(Store.draggableOptions, {});

    return {
      input_planName,
      input_abilityName,
      input_targetName,
      input_editingPlan,
      input_abilityListOfPlan,
      input_targetListOfPlan,
      temporaryPlanList,
      dailyPlanList,
      completedPlanList,
      isCompletedPlanDrawerDisplayed,
      isPlanEditorDrawerDisplayed,
      isPlanRelateAbilityDrawerDisplayed,
      isPlanRelateTargetDrawerDisplayed,
      keyUpEnter_planInputBox,
      keyUpEnter_abilityInputBox,
      keyUpEnter_targetInputBox,
      click_completePlanButton,
      click_completedPlanListButton,
      click_cancelCompletePlanButton,
      longclick_editPlanButton,
      click_savePlanButton,
      click_deletePlanButton,
      click_relatedAbilityButton,
      click_relatedTargetButton,
      click_abilityItemSelector,
      click_targetItemSelector,
      click_saveAbility,
      click_saveTarget,
      click_startTomatoButton,
      dragend_templayPlanItem,
      dragend_dailyPlanItem,
      draggableOptions,
      assets: {
        icon_finished,
        icon_logo,
        icon_add,
        icon_selected,
        icon_unselected,
        icon_enter,
        icon_start
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
  // 「创建新计划」输入框包含者
  section.new-plan-input-container {
    display flex
    background white
    justify-content center
    height 5.25vh
    position fixed
    top 7.52vh
    left 0
    right 0
    margin-left auto
    margin-right auto
    // 输入框
    input {
      opacity 0.54
      margin-top 0.3vh
      padding 0px
      width 92.67vw
      height 3.9vh
      background-color #e9e9e9
      border-radius 1.95vh
      border none
      text-align center
      font-size 2.02vh
      color #222a36
      // 输入框 placeholder
      &::-webkit-input-placeholder {
        opacity 0.6
        font-size 2.02vh
        font-weight normal
        font-stretch normal
        font-style normal
        letter-spacing 0.03vw
        text-align center
        color #959595
      }
    }
  }
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
    section.temporary {
      flex-shrink 0
      margin-bottom 1.57vh
      width 95.73vw
      display flex
      flex-direction column
      div.item-container {
        user-select none
        cursor pointer
        width 95.73vw
        height 7.2vh
        background white
        display flex
        align-items center
        position relative
        margin-bottom 0.52vh
        h2 {
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
        div.placeholder {
          width 0.13vw
          height 2.92vh
          background #707070
          opacity 0.4
        }
        h3 {
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
        div.finished-button {
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
      }
    }
    section.daily {
      flex-shrink 0
      width 95.73vw
      display flex
      flex-direction column
      .item-container {
        user-select none
        cursor pointer
        width 95.73vw
        height 11.47vh
        flex-shrink 0
        background white
        margin-bottom 1vh
        .plan-container {
          display flex
          flex-direction row cursor pointer
          width 95.73vw
          height 7.2vh
          background white
          display flex
          align-items center
          position relative
          border-bottom dashed 1px #D5D5D5
          h2 {
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
          div.placeholder {
            width 0.13vw
            height 2.92vh
            background #707070
            opacity 0.4
          }
          h3 {
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
          img.start-button {
            cursor pointer
            width 2.7vh
            height 2.7vh
            border-radius 50%
            opacity 0.5
            position absolute
            right 4.13vw
            border solid 0.15vw #959595
          }
        }
        .plan-detail-container {
          width 95.73vw
          height 4.27vh
          box-shadow 0 3px 6px 0 rgba(0, 0, 0, 0.01)
          background-color #ffffff
          position relative
          span {
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
            left 4.67vw
            top 0
            bottom 0
            margin-top auto
            margin-bottom auto
            position absolute
          }
          div {
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
            right 4.13vw
            top 0
            bottom 0
            margin-top auto
            margin-bottom auto
            position absolute
          }
        }
      }
    }
    div.completed-container {
      flex-shrink 0
      cursor pointer
      margin-top 3.75vh
      margin-bottom 3.75vh
      width 30.27vw
      height 5.17vh
      border-radius 3.15vh
      background-color #e8e8e8
      display flex
      justify-content center
      align-items center
      font-size 1.95vh
      color #D1D1D1
      letter-spacing 0.03vw
    }
  }
}
.container .item-container-drag {
  opacity 0
}
.flip-list-move {
  transition transform 0.5s
}
.ghost {
  box-shadow 10px 10px 5px -1px rgba(0, 0, 0, 0.14)
  opacity 0.7
}
.finished-plan-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center
  section.finished {
    flex-shrink 0
    margin-bottom 1.57vh
    width 95.73vw
    display flex
    flex-direction column
    .item-container {
      cursor pointer
      user-select none
      width 95.73vw
      height 7.2vh
      background #f0f1f3
      display flex
      align-items center
      position relative
      margin-bottom 0.52vh
      h2 {
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
      div.placeholder {
        width 0.13vw
        height 2.92vh
        background #707070
      }
      h3 {
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
      img.cancel-finished-button {
        cursor pointer
        width 2.7vh
        height 2.7vh
        position absolute
        right 4.13vw
      }
    }
  }
}
.finished-plan-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }
  i {
    &:focus {
      outline 0
    }
  }
}
.edit-plan-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center
}
.edit-plan-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }
  i {
    &:focus {
      outline 0
    }
  }
}
.input-plan-name {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
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
.input-plan-target {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
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
  margin-top 2.4vh
}
.input-plan-target::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #969294
}
.opacity40 {
  opacity 0.4
}
.input-plan-type >>> .el-input__inner {
  width 89.6vw
  height 6.9vh
  border-radius 0.67vh
  border solid 0.15vh #ebebf3
  padding-left 4.8vw
  padding-right 4.8vw
  margin-top 2.4vh
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #363636
}
.input-plan-type >>> .el-input__inner::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.21px
  text-align left
  color #969294
}
.add-plan-related {
  width 89.6vw
  height 6.9vh
  margin-top 2.4vh
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
.input-plan-description {
  outline none
  -webkit-appearance none /* 去除系统默认的样式 */
  width 89.6vw
  height 16.79vh
  border-radius 0.67vh
  margin-top 2.4vh
  border solid 0.15vh #ebebf3
  resize none
  padding-top 2.1vh
  padding-bottom 2.1vh
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
}
.input-plan-description::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.02vh
  text-align left
  color #969294
}
.radio-container {
  display flex
  margin-top 2.4vh
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
.button-container {
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
.related-ability-container >>> .el-drawer__body {
  display flex
  flex-direction column
  overflow scroll
  align-items center
}
.related-ability-container >>> .el-drawer__header {
  span {
    &:focus {
      outline 0
    }
  }
  i {
    &:focus {
      outline 0
    }
  }
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
}
.input-ability-name::-webkit-input-placeholder {
  font-size 1.95vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.42
  letter-spacing 0.02vh
  text-align left
  color #969294
}
.input-ability-name-container {
  position relative
  width 89.6vw
  height 6.9vh
}
.input-ability-name-container img {
  position absolute
  right 5.93vw
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  width 3.27vw
  height 1.3vh
}
.ability-container {
  margin-top 2.4vh
  width 100%
  display flex
  flex-direction column
  align-items center
}
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
}
.ability-item span {
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
.ability-item img {
  height 2.7vh
  width 2.7vh
  background white
  border-radius 50%
  border solid 0.07vh #d5d5d5
  margin-right 5.87vw
}
</style>
