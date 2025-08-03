
import services from '@/services/index';
import { useKeyboardStore, useLightSettingStore, useAppStore, useMacroStore } from '@/stores/index';
import { storeToRefs } from 'pinia';
import { useLightingHook } from '@/hooks/useLightingHook';

export const useSettingHook = () => {
  const keyboardStore = useKeyboardStore();
  const lightSettingStore = useLightSettingStore();
  const appStore = useAppStore();
  const macroStore = useMacroStore();
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  const { setLighting, setLightingPalette, setCustomLighting, setLightingSleepTime } = useLightingHook();

  // 处理灯光数据
  const handleLightingData = async () => {
    const { light, logo } = storeToRefs(lightSettingStore);

    if (isVersion2) {
      // v2版本灯光数据处理
      const lightingBase = await services.getLightingBaseV2({
        area: lightSettingStore.area,
        config: lightSettingStore.base
      }, lightSettingStore.lamp);

      const lightingPalette = await services.getLightingPaletteV2({
        area: lightSettingStore.area,
        config: lightSettingStore.palette
      });

      const lightSleepTime = await services.getLightingSleepTimeV2();

      return {
        base: lightingBase[0],
        palette: lightingPalette[0],
        sleepTime: lightSleepTime
      };
      
    } else {
      // v1版本灯光数据处理
      const keyboardLighting = await services.getLighting();
      const logoLighting = await services.getLogoLighting();

      return {
        keyboard: keyboardLighting,
        logo: logoLighting
      };
    }
  };

  // 处理系统数据
  const handleSystemData = async () => {
    // 获取基础信息
    const baseInfo = await appStore.getBaseInfo(isVersion2);

    // 获取系统模式
    const systemMode = await appStore.systemMode();

    // 获取协议版本
    const protocolVersion = await appStore.getProtocolVersion(isVersion2);

    return {
      baseInfo,
      systemMode,
      protocolVersion,
      version: isVersion2 ? 'v2' : 'v1'
    };
  };

  // 处理宏数据
  const handleMacroData = async () => {
    if (isVersion2) {
      // 如果宏数据为空，先获取所有宏数据
      if (macroStore.macroData.length === 0) {
        await macroStore.getMacroAllData();
      }
      return macroStore.macroData;
    } else {
      // v1版本从store获取宏数据，确保先初始化
      if (macroStore.localMacros.length === 0) {
        macroStore.initLocalMacros();
      }
      return macroStore.localMacros;
    }
  };

  // 导出配置
  const exportConfig = async (item) => {
    try {
      const light = await handleLightingData();
      const system = await handleSystemData();
      // 从键盘store获取键盘数据
      const { keyboards } = keyboardStore;

      // 确保获取所有层的键盘布局信息
      if (isVersion2) {
        // v2版本：使用getKeyLayoutV2获取所有层的布局信息
        const { row } = keyboardStore.keyLayoutConfig;

        // 获取所有层的数据并更新到store中
        for (let layer = 0; layer < 4; layer++) {
          keyboardStore.checkFnLayer(layer);

          // 获取当前层的所有行数据
          for (let i = 0; i < row; i++) {
            const result = await services.getKeyLayoutV2({ layer, row: i });
            const { keyboardLayout: layerData } = result[0];

            // 更新当前层的数据到keyboards中
            if (layerData && layerData.length > 0) {
              for (let colIndex = 0; colIndex < layerData.length; colIndex++) {
                if (keyboards[i] && keyboards[i][colIndex]) {
                  const customKeysKeyName = `fn${layer}`;
                  keyboards[i][colIndex].customKeys[customKeysKeyName].bindKeyValue = layerData[colIndex];
                }
              }
            }
          }
        }
      } else {
        // v1版本：使用getLayoutKeyInfo获取所有层的布局信息
        await keyboardStore.getLayoutKeyInfo(0, false);
        await keyboardStore.getLayoutKeyInfo(1, false);
        await keyboardStore.getLayoutKeyInfo(2, false);
        await keyboardStore.getLayoutKeyInfo(3, false);
      }

      const macro = await handleMacroData();

      const data = {
        light,
        keyboards,
        system,
        macro,
      };

      // 导出为json文件，内容为data
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  };

  // 导入配置
  const importConfig = async (file) => {
    try {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const content = e.target.result;
            const config = JSON.parse(content);

            // 导入灯光配置
            if (config.light) {
              if (isVersion2) {
                // 处理v2版本灯光配置
                if (config.light.base) {
                  // 更新store中的灯光数据
                  const open = config.light.base.open || "Open";
                  const mode = config.light.base.mode || 0;
                  const luminance = config.light.base.luminance || 80;
                  const speed = config.light.base.speed || 80;
                  const direction = config.light.base.direction === "Forward" ? true : false;
                  const selectStaticColor = config.light.base.selectStaticColor || 0;

                  // 更新lightSettingStore中的数据
                  lightSettingStore.light.open = open === 'Open' || open === 'OpenUp' || open === 'OpenDown';
                  lightSettingStore.light.mode = mode;
                  lightSettingStore.light.luminance = luminance;
                  lightSettingStore.light.speed = speed;
                  lightSettingStore.light.direction = direction;
                  lightSettingStore.light.selectStaticColor = selectStaticColor;

                  // 直接调用setLighting方法设置灯光
                  await setLighting('keyboard', open);
                }

                // 处理调色板数据
                if (config.light.palette && Array.isArray(config.light.palette.staticColors)) {
                  // 确保每个颜色都是有效的HEX格式
                  const validColors = config.light.palette.staticColors.map(color => {
                    // 检查是否是对象格式
                    if (typeof color === 'object' && color !== null) {
                      if (color.color && typeof color.color === 'string') {
                        return {
                          color: color.color.startsWith('#') ? color.color : `#${color.color}`,
                          id: color.id || 0
                        };
                      }
                      return { color: '#FFFFFF', id: 0 };
                    }
                    // 检查是否是字符串格式
                    else if (typeof color === 'string') {
                      return {
                        color: color.startsWith('#') ? color : `#${color}`,
                        id: 0
                      };
                    }
                    return { color: '#FFFFFF', id: 0 };
                  });

                  // 更新store中的调色板数据
                  lightSettingStore.light.staticColors = validColors;

                  // 设置灯光调色板
                  await setLightingPalette();
                }

                // 如果有自定义灯光配置，设置自定义灯光
                if (config.light.custom && Array.isArray(config.light.custom)) {
                  // 更新自定义灯光数据
                  for (let row = 0; row < keyboardStore.keyboards.length && row < config.light.custom.length; row++) {
                    for (let col = 0; col < keyboardStore.keyboards[row].length && col < config.light.custom[row].length; col++) {
                      keyboardStore.keyboards[row][col].customLight = config.light.custom[row][col];
                    }
                  }

                  // 设置自定义灯光
                  await setCustomLighting();
                }

                // 设置睡眠时间
                if (config.light.sleepTime !== undefined) {
                  // 更新store中的睡眠时间
                  lightSettingStore.light.sleepTime = config.light.sleepTime;

                  // 设置睡眠时间
                  await setLightingSleepTime(config.light.sleepTime);
                }
              } else {
                // 处理v1版本灯光配置
                if (config.light.keyboard) {
                  // 更新store中的键盘灯光数据
                  Object.assign(lightSettingStore.light, {
                    mode: config.light.keyboard.mode,
                    open: config.light.keyboard.open,
                    type: config.light.keyboard.type,
                    speed: config.light.keyboard.speed,
                    luminance: config.light.keyboard.luminance,
                    sleepTime: config.light.keyboard.sleepDelay,
                    direction: config.light.keyboard.direction,
                    staticColors: config.light.keyboard.colors.map((color, index) => ({ color, id: index })),
                    selectStaticColor: config.light.keyboard.staticColor,
                  });

                  await services.setLighting(config.light.keyboard);
                }

                if (config.light.logo) {
                  // 更新store中的logo灯光数据
                  Object.assign(lightSettingStore.logo, {
                    mode: config.light.logo.mode,
                    open: config.light.logo.open,
                    type: config.light.logo.type,
                    speed: config.light.logo.speed,
                    luminance: config.light.logo.luminance,
                    sleepTime: config.light.logo.sleepDelay,
                    direction: config.light.logo.direction,
                    staticColors: config.light.logo.colors.map((color, index) => ({ color, id: index })),
                    selectStaticColor: config.light.logo.staticColor,
                  });

                  await services.setLogoLighting(config.light.logo);
                }
              }
            }

            // 导入键盘配置
            if (config.keyboards && Array.isArray(config.keyboards)) {
              try {
                // 使用专门的导入方法处理键盘配置
                const result = await keyboardStore.importKeyboardConfig(config.keyboards);
              } catch (error) {
                // 导入键盘配置失败
              }
            }

            // 导入宏配置
            if (config.macro) {
              try {
                if (isVersion2) {
                  // v2版本宏数据处理
                  if (Array.isArray(config.macro)) {
                    await macroStore.importMacroData(config.macro);
                  }
                } else {
                  // v1版本宏数据处理
                  if (Array.isArray(config.macro)) {
                    macroStore.setMacroData_V1(config.macro);
                  }
                }
              } catch (error) {
                // 导入宏配置失败
              } finally {
                console.log('macroStore.macros', macroStore.macros);
              }
            }

            // 导入系统配置
            if (config.system) {
              try {
                // 应用系统配置
                if (config.system.systemMode) {
                  await appStore.setSystemMode(config.system.systemMode);
                }

                // 如果有其他系统配置，可以在这里添加
              } catch (error) {
                // 导入系统配置失败
              }
            }

            resolve(true);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsText(file);
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    handleLightingData,
    handleSystemData,
    handleMacroData,
    exportConfig,
    importConfig
  };
}; 