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

emitter.on('key-click', async ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
  if (hasCurrentKey.value) {
    const { singleTriggeringValue, rtPressValue, rtReleaseValue } = keyboards.value[rowIndex][colIndex].performance;
    console.log('rtPressValue, rtReleaseValue', rtPressValue, rtReleaseValue);
    rtEnabled.value = true;
    await handleRtEnabledChange();
    singleTravel.value =
      typeof singleTriggeringValue === 'number' ? singleTriggeringValue : Number(singleTriggeringValue);
    rtPressTravel.value = typeof rtPressValue === 'number' ? rtPressValue : Number(rtPressValue);
    rtReleaseTravel.value = typeof rtReleaseValue === 'number' ? rtReleaseValue : Number(rtReleaseValue);
  } else {
    rtEnabled.value = false;
  }
});

emitter.on('rt-enabled', ({ value }) => {
  rtEnabled.value = value;
});

const handleRtEnabledChange = async (value) => {
  if (rtEnabled.value && activeKeys.value.length > 0) {
    activeKeys.value.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const rowIndex = Number(key1);
      const colIndex = Number(key2);
      const { rtPressValue, rtReleaseValue } = keyboards.value[rowIndex][colIndex].performance;
      keyboards.value[rowIndex][colIndex].performance.isRt = true;
      // keyboards.value[rowIndex][colIndex].performance.isSingle = false;
      keyboards.value[rowIndex][colIndex].performance.rtPressValue = rtPressValue || 0;
      keyboards.value[rowIndex][colIndex].performance.rtReleaseValue = rtReleaseValue || 0;
    });
  }
};

// 更新键盘配置的防抖函数
const debouncedUpdateRtTreavel = debounce((value) => {
  activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    keyboards.value[rowIndex][colIndex].performance.isRt = true;
    keyboards.value[rowIndex][colIndex].performance.isSingle = false;
    keyboards.value[rowIndex][colIndex].performance.rtPressValue = rtPressTravel.value;
    keyboards.value[rowIndex][colIndex].performance.rtReleaseValue = rtReleaseTravel.value;
  });
}, 200);

// 更新单触发行程的防抖函数
const debouncedUpdateSingleTravel = debounce((value) => {
  activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    keyboards.value[rowIndex][colIndex].performance.singleTriggeringValue = value;
  });
}, 200);

const handleTriggerPointChange = async (value) => {
  singleTravel.value = value;
  debouncedUpdateSingleTravel(value);
};

// 设置RT按下的行程
const setRtPressTravel = async (value) => {
  console.log('setRtPressTravel: ', value);
  if (!rtEnabled.value) handleRtEnabledChange();
  rtPressTravel.value = value;
  rtPressLinkRelease.value ? (rtReleaseTravel.value = value) : '';
  if (rtEnabled.value) {
    debouncedUpdateRtTreavel(value);
  }
};

// 设置RT释放行程
const setRtReleaseTravel = async (value) => {
  if (!rtEnabled.value) handleRtEnabledChange();
  rtReleaseTravel.value = value;
  rtPressLinkRelease.value ? (rtPressTravel.value = value) : '';

  if (rtEnabled.value) {
    debouncedUpdateRtTreavel(value);
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
  const { setSingleTravel } = usePerformanceHook();
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
