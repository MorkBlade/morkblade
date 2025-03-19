import { defineStore } from 'pinia';

import services from '@/services/index';

const state = {
  highLevelKeys: {},
};

const useHighLevelKeyStore = defineStore('highLevelKey', {
  state: () => state,
  getters: {},

  actions: {
    // 查询所有的key
    async getHighLevelKeys(keys) {
      for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < keys[i].length; j++) {
          const { advancedKeyMode, keyValue } = keys[i][j];
          // 1:dks 2:mpt 3:MT 4:TGL 5:END 6:MCR 8:SOCD 9:RS
          if (advancedKeyMode === 1) {
            this.getDks(keyValue);
          } else if (advancedKeyMode === 3) {
            this.getMt(keyValue);
          } else if (advancedKeyMode === 8) {
            // socd的时候会重置出两个值
            this.getSocd(keyValue);
          } else if (advancedKeyMode === 9) {
            // socd的时候会重置出两个值
            this.getRS(keyValue);
          }
        }
      }
    },

    // 设置socd
    async setSocd(data) {
      const { pos, key, type, mode } = data;
      const value = { pos1: pos[0], pos2: pos[1], key1: key[0], key2: key[1], type, mode };
      const result = await services.setSocd(value);
      return result;
    },

    // 查询当前高级键value
    async getSocd(keyValue) {
      const result = await services.getSocd(keyValue);
      const { pos1, pos2 } = result;
      let direction = 1;
      if (pos1 === keyValue) {
        direction = 1;
      }
      if (pos2 === keyValue) {
        direction = 2;
      }
      if (pos1 === keyValue && pos2 === keyValue) {
        direction = 1;
      }
      this.highLevelKeys[keyValue] = { keyValue, type: 'socd', socd: { ...result, direction } };
    },

    // 设置MT
    async setMT({ key, delay, dks }) {
      const result = await services.setMT({ key, delay: delay / 10, dks });
      return result;
    },

    // 查询MT
    async getMt(keyValue) {
      const result = await services.getMtorTgl(keyValue);
      const dksAll = await services.getDksAll(keyValue);
      this.highLevelKeys[keyValue] = { keyValue, type: 'mt', mt: { delay: result, dksAll } };
    },

    // 设置dks
    async setDks({ key, db, db2, dks, trps }) {
      const result = await services.setDks({ key, dbs: [db * 1000, db2 * 1000], dks, trps });
      return result;
    },

    // 查询dks
    async getDks(keyValue) {
      const db = await services.getDksTravel(keyValue, 'Layout_DB1');
      const db2 = await services.getDksTravel(keyValue, 'Layout_DB2');
      const dks = await services.getDksAll(keyValue);
      const trps = await services.getTrpsAll(keyValue);
      this.highLevelKeys[keyValue] = { keyValue, type: 'dks', dks: { ...dks }, trps: { ...trps }, db, db2 };
    },

    // 删掉对象了
    async deleteHighLevelKey(keyValue) {
      await services.deleteKey(keyValue);
      delete this.highLevelKeys[keyValue];
    },

    async getRS(keyValue) {
      const result = await services.getRS(keyValue);
      console.log('getRSgetRSgetRS', result);
      // const dksAll = await services.getDksAll(keyValue);
      this.highLevelKeys[keyValue] = { keyValue, type: 'rs', dks: { ...result } };
    },
    async setRS({ key, dks }) {
      const result = await services.setRS({ key, dks });
      return result;
    },
  },
});

export default useHighLevelKeyStore;
