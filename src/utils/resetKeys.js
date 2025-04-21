import { useHighLevelKeyStore, useKeyboardStore, usePerformanceStore } from '@/stores';

export async function resetKeys() {
  const keyboardStore = useKeyboardStore();
  const performanceStore = usePerformanceStore();
  const highLevelKeyStore = useHighLevelKeyStore();
  await performanceStore.getKeyPerformance(keyboardStore.keyboards);
  const { value } = performanceStore;
  await highLevelKeyStore.getHighLevelKeys(value);
}
