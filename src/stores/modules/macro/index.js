
import { defineStore } from 'pinia';

import services from '@/services/index';
import { resetKeys } from '@/utils/resetKeys';
import service from '@/services/index';

const useMacroStore = defineStore('macro', {
  state: () => ({
    selectMacro: null,
    macroInfo: {
      dks: 0,
      mode: 0,
      repeatCount: 1,
      repeatDelay: 1,
      macroMode: 0,
      selectName: null,
    },
    usedMacro: [],
    macroData: [], // v2版本的宏数据
    localMacros: [], // v1版本的宏数据
    recording: false,
  }),

  getters: {
    // 根据版本获取宏数据
    macros: (state) => {
      const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
      return isVersion2 ? state.macroData : state.localMacros;
    },
  },
  setters: {
    setMacroData(macroData) {
      this.localMacros = macroData;
    },
  },

  actions: {
    // 初始化本地宏数据
    initLocalMacros() {
      const data = service.getMacro();
      console.log('data', data);
      try {
        const storedMacros = localStorage.getItem('localMacros');
        if (storedMacros && storedMacros !== '[]') {
          this.localMacros = JSON.parse(storedMacros);
        } else {
          this.localMacros = [];
        }
      } catch (error) {
        console.error('Failed to parse localMacros from localStorage', error);
        this.localMacros = [];
      }
    },

    // v2获取所有宏
    async getMacroAllData() {
      for (let i = 0; i < 16; i++) {
        const name = `Macro${i}`;
        const res = await services.getMacroModeV2({ macroId: i });
        const { actNum } = res;
        // 拆分offset 最大长度15条
        const data = [];
        const offset = Math.ceil(actNum / 15);
        for (let j = 0; j < offset; j++) {
          const res = await this.getMacroData({ macroId: i, offset: j });
          const { macros } = res;
          data.push(...macros);
        }
        this.macroData.push({ name, ...res, data });
      }
      // console.log('all macro list', this.macroData);
      return this.macroData;
    },

    // v2获取宏数据
    async getMacroData({ macroId, offset }) {
      const res = await services.getMacroDataV2({ macroId, offset });
      return res;
    },

    async setMacro() {
      const macroList = JSON.parse(localStorage.getItem('localMacros')) || [];
      let index = null;
      for (let i = 0; i < macroList.length; i++) {
        if (macroList[i].id !== this.selectMacro.id) continue;
        index = i;
      }
      const { mode, repeatCount, repeatInterval, macroLength } = this.selectMacro;
      const data = {
        index,
        len: macroLength,
        mode,
        key: this.macroInfo.dks,
        num: repeatCount,
        delay: repeatInterval,
      };
      this.processDelays(this.selectMacro.data);
      const macros = this.selectMacro.data
        .filter((item) => item.keyType === 'key') // 筛选出 keyType 为 'key' 的项
        .map((item) => {
          return {
            keyCode: item.keyCode,
            timeDifference: item.timeDifference,
            type: item.type,
            status: item.status,
          };
        });
      // console.log('xasdas', macros);
      const result = await services.setMacro(data, macros);
      if (this.usedMacro.indexOf(this.selectMacro.id) < 0) this.usedMacro.push(this.selectMacro.id);
      // resetKeys();
      this.selectMacro = null;
      return result;
    },

    updateMacroRecord(flag) {
      this.recording = flag;
    },

    processDelays(data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].keyType === 'delay') {
          const delayValue = data[i].timeDifference;

          // 如果当前 delay 是第一项，或者前面连续的项都是 delay
          if (i === 0 || data[i - 1].keyType === 'delay') {
            let prevIndex = i - 1;
            let nextIndex = i + 1;

            // 向前查找第一个非 delay 的项
            while (prevIndex >= 0 && data[prevIndex].keyType === 'delay') {
              prevIndex--;
            }

            // 如果前面有非 delay 的项，则累加到前一项
            if (prevIndex >= 0) {
              data[prevIndex].timeDifference += delayValue;
            } else {
              // 否则，向后查找第一个非 delay 的项
              while (nextIndex < data.length && data[nextIndex].keyType === 'delay') {
                nextIndex++;
              }

              // 如果找到非 delay 的项，则累加 delay 的值
              if (nextIndex < data.length) {
                data[nextIndex].timeDifference += delayValue;
              }
            }
          } else {
            // 如果前一项是非 delay 的项，则直接累加到前一项
            data[i - 1].timeDifference += delayValue;
          }

          // 清除当前 delay 项的 timeDifference
          data[i].timeDifference = 0;
        }
      }
    },

    async setMacroData(macroData) {
      // 直接更新store中的localMacros
      this.localMacros = macroData;
    },

    // v1设置宏列表
    async setMacroData_V1(macroData) {
      // 直接更新store中的localMacros
      this.localMacros = macroData;
      // 存一份到本地
      localStorage.setItem('localMacros', JSON.stringify(macroData));
    },

    // 导入宏数据
    async importMacroData(macroData) {
      try {
        if (!macroData || !Array.isArray(macroData)) {
          console.error('Invalid macro data format');
          return false;
        }

        // 清空现有宏数据
        this.macroData = [];
        
        // 导入新的宏数据
        const maxMacros = 16; // 最多支持16个宏
        
        // 逐个处理宏配置
        for (let i = 0; i < Math.min(macroData.length, maxMacros); i++) {
          const macro = macroData[i];
          
          // 设置宏模式
          await services.setMacroModeV2({
            macroId: i,
            actNum: macro.actNum || macro.data?.length || 0,
            repNum: macro.repNum || macro.repeatCount || 1,
            mode: macro.mode || 0,
            valid: 1 // 设置为有效
          });
          
          // 设置宏数据
          if (macro.data && macro.data.length > 0) {
            // 每次最多发送15条数据，分批处理
            const batchSize = 15;
            for (let j = 0; j < macro.data.length; j += batchSize) {
              const batch = macro.data.slice(j, j + batchSize);
              const offset = Math.floor(j / batchSize);
              
              await services.setMacroDataV2({
                macroId: i,
                offset,
                actions: batch
              });
            }
          }
        }
        
        // 重新加载宏数据
        await this.getMacroAllData();
        
        // 强制触发响应式更新
        this.macroData = [...this.macroData];
        
        return true;
      } catch (error) {
        console.error('Import macro data error:', error);
        return false;
      }
    },
  },
});
export default useMacroStore;
