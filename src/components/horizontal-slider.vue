<template>
  <div class="slider_box">
    <div class="progress-bar" ref="sliderContainer">
      <div class="slider-btn" :style="handleStyle" @mousedown.self="startDrag" @touchstart="startDrag"></div>
      <el-slider ref="slider" disabled :step="1" :min="minVal" :max="maxVal" v-model="sliderVal" />
    </div>
  </div>
</template>

<script setup>
const {
  sliderValue,
  min: minVal,
  max: maxVal,
} = defineProps({
  sliderValue: { type: Number },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 4 },
});

const emits = defineEmits(['sendSliderVal']);
const slider = ref(null);
const sliderContainer = ref(null);
const sliderVal = ref(sliderValue); // 使用解构的 props 初始化

// 添加 watch 来监听变化
watch(
  () => sliderValue,
  (newVal) => {
    sliderVal.value = newVal;
  },
);
let dragging = false;
let startX = 0;
let min = minVal;
let max = maxVal;

const sliderWidth = computed(() => {
  return Number(getComputedStyle(document.documentElement).getPropertyValue('--slider-width').trim());
});

const sliderBtnOffset = computed(() => {
  return Number(getComputedStyle(document.documentElement).getPropertyValue('--slider-btn-offset').trim());
});

// 修改计算滑块样式
const handleStyle = computed(() => {
  const percentage = (sliderVal.value - min) / (max - min);
  // 计算基础left值后减去滑块宽度的一半(22px / 2 = 11px)
  let left = percentage * sliderWidth.value - sliderBtnOffset.value + 'px';
  if (percentage * sliderWidth.value - sliderBtnOffset.value < 0) left = 0;
  return {
    left, // 使用 left 代替 top
  };
});

// 修改开始拖拽
const startDrag = (e) => {
  dragging = true;
  if (e.type === 'touchstart') {
    startX = e.touches[0].clientX; // 改为 clientX
  } else {
    startX = e.clientX; // 改为 clientX
  }
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', endDrag);
};

// 修改拖拽中
const onDrag = (e) => {
  if (!dragging) return;
  let clientX; // 改为 clientX
  if (e.type === 'touchmove') {
    clientX = e.touches[0].clientX;
  } else {
    clientX = e.clientX;
  }

  updateValue(clientX);
};

// 结束拖拽或鼠标离开
const endDrag = () => {
  dragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', endDrag);
};

// 修改更新值
const updateValue = (clientX) => {
  const rect = sliderContainer.value.getBoundingClientRect();
  // 在计算百分比时加上滑块宽度的一半，使点击位置对应滑块中心
  let percentage = (clientX - rect.left + sliderBtnOffset.value) / rect.width;
  percentage = Math.max(0, Math.min(1, percentage));
  let newValue = min + percentage * (max - min);
  newValue = Math.round(newValue);
  sliderVal.value = newValue;
  emits('sendSliderVal', sliderVal.value);
};
</script>

<style scoped lang="scss">
.progress-bar {
  width: var(--size-200);
  height: var(--size-20);
  margin: 0 var(--spacing-9);
  position: relative;
  background-image: url('@/assets/images/luminance.svg');
  background-size: cover;
  background-repeat: no-repeat;

  .el-slider {
    // transform: rotate(180deg);
    height: var(--size-18);
    width: var(--size-190);
    --el-slider-height: var(--size-12);
    background-color: transparent;
    position: absolute;
    left: var(--spacing-5);
    top: var(--spacing-1);
    transition: all 0.1s ease-in-out;
  }

  .slider-btn {
    width: var(--size-22);
    height: var(--size-22);
    cursor: grab;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    background-color: transparent;
    background-image: url('@/assets/images/luminance_btn.svg');
    background-size: cover;
    background-repeat: no-repeat;
    // display: none;
  }
}
</style>
