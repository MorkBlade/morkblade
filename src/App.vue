<template>
  <div class="video-background">
    <video autoplay muted playsinline ref="videoPlayer" @loadeddata="onVideoLoaded" @ended="onVideoEnded">
      <source src="@/assets/video/bg.mp4" type="video/mp4" />
    </video>
  </div>
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
const videoPlayer = ref(null);
const isVideoLoaded = ref(false);
const isContentReady = ref(false);

const onVideoEnded = () => {
  // console.log('videoPlayer', videoPlayer);
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0;
    videoPlayer.value.play();
  }
};

// 视频加载完成
const onVideoLoaded = () => {
  isVideoLoaded.value = true;
  // 短暂延迟后显示内容
  setTimeout(() => {
    isContentReady.value = true;
  }, 100);
};
</script>

<style scoped>
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1; /* 将视频背景置于底层 */
}

video {
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

@media (max-width: 768px) {
  video {
    width: 100%;
    height: auto;
  }
}

@media (min-width: 769px) and (max-height: 480px) {
  video {
    width: auto;
    height: 100%;
  }
}
</style>
