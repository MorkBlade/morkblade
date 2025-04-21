<template>
  <div class="quick-trigger-box">
    <travelTestCard />
    <div class="key-setting-box">
      <setTravelCard
        :sliderVal="singleTravel"
        :offsetX="scaleValue(40)"
        :min="min"
        :max="max"
        :disabled="disabled"
        title="首次触发行程"
        @sendKeyVal="handleTriggerPointChange"
      />
      <setTravelCard
        :sliderVal="rtPressTravel"
        :offsetX="scaleValue(40)"
        :min="min"
        :max="max"
        :disabled="disabled"
        title="RT按下行程"
        @sendKeyVal="setRtPressTravel"
      />
      <setTravelCard
        :sliderVal="rtReleaseTravel"
        :offsetX="scaleValue(40)"
        :min="min"
        :max="max"
        :disabled="disabled"
        title="RT抬起行程"
        @sendKeyVal="setRtReleaseTravel"
      />
      <div class="link-btn" @click="onLink" :class="{ linking: rtPressLinkRelease }">
        <img alt="" :src="rtPressLinkRelease ? linkedIcon : linkIcon" />
      </div>
    </div>
    <saveConfig
      :travelVal="travelVal"
      :RTKeyDown="rtPressTravel"
      :RTKeyUp="rtReleaseTravel"
      @saveRtConfig="saveRtConfig"
    />
  </div>
</template>

<script setup>
import emitter from '@/utils/app-emitter';
import { ElMessage } from 'element-plus';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { scaleValue } from '@/utils/responsive.js';

import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';
import sureIcon from '@/assets/images/sure.svg';

import linkIcon from '@/assets/images/link1.svg';
import linkedIcon from '@/assets/images/link2.svg';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const { keyboards } = storeToRefs(keyboardStore);

const min = 0.005; // 最小值
const max = 3.3; // 最大值
const travelVal = ref(0);
const RTKeyDown = ref(0);
const RTKeyUp = ref(0);

const rowIdx = ref(null);
const colIdx = ref(null);
const rtEnabled = ref(true);
const rtPressTravel = ref(performanceStore.rtPressTravel);
const rtReleaseTravel = ref(performanceStore.rtReleaseTravel);
const singleTravel = ref(performanceStore.singleTouchTravel);
const rtPressLinkRelease = ref(true);

// onMounted(async () => {
//   emitter.emit('rt-enabled', { value: rtEnabled.value });
// });

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
  return activeKeys.value.includes(`${rowIdx.value}-${colIdx.value}`);
});

emitter.on('key-click', async ({ rowIndex, colIndex }) => {
  rowIdx.value = rowIndex;
  colIdx.value = colIndex;
  if (hasCurrentKey.value) {
    // const { touchMode, single, rt } = performanceValue.value[rowIndex][colIndex];
    const { singleTriggeringValue, rtPressValue, rtReleaseValue } = keyboards.value[rowIndex][colIndex].performance;
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
  const selectedKeyValues = keyboardStore.activeKeys;
  const performanceValue = performanceStore.value;
  if (rtEnabled.value && selectedKeyValues.length > 0) {
    selectedKeyValues.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const rowIndex = Number(key1);
      const colIndex = Number(key2);
      const { rtPressValue, rtReleaseValue } = keyboards.value[rowIndex][colIndex].performance;
      keyboards.value[rowIndex][colIndex].performance.isRt = true;
      keyboards.value[rowIndex][colIndex].performance.isSingle = false;
      keyboards.value[rowIndex][colIndex].performance.rtPressValue = rtPressValue || 0.3;
      keyboards.value[rowIndex][colIndex].performance.rtReleaseValue = rtReleaseValue || 0.3;
    });
  }

  // emitter.emit('rt-enabled', { value });
};

const handleTriggerPointChange = async (value) => {
  singleTravel.value = value;
  // 拿到选中的键值
  // const selectedKeyValues = keyboardStore.activeKeys;
  const performanceValue = performanceStore.value;
  const touchMode = rtEnabled.value ? 'rt' : 'single';
  const promises = activeKeys.value.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // performanceValue[rowIndex][colIndex].touchMode = touchMode;
    keyboards.value[rowIndex][colIndex].performance.singleTriggeringValue = value;
  });
};

// 设置RT按下的行程
const setRtPressTravel = async (value) => {
  if (!rtEnabled.value) handleRtEnabledChange();
  rtPressTravel.value = value;
  rtPressLinkRelease.value ? (rtReleaseTravel.value = value) : '';
  const selectedKeyValues = keyboardStore.activeKeys;
  const performanceValue = performanceStore.value;
  if (rtEnabled.value) {
    const promises = selectedKeyValues.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const rowIndex = Number(key1);
      const colIndex = Number(key2);
      // performanceValue[rowIndex][colIndex].touchMode = 'rt';
      // performanceValue[rowIndex][colIndex].rt.pressTravel = rtPressTravel.value;
      // performanceValue[rowIndex][colIndex].rt.releaseTravel = rtReleaseTravel.value;
      keyboards.value[rowIndex][colIndex].performance.isRt = true;
      keyboards.value[rowIndex][colIndex].performance.isSingle = false;
      keyboards.value[rowIndex][colIndex].performance.rtPressValue = rtPressTravel.value;
      keyboards.value[rowIndex][colIndex].performance.rtReleaseValue = rtReleaseTravel.value;
    });
  }
};

// 设置RT释放行程
const setRtReleaseTravel = async (value) => {
  if (!rtEnabled.value) handleRtEnabledChange();
  rtReleaseTravel.value = value;
  rtPressLinkRelease.value ? (rtPressTravel.value = value) : '';
  const selectedKeyValues = keyboardStore.activeKeys;
  const performanceValue = performanceStore.value;
  if (rtEnabled.value) {
    const promises = selectedKeyValues.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const rowIndex = Number(key1);
      const colIndex = Number(key2);
      keyboards.value[rowIndex][colIndex].performance.isRt = true;
      keyboards.value[rowIndex][colIndex].performance.isSingle = false;
      keyboards.value[rowIndex][colIndex].performance.rtPressValue = rtPressTravel.value;
      keyboards.value[rowIndex][colIndex].performance.rtReleaseValue = rtReleaseTravel.value;
    });
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
  const selectedKeyValues = keyboardStore.activeKeys;
  const performanceValue = performanceStore.value;
  const promises = selectedKeyValues.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    const keyItem = keyboards.value[rowIndex][colIndex];
    const { advancedKeyMode } = keyItem.performance;
    return Promise.all([
      performanceStore.setPerformanceMode(keyItem.keyValue, 'rt', advancedKeyMode),
      performanceStore.setRtPressTravel(keyItem.keyValue, rtPressTravel.value),
      performanceStore.setRtReleaseTravel(keyItem.keyValue, rtReleaseTravel.value),
      performanceStore.setSingleTravel(
        keyItem.keyValue,
        keyboards.value[rowIndex][colIndex].performance.singleTriggeringValue,
      ),
    ]);
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
