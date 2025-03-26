<template>
  <div class="background">
    <div class="bg-layer"></div>
    <div class="bg-layer second-layer"></div>
  </div>
  <img src="@/assets/images/bg_shadow.png" alt="" />
  <div class="app-content" :class="{ 'content-ready': isContentReady }">
    <Transition name="fade" mode="out-in">
      <component :is="route.path === '/connect' ? connectPage : layoutPage" />
    </Transition>
  </div>
</template>

<script setup>
import layoutPage from '@/layout/index.vue';
import connectPage from '@/views/connect/index.vue';

const route = useRoute();
const isContentReady = ref(false);

onMounted(() => {
  // 页面加载后显示内容
  setTimeout(() => {
    isContentReady.value = true;
  }, 100);
});
</script>

<style scoped lang="scss">
.background {
  background-image: url('@/assets/images/bg.png');
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
  background-image: url('@/assets/images/bg.png');
  // background-size: cover;
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
