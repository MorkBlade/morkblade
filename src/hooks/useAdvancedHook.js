import { useKeyboardStore, usePerformanceStore } from '@/stores';
import services from '@/services/index';

/* -------- v1 v2获取高级键的数据解构不一致，这里一致将v1数据结构转成和v2一致进行存储 --------*/
export const useAdvancedHook = () => {
  const keyboardStore = useKeyboardStore();
  const performanceStore = usePerformanceStore();
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

  // 查询MT
  const getMT = async (params) => {
    if (isVersion2) {
      const { keyValue, data, row, col, mode } = params;
      const { kcs, time } = data.data;
      const mtData = { keyValue, type: 'mt', mode, mt: { delay: time, dksAll: [...kcs] } };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        mt: mtData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      const { keyValue, row, col, mode } = params;
      const result = await services.getMtorTgl(keyValue);
      const dksAll = await services.getDksAll(keyValue);
      const mtData = {
        keyValue,
        type: 'mt',
        mt: { delay: result, dksAll: [dksAll.dks1, dksAll.dks2, dksAll.dks3, dksAll.dks4] },
      };
      console.log('get MT V1:>>>>>>>>>>> ', mtData);
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        mt: mtData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置MT
  const setMT = async (params) => {
    let result = null;
    let mtData = null;
    const { key, row, col, delay, dks } = params;
    if (isVersion2) {
      const data = { time: delay, kcs: [...dks] };
      result = await services.setHigherKeyMTV2({ key, row, col, data });
      mtData = {
        keyValue: key,
        data: result,
        row,
        col,
        mode: 3,
      };
    } else {
      result = await services.setMT({ key, delay: delay / 10, dks });
      mtData = {
        keyValue: key,
        row,
        col,
        mode: 3,
      };
    }
    getMT(mtData);
    return result;
  };

  // TODO 高级键rs渲染可能有问题/v1高级键列表渲染比获取数据快，得排查

  // 查询RS
  const getRS = async (params) => {
    if (isVersion2) {
      console.log('getRS V2 log params:>>>>>', params);
      const { keyValue, row, col, mode, data } = params;
      const { kcs, delay } = data.data;
      const rsData = { keyValue, type: 'rs', mode, rs: [...kcs], delay };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        rs: rsData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      const { keyValue, row, col, mode } = params;
      const result = await services.getRS(keyValue);
      console.log('getRS v1', params, result);
      const rsData = { keyValue, type: 'rs', rs: [result.dks1, result.dks2] };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        rs: rsData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置RS
  const setRS = async (params) => {
    let result = null;
    let dksData = null;
    console.log('setRS log params: ', params);
    const { key, row, col, dks, delay } = params;
    if (isVersion2) {
      const data = { kcs: [...dks], delay };
      result = await services.setHigherKeyRSV2({ row, col, data });
      console.log('setRS V2', result);
      dksData = {
        keyValue: key,
        data: result,
        row,
        col,
        mode: 9,
      };
      getRS(dksData);
    } else {
      result = await services.setRS({ key: dks[0], dks: dks[1] });
      const socdKey = getRowCol(dks);
      const [[row, col], [row2, col2]] = socdKey.map((item) => item.split('-').map(Number));
      getRS({ keyValue: dks[0], row, col, mode: 9 });
      getRS({ keyValue: dks[1], row: row2, col: col2, mode: 9 });
    }
    return result;
  };

  // 查询MT
  const getTGL = async (params) => {
    if (isVersion2) {
      const { keyValue, data, row, col, mode } = params;
      const { kcs, time } = data.data;
      const mtData = { keyValue, type: 'tgl', mode, tgl: { delay: time, dksAll: [kcs] } };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        tgl: mtData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      const { keyValue, row, col, mode } = params;
      const result = await services.getMtorTgl(keyValue);
      const dksAll = await services.getDksAll(keyValue);
      const mtData = { keyValue, type: 'tgl', tgl: { delay: result, dksAll: [dksAll.dks1] } };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        tgl: mtData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置tgl
  const setTGL = async (params) => {
    let result = null;
    let tglData = null;
    const { key, row, col, delay, dks } = params;
    if (isVersion2) {
      const data = { kcs: dks, delay };
      result = await services.setHigherKeyTGLV2({ key, row, col, data });
      tglData = {
        keyValue: key,
        data: result,
        row,
        col,
        mode: 4,
      };
    } else {
      result = await services.setTGL({ key, delay, dks });
      tglData = {
        keyValue: key,
        row,
        col,
        mode: 4,
      };
    }
    getTGL(tglData);
    return result;
  };

  // 查询MPT
  const getMPT = async (params) => {
    if (isVersion2) {
      const { keyValue, data, row, col, mode } = params;
      const { kcs, dbs } = data.data;
      const mptData = { keyValue, type: 'mpt', mode, dks: [...kcs], dbs: [...dbs] };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        mpt: mptData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      const { keyValue, row, col, mode } = params;
      const result = await services.getMpt(keyValue);
      const mptData = { keyValue, type: 'mpt', dks: [...result.dks], dbs: [...result.dbs] };
      console.log('getMPT v1', mptData);
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        mpt: mptData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置MPT
  const setMPT = async (params) => {
    let result = null;
    let mptData = null;
    const { key, row, col, dks, dbs } = params;
    if (isVersion2) {
      // const dbsAll = dbs.map((item) => item * 1000);
      const data = { kcs: [...dks], dbs: [...dbs] };
      result = await services.setHigherKeyMPTV2({ row, col, data });
      // console.log('setMPT V2', result);
      mptData = {
        keyValue: key,
        data: result,
        row,
        col,
        mode: 2,
      };
    } else {
      result = await services.setMpt({ key, dks, dbs });
      mptData = {
        keyValue: key,
        row,
        col,
        mode: 2,
      };
    }
    getMPT(mptData);
    return result;
  };

  // 查询END
  const getEND = async (params) => {
    if (isVersion2) {
      const { keyValue, row, col, mode, data } = params;
      const { kcs, delay } = data.data;
      const endData = { keyValue, type: 'end', mode, end: { dks: [...kcs], delay } };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        end: endData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      // console.log('getEND v1', params);
      const { keyValue, row, col, mode } = params;
      const result = await services.getEND(keyValue);
      const endData = { keyValue, type: 'end', end: { dks: [keyValue, result.dks], delay: result.delay } };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        end: endData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置END
  const setEND = async (params) => {
    let result = null;
    let endData = null;
    // console.log('setEND log params: ', params);
    const { key, row, col, dks, delay, version } = params;
    if (isVersion2) {
      // TODO v2的end可以绑定两个键值，暂时先用选中的key和绑定的key作为两个绑定的键值
      const data = { kcs: [key, dks], delay };
      result = await services.setHigherKeyENDV2({ key, row, col, data });
      console.log('setEND V2', result);
      endData = {
        keyValue: key,
        data: result,
        row,
        col,
        mode: 5,
      };
    } else {
      result = await services.setEND({ key, dks, delay }, version);
      endData = {
        keyValue: key,
        row,
        col,
        mode: 5,
      };
    }
    getEND(endData);
    return result;
  };

  // 查询DKS
  const getDKS = async (params) => {
    if (isVersion2) {
      // console.log('getDKS V2 log params:>>>>>', params);
      const { keyValue, row, col, mode, data } = params;
      const { kcs, trps, dbs } = data.data;
      const db = dbs[0];
      const db2 = dbs[1];
      const dks = kcs;
      const dksData = { keyValue, type: 'dks', mode, dks: [...dks], trps: [...trps], db, db2 };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        dks: dksData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      const { keyValue, row, col, mode } = params;
      const db = await services.getDksTravel(keyValue, 'Layout_DB1');
      const db2 = await services.getDksTravel(keyValue, 'Layout_DB2');
      const dks = await services.getDksAll(keyValue);
      const trps = await services.getTrpsAll(keyValue);
      // const dksData = { keyValue, type: 'dks', dks: { ...dks }, trps: { ...trps }, db, db2 };
      const dksData = {
        keyValue,
        type: 'dks',
        mode,
        dks: [dks.dks1, dks.dks2, dks.dks3, dks.dks4],
        trps: [trps.trps1, trps.trps2, trps.trps3, trps.trps4],
        db,
        db2,
      };
      console.log('getEND v1', params, dksData);
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        dks: dksData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置DKS
  const setDKS = async (params) => {
    let result = null;
    let dksData = null;
    // console.log('setEND log params: ', params);
    const { key, row, col, db, db2, dks, trps } = params;
    if (isVersion2) {
      const data = { kcs: [...dks], trps: [...trps], dbs: [db, db2] };
      result = await services.setHigherKeyDKSV2({ row, col, data });
      // console.log('setDKS V2', result);
      dksData = {
        keyValue: key,
        data: result,
        row,
        col,
        mode: 1,
      };
    } else {
      result = await services.setDks({ key, dbs: [db * 1000, db2 * 1000], dks, trps });
      dksData = {
        keyValue: key,
        row,
        col,
        mode: 1,
      };
    }
    getDKS(dksData);
    return result;
  };

  // 查询socd
  const getSocd = async (params) => {
    if (isVersion2) {
      const { keyValue, data, row, col, mode } = params;
      const { socdMode, kcs } = data.data;
      const socdData = { keyValue, type: 'socd', mode, socdMode, socd: [...kcs] };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        socd: socdData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    } else {
      const { keyValue, data, row, col, mode } = params;
      const result = await services.getSocd(keyValue);
      const { mode: socdMode } = result;
      const storedSocdKeys = JSON.parse(localStorage.getItem('socdKeys') || '{}');
      const socdKeys = storedSocdKeys[keyValue] || [];
      console.log('getSocd v1', params, result, storedSocdKeys[keyValue], storedSocdKeys);
      const socdData = { keyValue, type: 'socd', mode, socdMode, socd: [...socdKeys] };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        socd: socdData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 设置socd
  const setSocd = async (params) => {
    if (isVersion2) {
      // const { row, col, row2, col2, mode: socdMode, delay, kcs } = params;
      const { key, mode, delay } = params;
      // console.log('params', key);
      const socdKey = getRowCol(key);
      const [[row, col], [row2, col2]] = socdKey.map((item) => item.split('-').map(Number));
      const data = { row, col, row2, col2, kcs: key, socdMode: mode, delay };
      const results = await services.setHigherKeySOCDV2(data);
      const [resultA, resultB] = results;
      // console.log('setSocd', resultA, resultB);
      getSocd({ keyValue: key[0], data: resultA, row: resultA.row, col: resultA.col, mode: 6 });
      getSocd({ keyValue: key[1], data: resultB, row: resultB.row, col: resultB.col, mode: 6 });
      return results;
    } else {
      const { pos, key, type, mode } = params;
      const socdKey = getRowCol(key);
      const [[row, col], [row2, col2]] = socdKey.map((item) => item.split('-').map(Number));
      const data = { pos1: pos[0], pos2: pos[1], key1: key[0], key2: key[1], type, mode };
      const result = await services.setSocd(data);
      // console.log('v1 setSocd', data, result);
      // v1 获取socd数据缺少关联性，暂时用localStorage存对应关系
      const storedSocdKeys = JSON.parse(localStorage.getItem('socdKeys') || '{}');
      storedSocdKeys[key[0]] = [...key];
      storedSocdKeys[key[1]] = [...key];
      localStorage.setItem('socdKeys', JSON.stringify(storedSocdKeys));

      getSocd({ keyValue: key[0], data: null, row: row, col: col, mode: 8 });
      getSocd({ keyValue: key[1], data: null, row: row2, col: col2, mode: 8 });
      return result;
    }
  };

  // 删除高级键
  const delAdvancedConfig = async (advanced, advancedType) => {
    try {
      if (isVersion2) {
        await handleV2Deletion(advanced, advancedType);
      } else {
        await handleV1Deletion(advanced, advancedType);
      }
    } catch (error) {
      console.error('Error in delAdvancedConfig:', error);
      throw error;
    }
  };

  const handleV2Deletion = async (advanced, advancedType) => {
    const resetAdvancedKeys = {
      advancedType: '',
      value: 0,
      dks: null,
      mpt: null,
      mt: null,
      tgl: null,
      end: null,
      socd: null,
      macro: null,
    };

    if (advancedType === 'socd') {
      const { socd } = advanced;
      const socdKey = getRowCol(socd.socd);
      const [[row, col], [row2, col2]] = socdKey.map((item) => item.split('-').map(Number));

      await Promise.all([
        services.setHigherKeyNONEV2({ row, col, data: { mode: 0 } }),
        services.setHigherKeyNONEV2({ row: row2, col: col2, data: { mode: 0 } }),
      ]);

      keyboardStore.keyboards[row][col].advancedKeys = { ...resetAdvancedKeys };
      keyboardStore.keyboards[row2][col2].advancedKeys = { ...resetAdvancedKeys };
    } else {
      const { row, col } = advanced;
      await services.setHigherKeyNONEV2({ row, col, data: { mode: 0 } });
      keyboardStore.keyboards[row][col].advancedKeys = { ...resetAdvancedKeys };
    }
  };

  const handleV1Deletion = async (advanced, advancedType) => {
    const keysToDelete = [];

    if (advancedType === 'socd') {
      const storedSocdKeys = JSON.parse(localStorage.getItem('socdKeys') || '{}');
      const socdKeys = storedSocdKeys[advanced.keyValue] || [];
      keysToDelete.push(...socdKeys);
    } else if (advancedType === 'rs') {
      const { rs } = advanced;
      keysToDelete.push(...rs.rs);
    } else {
      keysToDelete.push(advanced.keyValue);
    }

    await Promise.all(keysToDelete.map((key) => services.deleteKey(key)));
    await performanceStore.getKeyPerformanceV1(keyboardStore.keyboards);
  };

  // 获取宏
  const getMacro = async (params) => {
    if (isVersion2) {
    } else {
      const { keyValue, row, col, mode } = params;
      const result = await services.getMacro(keyValue);
      const macroData = {
        keyValue,
        type: 'macro',
        macro: { keyValue, type: 'macro', macro: { ...result } },
      };
      const advancedKeys = {
        ...keyboardStore.keyboards[row][col].advancedKeys,
        macro: macroData,
        advancedType: mode,
      };
      keyboardStore.keyboards[row][col].advancedKeys = advancedKeys;
    }
  };

  // 初始化高级键数据
  const getHighLevelKeys = async (keyboards) => {
    try {
      const processKey = async (keyValue, data, row, col, mode) => {
        if (!keyValue) return;

        const handlers = {
          1: () => getDKS({ keyValue, data, row, col, mode }),
          2: () => getMPT({ keyValue, data, row, col, mode }),
          3: () => getMT({ keyValue, data, row, col, mode }),
          4: () => getTGL({ keyValue, data, row, col, mode }),
          5: () => getEND({ keyValue, data, row, col, mode }),
          6: () =>
            isVersion2 ? getSocd({ keyValue, data, row, col, mode }) : getMacro({ keyValue, data, row, col, mode }), // v2 socd, v1 macro
          7: () => getRS({ keyValue, data, row, col, mode }), // v2
          8: () => getSocd({ keyValue, data, row, col, mode }), // v1
          9: () => getRS({ keyValue, data, row, col, mode }), // v1
        };

        const handler = handlers[mode];
        if (handler) {
          await handler();
        }
      };

      if (isVersion2) {
        for (let row = 0; row < keyboards.length; row++) {
          for (let col = 0; col < keyboards[row].length; col++) {
            const { keyValue } = keyboards[row][col];
            if (!keyValue) continue;

            try {
              const result = await services.getHigherKeyV2({ row, col });
              // console.log('getHighLevelKeys result', result);
              const data = result;
              const advancedKeyMode = data.mode;
              await processKey(keyValue, data, row, col, advancedKeyMode);
            } catch (error) {
              console.error(`Error processing key at row ${row}, col ${col}:`, error);
            }
          }
        }
      } else {
        // console.log('start match advanced mode------------------------>');
        for (let row = 0; row < keyboards.length; row++) {
          for (let col = 0; col < keyboards[row].length; col++) {
            const { keyValue, performance } = keyboards[row][col];
            if (!keyValue) continue;
            // console.log(`当前按键是：${keyValue}, 模式是： ${performance.advancedKeyMode}`);
            const advancedKeyMode = performance.advancedKeyMode;
            // v1版本不需要data参数，传入null
            await processKey(keyValue, null, row, col, advancedKeyMode);
          }
        }
      }
    } catch (error) {
      console.error('Error in getHighLevelKeys:', error);
      throw error;
    }
  };

  return {
    setMT,
    setRS,
    setTGL,
    setMPT,
    setEND,
    setDKS,
    setSocd,
    getMacro,
    getHighLevelKeys,
    delAdvancedConfig,
  };
};

/**
 *
 * @param {Array} keys // keyValue数组
 * @returns
 */
const getRowCol = (keys) => {
  const socdKey = [];
  const keyboardStore = useKeyboardStore();
  for (let row = 0; row < keyboardStore.keyboards.length; row++) {
    for (let col = 0; col < keyboardStore.keyboards[row].length; col++) {
      if (keyboardStore.keyboards[row][col].keyValue === keys[0]) {
        socdKey.push(`${row}-${col}`);
      }
      if (keyboardStore.keyboards[row][col].keyValue === keys[1]) {
        socdKey.push(`${row}-${col}`);
      }
    }
  }
  return socdKey;
};
