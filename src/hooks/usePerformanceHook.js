import services from '@/services/index';
import { useKeyboardStore, usePerformanceStore } from '@/stores';

export function usePerformanceHook() {
  const version = localStorage.getItem('keyboardVer');
  const performanceStore = usePerformanceStore();
  const setSingleTravel = async (keyboards, activeKeys, type = 'single') => {
    if (version === 'v2') {
      const promises = activeKeys.map(async (keyLocation) => {
        const [key1, key2] = keyLocation.split('-');
        const rowIndex = Number(key1);
        const colIndex = Number(key2);
        const { performance } = keyboards[rowIndex][colIndex];
        const params = changeParams(performance);
        return await services.setPerformanceV2({ ...params, calibrate: 0 });
      });
      const result = await Promise.all(promises);
      return result;
    } else {
      let promises = [];
      switch (type) {
        case 'single':
          promises = activeKeys.map(async (keyLocation) => {
            const [key1, key2] = keyLocation.split('-');
            const rowIndex = Number(key1);
            const colIndex = Number(key2);
            const keyItem = keyboards[rowIndex][colIndex];
            const { advancedKeyMode, singleTriggeringValue } = keyItem.performance;
            performanceStore.setPerformanceMode(keyItem.keyValue, 'single', advancedKeyMode);
            performanceStore.setSingleTravel(keyItem.keyValue, singleTriggeringValue);
          });
          break;
        case 'rt':
          promises = activeKeys.map(async (keyLocation) => {
            const [key1, key2] = keyLocation.split('-');
            const rowIndex = Number(key1);
            const colIndex = Number(key2);
            const keyItem = keyboards[rowIndex][colIndex];
            const { advancedKeyMode, rtPressValue, rtReleaseValue, singleTriggeringValue } = keyItem.performance;
            return Promise.all([
              performanceStore.setPerformanceMode(keyItem.keyValue, 'rt', advancedKeyMode),
              performanceStore.setRtPressTravel(keyItem.keyValue, rtPressValue),
              performanceStore.setRtReleaseTravel(keyItem.keyValue, rtReleaseValue),
              performanceStore.setSingleTravel(keyItem.keyValue, singleTriggeringValue),
            ]);
          });
          break;
        case 'dz':
          promises = activeKeys.map(async (keyLocation) => {
            const [key1, key2] = keyLocation.split('-');
            const rowIndex = Number(key1);
            const colIndex = Number(key2);
            const keyItem = keyboards[rowIndex][colIndex];
            const { deadBandPressValue, deadBandReleaseValue } = keyItem.performance;
            return Promise.all([
              performanceStore.setDp(keyItem.keyValue, deadBandPressValue),
              performanceStore.setDr(keyItem.keyValue, deadBandReleaseValue),
            ]);
          });
          break;
      }

      return await Promise.all(promises);
    }
  };

  const setAxis = async (keyboards, activeKeys, axisID) => {
    if (version === 'v2') {
      const promises = activeKeys.map(async (keyLocation) => {
        const [key1, key2] = keyLocation.split('-');
        const rowIndex = Number(key1);
        const colIndex = Number(key2);
        const { performance } = keyboards[rowIndex][colIndex];
        performance.axisID = axisID;
        const params = changeParams(performance);
        return await services.setPerformanceV2({ ...params, calibrate: 0 });
      });
      const result = await Promise.all(promises);
      return result;
    } else {
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

function changeParams(params) {
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
  console.log('change params after: ', res);
  return res;
}
