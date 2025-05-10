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
import emitter from '@/utils/app-emitter';

import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';
import sureIcon from '@/assets/images/sure.svg';
import { storeToRefs } from 'pinia';
import { usePerformanceHook } from '@/hooks';
import { usePerformancePageHook } from '../usePerformancePageHook';

const { rowIdx, colIdx, option, activeKeys, disabled, debounce, hasCurrentKey } = usePerformancePageHook();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboards } = storeToRefs(keyboardStore);

const title = '按键行程设置';
const singleTravel = ref(performanceStore.singleTouchTravel);

emitter.on('key-click', ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
  console.log('single listen click: ', rowIndex, colIndex);
  if (hasCurrentKey.value) {
    const { singleTriggeringValue } = keyboards.value[rowIndex][colIndex].performance;
    singleTravel.value =
      typeof singleTriggeringValue === 'number' ? singleTriggeringValue : parseFloat(singleTriggeringValue);
  }
});

// 更新单触发行程的防抖函数
const debouncedUpdateSingleTravel = debounce((value) => {
  activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // keyboards.value[rowIndex][colIndex].performance.isRt = false;
    keyboards.value[rowIndex][colIndex].performance.isSingle = true;
    keyboards.value[rowIndex][colIndex].performance.singleTriggeringValue = value;
  });
}, 200);

// 设置选中的为触发模式改单键程触发
const handleTriggerPointChange = async (value) => {
  // 拿到选中的键值
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
