<template>
  <div class="travel-test-card" :style="{ marginLeft: `${offsetX}px` }">
    <div class="slider_box">
      <img class="slider-img" src="/src/assets/images/keystroke_scale_bg.svg" alt="" />
      <div class="progress-bar" ref="sliderContainer">
        <!-- <div
          class="slider-btn"
          :class="{ disabled: disabled }"
          :style="{ top: handleStyle.top }"
          v-on="
            !disabled
              ? {
                  mousedown: startDrag,
                  // touchstart: startDrag,
                }
              : {}
          "
        ></div> -->
        <div class="my-slider" :style="{ height: handleStyle.sliderHeight }">
          <div
            class="slider-btn"
            :class="{ disabled: disabled }"
            v-on="
              !disabled
                ? {
                    mousedown: startDrag,
                    // touchstart: startDrag,
                  }
                : {}
            "
          ></div>
          <!-- :style="{ top: handleStyle.top }" -->
        </div>
        <!-- <el-slider
          ref="slider"
          vertical
          disabled
          :step="step"
          :height="sliderHeight"
          :min="min"
          :max="max"
          :model-value="travelVal"
        /> -->
        <!-- :model-value="0.5 * 2.5" -->
        <!-- :model-value="0.1 * 8.5" -->
      </div>
      <img class="slider-img isreverse" src="/src/assets/images/keystroke_scale_bg.svg" alt="" />
      <div class="nums">
        <p class="scale_0">{{ deadZone ? '0.01' : isVersion2 ? '0.001' : '0.005' }}</p>
        <p class="scale_1">{{ deadZone ? '0.25' : '0.10' }}</p>
        <p class="scale_2">{{ deadZone ? '0.50' : '1.00' }}</p>
        <p class="scale_3">{{ deadZone ? '0.75' : '2.00' }}</p>
        <p class="scale_4">{{ deadZone ? '1.00' : '3.30' }}</p>
      </div>
    </div>
    <div class="text-box">
      <span>{{ title }}</span>
      <!-- <span>{{ travelVal.toFixed(2) }}mm</span> -->
      <div class="travel-input">
        <input
          type="number"
          :disabled="disabled"
          v-model="travelVal"
          min="0"
          max="4"
          @input="updateValueFromInput"
          @blur="handleBlur"
        />
        mm
      </div>
    </div>
  </div>
</template>

<script setup>
import { showMessage } from '@/utils/message';
import { scaleValue } from '@/utils/responsive';

const { title, keyVal, sliderVal, min, max, offsetX, deadZone, disabled } = defineProps({
  title: { type: String, default: '' },
  keyVal: { type: [String, Number], default: 0 },
  sliderVal: { type: [Number, Array, String], default: 0 },
  min: { type: Number },
  max: { type: Number },
  offsetX: { type: Number },
  disabled: { type: Boolean, default: false },
  deadZone: { type: Boolean, default: false },
  normal: { type: Boolean, default: true },
});

const emits = defineEmits(['sendKeyVal']);

const slider = ref(null);
const sliderContainer = ref(null);
const step = 0.001; // 步进值
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const sliderHeight = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--slider-height').trim();
}); // 滑块高度
const travelVal = ref(null);
let dragging = false;
let startY = 0;

// 刻度线的值和像素位置（根据实际UI调整）
const scaleMap = [
  // { value: 0, pos: 18 },
  // { value: 0.001, pos: 18 },
  // { value: 0.002, pos: 18 },
  // { value: 0.003, pos: 18 },
  // { value: 0.004, pos: 18 },
  { value: 0.005, pos: 7 },
  { value: 0.006, pos: 8 },
  { value: 0.007, pos: 9 },
  { value: 0.008, pos: 10 },
  { value: 0.009, pos: 11 },
  // { value: 0.01, pos: 22 },
  { value: 0.01, pos: 12 },
  { value: 0.02, pos: 14 },
  { value: 0.03, pos: 16 },
  { value: 0.04, pos: 18 },
  { value: 0.05, pos: 20 },
  { value: 0.06, pos: 24 },
  { value: 0.07, pos: 28 },
  { value: 0.08, pos: 32 },
  { value: 0.09, pos: 36 },
  { value: 0.1, pos: 40 },
  { value: 1.0, pos: 92 },
  { value: 2.0, pos: 142 },
  { value: 3.3, pos: 190 },
];

watch(
  () => sliderVal,
  (newVal) => {
    travelVal.value = newVal;
  },
  { immediate: true },
);

/**
 * 将数值转换为对应的像素位置
 * @param {number} val - 输入的数值
 * @returns {number} 对应的像素位置
 *
 * 该函数根据输入的数值，在scaleMap中查找对应的像素位置
 * 如果数值超出范围，返回边界值
 * 如果在范围内，则通过线性插值计算具体位置
 */
