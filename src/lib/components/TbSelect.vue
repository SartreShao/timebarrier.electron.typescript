<template>
  <div class="tb-selecte-container">
    <select v-model="currentOption" @change="onChange_routeSelect">
      <option
        v-for="(item, index) in selectOptions"
        :key="index"
        :value="item.route"
      >
        {{ item.name }}
      </option>
    </select>
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
}
</style>
