<template>
  <div class="key-calibration-container">
    <div class="key-calibration-title">
      <div>
        <span>校准说明</span>
        <p>校准时请完全按下按键保持1到2秒，同时上下左右轻微摇晃按键。</p>
      </div>
      <div
        class="start-btn"
        :class="switchClass"
        @click="onStart"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <span>{{ isStart ? '结束校验' : '开始校验' }}</span>
      </div>
    </div>
    <div class="key-calibration-content">
      <div class="left-box">
        <div style="width: 50%;">
          <p>1.按下需要校准的按键；</p>
          <img src="@/assets/images/keyboard_calibration_bg.svg" alt="" style="margin-left: 50px;">
        </div>
        <div  style="width: 50%;">
          <p>2.长按保持。等待校准；</p>
          <img src="@/assets/images/check_btn.svg" alt="" style="margin-left: 50px;">
        </div>
        <div style="width: 100%;">
          <p>3.查看校准结果。</p>
          <div style="display: flex; justify-content: space-around;">
            <img src="@/assets/images/un_btn.svg" alt="">
            <img src="@/assets/images/success_btn.svg" alt="">
            <img src="@/assets/images/error_btn.svg" alt="">
          </div>
        </div>
      </div>
      <div class="echarts-box">
        <CalibrationMode v-model:isStart="isStart" />
      </div>
    </div>
    <!-- <div class="start-box">
      <div class="explain-box">
        <img src="@/assets/images/warn_icon.svg" alt="" />
        <span>校准说明:</span>
      </div>
      <div class="text-box">
        <span>校准时请完全按下按键并保持1到2秒</span>
        <span>同时上下左右轻微晃动按键。</span>
        <span>注意：快速的按下并抬起按键</span>
        <span>会导致校准的结果不准确。</span>
      </div>
      <div
        class="start-btn"
        :class="switchClass"
        @click="onStart"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <img :src="isStart ? stopIcon : startIcon" alt="" />
        <span>{{ isStart ? '结束校验' : '开始校验' }}</span>
      </div>
    </div> -->
  </div>
</template>
<script setup>
import emitter from '@/utils/app-emitter';
import { useDeviceStore, useKeyboardStore, usePerformanceStore } from '@/stores';

import CalibrationMode from './CalibrationMode.vue';
import startIcon from '@/assets/images/start_icon.svg';
import stopIcon from '@/assets/images/stop_icon.svg';

const deviceStore = useDeviceStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const isAct = ref(false);
const isStart = ref(false);

const keys = ref([]);
const keyID = ref(0);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const inputText = ref('');
const startTime = ref(null);
const endTime = ref(null);

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

const onStart = () => {
  isStart.value = !isStart.value;
  if (!isStart.value) {
    isVersion2.value ? performanceStore.calibrationEndV2() : performanceStore.calibrationEnd();
  }
  isAct.value = false;
};

const onMouseEnter = () => {
  isAct.value = true;
};
const onMouseLeave = () => {
  isAct.value = false;
};

const switchClass = computed(() => {
  if (isStart.value) {
    return 'is-pending';
  } else if (isAct.value) {
    return 'is-active';
  } else {
    return '';
  }
});

const addKey = (event) => {
  const { key } = event;
  const existingKey = keys.value.find((k) => k.name === key);

  if (existingKey) {
    existingKey.pressed = true;
  } else {
    keys.value.push({ id: keyID.value++, name: key, pressed: true });
  }

  if (startTime.value === null) {
    startTime.value = Date.now();
  }
  endTime.value = Date.now();
  inputText.value += key;
};

const releaseKey = (event) => {
  const key = keys.value.find((k) => k.name === event.key);
  if (key) {
    key.pressed = false;
    setTimeout(() => {
      if (!key.pressed) {
        removeKey(key.id);
      }
    }, 1000);
  }
};

const removeKey = (id) => {
  const index = keys.value.findIndex((k) => k.id === id);
  if (index > -1) {
    keys.value.splice(index, 1);
  }
};

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

