<template>
  <div class="lighting-box">
    <div class="left-menu">
      <div
        v-for="(item, idx) in lightingItem"
        :key="item"
        class="lighting-item"
        :class="idx === clickItem ? 'is-active' : ''"
        :style="{ display: (idx === 1 && isVersion2) || (idx === 3 && isVersion2) ? 'none' : '' }"
        @click="changeMenu(idx)"
      >
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <keyLighting
        v-if="!clickItem"
        v-model="lightSettingStore.light"
        @changeKeyLight="changeKeyLight"
        @changeColorPicker="changeColorPicker"
      />
      <logoLighting v-if="clickItem === 1" v-model="lightSettingStore.logo" @changeLogoLight="changeLogoLight" />
      <customLighting v-if="clickItem === 2" />
      <saturation v-if="clickItem === 3" />
    </div>
    <lightLuminance
      v-if="clickItem !== 3"
      @changeSleepDelay="changeSleepDelay"
      @changeLuminance="changeLuminance"
      @changeSpeed="changeSpeed"
      v-model="lightSettingStore.light"
    />
  </div>
</template>
<script setup>
import { useLightSettingStore, useKeyboardStore } from '@/stores';
import { useLightingHook } from '@/hooks';
import emitter from '@/utils/app-emitter';

import services from '@/services/index';
import keyLighting from './key-lighting/index.vue';
import logoLighting from './logo-lighting/index.vue';
import saturation from './saturation/index.vue';
import customLighting from './custom-lighting/index.vue';
import lightLuminance from './components/light-luminance.vue';

const keyboardStore = useKeyboardStore();
const lightSettingStore = useLightSettingStore();
const { initLighting, setLighting, setLightingPalette, initCustomLighting, setCustomLighting, getLightingSaturation } =
  useLightingHook();

const clickItem = ref(0);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const lightingItem = ['按键灯效', 'LOGO灯效', '自定义灯效', '高级设置'];
let animationFrameId = null;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 100; // 100ms

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

// 更新颜色的函数
const updateColors = async () => {
  try {
    const customLighting = await services.getLightingCustomV2();
    const root = document.documentElement;

    // 清除所有现有的颜色变量
    for (let row = 1; row <= 6; row++) {
      for (let col = 0; col <= 14; col++) {
        root.style.removeProperty(`--key-color-${row}-${col}`);
      }
    }

    // 设置新的颜色变量
    for (let row = 1; row <= 6; row++) {
      if (customLighting[row]) {
        for (let col = 0; col <= 14; col++) {
          if (customLighting[row][col]) {
            const { R, G, B } = customLighting[row][col];
            root.style.setProperty(`--key-color-${row}-${col}`, `rgb(${R},${G},${B})`);
          }
        }
      }
    }

    // 更新store数据
    for (let row = 1; row <= 6; row++) {
      if (customLighting[row] && keyboardStore.keyboards[row]) {
        const newRow = keyboardStore.keyboards[row].map((key, i) => ({
          ...key,
          customLight: customLighting[row][i],
        }));
        keyboardStore.keyboards[row].length = 0;
        keyboardStore.keyboards[row].push(...newRow);
      }
    }
  } catch (error) {
    console.error('Error updating lighting colors:', error);
    await initLighting();
  }
};

// 动画帧循环
const animationLoop = async (timestamp) => {
  if (timestamp - lastUpdateTime >= UPDATE_INTERVAL) {
    await updateColors();
    lastUpdateTime = timestamp;
  }
  animationFrameId = requestAnimationFrame(animationLoop);
};

onMounted(async () => {
  await initLighting();
  await getLightingSaturation();
  if (isVersion2.value) {
    animationFrameId = requestAnimationFrame(animationLoop);
  }
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  // 清理所有颜色变量
  const root = document.documentElement;
  for (let row = 1; row <= 6; row++) {
    for (let col = 0; col <= 14; col++) {
      root.style.removeProperty(`--key-color-${row}-${col}`);
    }
  }
});

const setCustomLightingStatus = async (isCustom) => {
  try {
    const { r, g, b } = lightSettingStore.currentColor;
    const customLight = { R: r, G: g, B: b, isCustom };

    // 一行一行异步设置灯光
    for (const row of keyboardStore.keyboards) {
      for (const key of row) {
        key.customLight = { ...customLight };
      }
      // 每设置完一行就更新一次灯光
      await setCustomLighting();
      // 给UI一个喘息的机会
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } catch (error) {
    console.error('Failed to set custom lighting status:', error);
  }
};

const changeMenu = (idx) => {
  clickItem.value = idx;
  let inCustomLighting = false;
  switch (idx) {
    case 1:
      // formData.type = 'dynamic';
      lightSettingStore.updateEnterCustom(false);
      break;
    case 2:
      lightSettingStore.light.type = 'custom';
      // lightSettingStore.light.mode = 1
      inCustomLighting = true;
      lightSettingStore.updateEnterCustom(true);
      if (isVersion2.value) setCustomLightingStatus(true);
      break;
    default:
      if (lightSettingStore.light.mode) {
        lightSettingStore.light.type = 'dynamic';
      } else {
        lightSettingStore.light.type = 'static';
      }
      inCustomLighting = false;
      lightSettingStore.updateEnterCustom(false);
      if (isVersion2.value) setCustomLightingStatus(false);
      break;
  }
  // 先取消自定义灯光
  // isVersion2.value ? initCustomLighting(inCustomLighting) : '';
  changeKeyLight();
};

// 切换灯光
const changeKeyLight = async () => {
  setLighting();
};

// 修改colorPicker触发修改灯光，v1没有
const changeColorPicker = async (isVersion2) => {
  if (isVersion2) {
    setLightingPalette();
  } else {
    setLighting();
  }
};

const changeLuminance = async (luminance) => {
  // console.log('changeLuminance: ', luminance);
  // if (!clickItem.value) {
  //   console.log('change keyborad luminance');
  //   lightSettingStore.light.luminance = luminance;
  //   setLighting();
  // } else if (clickItem.value === 1) {
  //   console.log('change logo luminance');
  // }
  // TODO 根据条件判断设置keyboard logo亮度会不生效
  lightSettingStore.light.luminance = luminance;
  lightSettingStore.logo.luminance = luminance;
  await setLighting();
  await setLighting('logo');
};

const changeSpeed = async (speed, isVersion2) => {
  lightSettingStore.light.speed = speed;
  if (isVersion2) {
    await setLighting();
  } else {
    lightSettingStore.logo.speed = speed;
    await setLighting();
    await setLighting('logo');
  }
};

const changeSleepDelay = async (delay) => {
  lightSettingStore.light.sleepTime = delay;
  lightSettingStore.logo.sleepTime = delay;
  await setLighting();
  await setLighting('logo');
};

const changeLogoLight = async () => {
  setLighting('logo');
};
</script>

<style scoped lang="scss">
.lighting-box {
  width: var(--size-1600);
  height: var(--size-350);
  margin-top: var(--spacing-25);
  display: flex;
  background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  padding-top: var(--spacing-30);
  // overflow: hidden;

  .lighting-item {
    width: var(--lighting-item-width);
    height: var(--lighting-item-height);
    font-size: var(--font-size-20);
    color: #fff;
    margin: 0 var(--spacing-30);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN oblique';
    background-image: url('@/assets/images/performance_item_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-bottom: var(--spacing-20);
    cursor: pointer;
  }
  .is-active {
    background-image: url('@/assets/images/performance_item_bgC.gif');
    color: #000;
  }
}
</style>
