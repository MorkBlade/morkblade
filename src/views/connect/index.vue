<template>
  <div class="connect">
    <div class="connect-header">
      <!-- <img class="connect-logo" src="@/assets/images/banner-logo.png" alt="banner-logo" /> -->
      <!-- <div class="connect-operate">
        <button>FAQ</button>
        <span>中&nbsp;文</span>
        <span>English</span>
      </div> -->
    </div>
    <div class="connect-title">
      <span>欢迎来到</span>
      <h1>MORK BLADE</h1>
      <p @click="handleDeviceStoreClick">开始配置您的键盘</p>
    </div>
  </div>
</template>

<script setup>
// defineOptions({ name: 'ConnectIndex' });

// import '@/configs/layout/index.js';

import { useDeviceStore } from '@/stores';

const router = useRouter();
const deviceStore = useDeviceStore();

// 连接按钮点击事件
const handleDeviceStoreClick = async () => {
  const result = await deviceStore.connectDevice();
  if (result) {
    router.push({ name: 'performance' });
  }
};
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
