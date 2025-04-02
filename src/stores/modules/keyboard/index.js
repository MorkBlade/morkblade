import { defineStore } from 'pinia';

import services from '@/services/index';
import { usePerformanceStore, useMacroStore } from '@/stores';

const state = {
  keyboard: [],
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
        this.keyboard = keyboardData;
        const performance = usePerformanceStore();
        await performance.getKeyPerformance(keyboardData);
        await performance.getAllDpDr(keyboardData);
        await this.getLayoutKeyInfo();
      }
    },

    // 获取每一层的值
    async getLayoutKeyInfo(layout = 0) {
      this.layout = layout;
      const result = [];
      // 每一行的数据
      for (let i = 0; i < this.keyboard.length; i++) {
        result.push(this.splitRowArray(this.keyboard[i], layout));
      }
      const data = await Promise.all(result);
      this.currentLayoutData = data;
    },

    // 写一个方法数组长度大于14拆成两包
    async splitRowArray(params, layout) {
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
        // console.log('results----------------------------->', results);
        // 处理结果
        const data = [];
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            data.push(...result.value);
          } else {
            console.error(`Batch ${index} failed:`, result.reason);
            data.push(
              ...batches[index].map((item) => ({
                ...item,
                error: true,
              })),
            );
          }
        });

        // 4. 异步获取 axis，不阻塞返回
        Promise.all(
          data.map(async (item, index) => {
            try {
              const { axis } = await services.getAxis(item.key);
              data[index].axis = axis;
            } catch (error) {
              console.error(`Failed to get axis for key ${item.key}:`, error);
              data[index].axis = null;
            }
          }),
        ).catch(console.error);

        // 5. 立即返回数据，axis 会在后续异步更新
        return data;
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
    async updateKey({ colIndex, rowIndex }) {
      // 调用updateKey接口返回需要更新的数据
      this.selectKey.x = colIndex;
      this.selectKey.y = rowIndex;
      const { layout, keyboard, selectKey } = this;
      const keyboardData = keyboard.filter((item) => item.length > 0);
      const { keyValue: key } = keyboardData[rowIndex][colIndex];
      const { value } = selectKey;
      try {
        const result = await services.setKey([{ key, layout, value }]);
        const data = result[0];
        this.currentLayoutData[rowIndex][colIndex] = data;
        // console.log('updateKey log', this.currentLayoutData);
      } catch (e) {
        console.log(e);
      }
    },

    async selectKey(key) {
      this.selectKey = key;
    },

    handleSelectKeyClick({ colIndex, rowIndex }, type = 'multiple') {
      const keyId = `${colIndex}-${rowIndex}`;
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
      this.keyboard.forEach((item, y) => {
        item.forEach((key, x) => {
          activeKeys.push(`${x}-${y}`);
        });
      });
      this.activeKeys = activeKeys;
    },

    // 选中WASD键
    selectWasdKey() {
      const activeKeys = [];
      this.keyboard.forEach((item, y) => {
        item.forEach((key, x) => {
          if (key.keyValue === 4 || key.keyValue === 22 || key.keyValue === 26 || key.keyValue === 7) {
            activeKeys.push(`${x}-${y}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },
    // 选中数字键
    selectNumKey() {
      const activeKeys = [];
      this.keyboard.forEach((item, y) => {
        item.forEach((key, x) => {
          if (key.keyValue >= 30 && key.keyValue <= 39) {
            activeKeys.push(`${x}-${y}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },
    // 选中字母键
    selectLetterKey() {
      const activeKeys = [];
      this.keyboard.forEach((item, y) => {
        item.forEach((key, x) => {
          if (key.keyValue >= 4 && key.keyValue <= 29) {
            activeKeys.push(`${x}-${y}`);
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
      this.keyboard.forEach((item, y) => {
        item.forEach((key, x) => {
          allKeys.push(`${x}-${y}`);
        });
      });

      // 反选：选中之前未选中的，取消之前选中的
      this.activeKeys = allKeys.filter((key) => !this.activeKeys.includes(key));
    },
  },
});

export default useKeyboardStore;
