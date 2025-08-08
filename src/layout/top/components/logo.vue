<template>
  <!-- TODO 这里需要根据版本号来判断，v1是-150px，v2是-350px -->
  <div class="logo-box" :style="{ marginLeft: isVersion2 ? '-350px' : '-120px' }">
    <img class="logo-img" src="/src/assets/images/logo.png" alt="" />
    <img class="bar-img" src="/src/assets/images/green_bar.svg" alt="" />
    <template v-if="isVersion2">
      <span>M K 6 0</span>
    </template>
    <template v-else>
      <span>BOLD TKL</span>
    </template>
    <!-- <el-select v-model="selectVersion" placeholder="Select" @change="changeKeyboardVersion">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-select> -->
  </div>
</template>

<script setup>
import services from '@/services';
import emitter from '@/utils/app-emitter';
import { useAppStore, useDeviceStore, useKeyboardStore, usePerformanceStore } from '@/stores';
import { useAdvancedHook, useLightingHook } from '@/hooks';

const appStore = useAppStore();
const deviceStore = useDeviceStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { getHighLevelKeys } = useAdvancedHook();
const { initLighting, getLightingSaturation } = useLightingHook();

const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const selectVersion = ref(isVersion2 ? 'v2' : 'v1');
// const options = [
//   { value: 'v1', label: 'BOLD TKL' },
//   { value: 'v2', label: 'M K 6 0' },
// ];
const options = computed(() => {
  if (deviceStore.devices.length > 1) {
    return [
      { value: 'v1', label: 'BOLD TKL' },
      { value: 'v2', label: 'M K 6 0' },
    ];
  } else {
    if (deviceStore.devices[0]?.usagePage === 65440) {
      return [{ value: 'v1', label: 'BOLD TKL' }];
    } else {
      return [{ value: 'v2', label: 'M K 6 0' }];
    }
  }
});

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const changeKeyboardVersion = async (version) => {
  console.log('version', version);
  if (version === 'v1') {
    console.log('切换设备前先断连', deviceStore.devices);
    await services.closeDevice();
    localStorage.setItem('keyboardVersion', 'v1');
    const devices = await services.getDevices();
    const device = deviceStore.devices.find(
      (item) => item.usagePage === 65440 && item.vendorId === 7331 && item.productId === 257,
    );
    console.log('connectDevice log devices', devices, device);
    await services.init(device?.id);
    console.log('123123123123123123123123123', new Date());
    await delay(4000);
    console.log('456456456456456456456456456', new Date());
    emitter.emit('versionChange', true);
    const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
    // 切v1要调用的接口
    await performanceStore.getGlobalTouchTravel();
    await appStore.getConfigID(isVersion2);
    await appStore.getBaseInfo(isVersion2);
    await keyboardStore.initKeyboard();
    await delay(1000);
    await getHighLevelKeys(keyboardStore.keyboards, isVersion2);
    await delay(1000);
    await initLighting();
    await delay(1000);
    await getLightingSaturation();
  } else {
    console.log('切换设备前先断连', deviceStore.devices);
    await services.closeDevice();
    localStorage.setItem('keyboardVersion', 'v2');
    const devices = await services.getDevices();
    const device = deviceStore.devices.find(
      (item) => item.usagePage === 65456 && item.vendorId === 7334 && item.productId === 5380,
    );
    console.log('connectDevice log devices', devices, device);
    await services.init(device?.id);
    await delay(1500);
    emitter.emit('versionChange', true);
    const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
    // 切v1要调用的接口
    await appStore.getConfigID(isVersion2);
    await appStore.getBaseInfo(isVersion2);
    await delay(200);
    await keyboardStore.initKeyboard();
    await delay(200);
    await getHighLevelKeys(keyboardStore.keyboards, isVersion2);
    await delay(200);
    await initLighting();
    await delay(200);
    await getLightingSaturation();
  }
};
</script>

<style scoped lang="scss">
.logo-box {
  display: flex;
  justify-content: center;
  align-content: center;
  flex: 2;

  .logo-img {
    width: calc(var(--size-200) + var(--size-7));
    height: var(--size-22);
    margin-top: var(--spacing-26);
  }

  .bar-img {
    width: var(--size-4);
    height: var(--size-22);
    margin: var(--spacing-26) var(--spacing-15);
  }

  span {
    margin-top: var(--spacing-21);
    font-family: 'Ridenation';
    font-size: var(--font-size-18);
    color: #ffffff;
  }

  ::v-deep(.el-select) {
    width: 100%;
    max-width: var(--size-260);
  }

  ::v-deep(.el-select__wrapper) {
    // width: 200px !important;
    // max-width: 260px;
    height: 100%;
    box-shadow: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-family: 'Ridenation';
      font-size: var(--font-size-18);
      color: #ffffff;
    }
  }
}
</style>
