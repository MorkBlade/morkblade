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
      <keyLighting v-show="!clickItem" v-model="formData" @changeKeyLight="changeKeyLight" />
      <logoLighting v-show="clickItem === 1" v-model="formLogoData" @changeLogoLight="changeLogoLight" />
      <customLighting v-show="clickItem === 2" v-model="formData" @changeCustomLight="changeCustomLight" />
    </div>
    <lightLuminance
      @changeSleepDelay="changeSleepDelay"
      @changeLuminance="changeLuminance"
      @changeSpeed="changeSpeed"
      v-model="formData"
    />
  </div>
</template>

<script setup>
import services from '@/services/index';
import { useLightSettingStore } from '@/stores';

import keyLighting from './key-lighting/index.vue';
import logoLighting from './logo-lighting/index.vue';
import customLighting from './custom-lighting/index.vue';
import lightLuminance from '@/components/light-luminance.vue';

const lightSettingStore = useLightSettingStore();
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
  try {
    const result = await services.getLighting();
    if (result) {
      const colors = result.colors.map((color, index) => {
        return { color, id: index };
      });
      Object.assign(formData, result, { colors });
      lightSettingStore.updateStaticLightColorChecked(formData.staticColor, true);
    }

    // await new Promise((resolve) => setTimeout(resolve, 100)); // 添加小延迟防止报错
    const result2 = await services.getLogoLighting();
    if (result2) {
      const colors = result2.colors.map((color, index) => {
        return { color, id: index };
      });
      Object.assign(formLogoData, result2, { colors });
      lightSettingStore.updateLogoStaticLightColorChecked(formLogoData.staticColor, true);
    }
    // console.log('onMouted log keyboard light config', formData);
    // console.log('onMouted log logo light config', formLogoData);
  } catch (error) {
    console.log(error);
  }

  // console.log('result', result);
});

const changeMenu = (idx) => {
  clickItem.value = idx;
  switch (idx) {
    case 1:
      // formData.type = 'dynamic';
      lightSettingStore.updateEnterCustom(false);
      break;
    case 2:
      formData.type = 'custom';
      formData.mode = 1;
      lightSettingStore.updateEnterCustom(true);
      break;
    default:
      // formData.type = 'static';
      lightSettingStore.updateEnterCustom(false);
      break;
  }
  changeKeyLight();
};

const changeKeyLight = async () => {
  formData.open = true;
  const colors = formData.colors.map(({ color }) => color);
  const value = { ...formData, colors };
  // console.log('changeKeyLight log', value);
  await services.setLighting(value);
};

const changeLuminance = (luminance) => {
  formData.luminance = luminance;
  changeKeyLight();
};
const changeSpeed = (speed) => {
  formData.speed = speed;
  changeKeyLight();
};
const changeSleepDelay = (delay) => {
  formData.sleepDelay = delay;
  changeKeyLight();
};

const changeCustomLight = (color) => {
  lightSettingStore.updateCurrentColor(color);
};

const changeLogoLight = async () => {
  const colors = formLogoData.colors.map(({ color }) => color);
  const value = { ...formLogoData, colors };
  // console.log('changeLogoLight log', value);
  await services.setLogoLighting(value);
};
</script>

<style scoped lang="scss">
.lighting-box {
  width: 1600px;
  height: 350px;
  margin-top: 25px;
  display: flex;
  background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  padding-top: 30px;
  overflow: hidden;

  .lighting-item {
    width: 200px;
    height: 42px;
    font-size: 20px;
    color: #fff;
    margin: 0 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN oblique';
    background-image: url('@/assets/images/performance_item_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-bottom: 20px;
    cursor: pointer;
  }
  .is-active {
    background-image: url('@/assets/images/performance_item_bgC.gif');
    color: #000;
  }
}
</style>
