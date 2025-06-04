<template>
  <div class="layout-box">
    <top />
    <container />
    <!-- <m-footer /> -->
  </div>
</template>

<script setup>
import emitter from '@/utils/app-emitter';
import { useKeyboardStore } from '@/stores';
import { defineAsyncComponent } from 'vue';

const router = useRouter();
const keyboardStore = useKeyboardStore();
const top = defineAsyncComponent(() => import('./top/index.vue'));
const container = defineAsyncComponent(() => import('./container/index.vue'));
// import mFooter from './footer/index.vue';

// 拔插事件的监听
emitter.on('disconnect', (isUpdate) => {
  if (isUpdate) return;
  if (router) {
    router.replace({ path: '/' });
    keyboardStore.activeKeys.length = 0;
  }
});
</script>
