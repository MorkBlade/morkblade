<template>
  <div class="top-box">
    <dropdownMenu />
    <logo />
    <checkLng />
  </div>
</template>

<script setup>
import checkLng from './components/check-lng.vue';
import dropdownMenu from './components/dropdown-menu.vue';
import logo from './components/logo.vue';
</script>

<style scoped>
.top-box {
  width: 100%;
  height: 74px;
  background-color: #000000;
  display: flex;
  position: relative;
  top: 0;
  left: 0;
}
</style>
