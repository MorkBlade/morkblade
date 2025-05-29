import services from '@/services/index';
import { useLightSettingStore, useKeyboardStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { paletteToHexArray, hexArrayToPalette } from '@/utils/color-convert';

export const useLightingHook = () => {
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  const keyboardStore = useKeyboardStore();
  const lightSettingStore = useLightSettingStore();
  const { light } = storeToRefs(lightSettingStore);
  const { area, base, palette, colorCorrection } = lightSettingStore;
  const lightData = light.value;

  const initLighting = async (lampData) => {
    const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
    if (isVersion2) {
      lightSettingStore.lamp = lightSettingStore.area === 'Keyboard' ? lampData : 'SingleLighting';
      const lightingBase = await services.getLightingBaseV2({ area: area, config: base }, lightSettingStore.lamp);
      const { open, mode, luminance, speed, direction, selectStaticColor } = lightingBase[0];
      // lightData.open = true;
      lightData.open = open === 'Open' || open === 'OpenUp' || open === 'OpenDown';
      lightData.mode = mode;
      lightData.luminance = luminance;
      lightData.speed = speed;
      lightData.direction = direction === 'Forward';
      lightData.selectStaticColor = selectStaticColor;
      // console.log('lightData.openlightData.open', lightData.open);
      if (open === 'Open') {
        lightSettingStore.upOpen = true;
        lightSettingStore.downOpen = true;
      } else if (open === 'OpenUp') {
        lightSettingStore.upOpen = true;
      } else if (open === 'OpenDown') {
        lightSettingStore.downOpen = true;
      } else {
        lightSettingStore.upOpen = false;
        lightSettingStore.downOpen = false;
      }

      const lightingPalette = await services.getLightingPaletteV2({ area: area, config: palette });

      const colors = paletteToHexArray(lightingPalette[0]?.staticColors).map((color, index) => ({ color, id: index }));
      lightData.staticColors = colors;
      // console.log('custom lighting data: ', await services.getLightingCustomV2());

      modifyCustomLightingData();
    } else {
      // v1初始化灯光数据
      const keyboardLighting = await services.getLighting();
      // console.log('keyboardLighting', keyboardLighting);
      const logoLighting = await services.getLogoLighting();
      modifyLightingData(keyboardLighting, logoLighting);
    }
    lightSettingStore.saturation = { R: 0, G: 0, B: 0 };
  };

  const setLighting = async (lightingType = 'keyboard', keyCode) => {
    const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
    if (isVersion2) {
      let open;
      if (keyCode) {
        open = keyCode;
      } else {
        open = lightData.open ? 'Open' : 'Close';
      }
      const res = await services.setLightingBaseV2({
        area: area,
        config: base,
        data: {
          open,
          mode: lightData.mode,
          luminance: lightData.luminance,
          speed: lightData.speed,
          direction: lightData.direction ? 'Forward' : 'Backward',
          selectStaticColor: lightData.selectStaticColor,
        },
        lamp: lightSettingStore.lamp,
      });
      return res;
    } else {
      // v1设置灯光
      const lightingInfo = conversionData(lightingType);
      // 发送灯光数据
      lightingType == 'keyboard'
        ? await services.setLighting(lightingInfo)
        : await services.setLogoLighting(lightingInfo);
    }
  };

  // 设置灯光调色板颜色 v2特有
  const setLightingPalette = async () => {
    const colors = hexArrayToPalette(
      lightData.staticColors.map((item) => (typeof item === 'string' ? item : item.color)),
    );

    const res = await services.setLightingPaletteV2({
      area,
      config: palette,
      data: { staticColors: colors },
    });
    return res;
  };

  // v2自定义灯光初始化状态
  const initCustomLighting = async (inCustomLighting = false) => {
    keyboardStore.keyboards.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        col.customLight.isCustom = inCustomLighting;
      });
    });
    await setCustomLighting();
  };

  const modifyCustomLightingData = async () => {
    const customLighting = await services.getLightingCustomV2();
    const keyboardStore = useKeyboardStore();
    // customLighting.forEach((row, rowIndex) => {
    //   row.forEach((col, colIndex) => {
    //     keyboardStore.keyboards[rowIndex][colIndex].customLight = col;
    //   });
    // });
    for (let row = 0; row < keyboardStore.keyboards.length; row++) {
      for (let col = 0; col < keyboardStore.keyboards[row].length; col++) {
        keyboardStore.keyboards[row][col].customLight = customLighting[row][col];
      }
    }
  };

  const setCustomLighting = async (key) => {
    const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
    if (isVersion2) {
      const customLightData = [];
      keyboardStore.keyboards.forEach((row, rowIndex) => {
        if (!customLightData[rowIndex]) customLightData[rowIndex] = [];
        row.forEach((col, colIndex) => {
          customLightData[rowIndex].push(col.customLight);
        });
      });
      await services.setLightingCustomV2({
        area: 'Keyboard',
        data: customLightData,
        protocol: 'Custom',
      });
    } else {
      await services.setCustomLighting({ key, ...lightSettingStore.currentColor });
    }
  };

  // v2 灯光饱和度
  const getLightingSaturation = async () => {
    if (isVersion2) {
      const res = await services.getLightingColorCorrectionV2({ area, config: colorCorrection });
      const { R, G, B } = res[0];
      lightSettingStore.saturation = { R, G, B };
      return res;
    } else {
      const res = await services.getSaturation();
      if (!res) return;
      // console.log('getLightingSaturation', res);
      const { r: R, g: G, b: B } = res;
      lightSettingStore.saturation = { R, G, B };
    }
  };

  const setLightingSaturation = async () => {
    if (isVersion2) {
      const res = await services.setLightingColorCorrectionV2({
        config: colorCorrection,
        data: lightSettingStore.saturation,
      });
      return res;
    } else {
      const { R, G, B } = lightSettingStore.saturation;
      const res = await services.setLightingSaturation([R, G, B]);
    }
  };

  return {
    initLighting,
    setLighting,
    setLightingPalette,
    setCustomLighting,
    initCustomLighting,
    modifyCustomLightingData,
    getLightingSaturation,
    setLightingSaturation,
  };
};

const modifyLightingData = (keyboardLighting, logoLighting) => {
  const lightSettingStore = useLightSettingStore();

  const processLightingData = (data, type) => {
    if (!data) return;

    const target = type === 'keyboard' ? lightSettingStore.light : lightSettingStore.logo;
    // console.log('data', data);
    const colors = data.colors.map((color, index) => ({ color, id: index }));

    Object.assign(target, {
      mode: data.mode,
      open: data.open,
      type: data.type,
      speed: data.speed,
      luminance: data.luminance,
      sleepTime: data.sleepDelay,
      direction: data.direction,
      staticColors: colors,
      selectStaticColor: data.staticColor,
    });
  };

  processLightingData(keyboardLighting, 'keyboard');
  processLightingData(logoLighting, 'logo');
};

const conversionData = (lightingType) => {
  const lightSettingStore = useLightSettingStore();

  const lightingData = lightingType === 'keyboard' ? lightSettingStore.light : lightSettingStore.logo;

  const colors = lightingData.staticColors.map((item) => (typeof item === 'string' ? item : item.color));

  // v1 灯光数据转换(因v1灯光所需属性与新定数据结构不一致，所以需要转换)
  lightingData.type === 'static' ? (lightingData.mode = 0) : '';
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
};
