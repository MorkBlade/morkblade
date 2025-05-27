<template>
  <div class="top-box">
    <dropdownMenu />
    <logo />
    <checkLng />
    <!-- <div class="test-change-connect" @click="connectMk">连接mork blade tkl</div>
    <div class="test-change-connect">连接mk60</div> -->
  </div>
</template>

<script setup>
import services from '@/services';
import emitter from '@/utils/app-emitter';
import { useAppStore, useDeviceStore, useKeyboardStore, usePerformanceStore } from '@/stores';
import { useAdvancedHook, useLightingHook } from '@/hooks';

import checkLng from './components/check-lng.vue';
import dropdownMenu from './components/dropdown-menu.vue';
import logo from './components/logo.vue';

const appStore = useAppStore();
const deviceStore = useDeviceStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { getHighLevelKeys } = useAdvancedHook();
const { initLighting, getLightingSaturation } = useLightingHook();

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const connectMk = async () => {
  console.log('切换设备前先断连', deviceStore.devices);
  await services.closeDevice();
  localStorage.setItem('keyboardVersion', 'v1');
  emitter.emit('versionChange', true);
  const devices = await services.getDevices();
  // history.go(0);
  await services.init(deviceStore.devices[1].id);
  delay(2000);
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  // 切v1要调用的接口
  await performanceStore.getGlobalTouchTravel();
  await appStore.getConfigID(isVersion2);
  await appStore.getBaseInfo(isVersion2);
  await keyboardStore.initKeyboard();
  delay(200);
  // await getHighLevelKeys(keyboardStore.keyboards, isVersion2);
  // await initLighting();
  // await getLightingSaturation();
};
</script>

<style scoped>
.top-box {
  width: 100%;
  height: calc(var(--spacing-70) + var(--spacing-4));
  background-color: #000000;
  display: flex;
  position: relative;
  top: 0;
  left: 0;

  & .test-change-connect {
    background-color: skyblue;
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