function valueToPos(val) {
  // 如果值小于等于最小值，返回最小位置
  if (val <= scaleMap[0].value) return scaleMap[0].pos;
  // 如果值大于最大值，返回最大位置
  if (val > scaleMap[scaleMap.length - 1].value) return scaleMap[scaleMap.length - 1].pos;

  // 遍历scaleMap查找值所在的区间
  for (let i = 0; i < scaleMap.length - 1; i++) {
    const cur = scaleMap[i];
    const next = scaleMap[i + 1];
    // console.log('cur', cur, 'next', next, 'val', val, prevTravel.value);
    // 找到值所在的区间后，使用线性插值计算具体位置
    if (val >= cur.value && val <= next.value) {
      const percent = (val - cur.value) / (next.value - cur.value);
      return cur.pos + percent * (next.pos - cur.pos);
    }
  }
  return 0;
}

/**
 * 计算滑块的样式
 * 根据当前值计算滑块的位置和高度
 * 返回包含top和sliderHeight的对象
 */
const handleStyle = computed(() => {
  // 获取滑块容器的高度，如果获取失败则使用默认值192
  const height = Number(sliderHeight.value.replace('px', '')) || scaleValue(192);

  // 获取scaleMap中的最大像素位置
  const scaleMaxPx = scaleMap[scaleMap.length - 1].pos;
  // 计算缩放比例，用于将scaleMap中的位置映射到实际滑块高度
  const scaleRatio = height / scaleMaxPx;

  // 计算滑块的实际像素位置，减去10px用于滑块居中
  let topPx = valueToPos(travelVal.value) * scaleRatio - scaleValue(10);

  // 限制滑块位置在有效范围内
  if (topPx < 0) topPx = 0;
  if (topPx > height - scaleValue(15)) topPx = height - scaleValue(15);
  let newTop = 0;
  if (prevTravel.value > travelVal.value) {
  }
  // 返回包含滑块位置和高度信息的对象
  return {
    top: topPx + 'px', // 滑块顶部位置
    sliderHeight: topPx + scaleValue(18) + 'px', // 滑块高度（包含18px的额外高度）
  };
});

// 开始拖拽
const startDrag = (e) => {
  dragging = true;
  if (e.type === 'touchstart') {
    startY = e.touches[0].clientY;
  } else {
    startY = e.clientY;
  }
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('touchend', endDrag);
};

// 拖拽中
const onDrag = (e) => {
  if (!dragging) return;
  let clientY;
  if (e.type === 'touchmove') {
    clientY = e.touches[0].clientY;
  } else {
    clientY = e.clientY;
  }
  updateValue(clientY - 30);
};

// 结束拖拽或鼠标离开
const endDrag = () => {
  // emits('sendKeyVal', travelVal.value);
  dragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', endDrag);
};
const prevTravel = ref(0);
// 更新值
const updateValue = (clientY) => {
  const rect = sliderContainer.value.getBoundingClientRect();
  let percentage = (rect.bottom - clientY) / rect.height;
  percentage = Math.max(0, Math.min(1, percentage)); // 确保百分比在0到1之间
  let newValue = max - percentage * (max - min);
  newValue = Math.round(newValue / step) * step; // 根据步进值四舍五入
  if (isVersion2) {
    if (newValue <= 0.001 && !deadZone) newValue = 0.001;
  } else {
    if (newValue <= 0.005 && !deadZone) newValue = 0.005;
  }
  prevTravel.value = travelVal.value;
  travelVal.value = parseFloat(newValue.toFixed(3)); // 保留一位小数
  emits('sendKeyVal', travelVal.value);
};

const updateValueFromInput = (e) => {
  // if (!e.target.value) return;
  const inputValue = parseFloat(e.target.value);
  if (isNaN(inputValue)) {
    travelVal.value = 0;
    emits('sendKeyVal', 0);
    return;
  } else if (inputValue >= max) {
    travelVal.value = max;
    emits('sendKeyVal', max);
    return;
  }

  travelVal.value = inputValue;
  emits('sendKeyVal', inputValue);
};

