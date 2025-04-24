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
      <keyLighting v-show="!clickItem" v-model="lightSettingStore.newState.light" @changeKeyLight="changeKeyLight" />
      <logoLighting
        v-show="clickItem === 1"
        v-model="lightSettingStore.newState.logo"
        @changeLogoLight="changeLogoLight"
      />
      <customLighting v-show="clickItem === 2" @changeCustomLight="changeCustomLight" />
    </div>
    <lightLuminance
      @changeSleepDelay="changeSleepDelay"
      @changeLuminance="changeLuminance"
      @changeSpeed="changeSpeed"
      v-model="lightSettingStore.newState.light"
    />
  </div>
</template>
<script setup>
import services from '@/services/index';
import { useLightSettingStore } from '@/stores';
import { useLightingHook } from '@/hooks';

import keyLighting from './key-lighting/index.vue';
import logoLighting from './logo-lighting/index.vue';
import customLighting from './custom-lighting/index.vue';
import lightLuminance from '@/components/light-luminance.vue';

const lightSettingStore = useLightSettingStore();
const { initLighting, setLighting } = useLightingHook();

const clickItem = ref(0);
const lightingItem = ['按键灯效', 'LOGO灯效', '自定义灯效'];

const formData = reactive({
  type: 'static',
  colors: [
    { color: '#ffffff', id: 0 },
    { color: '#ffffff', id: 1 },
    { color: '#ffffff', id: 2 },
    { color: '#ffffff', id: 3 },
    { color: '#ffffff', id: 4 },
    { color: '#ffffff', id: 5 },
    { color: '#ffffff', id: 6 },
  ], // 颜色组
  direction: false, // 方向 true 正向 false 反向
  superResponse: false, // 超强响应
  mode: 1, // 0 关闭, 1-20表示效果，21 自定义
  speed: 3, // 灯光速度
  luminance: 3, // 亮度
  sleepDelay: 3, // 灯光休眠时间
  staticColor: 0, // 静态颜色
});

const formLogoData = reactive({
  type: 'static',
  colors: [
    { color: '#ffffff', id: 0 },
    { color: '#ffffff', id: 1 },
    { color: '#ffffff', id: 2 },
    { color: '#ffffff', id: 3 },
    { color: '#ffffff', id: 4 },
    { color: '#ffffff', id: 5 },
    { color: '#ffffff', id: 6 },
  ], // 颜色组
  direction: false, // 方向 true 正向 false 反向
  superResponse: false, // 超强响应
  mode: 1, // 0 关闭, 1-20表示效果，21 自定义
  speed: 3, // 灯光速度
  luminance: 3, // 亮度
  sleepDelay: 3, // 灯光休眠时间
  staticColor: 0, // 静态颜色
});

onMounted(async () => {
  await initLighting();
});

const changeMenu = (idx) => {
  clickItem.value = idx;
  switch (idx) {
    case 1:
      // formData.type = 'dynamic';
      lightSettingStore.updateEnterCustom(false);
      break;
    case 2:
      lightSettingStore.newState.light.type = 'custom';
      // lightSettingStore.newState.light.mode = 1
      lightSettingStore.updateEnterCustom(true);
      break;
    default:
      if (lightSettingStore.newState.light.mode) {
        lightSettingStore.newState.light.type = 'dynamic';
      } else {
        lightSettingStore.newState.light.type = 'static';
      }
      lightSettingStore.updateEnterCustom(false);
      break;
  }
  changeKeyLight();
};

const changeKeyLight = async () => {
  setLighting();
};

const changeLuminance = async (luminance) => {
  console.log('changeLuminance: ', luminance);
  // if (!clickItem.value) {
  //   console.log('change keyborad luminance');
  //   lightSettingStore.newState.light.luminance = luminance;
  //   setLighting();
  // } else if (clickItem.value === 1) {
  //   console.log('change logo luminance');
  // }
  // TODO 根据条件判断设置keyboard logo亮度会不生效
  lightSettingStore.newState.light.luminance = luminance;
  lightSettingStore.newState.logo.luminance = luminance;
  await setLighting();
  await setLighting('logo');
};
const changeSpeed = async (speed) => {
  lightSettingStore.newState.light.speed = speed;
  lightSettingStore.newState.logo.speed = speed;
  await setLighting();
  await setLighting('logo');
};
const changeSleepDelay = async (delay) => {
  lightSettingStore.newState.light.sleepTime = delay;
  lightSettingStore.newState.logo.sleepTime = delay;
  await setLighting();
  await setLighting('logo');
};

const changeCustomLight = (color) => {
  lightSettingStore.updateCurrentColor(color);
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
