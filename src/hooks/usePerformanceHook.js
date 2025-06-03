import services from '@/services/index';
import { showMessage } from '@/utils/message';
import { usePerformanceStore } from '@/stores';

export const usePerformanceHook = () => {
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  const performanceStore = usePerformanceStore();

  const setSingleTravel = async (keyboards, activeKeys, type = 'single') => {
    if (isVersion2) {
      // v2设置single rt deadZone
      return await processKeysV2(keyboards, activeKeys);
    } else {
      // v1设置single rt deadZone
      let promises = [];

      promises = activeKeys.map(async (keyLocation) => {
        const [key1, key2] = keyLocation.split('-');
        const rowIndex = Number(key1);
        const colIndex = Number(key2);
        const keyItem = keyboards[rowIndex][colIndex];
        const {
          advancedKeyMode,
          singleTriggeringValue,
          rtPressValue,
          rtReleaseValue,
          deadBandPressValue,
          deadBandReleaseValue,
        } = keyItem.performance;
        switch (type) {
          case 'single':
            performanceStore.setPerformanceMode(keyItem.keyValue, 'single', advancedKeyMode);
            performanceStore.setSingleTravel(keyItem.keyValue, singleTriggeringValue);
            break;
          case 'rt':
            performanceStore.setPerformanceMode(keyItem.keyValue, 'rt', advancedKeyMode);
            performanceStore.setSingleTravel(keyItem.keyValue, singleTriggeringValue);
            performanceStore.setRtPressTravel(keyItem.keyValue, rtPressValue);
            performanceStore.setRtReleaseTravel(keyItem.keyValue, rtReleaseValue);
            break;
          case 'dz':
            performanceStore.setDp(keyItem.keyValue, deadBandPressValue);
            performanceStore.setDr(keyItem.keyValue, deadBandReleaseValue);
            break;
        }
      });
      return await Promise.all(promises);
    }
  };

  const setAxis = async (keyboards, activeKeys, axisID) => {
    if (isVersion2) {
      // v2设置轴
      // 使用工具函数，并传入修改performance的回调
      return await processKeysV2(keyboards, activeKeys, (performance) => {
        performance.axisID = axisID;
      });
    } else {
      // v1设置轴
      const promises = activeKeys.map(async (keyLocation) => {
        const [key1, key2] = keyLocation.split('-');
        const rowIndex = Number(key1);
        const colIndex = Number(key2);
        const { keyValue, performance } = keyboards[rowIndex][colIndex];
        performance.axisID = axisID;
        services.setAxis(keyValue, axisID);
      });
      return await Promise.all(promises);
    }
  };

  const setPreset = async (keyboards, preset) => {
    const promises = [];

    for (let row = 0; row < keyboards.length; row++) {
      const rowItem = keyboards[row];
      if (!Array.isArray(rowItem)) continue;

      for (let col = 0; col < rowItem.length; col++) {
        const keyItem = rowItem[col];
        if (!keyItem || typeof keyItem !== 'object') continue;

        const { keyValue, performance } = keyItem;

        // 获取按键的预设值
        const { triggerValue, rtValue, touchMode } = getKeyPresetValues(keyValue, preset);

        // 更新performance对象
        performance.mode = touchMode;
        performance.singleTriggeringValue = triggerValue;
        performance.rtPressValue = rtValue;
        performance.rtReleaseValue = rtValue;
        performance.isRt = rtValue !== 0;
        performance.isSingle = rtValue === 0;
        performance.mode = rtValue ? 1 : 0;
        if (isVersion2) performance.rtFirstTouch = triggerValue;
        performance.row = row;
        performance.col = col;

        // 添加异步操作到promises数组
        promises.push(
          (async () => {
            try {
              if (isVersion2) {
                const params = changeParams(performance);
                return await services.setPerformanceV2({ ...params, calibrate: 0 });
              } else {
                // v1版本的处理
                keyItem.isRt = touchMode === 'rt';
                // keyItem.isSingle = touchMode === 'single';

                const advancedKeyMode = keyItem.advancedKeyMode || '';
                await performanceStore.setPerformanceMode(keyValue, touchMode, advancedKeyMode);

                if (touchMode === 'single' || touchMode === 'rt') {
                  await performanceStore.setSingleTravel(keyValue, triggerValue);
                }

                if (touchMode === 'rt' && typeof rtValue === 'number') {
                  if (Array.isArray(rtValue) && rtValue.length >= 2) {
                    await performanceStore.setRtPressTravel(keyValue, rtValue[0]);
                    await performanceStore.setRtReleaseTravel(keyValue, rtValue[1]);
                  } else {
                    await performanceStore.setRtPressTravel(keyValue, rtValue);
                    await performanceStore.setRtReleaseTravel(keyValue, rtValue);
                  }
                }
              }
            } catch (error) {
              console.error(`应用设置到按键 ${keyValue} 时出错:`, error);
            }
          })(),
        );
      }
    }

    try {
      const res = await Promise.allSettled(promises);
      if (res) {
        showMessage('修改成功');
      }
    } catch (error) {
      console.error('应用设置时发生错误:', error);
    }
  };

  return {
    setSingleTravel,
    setAxis,
    setPreset,
  };
};

const changeParams = (params) => {
  const res = {
    mode: params.mode,
    normalPress: params.singleTriggeringValue,
    rtFirstTouch: params.rtFirstTouch,
    rtPress: params.rtPressValue,
    rtRelease: params.rtReleaseValue,
    pressDeadStroke: params.deadBandPressValue,
    releaseDeadStroke: params.deadBandReleaseValue,
    axis: params.axisID,
    row: params.row,
    col: params.col,
  };

  return res;
};

// 处理v2模式下的公共逻辑
const processKeysV2 = async (keyboards, activeKeys, modifyPerformance = null) => {
  const promises = activeKeys.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    const { performance } = keyboards[rowIndex][colIndex];

    // 如果有需要修改performance的回调，执行它
    if (modifyPerformance) {
      modifyPerformance(performance);
    }

    const params = changeParams(performance);
    return await services.setPerformanceV2({ ...params, calibrate: 0 });
  });

  return await Promise.all(promises);
};

// 辅助函数：获取按键的预设值
const getKeyPresetValues = (keyValue, preset) => {
  // 默认使用预设的全局设置
  let triggerValue = preset.other.trigger;
  let rtValue = preset.other.rt;
  let touchMode = 'global';

  // 检查当前按键是否在预设的特定按键列表中
  const specificKey = preset.keys.find((k) => k.key === keyValue);

  if (specificKey) {
    // 如果找到特定按键设置，则使用特定设置
    triggerValue = specificKey.trigger;
    rtValue = specificKey.rt;
    touchMode = typeof rtValue === 'number' && rtValue > 0 ? 'rt' : 'single';
  } else {
    // 没有找到特定按键设置，使用other的设置
    triggerValue = preset.other.trigger;
    rtValue = preset.other.rt;
    touchMode = typeof rtValue === 'number' && rtValue > 0 ? 'rt' : 'single';
  }

  return { triggerValue, rtValue, touchMode };
};
