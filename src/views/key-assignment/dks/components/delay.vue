<template>
  <div class="dks-delay" v-if="delayPageShow">
    <div class="dks-delay__content">
      <div class="slider_box">
        <img class="slider-img" src="/src/assets/images/keystroke_scale_bg.svg" alt="" />
        <div class="progress-bar" ref="sliderContainer">
          <!-- <div
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
          /> -->
          <div class="my-slider" :style="{ height: handleStyle.top }">
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
        </div>
        <img class="slider-img isreverse" src="/src/assets/images/keystroke_scale_bg.svg" alt="" />
        <div class="nums">
          <p class="scale_0">{{ '0.20' }}</p>
          <p class="scale_1">{{ '1.00' }}</p>
          <p class="scale_2">{{ '2.00' }}</p>
          <p class="scale_3">{{ '3.00' }}</p>
          <p class="scale_4">{{ '4.00' }}</p>
        </div>
      </div>
      <div class="text-box">
        <span>{{ title }}</span>
        <div class="travel-input">
          <input type="number" v-model.number="psliderVal" :min="0" :max="4" @input="updateValueFromInput" />
          mm
        </div>
      </div>
      <div class="close-btn" @click="onCloseDelayPage">{{ t('dksDelay.close') }}</div>
    </div>
  </div>
</template>

<script setup>
import { scaleValue } from '@/utils/responsive';
import { showMessage } from '@/utils/message';

const delayPageShow = defineModel('delayPageShow', Boolean, false);
const { delay, title } = defineProps({
  delay: {
    type: Number,
    default: 0,
  },
  title: String,
});
const emits = defineEmits(['changeDelay']);
const slider = ref(null);
const disabled = ref(false);
const psliderVal = ref(null);
const sliderContainer = ref(null);
const step = 0.01; // 步进值
const min = 0.01; // 步进值
const max = 4; // 步进值
const sliderHeight = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--slider-height').trim();
}); // 滑块高度
let dragging = false;
let startY = 0;

watch(
  () => delay,
  (newVal) => {
    psliderVal.value = newVal;
  },
  { immediate: true },
);

// 计算滑块样式
const handleStyle = computed(() => {
  const percentage = (psliderVal.value - min) / (max - min);
  let top = percentage * sliderHeight.value.replace('px', '') + scaleValue(10) + 'px';
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
  emits('changeDelay', psliderVal.value);
};

const updateValueFromInput = (e) => {
  const inputValue = parseFloat(e.target.value);
  if (isNaN(inputValue)) {
    psliderVal.value = 0;
    emits('changeDelay', 0);
    return;
  } else if (inputValue >= max) {
    psliderVal.value = max;
    emits('changeDelay', max);
    return;
  }

  psliderVal.value = inputValue;
  emits('changeDelay', inputValue);
  // if (psliderVal.value === '') {
  //   psliderVal.value = 0;
  // }
  // emits('changeDelay', psliderVal.value);
};

// const handleBlur = (e) => {
//   const inputValue = parseFloat(e.target.value);
//   let sendTravel = 0;
//   if (inputValue >= max) {
//     sendTravel = max;
//   } else {
//     sendTravel = inputValue;
//   }
//   if (isNaN(inputValue)) {
//     sendTravel = 0.005;
//   }
//   psliderVal.value = sendTravel;

//   if (inputValue >= max) showMessage('最大值为4', 'warning');
//   emits('changeDelay', sendTravel);
// };

// 添加全局事件监听器以处理触摸设备上的拖动
onMounted(() => {
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
});

onUnmounted(() => {
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchend', endDrag);
});

const onCloseDelayPage = () => {
  delayPageShow.value = false;
};
</script>

<style scoped lang="scss">
.dks-delay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;

  &__content {
    width: var(--size-300);
    height: var(--size-350);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: var(--spacing-15);
    background-color: #000;
    border: var(--spacing-3) solid rgb(37, 37, 37);

    .slider_box {
      display: flex;
      margin-left: calc(var(--spacing-30) - var(--spacing-60));
      position: relative;
      margin-top: var(--spacing-30);

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

    .close-btn {
      width: var(--size-80);
      height: var(--size-28);
      line-height: var(--size-28);
      margin-top: var(--spacing-15);
      font-size: var(--font-size-15);
      font-family: 'CN Heavy';
      color: #000;
      text-align: center;
      background-color: rgb(255, 0, 0);
      border-radius: var(--spacing-5);
      cursor: pointer;

      &:hover {
        background-color: rgba(255, 0, 0, 0.8);
      }
    }
  }
}
</style>
