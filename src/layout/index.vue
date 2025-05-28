<template>
  <div class="layout-box">
    <top />
    <container />
    <!-- <m-footer /> -->
  </div>
</template>

<script setup>
import services from '@/services';
import emitter from '@/utils/app-emitter';
import { defineAsyncComponent } from 'vue';
import { useDeviceStore } from '@/stores';

const router = useRouter();
const deviceStore = useDeviceStore();
const top = defineAsyncComponent(() => import('./top/index.vue'));
const container = defineAsyncComponent(() => import('./container/index.vue'));
// import mFooter from './footer/index.vue';

// 拔插事件的监听
emitter.on('disconnect', (isUpdate) => {
  if (isUpdate) return;
  if (router) router.replace({ path: '/' });
});

onMounted(async () => {
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  if (isVersion2) await deviceStore.getDoubleLighting();
});
</script>
