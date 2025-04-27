import services from '@/services/index';
import { usePerformanceStore } from '@/stores';

export const usePerformanceHook = () => {
  const version = localStorage.getItem('keyboardVer');
  const performanceStore = usePerformanceStore();

  const setSingleTravel = async (keyboards, activeKeys, type = 'single') => {
    if (version === 'v2') { // v2设置single rt deadZone
      return await processKeysV2(keyboards, activeKeys);
    } else { // v1设置single rt deadZone
      let promises = [];

      promises = activeKeys.map(async (keyLocation) => {
        const [key1, key2] = keyLocation.split('-');
        const rowIndex = Number(key1);
        const colIndex = Number(key2);
        const keyItem = keyboards[rowIndex][colIndex];
        const { advancedKeyMode, singleTriggeringValue, rtPressValue, rtReleaseValue, deadBandPressValue, deadBandReleaseValue } = keyItem.performance;
        switch (type) {
          case 'single':
            performanceStore.setPerformanceMode(keyItem.keyValue, 'single', advancedKeyMode);
            performanceStore.setSingleTravel(keyItem.keyValue, singleTriggeringValue);
            break;
          case 'rt':
            performanceStore.setPerformanceMode(keyItem.keyValue, 'rt', advancedKeyMode);
            performanceStore.setRtPressTravel(keyItem.keyValue, rtPressValue);
            performanceStore.setRtReleaseTravel(keyItem.keyValue, rtReleaseValue);
            break;
          case 'dz':
            performanceStore.setPerformanceMode(keyItem.keyValue, 'dz', advancedKeyMode);
            performanceStore.setDp(keyItem.keyValue, deadBandPressValue);
            performanceStore.setDr(keyItem.keyValue, deadBandReleaseValue);
            break;
        }
      });
      return await Promise.all(promises);
    }
  };

  const setAxis = async (keyboards, activeKeys, axisID) => {
    if (version === 'v2') { // v2设置轴
      // 使用工具函数，并传入修改performance的回调
      return await processKeysV2(keyboards, activeKeys, (performance) => {
        performance.axisID = axisID;
      });
    } else { // v1设置轴
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


  return {
    setSingleTravel,
    setAxis,
  };
}

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
}

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