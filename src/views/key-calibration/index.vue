<template>
  <div class="key-calibration-container">
    <div class="show-key-box">
      <p>按键测试</p>
      <div class="keys">
        <div v-for="key in keys" :key="key.id">{{ key.name }}</div>
      </div>
    </div>
    <div class="echarts-box">
      <CalibrationMode v-model:isStart="isStart" />
    </div>
    <div class="start-box">
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
        <img :src="isStart ? '/src/assets/images/stop_icon.svg' : '/src/assets/images/start_icon.svg'" alt="" />
        <span>{{ isStart ? '结束校验' : '开始校验' }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useDeviceStore, useKeyboardStore, usePerformanceStore } from '@/stores';
import CalibrationMode from './CalibrationMode.vue';

const deviceStore = useDeviceStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const isAct = ref(false);
const isStart = ref(false);

const keys = ref([]);
const keyID = ref(0);

const inputText = ref('');
const startTime = ref(null);
const endTime = ref(null);

const onStart = () => {
  isStart.value = !isStart.value;
  if (!isStart.value) {
    performanceStore.calibrationEnd();
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
  if (deviceStore.updateSuc) {
    await deviceStore.connectDevice();
    delay(100);
    await keyboardStore.defKey();
    setTimeout(async () => {
      deviceStore.updateSuc = false;
      try {
        onStart();
      } catch (error) {
        console.error('Error in setTimeout:', error);
        await deviceStore.connectDevice();
        delay(2000);
        onStart();
      }
    }, 2000);
  }

  window.addEventListener('keydown', addKey);
  window.addEventListener('keyup', releaseKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', addKey);
  window.removeEventListener('keyup', releaseKey);
});
</script>

<style scoped lang="scss">
.key-calibration-container {
  width: 1600px;
  height: 350px;
  margin-top: 25px;
  display: flex;
  background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  padding-top: 30px;
  overflow: hidden;

  .show-key-box {
    width: 300px;
    height: 290px;
    box-sizing: border-box;
    padding-left: 20px;
    margin-left: 30px;
    background-image: url('@/assets/images/show_key_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    p {
      text-align: center;
      margin: 20px 0 20px -20px;
      font-size: 15px;
      font-family: 'CN Heavy';
      color: #cccccc;
    }

    .keys {
      display: flex;
      flex-wrap: wrap;

      div {
        height: 50px;
        width: 50px;
        margin: 0 20px 10px 0;
        font-size: 16px;
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
    width: 880px;
    height: 290px;
    margin: 0 30px;
    display: flex;
    background-image: url('@/assets/images/echarts_box_bg.svg');
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
    width: 300px;
    height: 290px;
    box-sizing: border-box;
    padding-left: 20px;
    background-image: url('@/assets/images/show_key_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;
    display: flex;
    text-align: center;
    flex-direction: column;
    align-content: center;
    font-size: 15px;
    color: #cccccc;
    font-family: 'CN Heavy';

    .explain-box {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
      img {
        width: 15px;
        height: 15px;
        object-fit: fill;
        margin-right: 5px;
      }
    }
    .text-box {
      display: flex;
      flex-direction: column;

      & span {
        margin-bottom: 20px;
      }
    }

    .start-btn {
      width: 170px;
      height: 40px;
      margin-left: 45px;
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      img {
        width: 20px;
        height: 20px;
        object-fit: fill;
        position: absolute;
        top: 10px;
        left: 10px;
      }

      span {
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 6px;
        left: 65px;
      }
    }
    .is-active {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
    .is-pending {
      background-image: url('/src/assets/images/pending_bg.svg');
    }
  }
}
</style>
