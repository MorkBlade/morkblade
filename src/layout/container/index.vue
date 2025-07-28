<template>
  <div class="container">
    <!-- <Navigation /> -->
    <Transition name="fade" mode="out-in">
      <div class="content-wrapper">
        <Transition name="fade">
          <KeepAlive>
            <div class="keyboard-container">
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
  width: 100%;
  height: calc(100vh - 60px);
  transition: all 0.3s ease;

  .content-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .keyboard-container {
      min-height: 540px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      // min-height: 0; // 允许flex子项收缩
      padding-bottom: 80px;
      padding-top: 40px;
    }

    .view-wrapper {
      flex: 1;
      width: 100%;
      position: relative;
      background-image: url('@/assets/images/bg.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      padding-top: 20px;
      // min-height: 0; // 允许flex子项收缩
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
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
