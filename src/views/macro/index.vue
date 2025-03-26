<template>
  <div class="macro-container">
    <macroList />
    <!-- <editMacro /> -->
    <testDrag />
    <div>1</div>
  </div>
</template>

<script setup>
import macroList from './components/macroList.vue';
import editMacro from './components/edit-macro.vue';
import testDrag from './components/test.vue';
</script>

<style scoped lang="scss">
.macro-container {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}
</style>
