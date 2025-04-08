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
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { scaleValue } from '@/utils/responsive.js';

import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';

import linkIcon from '@/assets/images/link1.svg';
import linkedIcon from '@/assets/images/link2.svg';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const min = 0.005; // 最小值
const max = 3.3; // 最大值
const travelVal = ref(0);
const RTKeyDown = ref(0);
const RTKeyUp = ref(0);

const currentKeyX = ref(null);
const currentKeyY = ref(null);
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
  return activeKeys.value.includes(`${currentKeyX.value}-${currentKeyY.value}`);
});

emitter.on('key-click', async ({ colIndex, rowIndex }) => {
  currentKeyX.value = colIndex;
  currentKeyY.value = rowIndex;
  if (hasCurrentKey.value) {
    const { touchMode, single, rt } = performanceValue.value[rowIndex][colIndex];
    rtEnabled.value = true;
    await handleRtEnabledChange();
    singleTravel.value = typeof single.singleTravel === 'number' ? single.singleTravel : Number(single.singleTravel);
    rtPressTravel.value = typeof rt.pressTravel === 'number' ? rt.pressTravel : Number(rt.pressTravel);
    rtReleaseTravel.value = typeof rt.releaseTravel === 'number' ? rt.releaseTravel : Number(rt.releaseTravel);
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
    const promises = selectedKeyValues.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const x = Number(key1);
      const y = Number(key2);
      const { rt } = performanceValue[y][x];
      performanceValue[y][x].touchMode = 'rt';
      performanceValue[y][x].rt.pressTravel = rt.pressTravel || 0.3;
      performanceValue[y][x].rt.releaseTravel = rt.releaseTravel || 0.3;
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
    const x = Number(key1);
    const y = Number(key2);
    performanceValue[y][x].touchMode = touchMode;
    performanceValue[y][x].single.singleTravel = value;
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
      const x = Number(key1);
      const y = Number(key2);
      performanceValue[y][x].touchMode = 'rt';
      performanceValue[y][x].rt.pressTravel = rtPressTravel.value;
      performanceValue[y][x].rt.releaseTravel = rtReleaseTravel.value;
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
      const x = Number(key1);
      const y = Number(key2);
      performanceValue[y][x].touchMode = 'rt';
      performanceValue[y][x].rt.pressTravel = rtPressTravel.value;
      performanceValue[y][x].rt.releaseTravel = rtReleaseTravel.value;
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
  const { currentLayoutData } = keyboardStore;
  const performanceValue = performanceStore.value;
  const promises = selectedKeyValues.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    const keyValue = currentLayoutData[y][x];
    const { advancedKeyMode } = performanceValue[y][x];
    return Promise.all([
      performanceStore.setPerformanceMode(keyValue.value, 'rt', advancedKeyMode),
      performanceStore.setRtPressTravel(keyValue.value, rtPressTravel.value),
      performanceStore.setRtReleaseTravel(keyValue.value, rtReleaseTravel.value),
      performanceStore.setSingleTravel(keyValue.value, performanceValue[y][x].single.singleTravel),
    ]);
  });
  await Promise.all(promises);
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
