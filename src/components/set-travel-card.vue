<template>
  <div class="travel-test-card" :style="{ marginLeft: `${offsetX}px` }">
    <div class="slider_box">
      <img class="slider-img" src="/src/assets/images/keystroke_scale_bg.svg" alt="" />
      <div class="progress-bar" ref="sliderContainer">
        <div
          class="slider-btn"
          :class="{ disabled: disabled }"
          :style="handleStyle"
          v-on="
            !disabled
              ? {
                  mousedown: startDrag,
                  touchstart: startDrag,
                }
              : {}
          "
        ></div>
        <el-slider
          ref="slider"
          vertical
          disabled
          :step="step"
          :height="sliderHeight"
          :min="min"
          :max="max"
          v-model="psliderVal"
        />
      </div>
      <img class="slider-img isreverse" src="/src/assets/images/keystroke_scale_bg.svg" alt="" />
      <div class="nums">
        <p class="scale_0">{{ deadZone ? '0.01' : '0.005' }}</p>
        <p class="scale_1">{{ deadZone ? '0.25' : '0.10' }}</p>
        <p class="scale_2">{{ deadZone ? '0.50' : '1.00' }}</p>
        <p class="scale_3">{{ deadZone ? '0.75' : '2.00' }}</p>
        <p class="scale_4">{{ deadZone ? '1.00' : '3.30' }}</p>
      </div>
    </div>
    <div class="text-box">
      <span>{{ title }}</span>
      <!-- <span>{{ psliderVal.toFixed(2) }}mm</span> -->
      <div class="travel-input">
        <input
          type="number"
          :disabled="disabled"
          v-model.number="psliderVal"
          min="0"
          max="4"
          @input="updateValueFromInput"
        />
        mm
      </div>
    </div>
  </div>
</template>

<script setup>
const { title, keyVal, sliderVal, min, max, offsetX, deadZone } = defineProps({
  title: { type: String, default: '' },
  keyVal: { type: [String, Number], default: 0 },
  sliderVal: { type: Number, default: 0 },
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
const sliderHeight = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--slider-height').trim();
}); // 滑块高度
const psliderVal = ref(null);
let dragging = false;
let startY = 0;

watch(
  () => sliderVal,
  (newVal) => {
    psliderVal.value = newVal;
  },
  { immediate: true },
);

// 计算滑块样式
const handleStyle = computed(() => {
  const percentage = (psliderVal.value - min) / (max - min);
  let top = percentage * sliderHeight.value.replace('px', '') - 10 + 'px';
  return {
    top, // 根据进度计算底部位置
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
  document.addEventListener('touchmove', onDrag);
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

  updateValue(clientY);
};

// 结束拖拽或鼠标离开
const endDrag = () => {
  dragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', endDrag);
};

// 更新值
const updateValue = (clientY) => {
  const rect = sliderContainer.value.getBoundingClientRect();
  let percentage = (rect.bottom - clientY) / rect.height;
  percentage = Math.max(0, Math.min(1, percentage)); // 确保百分比在0到1之间
  let newValue = max - percentage * (max - min);
  newValue = Math.round(newValue / step) * step; // 根据步进值四舍五入
  psliderVal.value = parseFloat(newValue.toFixed(3)); // 保留一位小数
  emits('sendKeyVal', psliderVal.value);
};

const updateValueFromInput = () => {
  if (psliderVal.value === '') {
    psliderVal.value = 0;
  }
  emits('sendKeyVal', psliderVal.value);
};

// 添加全局事件监听器以处理触摸设备上的拖动
onMounted(() => {
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
});

onUnmounted(() => {
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchend', endDrag);
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

      .el-slider {
        transform: rotate(180deg);
        --el-slider-height: var(--size-15);
      }

      .slider-btn {
        width: var(--size-22);
        height: var(--size-22);
        cursor: grab;
        position: absolute;
        top: 0;
        left: 0;
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
      background-color: pink;

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
