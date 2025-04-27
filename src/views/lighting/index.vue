<template>
  <div class="lighting-box">
    <div class="left-menu">
      <div
        v-for="(item, idx) in lightingItem"
        :key="item"
        class="lighting-item"
        :class="idx === clickItem ? 'is-active' : ''"
        @click="changeMenu(idx)"
      >
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <keyLighting
        v-show="!clickItem"
        v-model="lightSettingStore.light"
        @changeKeyLight="changeKeyLight"
        @changeColorPicker="changeColorPicker"
      />
      <logoLighting v-show="clickItem === 1" v-model="lightSettingStore.logo" @changeLogoLight="changeLogoLight" />
      <customLighting v-show="clickItem === 2" />
    </div>
    <lightLuminance
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

import services from '@/services/index';
import keyLighting from './key-lighting/index.vue';
import logoLighting from './logo-lighting/index.vue';
import customLighting from './custom-lighting/index.vue';
import lightLuminance from '@/components/light-luminance.vue';
import { onBeforeUnmount } from 'vue';

const keyboardStore = useKeyboardStore();
const lightSettingStore = useLightSettingStore();
const { initLighting, setLighting, setLightingPalette, initCustomLighting, modifyCustomLightingData } =
  useLightingHook();

const clickItem = ref(0);
const isVersion2 = localStorage.getItem('keyboardVer') === 'v2';
const lightingItem = ['按键灯效', 'LOGO灯效', '自定义灯效'];
let timer = null;

onMounted(async () => {
  await initLighting();
  if (isVersion2) {
    // 这种方式会卡顿，改用css变量存储背景色
    // timer = setInterval(async () => {
    //   await modifyCustomLightingData();
    //   // await keyboardStore.getKeyCustomLighting(keyboardStore.customLighting);
    // }, 300);
    timer = setInterval(async () => {
      const customLighting = await services.getLightingCustomV2();
      const root = document.documentElement;

      // 创建一个包含所有颜色的字符串
      let cssText = '';
      // 遍历所有行和列
      for (let row = 1; row <= 6; row++) {
        if (customLighting[row]) {
          for (let col = 0; col <= 14; col++) {
            if (customLighting[row][col]) {
              const { R, G, B } = customLighting[row][col];
              cssText += `--key-color-${row}-${col}:rgb(${R},${G},${B});`;
            }
          }
        }
      }
      // 一次性设置所有CSS变量
      root.style.cssText += cssText;

      // 逐行更新store数据，保持响应式
      for (let row = 1; row <= 6; row++) {
        if (customLighting[row] && keyboardStore.keyboards[row]) {
          const newRow = keyboardStore.keyboards[row].map((key, i) => ({
            ...key,
            customLight: customLighting[row][i],
          }));
          // 使用Vue的响应式API更新数组
          keyboardStore.keyboards[row].length = 0;
          keyboardStore.keyboards[row].push(...newRow);
        }
      }
    }, 100);
  }
});

onBeforeUnmount(() => {
  clearInterval(timer);
});

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
      break;
    default:
      if (lightSettingStore.light.mode) {
        lightSettingStore.light.type = 'dynamic';
      } else {
        lightSettingStore.light.type = 'static';
      }
      inCustomLighting = false;
      lightSettingStore.updateEnterCustom(false);
      break;
  }
  initCustomLighting(inCustomLighting);
  setTimeout(() => {
    changeKeyLight();
  }, 200);
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

const changeSpeed = async (speed) => {
  lightSettingStore.light.speed = speed;
  lightSettingStore.logo.speed = speed;
  await setLighting();
  await setLighting('logo');
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
