// import emitter from '@/utils/app-emitter';
import { useKeyboardStore } from '@/stores';

/* ------------ 提取多平台共用逻辑方法 ------------ */
export const usePerformancePageHook = () => {
  const keyboardStore = useKeyboardStore();

  const rowIdx = ref(null);
  const colIdx = ref(null);
  const option = { max: 3.3, min: 0, step: 0.001 };

  const activeKeys = computed(() => {
    return keyboardStore.activeKeys;
  });

  const disabled = computed(() => {
    return activeKeys.value.length === 0;
  });

  const hasCurrentKey = computed(() => {
    return activeKeys.value.includes(`${rowIdx.value}-${colIdx.value}`);
  });

  // 添加防抖函数
  const debounce = (fn, delay) => {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };

  return {
    rowIdx,
    colIdx,
    option,
    activeKeys,
    disabled,
    debounce,
    hasCurrentKey,
  };
};
