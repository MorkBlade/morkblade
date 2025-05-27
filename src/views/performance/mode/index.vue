<template>
  <div class="mode-container">
    <travelTestCard />
    <div class="keystroke">
      <setTravelCard
        :sliderVal="singleTravel"
        :min="option.min"
        :max="option.max"
        :title="title"
        :offsetX="scaleValue(280)"
        :disabled="disabled"
        @sendKeyVal="handleTriggerPointChange"
      />
    </div>
    <saveConfig :travelVal="singleTravel" @saveSingleTravel="saveSingleConfig" />
  </div>
</template>

<script setup>
import { showMessage } from '@/utils/message';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { scaleValue } from '@/utils/responsive.js';
import { storeToRefs } from 'pinia';
import { usePerformanceHook } from '@/hooks';
import { usePerformancePageHook } from '../usePerformancePageHook';
import emitter from '@/utils/app-emitter';

import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';
import { onBeforeUnmount } from 'vue';
import { onMounted } from 'vue';

const { rowIdx, colIdx, option, activeKeys, disabled, debounce, hasCurrentKey } = usePerformancePageHook();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboards } = storeToRefs(keyboardStore);

const title = '按键行程设置';
const singleTravel = ref(performanceStore.singleTouchTravel);

emitter.on('key-click', ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
  // console.log('single listen click: ', rowIndex, colIndex);
  if (hasCurrentKey.value) {
    // renderRtValue(rowIndex, colIndex);
  }
});

watch(
  () => keyboardStore.activeKeys,
  (newValue) => {
    if (newValue.length > 0) {
      const lastKey = newValue[newValue.length - 1].split('-');
      const [rowIndex, colIndex] = lastKey;
      renderRtValue(rowIndex, colIndex);
    }
  },
  { deep: true },
);

onMounted(() => {
  if (keyboardStore.activeKeys.length > 0) {
    const lastKey = keyboardStore.activeKeys[keyboardStore.activeKeys.length - 1].split('-');
    const [rowIndex, colIndex] = lastKey;
    renderRtValue(rowIndex, colIndex);
  }
});

const renderRtValue = (rowIndex, colIndex) => {
  const { singleTriggeringValue } = keyboards.value[rowIndex][colIndex].performance;
  const singleTravelVal =
    typeof singleTriggeringValue === 'number' ? singleTriggeringValue : parseFloat(singleTriggeringValue);
  singleTravel.value = singleTravelVal;
};

// 更新单触发行程的防抖函数
const debouncedUpdateSingleTravel = debounce((value) => {
  const updates = [];
  activeKeys.value.forEach((keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // Collect updates without directly modifying state
    updates.push({
      rowIndex,
      colIndex,
      performance: {
        isRt: false,
        isSingle: true,
        singleTriggeringValue: value,
      },
    });
  });

  // Apply updates in a batch
  updates.forEach(({ rowIndex, colIndex, performance }) => {
    const currentPerformance = { ...keyboards.value[rowIndex][colIndex].performance };
    keyboards.value[rowIndex][colIndex].performance = { ...currentPerformance, ...performance };
  });
}, 100);

// 设置选中的为触发模式改单键程触发
const handleTriggerPointChange = async (value) => {
  // 拿到选中的键值
  // console.log('handleTriggerPointChange: ', value);
  singleTravel.value = value;
  debouncedUpdateSingleTravel(value);
};

const saveSingleConfig = async () => {
  const { setSingleTravel } = usePerformanceHook();
  const res = setSingleTravel(keyboards.value, activeKeys.value);
  if (res) {
    showMessage('修改成功');
  }
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
