
// import { createPinia } from 'pinia';

import { useLightSettingStore } from './modules/light/index.js';
import useDeviceStore from './modules/device/index.js';
import useKeyboardStore from './modules/keyboard/index.js';
import usePerformanceStore from './modules/performance/index.js';
import useAppStore from './modules/app/index.js';
import useMacroStore from './modules/macro/index.js';
import useHighLevelKeyStore from './modules/high-level-key/index.js';

import keyboardStore from './modules/keyboard/index.js';

const pinia = createPinia();


// const light = await handleLightingData();
// const system = await handleSystemData();
// const keyboards = await handleKeyboardData();  
// const keyboardStore = useKeyboardStore();
// console.log('keyboards: ', keyboardStore);
// await keyboardStore.getLayoutKeyInfo(0, false);
// await keyboardStore.getLayoutKeyInfo(1, false);
// await keyboardStore.getLayoutKeyInfo(2, false);
// await keyboardStore.getLayoutKeyInfo(3, false);
// const macro = handleMacroData();
// const data = {
//   light,
//   keyboards,
//   system,
//   macro,
// };
// console.log('data: ', data);
// services.exportConfig(data); 


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
