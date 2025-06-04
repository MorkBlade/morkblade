<template>
  <div class="quick-trigger-box">
    <travelTestCard />
    <div class="key-setting-box">
      <setTravelCard
        :sliderVal="singleTravel"
        :offsetX="scaleValue(40)"
        :min="option.min"
        :max="option.max"
        :disabled="disabled"
        title="首次触发行程"
        @sendKeyVal="handleTriggerPointChange"
      />
      <setTravelCard
        :sliderVal="rtPressTravel"
        :offsetX="scaleValue(40)"
        :min="option.min"
        :max="option.max"
        :disabled="disabled"
        title="RT按下行程"
        @sendKeyVal="setRtPressTravel"
      />
      <setTravelCard
        :sliderVal="rtReleaseTravel"
        :offsetX="scaleValue(40)"
        :min="option.min"
        :max="option.max"
        :disabled="disabled"
        title="RT抬起行程"
        @sendKeyVal="setRtReleaseTravel"
      />
      <div class="link-btn" @click="onLink" :class="{ linking: rtPressLinkRelease }">
        <img alt="" :src="rtPressLinkRelease ? linkedIcon : linkIcon" />
      </div>
    </div>
    <saveConfig
      :travelVal="singleTravel"
      :RTKeyDown="rtPressTravel"
      :RTKeyUp="rtReleaseTravel"
      @saveRtConfig="saveRtConfig"
    />
  </div>
</template>

<script setup>
import emitter from '@/utils/app-emitter';
import { showMessage } from '@/utils/message';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { scaleValue } from '@/utils/responsive.js';
import { usePerformanceHook } from '@/hooks';
import { usePerformancePageHook } from '../usePerformancePageHook';

import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';
import sureIcon from '@/assets/images/sure.svg';
import linkIcon from '@/assets/images/link1.svg';
import linkedIcon from '@/assets/images/link2.svg';
import { watch } from 'vue';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const { keyboards } = storeToRefs(keyboardStore);

const { rowIdx, colIdx, option, activeKeys, disabled, debounce, hasCurrentKey } = usePerformancePageHook();

const travelVal = ref(0);
const rtEnabled = ref(true);
const rtPressTravel = ref(performanceStore.rtPressTravel);
const rtReleaseTravel = ref(performanceStore.rtReleaseTravel);
const singleTravel = ref(performanceStore.singleTouchTravel);
const rtPressLinkRelease = ref(true);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

emitter.on('key-click', async ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
  if (hasCurrentKey.value) {
    // renderRtValue(rowIndex, colIndex);
  } else {
    rtEnabled.value = false;
  }
});

emitter.on('rt-enabled', ({ value }) => {
  rtEnabled.value = value;
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
    // debouncedUpdateRtTreavel();
  }
});

const renderRtValue = (rowIndex, colIndex) => {
  const { singleTriggeringValue, rtFirstTouch, rtPressValue, rtReleaseValue } =
    keyboards.value[rowIndex][colIndex].performance;
  rtEnabled.value = true;
  handleRtEnabledChange();
  let singleTravelVal;
  if (isVersion2) {
    singleTravelVal = typeof rtFirstTouch === 'number' ? rtFirstTouch : parseFloat(rtFirstTouch);
  } else {
    singleTravelVal =
      typeof singleTriggeringValue === 'number' ? singleTriggeringValue : parseFloat(singleTriggeringValue);
  }
  const rtPressTravelVal = typeof rtPressValue === 'number' ? rtPressValue : parseFloat(rtPressValue);
  const rtReleaseTravelVal = typeof rtReleaseValue === 'number' ? rtReleaseValue : parseFloat(rtReleaseValue);
  console.log('sigleTravelVal: ', singleTravelVal, rtPressTravelVal, rtReleaseTravelVal);
  singleTravel.value = singleTravelVal || 0.1;
  rtPressTravel.value = rtPressTravelVal || 0.1;
  rtReleaseTravel.value = rtReleaseTravelVal || 0.1;
};

const handleRtEnabledChange = (value) => {
  if (rtEnabled.value && activeKeys.value.length > 0) {
    activeKeys.value.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const rowIndex = Number(key1);
      const colIndex = Number(key2);
      const { rtPressValue, rtReleaseValue, isRt, isSingle } = keyboards.value[rowIndex][colIndex].performance;
      keyboards.value[rowIndex][colIndex].performance.isRt = isRt;
      keyboards.value[rowIndex][colIndex].performance.isSingle = isSingle;
      keyboards.value[rowIndex][colIndex].performance.rtPressValue = rtPressValue || 0.1;
      keyboards.value[rowIndex][colIndex].performance.rtReleaseValue = rtReleaseValue || 0.1;
    });
  }
};

