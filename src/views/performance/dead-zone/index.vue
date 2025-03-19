<template>
  <div class="dead-zone">
    <travelTestCard />
    <div class="key-setting-box">
      <setTravelCard
        :sliderVal="pressDead"
        :offsetX="40"
        :min="min"
        :max="max"
        :disabled="disabled"
        :deadZone="true"
        title="按下死区设置"
        @sendKeyVal="handlePressDeadChange"
      />
      <setTravelCard
        :sliderVal="releaseDead"
        :offsetX="40"
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
const maxKeyDeadHeight = 60; // 最大高度

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
    const releaseHeight = (releaseDead / max) * maxKeyDeadHeight;
    releaseDeadHeight.value = Math.round(releaseHeight);
    const pressHeight = (pressDead / max) * maxKeyDeadHeight;
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
    const height = (value || performanceValue[y][x].pressDead / max) * maxKeyDeadHeight;
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
    const height = (value || performanceValue[y][x].pressDead / max) * maxKeyDeadHeight;
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
    height: 290px;
    width: 740px;
    margin: 0 30px;
    background-image: url('@/assets/images/keystroke_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;

    .setTravelCard1 {
      margin-left: 40px;
    }
  }

  .key-dead-preview {
    display: flex;
    position: absolute;
    top: 20px;
    right: 70px;

    .key-dead-scale {
      width: 40px;
      height: 250px;
      margin: 0 10px;
      position: relative;
      background-image: url('@/assets/images/key_dead_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;

      .top-box,
      .bottom-box {
        width: 28px;
        height: 50px;
        border-radius: 3px;
        background-color: rgb(253, 255, 0);
        position: absolute;
        left: 6.5px;
        transition: height 0.3s ease;
      }

      .top-box {
        top: 6px;
      }
      .bottom-box {
        bottom: 6px;
      }
    }

    img {
      height: 250px;
      width: 25px;
      object-fit: fill;
    }

    img:first-child {
      transform: rotateY(180deg) rotateZ(0deg);
    }

    .nums {
      height: 200px;
      margin-left: 10px;
      position: absolute;
      top: -5px;
      left: 110px;
      // background-color: pink;

      p {
        color: #ccc;
        font-size: 13px;
        position: absolute;
        font-family: 'CN Regular';
      }
      .scale_0 {
        top: -1px;
      }
      .scale_1 {
        top: 55px;
      }
      .scale_2 {
        top: 117px;
      }
      .scale_3 {
        top: 178px;
      }
      .scale_3_3 {
        top: 241px;
      }
    }
  }
}
</style>
