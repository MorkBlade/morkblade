// import { createPinia } from 'pinia';

import { useLightSettingStore } from './modules/light/index.js';
import useDeviceStore from './modules/device/index.js';
import useKeyboardStore from './modules/keyboard/index.js';
import usePerformanceStore from './modules/performance/index.js';
import useAppStore from './modules/app/index.js';
import useMacroStore from './modules/macro/index.js';
import useHighLevelKeyStore from './modules/high-level-key/index.js';

const pinia = createPinia();

export {
  useLightSettingStore,
  useDeviceStore,
  useKeyboardStore,
  usePerformanceStore,
  useAppStore,
  useMacroStore,
  useHighLevelKeyStore,
};

// 默认导出 pinia 实例
export default pinia;
