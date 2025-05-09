import { defineStore } from 'pinia';

import services from '@/services/index';

const state = {
  highLevelKeys: {},
};

const useHighLevelKeyStore = defineStore('highLevelKey', {
  state: () => state,
  getters: {},

  actions: {
    // // 查询所有的key
    // async getHighLevelKeys(keys) {
    //   for (let i = 0; i < keys.length; i++) {
    //     for (let j = 0; j < keys[i].length; j++) {
    //       const { keyValue, performance } = keys[i][j];
    //       const advancedKeyMode = performance.advancedKeyMode;
    //       // console.log('advancedKeyMode: ', advancedKeyMode, performance);
    //       // 1:dks 2:mpt 3:MT 4:TGL 5:END 6:MCR 8:SOCD 9:RS
    //       if (advancedKeyMode === 1) {
    //         this.getDks(keyValue);
    //       } else if (advancedKeyMode === 2) {
    //         this.getMpt(keyValue);
    //       } else if (advancedKeyMode === 3) {
    //         console.log('is mt : ', keyValue);
    //         this.getMt(keyValue);
    //       } else if (advancedKeyMode === 4) {
    //         this.getTGL(keyValue);
    //       } else if (advancedKeyMode === 5) {
    //         this.getEnd(keyValue);
    //       } else if (advancedKeyMode === 8) {
    //         // socd的时候会重置出两个值
    //         this.getSocd(keyValue);
    //       } else if (advancedKeyMode === 9) {
    //         // socd的时候会重置出两个值
    //         this.getRS(keyValue);
    //       }
    //     }
    //   }
    // },
    // // 设置socd
    // async setSocd(data) {
    //   const { pos, key, type, mode } = data;
    //   const value = { pos1: pos[0], pos2: pos[1], key1: key[0], key2: key[1], type, mode };
    //   const result = await services.setSocd(value);
    //   return result;
    // },
    // // 查询当前高级键value
    // async getSocd(keyValue) {
    //   const result = await services.getSocd(keyValue);
    //   const { pos1, pos2 } = result;
    //   let direction = 1;
    //   if (pos1 === keyValue) {
    //     direction = 1;
    //   }
    //   if (pos2 === keyValue) {
    //     direction = 2;
    //   }
    //   if (pos1 === keyValue && pos2 === keyValue) {
    //     direction = 1;
    //   }
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'socd', socd: { ...result, direction } };
    // },
    // // 设置MT
    // async setMT({ key, delay, dks }) {
    //   const result = await services.setMT({ key, delay: delay / 10, dks });
    //   return result;
    // },
    // // 查询MT
    // async getMt(keyValue) {
    //   const result = await services.getMtorTgl(keyValue);
    //   const dksAll = await services.getDksAll(keyValue);
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'mt', mt: { delay: result, dksAll } };
    // },
    // // 设置dks
    // async setDks({ key, db, db2, dks, trps }) {
    //   const result = await services.setDks({ key, dbs: [db * 1000, db2 * 1000], dks, trps });
    //   return result;
    // },
    // // 查询dks
    // async getDks(keyValue) {
    //   const db = await services.getDksTravel(keyValue, 'Layout_DB1');
    //   const db2 = await services.getDksTravel(keyValue, 'Layout_DB2');
    //   const dks = await services.getDksAll(keyValue);
    //   const trps = await services.getTrpsAll(keyValue);
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'dks', dks: { ...dks }, trps: { ...trps }, db, db2 };
    // },
    // // 删掉对象了
    // async deleteHighLevelKey(keyValue) {
    //   await services.deleteKey(keyValue);
    //   delete this.highLevelKeys[keyValue];
    // },
    // async getRS(keyValue) {
    //   const result = await services.getRS(keyValue);
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'rs', dks: { ...result } };
    // },
    // async setRS({ key, dks }) {
    //   const result = await services.setRS({ key, dks });
    //   return result;
    // },
    // // 设置END
    // async setEnd(data, v) {
    //   const { key, ...endInfo } = data;
    //   console.log(endInfo);
    //   const result = await services.setEND({ key, ...endInfo }, v);
    //   return result;
    // },
    // // END
    // async getEnd(keyValue) {
    //   const result = await services.getEND(keyValue);
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'end', end: { ...result } };
    //   return result;
    // },
    // // TGL
    // async getTGL(keyValue) {
    //   const result = await services.getTGL(keyValue);
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'tgl', tgl: { ...result } };
    //   return result;
    // },
    // async setTGL(data) {
    //   const { key, ...tglInfo } = data;
    //   const result = await services.setTGL({ key, ...tglInfo });
    //   return result;
    // },
    // // 设置MPT
    // async setMpt(data) {
    //   const { key, ...mptInfo } = data;
    //   const result = await services.setMpt({ key, ...mptInfo });
    //   return result;
    // },
    // // MPT
    // async getMpt(keyValue) {
    //   const result = await services.getMpt(keyValue);
    //   this.highLevelKeys[keyValue] = { keyValue, type: 'mpt', mpt: { ...result } };
    //   return result;
    // },
    async getMacro(keyValue) {
      const result = await services.getMacro(keyValue);
      this.highLevelKeys[keyValue] = { keyValue, type: 'macro', macro: { ...result } };
      return result;
    },
  },
});

export default useHighLevelKeyStore;
