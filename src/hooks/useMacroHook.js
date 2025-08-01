
import { useMacroStore } from '@/stores';
import services from '@/services/index';

export const useMacroHook = () => {
  const macroStore = useMacroStore();

  // v2获取所有宏
  const getMacroAllDataV2 = async () => {
    for (let i = 0; i < 16; i++) {
      const name = `Macro${i}`;
      const res = await services.getMacroModeV2({ macroId: i });
      const { actNum } = res;
      // 拆分offset 最大长度15条
      const data = [];
      const offset = Math.ceil(actNum / 15);
      for (let j = 0; j < offset; j++) {
        const res = await getMacroDataV2({ macroId: i, offset: j });
        const { macros } = res;
        data.push(...macros);
      }
      macroStore.macroData.push({ name, ...res, data });
    }
  };

  // v2获取宏数据
  const getMacroDataV2 = async ({ macroId, offset }) => {
    const res = await services.getMacroDataV2({ macroId, offset });
    return res;
  };

  // v1设置宏
  const setMacroV1 = async (macroList_) => {
    // console.log('macroList', macroList);
    const macroList = macroList_ || [];
    let index = null;
    for (let i = 0; i < macroList.length; i++) {
      if (macroList[i].id !== macroStore.selectMacro.id) continue;
      index = i;
    }
    const { mode, repeatCount, repeatInterval, macroLength } = macroStore.selectMacro;
    const data = {
      index,
      len: macroLength,
      mode,
      key: macroStore.macroInfo.dks,
      num: repeatCount,
      delay: repeatInterval,
    };
    processDelays(macroStore.selectMacro.data);
    const macros = macroStore.selectMacro.data
      .filter((item) => item.keyType === 'key') // 筛选出 keyType 为 'key' 的项
      .map((item) => {
        return {
          keyCode: item.keyCode,
          timeDifference: item.timeDifference,
          type: item.type === 'keyup' ? 0 : 1,
          status: item.status,
        };
      });

    const result = await services.setMacro(data, macros);
    if (macroStore.usedMacro.indexOf(macroStore.selectMacro.id) < 0)
      macroStore.usedMacro.push(macroStore.selectMacro.id);
    // TODO 设置宏后还要更新按键状态
    // resetKeys();
    macroStore.selectMacro = null;
    return result;
  };


  // v2设置宏模式
  const setMacroModeV2 = async ({ actNum, repNum, mode, macroId, valid }) => {
    const res = await services.setMacroModeV2({ actNum, repNum, mode, macroId, valid });
    return res;
  };

  // 编辑宏数据
  const setMacroV2 = async ({ macroId, data }) => {
    const macroData = [];
    const offset = Math.ceil(data.length / 15);
    for (let i = 0; i < offset; i++) {
      const res = await services.setMacroDataV2({
        macroId: macroId,
        offset: i,
        actions: data.slice(i * 15, (i + 1) * 15),
      });
      macroData.push({ ...res });
    }
    return macroData;
  };

  return {
    setMacroV1,
    setMacroModeV2,
    setMacroV2,
    getMacroAllDataV2,
  };
};

const processDelays = (data) => {
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
};
