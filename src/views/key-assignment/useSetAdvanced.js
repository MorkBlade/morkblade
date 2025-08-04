
import keyboard from '@/configs/byte-to-key/keyboard.js';
import { ElMessage } from 'element-plus';
import { useAdvancedHook } from '@/hooks';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { useI18n } from 'vue-i18n';

import sureIcon from '@/assets/images/sure.svg';

const useSetAdvanced = () => {
  const { t } = useI18n();
  const keyboardStore = useKeyboardStore();
  const performanceStore = usePerformanceStore();
  const { getHighLevelKeys } = useAdvancedHook();
  const childRef = useTemplateRef('childRef');

  const minTouchTravel = ref(0);
  const maxTouchTravel = ref(10);
  const precision = ref(0);
  const hasAdvancedData = ref(false);

  const selectedKeyType = ref(null);
  const selectedCenterItem = reactive({
    value: null,
  });
  const selectedCenterKeyId = ref(null);
  // socdInfo
  const socdInfo = reactive({ pos: [0, 0], key: [0, 0], type: 0, mode: 0, delay: 100 });
  // dksInfo
  const dksInfo = reactive({ dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.4, db2: 3.0 });
  // mtInfo
  const mtInfo = reactive({ dks: [0, 0], delay: 200 });
  // rsInfo
  const rsInfo = reactive({ dks: [0, 0], delay: 200 });
  // mptInfo
  const mptInfo = reactive({ dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] });
  // tglInfo
  const tglInfo = reactive({ dks: 0, delay: 200 });
  // endInfo
  const endInfo = reactive({ dks: 0, delay: 200 });

  const edit = ref(false);
  const editKey = ref(0);

  const handleItemClick = (item) => {
    selectedCenterItem.value = item;
    selectedCenterKeyId.value = item.keyId;

    // TODO:这里的type都是小写后面要改为大写
    selectedKeyType.value = item.type.toUpperCase();
    edit.value = true;
    editKey.value = item.keyValue;
    // 解析
    if (item.type === 'socd') {
      const { key1, key2, pos1, pos2, type, mode } = item.socd;
      socdInfo.key = [key1, key2];
      socdInfo.pos = [pos1, pos2];
      socdInfo.type = type;
      socdInfo.mode = mode;
    } else if (item.type === 'dks') {
      const { dks, trps, db, db2 } = item;
      const { dks1, dks2, dks3, dks4 } = dks;
      dksInfo.dks = [dks1, dks2, dks3, dks4];
      dksInfo.trps = [trps.trps1, trps.trps2, trps.trps3, trps.trps4];
      dksInfo.db = db;
      dksInfo.db2 = db2;
    } else if (item.type === 'mt') {
      const { mt } = item;
      const { dksAll, delay } = mt;
      mtInfo.dks = [dksAll.dks1, dksAll.dks2];
      mtInfo.delay = delay;
    }
  };

  const handleKeyTypeChange = (type) => {
    // 初始化调用的
    // console.log('handleKeyTypeChange log11111');
    if (type === selectedKeyType.value) {
      selectedKeyType.value = '';
      return;
    }
    if (type !== 'SOCD' && activeKeys.value.length === 0) {
      return;
    }

    // 编辑的时候会覆盖值
    if (type === 'MT') {
      Object.assign(mtInfo, { dks: [0, 0], delay: 200 });
    } else if (type === 'DKS') {
      Object.assign(dksInfo, { dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.5, db2: 3.0 });
    } else if (type === 'SOCD') {
      Object.assign(socdInfo, { pos: [0, 0], key: [0, 0], type: 0, mode: 0, delay: 100 });
    } else if (type === 'RS') {
      Object.assign(rsInfo, { dks: [0, 0] });
    } else if (type === 'MPT') {
      Object.assign(mptInfo, { dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] });
    } else if (type === 'END') {
      Object.assign(endInfo, { dks: 0, delay: 200 });
    } else if (type === 'TGL') {
      Object.assign(tglInfo, { dks: 0, delay: 200 });
    } else if (type === 'MACRO') {
      Object.assign(macroInfo, { dks: 0, macroMode: 0, selectName: null, mode: 0, repeatCount: 1, repeatDelay: 1 });
    }

    // console.log('handleKeyTypeChange log22222');
    // 打开弹窗
    edit.value = false;
    editKey.value = 0;
    selectedKeyType.value = type;
  };

  const handleDialoConfirm = async () => {
    try {
      const res = await childRef.value?.save();
      // TODO 数据结构改变后不需要调用，待验证
      // await resetKeys();
      if (res) {
        ElMessage({
          grouping: true,
          duration: 1000,
          dangerouslyUseHTMLString: true,
          message: `<span class="custom-message"><img src="${sureIcon}" class="warn-icon"/>${t('useSetAdvanced.modifySuccess')}</span>`,
          customClass: 'custom-message-container',
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      selectedKeyType.value = '';
    }
  };

  const resetDefaultValue = () => {
    if (childRef?.value && typeof childRef.value.reset === 'function') {
      childRef.value.reset();
    }
  };

  const resetKeys = async () => {
    // console.log('onMounted resetKeys start=======================>', keyboardStore.keyboards.length);
    await getHighLevelKeys(keyboardStore.keyboards);
    // console.log('onMounted resetKeys over=======================>');
    hasAdvancedData.value = true;
  };

  onMounted(async () => {
    // console.log('advnaced onMounted----------------------->');
    // resetKeys();
    try {
      const travelData = await performanceStore.getMaxMinTravel();
      if (travelData) {
        const { maxTouchTravel: max, minTouchTravel: min, precision: step } = travelData;
        minTouchTravel.value = min;
        maxTouchTravel.value = max;
        precision.value = step;
      } else {
        // console.error('getMaxMinTravel returned null or undefined');
        // Set default values or handle the error as needed
        minTouchTravel.value = 0;
        maxTouchTravel.value = 4;
        precision.value = 0;
      }
    } catch (error) {
      // console.error('Error fetching max/min travel:', error);
      // Handle the error, possibly setting default values
      minTouchTravel.value = 0;
      maxTouchTravel.value = 4;
      precision.value = 0;
    }
  });

  // 计算当前的高级键
  const advancedItems = computed(() => {
    const value = [];
    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
    // if (hasAdvancedData.value) {
    const keyboards = keyboardStore.keyboards;
    if (Array.isArray(keyboards)) {
      keyboards.forEach((row, rowIdx) => {
        if (Array.isArray(row)) {
          row.forEach((col, colIdx) => {
            if (
              col &&
              col.advancedKeys &&
              col.advancedKeys.advancedType !== 0 &&
              col.advancedKeys.advancedType !== null &&
              col.advancedKeys.advancedType !== ''
            ) {
              // console.log('current key is advanced:>>>>>>>>>>', col);
              // 只收集advancedKeys下不为null的属性
              const advancedKeys = col.advancedKeys;
              const filtered = {};
              Object.keys(advancedKeys).forEach((k) => {
                if (advancedKeys[k] !== null) {
                  filtered[k] = advancedKeys[k];
                }
              });
              value.push({
                row: rowIdx,
                col: colIdx,
                keyValue: col.keyValue,
                ...filtered,
              });
            }
          });
        }
      });
    }
    // }
    // console.log('advancedItems', value);
    return value;
  });
  // 计算当前选择的高级键
  const activeKeys = computed(() => {
    return keyboardStore.activeKeys;
  });

  return {
    edit,
    editKey,
    childRef,
    socdInfo,
    dksInfo,
    mtInfo,
    rsInfo,
    mptInfo,
    tglInfo,
    endInfo,
    maxTouchTravel,
    minTouchTravel,
    precision,
    handleKeyTypeChange,
    handleDialoConfirm,
    resetDefaultValue,
    advancedItems,
    handleItemClick,
    keyboardStore,
  };
};

export default useSetAdvanced;
