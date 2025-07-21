<template>
  <div class="container">
    <!-- <Navigation /> -->
    <Transition name="fade" mode="out-in">
      <div class="content-wrapper">
        <Transition name="fade">
          <KeepAlive>
            <div class="keyboard-container" :style="{ height: `${keyboardHeight}px` }">
              <Keyboard v-if="!isNotShow" key="keyboard" />
            </div>
          </KeepAlive>
        </Transition>
        <!-- 路由视图的过渡 -->
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <div class="view-wrapper" :key="route.path">
              <component :is="Component" />
            </div>
          </Transition>
        </router-view>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { httpService } from '@/http/api/index.js';
import { usePerformanceStore } from '@/stores';

import Navigation from './navigation/index.vue';

const Keyboard = defineAsyncComponent(() => import('@/keyboard/index.vue'));
const route = useRoute();
const performanceStore = usePerformanceStore();

const isNotShow = computed(() => {
  return route.path === '/settings' || route.path === '/connect' || route.path === '/macro' || route.path === '/';
});

onMounted(async () => {
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  const res = await httpService.getAxisList();
  performanceStore.getAixsList(isVersion2, res);
});
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%; // Ensure consistent width
  height: 100%; // Ensure consistent height
  // overflow: hidden; // Prevent overflow issues
  transition: all 0.3s ease; // Smooth transition for all properties

  .content-wrapper {
    width: 100%;
    height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .keyboard-container {
      height: var(--size-550);
    }

    .view-wrapper {
      width: 100%;
      flex: 1;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
