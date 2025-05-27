<template>
  <div class="dead-zone">
    <travelTestCard />
    <div class="key-setting-box">
      <setTravelCard
        :sliderVal="pressDead"
        :offsetX="scaleValue(40)"
        :min="min"
        :max="max"
        :disabled="disabled"
        :deadZone="true"
        title="按下死区设置"
        @sendKeyVal="handlePressDeadChange"
      />
      <setTravelCard
        :sliderVal="releaseDead"
        :offsetX="scaleValue(40)"
        :min="min"
        :max="max"
        :disabled="disabled"
        :deadZone="true"
        title="抬起死区设置"
        @sendKeyVal="handleReleaseDeadChange"
      />
      <div class="key-dead-preview">
        <img src="@/assets/images/scale.svg" alt="" />
        <div class="key-dead-scale">
          <div class="top-box" :style="{ height: `${pressDeadHeight}px` }"></div>
          <div class="bottom-box" :style="{ height: `${releaseDeadHeight}px` }"></div>
        </div>
        <img src="@/assets/images/scale.svg" alt="" />
        <div class="nums">
          <p class="scale_0">0.10</p>
          <p class="scale_1">1.00</p>
          <p class="scale_2">2.00</p>
          <p class="scale_3">3.00</p>
          <p class="scale_3_3">{{ maxTravel || '3.30' }}</p>
        </div>
      </div>
    </div>
    <saveConfig :keyDownUp="pressDead" :keyUpVal="releaseDead" @saveDeadZoneTravel="saveDeadZoneTravel" />
  </div>
</template>

<script setup>
import { showMessage } from '@/utils/message';
import emitter from '@/utils/app-emitter';
import { KEY_SHAFT } from '@/configs/constant/index.js';
import { usePerformanceHook } from '@/hooks';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { usePerformancePageHook } from '../usePerformancePageHook';

import sureIcon from '@/assets/images/sure.svg';
import saveConfig from './components/save-config.vue';
import setTravelCard from '@/components/dz-travel.vue';
import travelTestCard from '@/components/travel-test-card.vue';

const { rowIdx, colIdx, activeKeys, disabled, debounce, hasCurrentKey } = usePerformancePageHook();

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboards } = storeToRefs(keyboardStore);

const min = 0; // 最小值
const max = 1; // 最大值
const pressDeadHeight = ref(10);
const releaseDeadHeight = ref(10);
const maxTravel = ref(null);
const pressDead = ref(0.2);
const releaseDead = ref(0.2);
const maxKeyDeadHeight = computed(() => {
  return Number(getComputedStyle(document.documentElement).getPropertyValue('--dead-zone-height').trim());
}); // 使用CSS变量

watchEffect(() => {
  if (activeKeys.value.length > 0) {
    // 获取最后一个
    const lastKey = activeKeys.value[activeKeys.value.length - 1];
    const [rowIndx, colIndx] = lastKey.split('-');
    const { deadBandPressValue, deadBandReleaseValue } = keyboards.value[rowIndx][colIndx].performance;
    pressDead.value = deadBandPressValue;
    releaseDead.value = deadBandReleaseValue;
  }
});

emitter.on('key-click', ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
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
  const { deadBandPressValue, deadBandReleaseValue, axisID } = keyboards.value[rowIndex][colIndex].performance;
  const axisItem = performanceStore.axisList.find((item) => item.id === axisID);
  console.log('轴体信息', axisItem);
  maxTravel.value = axisItem ? (axisItem.maxTravel / 1000).toFixed(2) : null;
  const releaseHeight = (deadBandPressValue / max) * maxKeyDeadHeight.value;
  releaseDeadHeight.value = Math.round(releaseHeight);
  const pressHeight = (deadBandReleaseValue / max) * maxKeyDeadHeight.value;
  pressDeadHeight.value = Math.round(pressHeight);
};

const handlePressDeadChange = async (value) => {
  pressDead.value = value;
  const lastActiveKey = activeKeys.value[activeKeys.value.length - 1];
  const [rowIndx, colIndx] = lastActiveKey.split('-');
  const { deadBandReleaseValue } = keyboards.value[rowIndx][colIndx].performance;
  const height = ((value ?? deadBandReleaseValue) / max) * maxKeyDeadHeight.value;
  pressDeadHeight.value = Math.round(height);
  debouncedUpdateDZPress(value);
};

