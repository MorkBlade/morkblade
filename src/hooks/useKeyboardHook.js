import { useKeyboardStore, usePerformanceStore } from '@/stores';
import services from '@/services/index';

const keyboardItemInfo = {
  col: -1,
  row: -1,
  keyValue: -1,

  customLight: { B: 0, G: 0, R: 0 },

  performance: {
    isGlobalTriggering: true,
    globalTriggeringValue: 0,
    isRt: false,
    isSingle: false,
    singleTriggeringValue: 0,
    rtPressValue: 0,
    rtReleaseValue: 0,
    axisID: 0,
    deadBandPressValue: 0,
    deadBandReleaseValue: 0,
    advancedKeyMode: 0,
    calibrationData: 0,
    calibrations: 0,
  },

  advancedKeys: {
    advancedType: '',
    value: 0,
    dks: null,
    mpt: null,
    mt: null,
    tgl: null,
    end: null,
    socd: null,
    macro: null,
  },

  customKeys: {
    fn0: { keyValue: -1, bindKeyValue: -1 },
    fn1: { keyValue: -1, bindKeyValue: -1 },
    fn2: { keyValue: -1, bindKeyValue: -1 },
    fn3: { keyValue: -1, bindKeyValue: -1 },
  },
};

export const useKeyboardHook = () => {
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  const keyboardStore = useKeyboardStore();
  const performanceStore = usePerformanceStore();

  const initKeyboard = async () => {
    if (isVersion2) {
      // v2 keyboard初始化
      const { row } = keyboardStore.keyLayoutConfig;
      const keyboardLayout = [];
      for (let i = 0; i < row; i++) {
        // eslint-disable-next-line no-await-in-loop
        const result = await services.getKeyLayoutV2({ layer: keyboardStore.fnLayer, row: i });
        const { keyboardLayout: data } = result[0];
        keyboardLayout.push(data);
      }

      if (keyboardLayout.length === 0) {
        console.error('初始化键盘数据失败: 返回值无效');
        return null;
      }

      const layoutData = [];
      const keyboardsWithPerformance = [];
      // console.log('initKeyboard-------------------------------', keyboardLayout);

      for (let rowIndex = 0; rowIndex < keyboardLayout.length; rowIndex++) {
        const row = keyboardLayout[rowIndex];
        if (layoutData[rowIndex] === undefined) layoutData[rowIndex] = [];

        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const customKeys = {
            fn0: { keyValue: -1, bindKeyValue: row[colIndex] },
            fn1: { keyValue: -1, bindKeyValue: row[colIndex] },
            fn2: { keyValue: -1, bindKeyValue: row[colIndex] },
            fn3: { keyValue: -1, bindKeyValue: row[colIndex] },
          };
          layoutData[rowIndex].push({
            ...keyboardItemInfo,
            keyValue: row[colIndex],
            row: rowIndex,
            col: colIndex,
            customKeys,
          });
        }
        // 获取性能数据
        // eslint-disable-next-line no-await-in-loop
        const performanceDataArray = await performanceStore.getKeyPerformanceV2(layoutData[rowIndex]);

        // 将性能数据合并到layoutData中的每个键对象
        if (Array.isArray(performanceDataArray)) {
          let performanceIndex = 0;
          for (let i = 0; i < layoutData[rowIndex].length; i++) {
            if (performanceIndex < performanceDataArray.length) {
              if (layoutData[rowIndex][i].keyValue > 0) {
                layoutData[rowIndex][i].performance = {
                  ...layoutData[rowIndex][i].performance,
                  ...performanceDataArray[performanceIndex],
                };
                performanceIndex++;
              }
            }
          }
        }

        // 将处理后的行数据添加到keyboardsWithPerformance
        keyboardsWithPerformance.push(layoutData[rowIndex]);
      }

      // console.log('keyboardsWithPerformance', keyboardsWithPerformance);
      return keyboardsWithPerformance;
    } else {
      // v1 keyboard初始化
      const result = await services.defKey();
      if (result) {
        let keyboards;
        const keyboardData = result.filter((item) => item.length > 0);
        const keyboardItems = [];
        keyboardData.forEach((row, rowIndex) => {
          if (!keyboardItems[rowIndex]) keyboardItems[rowIndex] = [];
          row.forEach((column) => {
            const { keyValue, location } = column;
            const { col, row } = location;
            const keyboardItem = JSON.parse(JSON.stringify(keyboardItemInfo));
            keyboardItem.col = col;
            keyboardItem.row = row;
            keyboardItem.keyValue = keyValue;
            keyboardItem.customKeys.fn0.keyValue = keyValue;
            keyboardItem.customKeys.fn1.keyValue = keyValue;
            keyboardItem.customKeys.fn2.keyValue = keyValue;
            keyboardItem.customKeys.fn3.keyValue = keyValue;
            keyboardItems[rowIndex].push(keyboardItem);
          });
        });
        // console.log('keyboardItems', keyboardItems);
        // 获取每一层的值
        await keyboardStore.getLayoutKeyInfo(keyboardStore.layout, keyboardItems);
        await performanceStore.getKeyPerformanceV1(keyboardItems);
        return keyboardItems;
      }
      return null;
    }
  };

  return {
    initKeyboard,
  };
};

const initKeyboardLayout = (keyboards) => {
  const keyboardStore = useKeyboardStore();
  const filteredKeyboards = [];

  // 检查keyboards是否为空
  if (!keyboards || !Array.isArray(keyboards) || keyboards.length === 0) {
    return [];
  }

  // 遍历keyboards数组
  for (let rowIndex = 0; rowIndex < keyboards.length; rowIndex++) {
    // 如果当前行不存在于keyboardLayout中，跳过
    if (rowIndex >= keyboardStore.keyboardLayoutV2.length) {
      continue;
    }

    filteredKeyboards[rowIndex] = [];

    // 检查当前行是否为数组
    if (!Array.isArray(keyboards[rowIndex])) {
      continue;
    }

    // 遍历当前行的键
    for (let colIndex = 0; colIndex < keyboards[rowIndex].length; colIndex++) {
      // 当row等于5且keyValue不存在或为0时，跳过该键
      const colData = keyboards[rowIndex][colIndex];
      // console.log('colData',colData);
      // 创建深拷贝，避免引用同一个对象
      const currentKey = JSON.parse(JSON.stringify(colData));

      if (!currentKey.keyValue || currentKey.keyValue === 0 || currentKey.keyValue === -1) {
        continue;
      }

      // 如果当前列不存在于keyboardLayout的当前行中，跳过
      if (filteredKeyboards[rowIndex].length >= keyboardStore.keyboardLayoutV2[rowIndex].length) {
        continue;
      }

      // 设置自定义键值
      currentKey.customKeys.fn0.keyValue = currentKey.keyValue;
      currentKey.customKeys.fn0.bindKeyValue = currentKey.keyValue;
      currentKey.customKeys.fn1.keyValue = currentKey.keyValue;
      currentKey.customKeys.fn2.keyValue = currentKey.keyValue;
      currentKey.customKeys.fn3.keyValue = currentKey.keyValue;

      // 添加键
      filteredKeyboards[rowIndex].push(currentKey);
    }
  }
  return filteredKeyboards;
};
