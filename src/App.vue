<template>
  <div class="app-wrapper">
    <div class="background">
      <div class="bg-layer"></div>
      <div class="bg-layer second-layer"></div>
    </div>
    <img src="@/assets/images/bg_shadow.png" alt="" />
    <div class="app-content" :class="{ 'content-ready': isContentReady }">
      <Transition name="fade" mode="out-in">
        <component :is="currentPage" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isContentReady = ref(false);

const currentPage = computed(() => {
  return route.path === '/connect'
    ? defineAsyncComponent(() => import('@/views/connect/index.vue'))
    : defineAsyncComponent(() => import('@/layout/index.vue'));
});

onMounted(() => {
  // 页面加载后显示内容
  setTimeout(() => {
    isContentReady.value = true;
  }, 500);
});
</script>

<style scoped lang="scss">
.app-wrapper {
  width: 100%;
  height: 100%;
}

.background {
  background-image: url('@/assets/images/newbg.png');
  background-size: cover;
  background-repeat: repeat-x;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -20;
}

.bg-layer {
  background-image: url('@/assets/images/newbg.png');
  background-size: cover;
  background-repeat: repeat-x;
  background-size: 100% 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: slideLeft 10s linear infinite;
}

.second-layer {
  left: 100%; /* 第二层从画面右侧开始 */
}

@keyframes slideLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%); /* 向左移动一个屏幕宽度 */
  }
}

img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -10;
}

.app-content {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.content-ready {
  opacity: 1;
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