const handleReleaseDeadChange = async (value) => {
  releaseDead.value = value;
  const lastActiveKey = activeKeys.value[activeKeys.value.length - 1];
  const [rowIndx, colIndx] = lastActiveKey.split('-');
  const { deadBandPressValue } = keyboards.value[rowIndx][colIndx].performance;
  const height = ((value ?? deadBandPressValue) / max) * maxKeyDeadHeight.value;
  releaseDeadHeight.value = Math.round(height);
  debouncedUpdateDZRelease(value);
};

// 防抖
const debouncedUpdateDZPress = debounce((value) => {
  const updates = [];
  activeKeys.value.forEach((keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // Collect updates without directly modifying state
    updates.push({
      rowIndex,
      colIndex,
      performance: { deadBandPressValue: value },
    });
  });

  // Apply updates in a batch
  updates.forEach(({ rowIndex, colIndex, performance }) => {
    const currentPerformance = { ...keyboards.value[rowIndex][colIndex].performance };
    keyboards.value[rowIndex][colIndex].performance = { ...currentPerformance, ...performance };
  });
}, 100);

// 防抖
const debouncedUpdateDZRelease = debounce((value) => {
  const updates = [];
  activeKeys.value.forEach((keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // Collect updates without directly modifying state
    updates.push({
      rowIndex,
      colIndex,
      performance: { deadBandReleaseValue: value },
    });
  });

  // Apply updates in a batch
  updates.forEach(({ rowIndex, colIndex, performance }) => {
    const currentPerformance = { ...keyboards.value[rowIndex][colIndex].performance };
    keyboards.value[rowIndex][colIndex].performance = { ...currentPerformance, ...performance };
  });
}, 100);

const saveDeadZoneTravel = async () => {
  const { setSingleTravel } = usePerformanceHook();
  const res = setSingleTravel(keyboards.value, activeKeys.value, 'dz');
  if (res) {
    showMessage('修改成功');
  }
};
</script>

<style scoped lang="scss">
.dead-zone {
  display: flex;

  .key-setting-box {
    display: flex;
    height: var(--size-290);
    width: var(--performance-center-box-width);
    margin: 0 var(--spacing-25);
    background-image: url('@/assets/images/keystroke_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;

    .setTravelCard1 {
      margin-left: var(--spacing-40);
    }
  }

  .key-dead-preview {
    display: flex;
    position: absolute;
    top: var(--spacing-20);
    right: var(--spacing-70);

    .key-dead-scale {
      width: var(--size-40);
      height: var(--size-250);
      margin: 0 var(--spacing-10);
      position: relative;
      background-image: url('@/assets/images/key_dead_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;

      .top-box,
      .bottom-box {
        width: var(--size-28);
        height: var(--size-50);
        border-radius: var(--spacing-3);
        background-color: rgb(253, 255, 0);
        position: absolute;
        left: var(--spacing-6);
        transition: height 0.3s ease;
      }

      .top-box {
        top: var(--spacing-6);
      }
      .bottom-box {
        bottom: var(--spacing-6);
      }
    }

    img {
      height: var(--size-250);
      width: var(--size-25);
      object-fit: cover;
    }

    img:first-child {
      transform: rotateY(180deg) rotateZ(0deg);
    }

    .nums {
      height: var(--size-200);
      margin-left: var(--spacing-10);
      position: absolute;
      top: calc(var(--spacing-5) - var(--spacing-10));
      left: var(--spacing-110);
      // background-color: pink;

      p {
        color: #ccc;
        font-size: var(--font-size-13);
        position: absolute;
        font-family: 'CN Regular';
      }
      .scale_0 {
        top: var(--scale-1);
      }
      .scale_1 {
        top: var(--scale-55);
      }
      .scale_2 {
        top: var(--scale-117);
      }
      .scale_3 {
        top: var(--scale-178);
      }
      .scale_3_3 {
        top: var(--scale-241);
      }
    }
  }
}
</style>
