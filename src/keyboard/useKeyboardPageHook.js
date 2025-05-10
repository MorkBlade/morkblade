import { useKeyboardStore } from '@/stores';
import { useKeyboardHook } from '@/hooks';
import emitter from '@/utils/app-emitter';

/* ------------ 提取多平台共用逻辑方法 ------------ */
export const useKeyboardPageHook = () => {
  const keyboardStore = useKeyboardStore();

  const selectedKey = ref('');
  const checkedFn = ref(0);
  const formData = reactive({ type: 'win', fn: 0 });

  const activeKeys = computed(() => {
    return keyboardStore.activeKeys;
  });

  const handleAllSelect = () => {
    selectedKey.value = 'all-key';
    keyboardStore.selectAllKey();
    handleOperationKey('allSelect');
  };

  const handleCancelSelect = () => {
    selectedKey.value = 'cancel-all';
    keyboardStore.cancelSelectKey();
    handleOperationKey('cancelSelect');
  };

  const handleReverseSelect = () => {
    selectedKey.value = 'reverse-key';
    keyboardStore.reverseSelectKey();
    handleOperationKey('reverseSelect');
  };

  const handleWasdSelect = () => {
    selectedKey.value = 'wasd';
    keyboardStore.selectWasdKey();
    handleOperationKey('wasdSelect');
  };

  const handleNumSelect = () => {
    selectedKey.value = 'num-key';
    keyboardStore.selectNumKey();
    handleOperationKey('numSelect');
  };

  const handleLetterSelect = () => {
    selectedKey.value = 'letter-key';
    keyboardStore.selectLetterKey();
    handleOperationKey('letterSelect');
  };

  // 换层
  const handleFnChange = (event, isVersion2) => {
    console.log('handleFnChange', event, isVersion2);
    const fnVal = event.target.dataset.idx;
    checkedFn.value = Number(fnVal);
    formData.fn = fnVal;
    const { fn } = formData;
    if (isVersion2) {
      keyboardStore.checkFnLayer(fn);
      keyboardStore.initKeyboard();
    } else {
      keyboardStore.getLayoutKeyInfo(fn, keyboardStore.keyboards);
    }
  };

  const handleOperationKey = (value) => {
    if (value === 'wasdSelect' || value === 'numSelect' || value === 'letterSelect' || value === 'allSelect') {
      const [rowIndex, colIndex] = activeKeys.value[activeKeys.value.length - 1].split('-');
      emitter.emit('key-click', { rowIndex, colIndex });
    }
  };

  return {
    selectedKey,
    checkedFn,
    formData,
    activeKeys,
    handleAllSelect,
    handleCancelSelect,
    handleReverseSelect,
    handleWasdSelect,
    handleNumSelect,
    handleLetterSelect,
    handleFnChange,
    handleOperationKey,
  };
};