onMounted(async () => {
  // TODO 升级成功后跳转到校验逻辑
  // if (deviceStore.updateSuc) {
  //   console.log('asdasdasdwas onmounted');
  //   await deviceStore.connectDevice();
  //   delay(100);
  //   await keyboardStore.initKeyboard();
  //   setTimeout(async () => {
  //     deviceStore.updateSuc = false;
  //     try {
  //       onStart();
  //     } catch (error) {
  //       console.error('Error in setTimeout:', error);
  //       await deviceStore.connectDevice();
  //       delay(2000);
  //       onStart();
  //     }
  //   }, 2000);
  // }

  window.addEventListener('keydown', addKey);
  window.addEventListener('keyup', releaseKey);
  window.addEventListener('blur', () => {
    keys.value.forEach((key) => {
      key.pressed = false;
      setTimeout(() => {
        if (!key.pressed) {
          removeKey(key.id);
        }
      }, 1000);
    });
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', addKey);
  window.removeEventListener('keyup', releaseKey);
  window.removeEventListener('blur', () => {});
});
</script>

<style scoped lang="scss">
.key-calibration-container {
  //height: var(--size-350);
  //background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;

  .show-key-box {
    width: var(--assignment-leftbox-width);
    height: var(--character-card-height);
    box-sizing: border-box;
    padding-left: var(--spacing-20);
    margin-left: var(--spacing-30);
    //background-image: url('@/assets/images/show_key_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    p {
      text-align: center;
      margin: var(--spacing-20) 0 var(--spacing-20) calc(var(--spacing-20) * -1);
      font-size: var(--font-size-15);
      font-family: 'CN Heavy';
      color: #cccccc;
    }

    .keys {
      display: flex;
      flex-wrap: wrap;
      max-height: 62%;
      overflow: hidden;

      div {
        height: var(--size-50);
        width: var(--size-50);
        margin: 0 var(--spacing-15) var(--spacing-10) 0;
        font-size: var(--font-size-16);
        font-family: 'Airal Blod';
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url('@/assets/images/show_key1.svg');
        background-size: cover;
        background-repeat: no-repeat;
      }
    }
  }

  .echarts-box {
    width: 1400px;
    height: 400px;
    margin: 0 var(--spacing-30);
    display: flex;
    //background-image: url('@/assets/images/echarts_box_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    .show-echarts {
      background-image: url('@/assets/images/echarts_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
    }
  }

  .start-box {
    width: var(--assignment-leftbox-width);
    height: var(--character-card-height);
    box-sizing: border-box;
    padding-left: var(--spacing-20);
    //background-image: url('@/assets/images/show_key_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;
    display: flex;
    text-align: center;
    flex-direction: column;
    align-content: center;
    font-size: var(--font-size-15);
    color: #cccccc;
    font-family: 'CN Heavy';

    .explain-box {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: var(--spacing-10) 0;
      img {
        width: var(--size-15);
        height: var(--size-15);
        object-fit: fill;
        margin-right: var(--spacing-5);
      }
    }
    .text-box {
      display: flex;
      flex-direction: column;

      & span {
        margin-bottom: var(--spacing-20);
      }
    }

    .start-btn {
      width: 180px;
      height: var(--size-40);
      margin-left: var(--spacing-45);
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      img {
        width: var(--size-20);
        height: var(--size-20);
        object-fit: fill;
        position: absolute;
        top: var(--spacing-10);
        left: var(--spacing-10);
      }

      span {
        font-size: var(--font-size-18);
        color: #fff;
        position: absolute;
        top: var(--spacing-6);
        left: var(--spacing-65);
      }
    }
  }
  .key-calibration-title {
    display: flex;
    justify-content: space-between;
    margin-left: 8px;
    span {
      font-size: var(--font-size-18);
      font-family: 'CN Heavy';
      color: #ffffff;
    }
    p {
      font-size: var(--font-size-14);
      color: #cccccc;
      margin-top: var(--spacing-5);
    }
    .start-btn {
      width: var(--size-170);
      height: var(--size-40);
      margin-left: var(--spacing-45);
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      margin-right: 95px;
      cursor: pointer;

      img {
        width: var(--size-20);
        height: var(--size-20);
        object-fit: fill;
        position: absolute;
        top: var(--spacing-10);
        left: var(--spacing-10);
      }

      span {
        font-size: var(--font-size-16);
        color: #fff;
        position: absolute;
        top: var(--spacing-6);
        left: 53px;
      }
    }
    .is-active {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
    .is-pending {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
  }
  .key-calibration-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    margin-left: 8px;
    .left-box {
      width: 620px;
      display: flex;
      flex-wrap: wrap;
      border-right: 1px solid #444444;
      p {
        margin: 25px 0;
        color: #fff;
      }
    }
  }
}
</style>
