<template>
  <div class="tb-selecte-container">
    <img
      v-for="(item, index) in selectOptions"
      :key="index"
      class="icon-image"
      :src="item.icon"
      alt="1"
      :hidden="currentOption !== item.route"
    />

    <el-select
      v-model="currentOption"
      @change="onChange_routeSelect"
      class="select"
    >
      <el-option
        style="left:0"
        class="option"
        v-for="(item, index) in selectOptions"
        :key="index"
        :label="item.name"
        :value="item.route"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import { Router } from "@/lib/vue-utils";
/**
 * 传入参数：selectOptions 结构：{name:string, icon:any, route:string}[]
 */
export default defineComponent({
  props: {
    selectOptions: Array
  },
  setup(props, context) {
    const currentOption: Ref<any> = ref();

    if (props !== undefined && props.selectOptions !== undefined) {
      currentOption.value = (props.selectOptions[0] as any).route;
    }

    const onChange_routeSelect = () => {
      Router.replace(context.root.$router, currentOption.value);
      console.log(currentOption.value);
    };

    return {
      currentOption,
      onChange_routeSelect
    };
  }
});
</script>

<style lang="stylus" scoped>
.tb-selecte-container {
  width 100%
  height 5.55vh
  display flex
  align-items center
  justify-content center
  position relative
  background white
}
.icon-image {
  position absolute
  height 2.16vh
  width 2.16vh
  z-index 99999
  top 0
  bottom 0
  margin-top auto
  margin-bottom auto
  right 61.33vw
}
.select >>> .el-input__inner {
  background white
  width 95vw
  border none
  outline none
  border-radius 0
  height 5.55vh
  padding 0
  font-size 1.8vh
  font-weight normal
  font-stretch normal
  font-style normal
  line-height 1.46
  letter-spacing normal
  text-align center
  color #222a36
}
.option {
}
</style>
