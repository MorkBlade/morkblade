import { defineStore } from 'pinia';

import services from '@/services/index';

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
      const macros = this.selectMacro.data.map((item) => {
        return {
          keyCode: item.keyCode,
          timeDifference: item.timeDifference,
          type: item.type,
        };
      });
      console.log('xasdas', macros);
      const result = await services.setMacro(data, macros);
      this.selectMacro = null;
      return result;
    },
  },
});
export default useMacroStore;
