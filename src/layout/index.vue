<template>
  <div class="layout-box">
    <top />
    <container />
    <!-- <m-footer /> -->
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const top = defineAsyncComponent(() => import('./top/index.vue'));
const container = defineAsyncComponent(() => import('./container/index.vue'));
// import mFooter from './footer/index.vue';
</script>
