import { defineStore } from 'pinia';

import services from '@/services/index';
import { usePerformanceStore, useMacroStore } from '@/stores';

const keyboardItemInfo = {
  col: -1,
  row: -1,
  keyValue: -1,

  light: {
    custom: { B: 114, G: 153, R: 168 },
  },

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

const state = {
  keyboards: [],
  layout: 0,
  currentLayoutData: [],
  selectKey: { x: 0, y: 0, value: 0 },
  activeKeys: [], // 存储当前选中的键帽值
  isDraging: false,
  inChangLight: false,
};

const useKeyboardStore = defineStore('keyboard', {
  state: () => state,

  getters: {},

  actions: {
    // 初始化键盘布局
    async defKey() {
      // console.log('defKey render===================================>>>');
      const result = await services.defKey();
      // console.log('defKey log res:>>>>>', result);
      if (result) {
        // console.log('------------------------------------ defkey has data ------------------------------------');
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
        this.keyboards = keyboardItems;
        const performance = usePerformanceStore();
        await this.getLayoutKeyInfo();
        await performance.getKeyPerformance(this.keyboards);
        // await performance.getAllDpDr(this.keyboards);
      }
    },

    // 获取每一层的值
    async getLayoutKeyInfo(layout = 0) {
      this.layout = layout;
      const result = [];
      // 每一行的数据
      for (let i = 0; i < this.keyboards.length; i++) {
        result.push(this.splitRowArray(this.keyboards[i], layout, i));
      }
      await Promise.all(result);
      return this.keyboards;
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
              params[colIdx].axis = axis;
              // const col = colNum + rowNum * 14;
              const { key, layout, value } = col;
              const customKeysKeyName = `fn${layout}`;
              const { customKeys } = params[colIdx];
              customKeys[customKeysKeyName].keyValue = key;
              customKeys[customKeysKeyName].bindKeyValue = value;
            } catch (error) {
              console.error(`Failed to get axis for key ${col.key}:`, error);
              params[colIdx].axis = null;
            }
          }),
        ).catch(console.error);
        // 5. 立即返回数据，axis 会在后续异步更新
        return this.keyboards;
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

    // 拖拽的按键
    updateSelectKey(data) {
      if (typeof data === 'number') {
        this.selectKey.value = data;
      } else {
        const macroStore = useMacroStore();
        macroStore.selectMacro = data;
      }
    },

    // 更新按键
    async updateKey({ rowIndex, colIndex }) {
      // 调用updateKey接口返回需要更新的数据
      this.selectKey.row = rowIndex;
      this.selectKey.col = colIndex;
      const { layout, keyboards, selectKey } = this;
      const keyboardData = keyboards.filter((item) => item.length > 0);
      const { keyValue: key, customKeys } = keyboardData[rowIndex][colIndex];
      const { value } = selectKey;
      try {
        const result = await services.setKey([{ key, layout, value }]);
        const data = result[0];
        const customKeysKeyName = `fn${layout}`;
        customKeys[customKeysKeyName].bindKeyValue = data.value;
      } catch (e) {
        console.log(e);
      }
    },

    async selectKey(key) {
      this.selectKey = key;
    },

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

    // 全选所有按键
    selectAllKey() {
      const activeKeys = [];
      this.keyboards.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          activeKeys.push(`${rowIndex}-${colIndex}`);
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

      // 反选：选中之前未选中的，取消之前选中的
      this.activeKeys = allKeys.filter((key) => !this.activeKeys.includes(key));
    },
  },
});

export default useKeyboardStore;
