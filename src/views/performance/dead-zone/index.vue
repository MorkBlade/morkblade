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
        <img src="@/assets/images/key_dead_scale.svg" alt="" />
        <div class="key-dead-scale">
          <div class="top-box" :style="{ height: `${pressDeadHeight}px` }"></div>
          <div class="bottom-box" :style="{ height: `${releaseDeadHeight}px` }"></div>
        </div>
        <img src="@/assets/images/key_dead_scale.svg" alt="" />
        <div class="nums">
          <p class="scale_0">0.10</p>
          <p class="scale_1">1.00</p>
          <p class="scale_2">2.00</p>
          <p class="scale_3">3.00</p>
          <p class="scale_3_3">4.00</p>
        </div>
      </div>
    </div>
    <saveConfig :keyDownUp="pressDead" :keyUpVal="releaseDead" @saveDeadZoneTravel="saveDeadZoneTravel" />
  </div>
</template>

<script setup>
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import travelTestCard from '@/components/travel-test-card.vue';
import setTravelCard from '@/components/set-travel-card.vue';
import saveConfig from './components/save-config.vue';
import emitter from '@/utils/app-emitter';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const min = 0; // 最小值
const max = 1; // 最大值
const pressDeadHeight = ref(10);
const releaseDeadHeight = ref(10);
const pressDead = ref(0.2);
const releaseDead = ref(0.2);
const maxKeyDeadHeight = computed(() => {
  return Number(getComputedStyle(document.documentElement).getPropertyValue('--dead-zone-height').trim());
}); // 使用CSS变量

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

watchEffect(() => {
  if (activeKeys.value.length > 0) {
    // 获取最后一个
    const lastKey = activeKeys.value[activeKeys.value.length - 1];
    const [x, y] = lastKey.split('-');
    const result = performanceStore.deadZoneValue[y][x];
    pressDead.value = result.pressDead;
    releaseDead.value = result.releaseDead;
  }
});

const disabled = computed(() => {
  const selectedKeyValues = keyboardStore.activeKeys;
  if (selectedKeyValues.length === 0) return true;
  return false;
});

const currentKeyX = ref(null);
const currentKeyY = ref(null);
const hasCurrentKey = computed(() => {
  return activeKeys.value.includes(`${currentKeyX.value}-${currentKeyY.value}`);
});
const perdeadZoneValue = computed(() => {
  return performanceStore.deadZoneValue;
});
emitter.on('key-click', ({ colIndex, rowIndex }) => {
  currentKeyX.value = colIndex;
  currentKeyY.value = rowIndex;
  if (hasCurrentKey.value) {
    const { pressDead, releaseDead } = perdeadZoneValue.value[rowIndex][colIndex];
    const releaseHeight = (releaseDead / max) * maxKeyDeadHeight.value;
    releaseDeadHeight.value = Math.round(releaseHeight);
    const pressHeight = (pressDead / max) * maxKeyDeadHeight.value;
    pressDeadHeight.value = Math.round(pressHeight);
  }
});

const handlePressDeadChange = async (value) => {
  pressDead.value = value;
  const selectedKeyValues = keyboardStore.activeKeys;
  // const { currentLayoutData } = keyboardStore;
  const performanceValue = performanceStore.deadZoneValue;
  const promises = selectedKeyValues.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    // const keyValue = currentLayoutData[y][x];
    const height = (value || performanceValue[y][x].pressDead / max) * maxKeyDeadHeight.value;
    pressDeadHeight.value = Math.round(height);
    performanceValue[y][x].pressDead = value;
    // performanceStore.setDp(keyValue.value, value);
  });
  // await Promise.all(promises);
};

const handleReleaseDeadChange = async (value) => {
  releaseDead.value = value;
  const selectedKeyValues = keyboardStore.activeKeys;
  // const { currentLayoutData } = keyboardStore;
  const performanceValue = performanceStore.deadZoneValue;
  const promises = selectedKeyValues.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    // const keyValue = currentLayoutData[y][x];
    const height = (value || performanceValue[y][x].pressDead / max) * maxKeyDeadHeight.value;
    releaseDeadHeight.value = Math.round(height);
    performanceValue[y][x].releaseDead = value;
    // performanceStore.setDr(keyValue.value, value);
  });
  // await Promise.all(promises);
};

const saveDeadZoneTravel = async () => {
  const selectedKeyValues = keyboardStore.activeKeys;
  const { currentLayoutData } = keyboardStore;
  const promises = selectedKeyValues.map(async (keyLocation) => {
    const [key1, key2] = keyLocation.split('-');
    const x = Number(key1);
    const y = Number(key2);
    const keyValue = currentLayoutData[y][x];
    performanceStore.setDp(keyValue.value, pressDead.value);
    performanceStore.setDr(keyValue.value, releaseDead.value);
  });
  await Promise.all(promises);
};
</script>

<style scoped lang="scss">
.dead-zone {
  display: flex;

  .key-setting-box {
    display: flex;
    height: var(--size-290);
    width: var(--performance-center-box-width);
    margin: 0 var(--spacing-30);
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
        border-radius: var(--border-radius-3);
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
      object-fit: fill;
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