// 更新键盘配置的防抖函数
const debouncedUpdateRtTreavel = debounce(() => {
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
        mode: 1,
        isRt: true,
        isSingle: false,
        rtPressValue: rtPressTravel.value,
        rtReleaseValue: rtReleaseTravel.value,
      },
    });
  });

  // Apply updates in a batch
  updates.forEach(({ rowIndex, colIndex, performance }) => {
    // Create a copy to ensure reactivity updates correctly if needed
    const currentPerformance = { ...keyboards.value[rowIndex][colIndex].performance };
    keyboards.value[rowIndex][colIndex].performance = { ...currentPerformance, ...performance };
  });
}, 120);

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
      performance: isVersion2 ? { rtFirstTouch: value } : { singleTriggeringValue: value },
    });
  });

  // Apply updates in a batch
  updates.forEach(({ rowIndex, colIndex, performance }) => {
    // Create a copy to ensure reactivity updates correctly if needed
    const currentPerformance = { ...keyboards.value[rowIndex][colIndex].performance };
    keyboards.value[rowIndex][colIndex].performance = { ...currentPerformance, ...performance };
  });
}, 120);

const handleTriggerPointChange = async (value) => {
  singleTravel.value = value;
  debouncedUpdateSingleTravel(value);
};

// 设置RT按下的行程
const setRtPressTravel = async (value) => {
  // console.log('setRtPressTravel: ', value);
  if (!rtEnabled.value) handleRtEnabledChange();
  rtPressTravel.value = value;
  rtPressLinkRelease.value ? (rtReleaseTravel.value = value) : '';
  if (rtEnabled.value) {
    debouncedUpdateRtTreavel();
  }
};

// 设置RT释放行程
const setRtReleaseTravel = async (value) => {
  if (!rtEnabled.value) handleRtEnabledChange();
  rtReleaseTravel.value = value;
  rtPressLinkRelease.value ? (rtPressTravel.value = value) : '';

  if (rtEnabled.value) {
    debouncedUpdateRtTreavel();
  }
};

const onLink = async () => {
  if (!rtPressLinkRelease.value) {
    rtPressTravel.value > rtReleaseTravel.value
      ? setRtReleaseTravel(rtPressTravel.value)
      : setRtPressTravel(rtReleaseTravel.value);
  }
  rtPressLinkRelease.value = !rtPressLinkRelease.value;
};

const saveRtConfig = async () => {
  // console.log('saveconfig');
  const { setSingleTravel } = usePerformanceHook();
  const updates = [];
  activeKeys.value.forEach((keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // Collect updates without directly modifying state
    const { rtPressValue: rtPress, rtReleaseValue: rtRelease } = keyboards.value[rowIndex][colIndex].performance;
    updates.push({
      rowIndex,
      colIndex,
      performance: {
        mode: 1,
        isRt: true,
        isSingle: false,
        isGlobalTriggering: false,
        rtPressValue: rtPress !== 0.1 ? rtPress : rtPressTravel.value,
        rtReleaseValue: rtRelease !== 0.1 ? rtRelease : rtReleaseTravel.value,
      },
    });
  });
  // Apply updates in a batch
  updates.forEach(({ rowIndex, colIndex, performance }) => {
    // Create a copy to ensure reactivity updates correctly if needed
    const currentPerformance = { ...keyboards.value[rowIndex][colIndex].performance };
    keyboards.value[rowIndex][colIndex].performance = { ...currentPerformance, ...performance };
  });
  const res = setSingleTravel(keyboards.value, activeKeys.value, 'rt');
  if (res) {
    showMessage('修改成功');
  }
};
</script>

<style scoped lang="scss">
.quick-trigger-box {
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

  .link-btn {
    width: var(--size-35);
    height: var(--size-35);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('@/assets/images/link_icon1.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    left: var(--performance-link-btn-left);
    top: var(--performance-link-btn-top);
    img {
      width: var(--size-16);
      height: var(--size-16);
      object-fit: fill;
    }
  }
  .linking {
    background-image: url('@/assets/images/link_icon2.svg');
  }
}
</style>
