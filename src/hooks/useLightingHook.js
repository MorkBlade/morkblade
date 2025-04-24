import services from '@/services/index';
import { useLightSettingStore } from '@/stores';
import { storeToRefs } from 'pinia';

export function useLightingHook() {
  const version = localStorage.getItem('keyboardVer');

  const initLighting = async () => {
    if (version === 'v2') {
    } else {
      const keyboardLighting = await services.getLighting();
      const logoLighting = await services.getLogoLighting();
      modifyLightingData(keyboardLighting, logoLighting);
    }
  };

  const setLighting = async (lightingType = 'keyboard') => {
    if (version === 'v2') {
    } else {
      const lightingInfo = conversionData(lightingType);
      lightingType == 'keyboard'
        ? await services.setLighting(lightingInfo)
        : await services.setLogoLighting(lightingInfo);
    }
  };

  return { initLighting, setLighting };
}

function modifyLightingData(keyboardLighting, logoLighting) {
  const lightSettingStore = useLightSettingStore();
  const { newState } = storeToRefs(lightSettingStore);
  if (keyboardLighting) {
    const colors = keyboardLighting.colors.map((color, index) => {
      return { color, id: index };
    });
    lightSettingStore.updateStaticLightColorChecked(keyboardLighting.staticColor, true);

    newState.value.light.mode = keyboardLighting.mode;
    newState.value.light.open = keyboardLighting.open;
    newState.value.light.type = keyboardLighting.type;
    newState.value.light.speed = keyboardLighting.speed;
    newState.value.light.luminance = keyboardLighting.luminance;
    newState.value.light.sleepTime = keyboardLighting.sleepDelay;
    newState.value.light.direction = keyboardLighting.direction;
    newState.value.light.staticColors = colors;
    newState.value.light.selectStaticColor = keyboardLighting.staticColor;
  }

  if (logoLighting) {
    const colors = logoLighting.colors.map((color, index) => {
      return { color, id: index };
    });
    lightSettingStore.updateLogoStaticLightColorChecked(logoLighting.staticColor, true);

    newState.value.logo.mode = logoLighting.mode;
    newState.value.logo.open = logoLighting.open;
    newState.value.logo.type = logoLighting.type;
    newState.value.logo.speed = logoLighting.speed;
    newState.value.logo.luminance = logoLighting.luminance;
    newState.value.logo.sleepTime = logoLighting.sleepDelay;
    newState.value.logo.direction = logoLighting.direction;
    newState.value.logo.staticColors = colors;
    newState.value.logo.selectStaticColor = logoLighting.staticColor;
  }
}

function conversionData(lightingType) {
  const lightSettingStore = useLightSettingStore();

  const lightingData = lightingType === 'keyboard' ? lightSettingStore.newState.light : lightSettingStore.newState.logo;

  const colors = lightingData.staticColors.map((item) => {
    return typeof item === 'string' ? item : item.color;
  });

  console.log('setKeyLighting log light: ', lightingType, lightingData);
  return {
    type: lightingData.type,
    colors, // 颜色组
    direction: lightingData.direction, // 方向 true 正向 false 反向
    superResponse: false, // 超强响应
    mode: lightingData.mode, // 0 关闭, 1-20表示效果，21 自定义
    speed: lightingData.speed, // 灯光速度
    luminance: lightingData.luminance, // 亮度
    sleepDelay: lightingData.sleepTime, // 灯光休眠时间
    staticColor: lightingData.selectStaticColor, // 静态颜色
  };
}