const handleBlur = (e) => {
  const inputValue = parseFloat(e.target.value);
  let sendTravel = 0;
  if (inputValue === 0 && !deadZone) {
    if (isVersion2) {
      sendTravel = 0.001;
    } else {
      sendTravel = 0.005;
    }
  } else if (inputValue >= max) {
    sendTravel = max;
  } else if (inputValue < 0.001 && !deadZone && isVersion2) {
    sendTravel = 0.001;
  } else if (inputValue < 0.005 && !deadZone && !isVersion2) {
    sendTravel = 0.005;
  } else {
    sendTravel = inputValue;
  }
  if (isNaN(inputValue)) {
    if (isVersion2) {
      sendTravel = 0.001;
    } else {
      sendTravel = 0.005;
    }
  }
  travelVal.value = sendTravel;

  if (isVersion2) {
    if (inputValue <= 0.001 && !deadZone) showMessage('最小值为0.001', 'warning');
  } else {
    if (inputValue <= 0.005 && !deadZone) showMessage('最小值为0.005', 'warning');
  }
  if (inputValue >= max) showMessage('最大值为3.3', 'warning');
  emits('sendKeyVal', Number(sendTravel.toFixed(3)));
};

// 添加全局事件监听器以处理触摸设备上的拖动
onMounted(() => {
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
  const sliderBtn = sliderContainer.value?.querySelector('.slider-btn');
  if (sliderBtn && !disabled) {
    sliderBtn.addEventListener('touchstart', startDrag, { passive: true });
  }
});

onUnmounted(() => {
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchend', endDrag);
  const sliderBtn = sliderContainer.value?.querySelector('.slider-btn');
  if (sliderBtn) {
    sliderBtn.removeEventListener('touchstart', startDrag);
  }
});
</script>

<style scoped lang="scss">
.travel-test-card {
  width: var(--size-200);
  box-sizing: border-box;
  padding-top: var(--spacing-20);
  // margin-left: 280px;
  overflow: hidden;
  .slider_box {
    display: flex;
    margin-left: var(--spacing-33);
    position: relative;

    .slider-img {
      width: var(--size-25);
      height: var(--size-200);
      object-fit: fill;
    }

    .progress-bar {
      width: var(--size-22);
      height: var(--size-200);
      margin: 0 var(--spacing-9);
      position: relative;
      background-image: url('@/assets/images/travel_progress_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;

      .my-slider {
        position: absolute;
        top: var(--spacing-3);
        left: var(--spacing-3);
        width: var(--size-16);
        border-radius: var(--spacing-15);
        background-color: rgb(145, 188, 0);
      }

      .el-slider {
        transform: rotate(180deg);
        --el-slider-height: var(--size-15);
      }

      .slider-btn {
        width: var(--size-22);
        height: var(--size-22);
        cursor: grab;
        position: absolute;
        bottom: -3px;
        left: -3px;
        z-index: 3;
        background-image: url('@/assets/images/sliding_block2.svg');
        background-size: cover;
        background-repeat: no-repeat;
        transition: all 0.1s linear;

        &.disabled {
          cursor: not-allowed;
        }
      }
    }

    .isreverse {
      transform: rotateY(180deg) rotateZ(0deg);
    }

    .nums {
      position: absolute;
      height: var(--size-200);
      top: calc(var(--spacing-5) * -1);
      left: var(--spacing-95);
      // background-color: pink;

      p {
        color: #ccc;
        font-size: var(--font-size-13);
        position: absolute;
        top: var(--spacing-2);
        font-family: 'CN Regular';
      }
      .scale_1 {
        top: var(--scale-42);
      }
      .scale_2 {
        top: var(--scale-92);
      }
      .scale_3 {
        top: var(--scale-142);
      }
      .scale_4 {
        top: var(--scale-190);
      }
    }
  }

  .text-box {
    width: var(--size-190);
    height: var(--size-36);
    line-height: var(--size-32);
    margin-top: var(--spacing-14);
    display: flex;
    align-items: center;
    position: relative;
    background-image: url('@/assets/images/keystroke_switch.svg');
    background-size: cover;
    background-repeat: no-repeat;

    .travel-input {
      font-size: var(--font-size-10);
      margin-left: var(--spacing-24);

      & input {
        width: var(--size-40);
        height: 100%;
        text-align: center;
        font-size: var(--font-size-14);
        color: #ccc;
        font-family: 'CN Heavy';
        background-color: transparent;
        border: none;
        outline: none;

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* For Firefox */
        & {
          -moz-appearance: textfield; /* Firefox */
        }
      }
    }

    & span:last-child {
      font-size: var(--font-size-10);
      color: #ccc;
      font-family: 'CN Heavy';
      position: absolute;
      top: var(--spacing-2);
      left: var(--spacing-120);
      // margin-left: 20px;
    }

    & span:first-child {
      display: inline-block;
      width: var(--size-78);
      font-size: var(--font-size-13);
      text-align: center;
      color: #ccc;
      font-family: 'CN Heavy';
      // -webkit-text-stroke: 1px #000000;
      margin-left: var(--spacing-16);
    }
  }
}
</style>
