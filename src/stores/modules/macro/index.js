import { defineStore } from 'pinia';

import services from '@/services/index';
import { resetKeys } from '@/utils/resetKeys';

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
  }),

  actions: {
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
      resetKeys();
      this.selectMacro = null;
      return result;
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
  },
});
export default useMacroStore;
