<template>
  <div class="container">
    <h1>Skills</h1>
    <draggable v-model="myArray" ghost-class="ghost" @end="onEnd">
      <transition-group type="transition" name="flip-list">
        <div
          class="sortable"
          :id="element.id"
          v-for="element in myArray"
          :key="element.id"
        >
          <strong>{{ element.name }}</strong>
          <span>{{ element.id }}</span>
        </div>
      </transition-group>
    </draggable>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from "@vue/composition-api";
import draggable from "vuedraggable";
export default defineComponent({
  setup() {
    const myArray = ref([
      { name: "Angular", id: 0 },
      { name: "React", id: 1 },
      { name: "Vue", id: 2 },
      { name: "HTML", id: 3 },
      { name: "CSS", id: 4 },
      { name: "SASS", id: 5 }
    ]);

    watch(myArray, (newValue, oldValue) => {
      console.log("list", newValue);
    });

    const oldIndex = ref("");
    const newIndex = ref("");

    const onEnd = function(event: any) {
      console.log(event);
      oldIndex.value = event.oldIndex;
      newIndex.value = event.newIndex;
    };

    return {
      myArray,
      oldIndex,
      newIndex,
      onEnd
    };
  },
  components: { draggable }
});
</script>

<style lang="stylus" scoped>
.container {
  height 100%
  width 100%
  background white
}
strong {
  display inline-block
}
.sortable {
  width 100%
  background white
  padding 1em
  cursor move
  margin-bottom 2px
}
.container .sortable-drag {
  // opacity 0
}
.flip-list-move {
  transition transform 0.5s
}
.ghost {
  border-left 6px solid rgb(0, 183, 255)
  box-shadow 10px 10px 5px -1px rgba(0, 0, 0, 0.14)
  opacity 0.7
  &::before {
    content ' '
    position absolute
    widows 20px
    height 20px
    margin-left -50px
    background-image url('../../../assets/icon_add.svg')
  }
}
</style>
