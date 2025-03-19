<template>
  <div class="mode-container">
    <travelTestCard />
    <div class="keystroke">
      <setTravelCard
        :sliderVal="singleTravel"
        :min="min"
        :max="max"
        :title="title"
        :offsetX="280"
        :disabled="disabled"
        @sendKeyVal="handleTriggerPointChange"
      />
    </div>
    <saveConfig :travelVal="singleTravel" @saveSingleTravel="saveSingleConfig" />
  </div>
</template>

<script setup>
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import emitter from '@/utils/app-emitter';
import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';

const min = 0; // 最小值
const max = 4; // 最大值
const title = '按键行程设置';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const singleTravel = ref(performanceStore.singleTouchTravel);

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const performanceValue = computed(() => {
  return performanceStore.value;
});

const disabled = computed(() => {
  return activeKeys.value.length === 0;
});

const hasCurrentKey = computed(() => {
  return activeKeys.value.includes(`${currentKeyX.value}-${currentKeyY.value}`);
});

const currentKeyX = ref(null);
const currentKeyY = ref(null);

emitter.on('key-click', ({ colIndex, rowIndex }) => {
  currentKeyX.value = colIndex;
  currentKeyY.value = rowIndex;
  if (hasCurrentKey.value) {
    const { touchMode, single } = performanceValue.value[rowIndex][colIndex];
    if (touchMode === 'single' || touchMode === 'rt') {
      singleTravel.value = typeof single.singleTravel === 'number' ? single.singleTravel : Number(single.singleTravel);
    }
  }
});

const rtEnabled = ref(false);
emitter.on('rt-enabled', ({ value }) => {
  rtEnabled.value = value;
});

// 设置选中的为触发模式改单键程触发
const handleTriggerPointChange = async (value) => {
  // 拿到选中的键值
  singleTravel.value = value;
  // const selectedKeyValues = keyboardStore.activeKeys;
  const performanceValue = performanceStore.value;
  const touchMode = rtEnabled.value ? 'rt' : 'single';
  const promises = activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    performanceValue[y][x].touchMode = touchMode;
    performanceValue[y][x].single.singleTravel = value;
  });
  await Promise.all(promises);
};

const saveSingleConfig = async () => {
  const { currentLayoutData } = keyboardStore;
  const performanceValue = performanceStore.value;
  const touchMode = rtEnabled.value ? 'rt' : 'single';
  const promises = activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    const keyValue = currentLayoutData[y][x];
    const { advancedKeyMode } = performanceValue[y][x];
    performanceStore.setPerformanceMode(keyValue.value, touchMode, advancedKeyMode);
    performanceStore.setSingleTravel(keyValue.value, singleTravel.value);
  });
  await Promise.all(promises);
};
</script>

<style scoped lang="scss">
.mode-container {
  display: flex;

  .keystroke {
    height: 290px;
    width: 740px;
    margin: 0 30px;
    background-image: url('@/assets/images/keystroke_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
  }
}
</style>
