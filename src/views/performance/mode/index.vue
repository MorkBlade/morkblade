<template>
  <div class="mode-container">
    <travelTestCard />
    <div class="keystroke">
      <setTravelCard
        :sliderVal="singleTravel"
        :min="min"
        :max="max"
        :title="title"
        :offsetX="getOffsetX()"
        :disabled="disabled"
        @sendKeyVal="handleTriggerPointChange"
      />
    </div>
    <saveConfig :travelVal="singleTravel" @saveSingleTravel="saveSingleConfig" />
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import emitter from '@/utils/app-emitter';

import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';
import sureIcon from '@/assets/images/sure.svg';
import { storeToRefs } from 'pinia';

const min = 0.005; // 最小值
const max = 3.3; // 最大值
const title = '按键行程设置';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const { keyboards } = storeToRefs(keyboardStore);
const singleTravel = ref(performanceStore.singleTouchTravel);

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

// const performanceValue = computed(() => {
//   return performanceStore.value;
// });

const disabled = computed(() => {
  return activeKeys.value.length === 0;
});

const hasCurrentKey = computed(() => {
  return activeKeys.value.includes(`${rowIdx.value}-${colIdx.value}`);
});

const rowIdx = ref(null);
const colIdx = ref(null);

emitter.on('key-click', ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
  if (hasCurrentKey.value) {
    const { isRt, isSingle, singleTriggeringValue } = keyboards.value[rowIndex][colIndex].performance;
    if (isRt || isSingle) {
      singleTravel.value =
        typeof singleTriggeringValue === 'number' ? singleTriggeringValue : parseFloat(singleTriggeringValue);
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
  // const performanceValue = performanceStore.value;
  // const touchMode = rtEnabled.value ? 'rt' : 'single';
  const promises = activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    keyboards.value[rowIndex][colIndex].performance.isRt = false;
    keyboards.value[rowIndex][colIndex].performance.isSingle = true;
    keyboards.value[rowIndex][colIndex].performance.singleTriggeringValue = value;
  });
  await Promise.all(promises);
};

const saveSingleConfig = async () => {
  // const performanceValue = performanceStore.value;
  const touchMode = rtEnabled.value ? 'rt' : 'single';
  const promises = activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    const keyItem = keyboards.value[rowIndex][colIndex];
    const { advancedKeyMode } = keyItem.performance;
    performanceStore.setPerformanceMode(keyItem.keyValue, touchMode, advancedKeyMode);
    performanceStore.setSingleTravel(keyItem.keyValue, singleTravel.value);
  });
  const res = await Promise.all(promises);
  if (res) {
    ElMessage({
      grouping: true,
      duration: 1000,
      dangerouslyUseHTMLString: true,
      message: `<span class="custom-message"><img src="${sureIcon}" class="warn-icon"/>修改成功</span>`,
      customClass: 'custom-message-container',
    });
  }
};

// 添加一个获取 CSS 变量值的函数
const getOffsetX = () => {
  const offsetXValue = getComputedStyle(document.documentElement).getPropertyValue('--mode-offset-x-280');
  return parseInt(offsetXValue) || `${280}px`; // 提供一个默认值以防 CSS 变量未定义
};
</script>

<style scoped lang="scss">
.mode-container {
  display: flex;

  .keystroke {
    height: var(--size-290);
    width: var(--performance-center-box-width);
    margin: 0 var(--spacing-25);
    background-image: url('@/assets/images/keystroke_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
  }
}
</style>
