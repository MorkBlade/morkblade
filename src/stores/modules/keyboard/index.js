
import { defineStore } from 'pinia';

import services from '@/services/index';
import { useMacroStore, usePerformanceStore } from '@/stores';
import { useKeyboardHook } from '@/hooks';

const state = {
  keyboards: [],
  layout: 0,
  fnLayer: 0,
  system: 0,
  keyLayoutConfig: {
    row: 6,
    col: 21,
  },
  selectKey: { row: 0, col: 0, keyCode: 0 },
  activeKeys: [], // 存储当前选中的键帽值
  isDraging: false,
  inChangLight: false,
  grabStatus: false,
};

const useKeyboardStore = defineStore('keyboard', {
  state: () => state,

  actions: {
    // 初始化键盘布局
    async initKeyboard() {
      // 将v1 v2初始化逻辑移到hook
      const { initKeyboard } = useKeyboardHook();
      this.keyboards = await initKeyboard();
    },

    // getLayoutKeyInfo  splitRowArray 只有v1需要调用
    // 获取每一层的值
    async getLayoutKeyInfo(layout = 0, keyboardsData) {
      // console.log('getLayoutKeyInfo', layout, keyboardsData);
      const result = [];
      // 每一行的数据
      for (let i = 0; i < keyboardsData.length; i++) {
        result.push(this.splitRowArray(keyboardsData[i], layout, i));
      }
      this.layout = layout;
      const res = await Promise.all(result);
      return res;
    },

    // 写一个方法数组长度大于14拆成两包
    async splitRowArray(params, layout, row) {
      // 将数据分成每组14个
      const batchSize = 14;
      const batches = [];
      for (let i = 0; i < params.length; i += batchSize) {
        const batch = params.slice(i, i + batchSize);
        const mappedBatch = batch.map(({ keyValue }) => ({
          key: keyValue,
          layout,
        }));
        batches.push(mappedBatch);
      }

      // console.log('Processing batches:', batches);

      try {
        // 使用 Promise.allSettled 替代 Promise.all 以防止一个失败影响所有
        const results = await Promise.allSettled(batches.map((batch) => services.getLayoutKeyInfo(batch)));
        // 处理结果
        const rowData = [];
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            rowData.push(...result.value);
          } else {
            console.error(`Batch ${index} failed:`, result.reason);
            rowData.push(
              ...batches[index].map((item) => ({
                ...item,
                error: true,
              })),
            );
          }
        });

        // console.log('results----------------------------->', rowData);
        // 4. 异步获取 axis，不阻塞返回
        Promise.all(
          rowData.map(async (col, colIdx) => {
            try {
              const { axis } = await services.getAxis(col.key);
              params[colIdx].performance.axisID = axis;
              // const col = colNum + rowNum * 14;
              const { key, layout, value } = col;
              const customKeysKeyName = `fn${layout}`;
              const { customKeys } = params[colIdx];
              customKeys[customKeysKeyName].keyValue = key;
              customKeys[customKeysKeyName].bindKeyValue = value;
            } catch (error) {
              console.error(`Failed to get axis for key ${col.key}:`, error);
              params[colIdx].performance.axisID = 0;
            }
          }),
        ).catch(console.error);
        // 5. 立即返回数据，axis 会在后续异步更新
        return params;
      } catch (error) {
        console.error('splitRowArray error:', error);
        return params.map(({ keyValue }) => ({
          key: keyValue,
          layout,
          error: true,
          axis: null,
        }));
      }
    },

    // 切换fn层
    checkFnLayer(layer) {
      this.fnLayer = layer;
    },

    // 拖拽的按键键值
    updateSelectKeyCode(data) {
      if (typeof data === 'number') {
        this.selectKey.keyCode = data;
      } else {
        const macroStore = useMacroStore();
        macroStore.selectMacro = data;
      }
    },

    // 改键
    async updateKey({ rowIndex, colIndex }) {
      // 调用updateKey接口返回需要更新的数据
      this.selectKey.row = rowIndex;
      this.selectKey.col = colIndex;
      const { layout, keyboards, selectKey } = this;
      const keyboardData = keyboards.filter((item) => item.length > 0);
      const { keyValue: key, customKeys } = keyboardData[rowIndex][colIndex];
      const { keyCode } = selectKey;
      try {
        const result = await services.setKey([{ key, layout, value: keyCode }]);
        const data = result[0];
        const customKeysKeyName = `fn${layout}`;
        customKeys[customKeysKeyName].bindKeyValue = data.value;
      } catch (e) {
        console.log(e);
      }
    },

    // 改键
    async updateKeyV2({ rowIndex, colIndex }) {
      this.selectKey.row = rowIndex;
      this.selectKey.col = colIndex;
      const { row, col, keyCode } = this.selectKey;
      const { customKeys } = this.keyboards[rowIndex][colIndex];
      if (row !== null && col !== null && keyCode !== null) {
        const res = await services.setKeyCodeV2({ layer: this.fnLayer, row, col, keycode: keyCode });
        const customKeysKeyName = `fn${this.layout}`;
        customKeys[customKeysKeyName].bindKeyValue = keyCode;
        return res;
      }
    },

    // 多选
    handleSelectKeyClick({ rowIndex, colIndex }, type = 'multiple') {
      const keyId = `${rowIndex}-${colIndex}`;
      const isKeySelected = this.activeKeys.includes(keyId);

      if (type === 'single') {
        this.activeKeys = isKeySelected ? [] : [keyId];
      } else if (type === 'multiple') {
        // type === 'multiple'
        if (isKeySelected) {
          this.activeKeys = this.activeKeys.filter((key) => key !== keyId);
        } else {
          this.activeKeys.push(keyId);
        }
      }
    },

    // 选择两个按键
    handleHighLevelKeyClick({ rowIndex, colIndex }) {
      const keyId = `${rowIndex}-${colIndex}`;
      const isKeySelected = this.activeKeys.includes(keyId);
      if (this.activeKeys.length > 1 && !isKeySelected) {
        this.activeKeys.shift();
        this.activeKeys.push(keyId);
      } else if (isKeySelected) {
        this.activeKeys = this.activeKeys.filter((key) => key !== keyId);
      } else {
        this.activeKeys.push(keyId);
      }
    },

    // 全选所有按键
    selectAllKey() {
      const activeKeys = [];
      this.keyboards.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col.keyValue !== 0) {
            // 排除无效按键
            // 只选中有效按键
            activeKeys.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    // 选中WASD键
    selectWasdKey() {
      const activeKeys = [];
      this.keyboards.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col.keyValue === 4 || col.keyValue === 22 || col.keyValue === 26 || col.keyValue === 7) {
            activeKeys.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    // 选中数字键
    selectNumKey() {
      const activeKeys = [];
      this.keyboards.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col.keyValue >= 30 && col.keyValue <= 39) {
            activeKeys.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    // 选中字母键
    selectLetterKey() {
      const activeKeys = [];
      this.keyboards.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col.keyValue >= 4 && col.keyValue <= 29) {
            activeKeys.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    // 取消选中
    cancelSelectKey() {
      this.activeKeys = [];
    },

    // 反选按键
    reverseSelectKey() {
      const allKeys = [];
      // 先获取所有可能的按键位置
      this.keyboards.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          allKeys.push(`${rowIndex}-${colIndex}`);
        });
      });

      this.activeKeys = allKeys.filter((key) => !this.activeKeys.includes(key));
    },

    // 更新抓取按键状态
    updateGrabStatus(status) {
      this.grabStatus = status;
    },

    async getKeyCode(params) {
      const res = await services.getKeyCodeV2(params);
      return res[0].keycode;
    },

    handleKeyboardData() {
      const { keyboards } = this;
      return keyboards;
    },

    // 导入键盘配置
    async importKeyboardConfig(keyboardData) {
      try {
        if (!keyboardData || !Array.isArray(keyboardData)) {
          console.error('Invalid keyboard data format');
          return false;
        }

        // 保存键盘数据到store
        this.keyboards = keyboardData;

        // 获取键盘版本
        const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

        // 应用键盘配置到设备
        if (isVersion2) {
          // v2版本: 使用批量设置API
          const keysToUpdate = [];

          // 收集所有层的按键数据
          for (let layer = 0; layer < 4; layer++) {
            for (let row = 0; row < keyboardData.length; row++) {
              if (!keyboardData[row]) continue;

              for (let col = 0; col < keyboardData[row].length; col++) {
                if (!keyboardData[row][col]) continue;

                const { customKeys } = keyboardData[row][col];
                const customKeysKeyName = `fn${layer}`;

                if (customKeys && customKeys[customKeysKeyName]) {
                  const keyCode = customKeys[customKeysKeyName].bindKeyValue;
                  keysToUpdate.push({ layer, row, col, keycode: keyCode });
                }
              }
            }
          }
          // 批量设置键位 - 使用单个API调用
          if (keysToUpdate.length > 0) {
            // 由于可能没有批量API，使用循环单个设置
            for (const keyData of keysToUpdate) {
              await services.setKeyCodeV2(keyData);
            }
          }

        } else {
          // v1版本: 按层设置
          for (let layout = 0; layout < 4; layout++) {
            const keysToUpdate = [];

            for (let row = 0; row < keyboardData.length; row++) {
              if (!keyboardData[row]) continue;

              for (let col = 0; col < keyboardData[row].length; col++) {
                if (!keyboardData[row][col]) continue;

                const { keyValue, customKeys } = keyboardData[row][col];
                const customKeysKeyName = `fn${layout}`;

                if (customKeys && customKeys[customKeysKeyName]) {
                  const value = customKeys[customKeysKeyName].bindKeyValue;
                  keysToUpdate.push({ key: keyValue, layout, value });
                }
              }
            }
            // 批量设置当前层的键位
            if (keysToUpdate.length > 0) {
              await services.setKey(keysToUpdate);
            }
          }
        }

        // 新增：恢复性能设置
        await this.restorePerformanceSettings(keyboardData, isVersion2);

        // 
        return true;
      } catch (error) {
        console.error('Import keyboard config error:', error);
        return false;
      }
    },

    // 新增：恢复性能设置的方法
    async restorePerformanceSettings(keyboardData, isVersion2) {
      try {
        const performanceStore = usePerformanceStore();

        if (isVersion2) {
          // v2版本：遍历所有按键，恢复性能设置
          for (let row = 0; row < keyboardData.length; row++) {
            for (let col = 0; col < keyboardData[row].length; col++) {
              const keyItem = keyboardData[row][col];
              if (!keyItem || keyItem.keyValue === 0) continue;

              const { keyValue, performance } = keyItem;

              // 恢复性能设置
              if (performance) {
                // 构建v2版本的性能参数
                const params = {
                  mode: performance.mode || 0,
                  normalPress: performance.singleTriggeringValue || 0,
                  rtFirstTouch: performance.rtFirstTouch || 0,
                  rtPress: performance.rtPressValue || 0,
                  rtRelease: performance.rtReleaseValue || 0,
                  pressDeadStroke: performance.deadBandPressValue || 0,
                  releaseDeadStroke: performance.deadBandReleaseValue || 0,
                  axis: performance.axisID || 0,
                  row: row,
                  col: col,
                  calibrate: 0
                };

                // 设置性能配置到设备
                await services.setPerformanceV2(params);
              }
            }
          }
        } else {
          // v1版本：遍历所有按键，恢复性能设置
          for (let row = 0; row < keyboardData.length; row++) {
            for (let col = 0; col < keyboardData[row].length; col++) {
              const keyItem = keyboardData[row][col];
              if (!keyItem || keyItem.keyValue === 0) continue;

              const { keyValue, performance, advancedKeys } = keyItem;

              // 恢复性能模式
              if (performance) {
                let touchMode = 'single';
                let advancedKeyMode = 0;

                if (performance.isRt) {
                  touchMode = 'rt';
                } else if (performance.isGlobalTriggering) {
                  touchMode = 'global';
                }

                // 恢复高级键模式
                if (advancedKeys && advancedKeys.advancedType) {
                  advancedKeyMode = advancedKeys.advancedType;
                }

                // 设置性能模式
                await performanceStore.setPerformanceMode(keyValue, touchMode, advancedKeyMode);

                // 恢复触发行程
                if (performance.singleTriggeringValue && (touchMode === 'single' || touchMode === 'rt')) {
                  await performanceStore.setSingleTravel(keyValue, performance.singleTriggeringValue, 2);
                }

                // 恢复RT模式设置
                if (touchMode === 'rt' && performance.rtPressValue && performance.rtReleaseValue) {
                  await performanceStore.setRtPressTravel(keyValue, performance.rtPressValue);
                  await performanceStore.setRtReleaseTravel(keyValue, performance.rtReleaseValue);
                }

                // 恢复死区设置
                if (performance.deadBandPressValue !== undefined) {
                  await performanceStore.setDp(keyValue, performance.deadBandPressValue);
                }
                if (performance.deadBandReleaseValue !== undefined) {
                  await performanceStore.setDr(keyValue, performance.deadBandReleaseValue);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Restore performance settings error:', error);
      }
    },

    // 获取键盘数据
    async getAllFnKeyboardData() {
      const { getKeyboardDataV2 } = useKeyboardHook();
      const keyboardData = await getKeyboardDataV2();
      return keyboardData;
    },
  },
});

export default useKeyboardStore;
