<template>
  <div class="carousel-box" :style="{ marginLeft: `${offset}px`, width: `${width}px` }">
    <div class="left-arrow" @click="prevClickSlide"></div>
    <div class="shadow" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag">
      <div
        class="carousel"
        :class="noTransition ? 'no-transition' : ''"
        :style="{ transform: `translateX(${offsetVal}px)` }"
      >
        <div
          v-for="(item, index) in localCarouselData"
          :key="item.src"
          :class="{ selected: currentIdx === index }"
          :data-id="item.id"
          class="slide"
        >
          <img :src="item.src" alt="" draggable="false" />
        </div>
      </div>
    </div>
    <div class="right-arrow" @click="nextClick"></div>
    <div class="bottom-taskbar">
      <saveConfigBtn :btnText="btnText" @saveConfig="saveConfig" v-if="!showText" />
      <div class="bottom-taskbar__text" v-if="showText">
        <span :style="{ backgroundColor: localCarouselData[currentIdx]?.color }">
          {{ localCarouselData[currentIdx]?.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import saveConfigBtn from './save-config-btn.vue';
import { scaleValue } from '@/utils/responsive.js';

const { carouselData, btnText, offset } = defineProps({
  carouselData: {
    type: Array,
    default: [],
  },
  btnText: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: scaleValue(1030),
  },
  offset: {
    type: Number,
    default: scaleValue(160),
  },
  showText: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['handleSave', 'changeAxis']);

const SLIDE_WIDTH = computed(() => {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--carousel-offset-x').trim();
  return parseInt(value, 10);
});
const currentIdx = ref(6);
const offsetVal = ref(0);
const noTransition = ref(false);
const originalLength = computed(() => carouselData.length);
const localCarouselData = ref([...carouselData.slice(-3), ...carouselData, ...carouselData.slice(0, 3)]);

// console.log(carouselData.value.length);
let flag = false;
const prevClickSlide = () => {
  if (flag) return;
  flag = true;
  currentIdx.value--;
  offsetVal.value += SLIDE_WIDTH.value;
  noTransition.value = false;

  // 当到达前面添加的项时需要跳转
  if (currentIdx.value === 2) {
    setTimeout(() => {
      noTransition.value = true;
      // 跳转到原数组的最后一项（位置在 原数组长度+3-1）
      currentIdx.value = originalLength.value + 2;
      // 计算对应的偏移量
      offsetVal.value = -(SLIDE_WIDTH.value * (originalLength.value - 1));
      console.log('prev click', currentIdx.value, offsetVal.value, SLIDE_WIDTH.value, originalLength.value - 1);
    }, 500);
  }
  emits('changeAxis', localCarouselData.value[currentIdx.value].id);
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('prev Click', currentIdx.value);
};

const nextClick = () => {
  if (flag) return;
  flag = true;
  currentIdx.value++;
  offsetVal.value -= SLIDE_WIDTH.value;
  noTransition.value = false;

  // 当到达后面添加的项时需要跳转
  if (currentIdx.value === originalLength.value + 3) {
    setTimeout(() => {
      noTransition.value = true;
      // 跳转回到原数组的第一项（位置在索引3）
      currentIdx.value = 3;
      // 重置偏移量
      // offsetVal.value = -(SLIDE_WIDTH * 3);
      offsetVal.value = 0;
    }, 500);
  }
  emits('changeAxis', localCarouselData.value[currentIdx.value].id);
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('next click', currentIdx.value, localCarouselData.value[currentIdx.value]);
};

// 初始化
onMounted(() => {
  // 设置初始位置
  currentIdx.value = 6;
  offsetVal.value = -(SLIDE_WIDTH.value * 3);
  // offsetVal.value = -525;
  // console.log('初始化：', {
  //   总长度: carouselData.value.length,
  //   原数组长度: originalLength.value,
  //   当前索引: currentIdx.value,
  //   偏移量: offsetVal.value,
  // });
});

const isDragging = ref(false);
const startX = ref(0);
const dragOffset = ref(0);

const startDrag = (e) => {
  if (flag) return;
  isDragging.value = true;
  startX.value = e.clientX;
  dragOffset.value = 0;
  noTransition.value = true;
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const currentX = e.clientX;
  const diff = currentX - startX.value;
  dragOffset.value = diff;
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  noTransition.value = false;

  // 如果拖动距离超过50px，则触发切换
  if (Math.abs(dragOffset.value) > 50) {
    if (dragOffset.value > 0) {
      prevClickSlide();
    } else {
      nextClick();
    }
  }
  dragOffset.value = 0;
};

const saveConfig = () => {
  emits('handleSave', localCarouselData.value[currentIdx.value].id);
};
</script>

<style scoped lang="scss">
.carousel-box {
  width: var(--carousel-outer-width);
  height: var(--size-230);
  display: flex;
  // margin-left: 160px;
  position: relative;

  .left-arrow,
  .right-arrow {
    width: var(--size-15);
    height: var(--size-25);
    margin-top: var(--spacing-105);
    cursor: pointer;
    background-image: url('@/assets/images/arrow.svg');
    background-size: cover;
    background-repeat: no-repeat;
  }
  .left-arrow {
    transform: rotate(180deg);
  }
  .left-arrow:hover,
  .right-arrow:hover {
    background-image: url('@/assets/images/arrow_clicked.svg');
  }

  .shadow {
    width: var(--carousel-shadow-width);
    display: flex;
    justify-content: center;
    overflow: hidden;
    cursor: grab; // 默认显示抓取手型
    // box-sizing: border-box;
    // padding-left: 75px;

    .carousel {
      width: var(--carousel-inner-width);
      display: flex;
      align-items: center;
      margin-right: var(--spacing-75);
      box-sizing: border-box;
      padding-left: var(--spacing-75);
      // transform: translateX(-175px);
      transition: transform 0.5s ease;

      .slide {
        width: var(--size-100);
        height: var(--size-100);
        overflow: hidden;
        margin-left: var(--spacing-75);
        flex-shrink: 0;
        // transition: transform 0.5s ease;
        background-image: url('@/assets/images/check_item.svg');
        background-size: cover;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
        // transition: all 0.3s;

        img {
          width: var(--size-50);
          height: var(--size-50);
          object-fit: fill;
        }
      }

      .slide:first-child {
        margin-left: 0;
      }

      .selected {
        width: var(--size-150);
        height: var(--size-150);
        background-image: url('@/assets/images/checked_item.svg');
      }
    }

    .no-transition {
      transition: none;
    }
  }

  .bottom-taskbar {
    position: absolute;
    top: var(--size-230);
    left: calc(var(--size-350) - var(--spacing-5));
    &__text {
      width: var(--size-150);
      margin-left: var(--spacing-38);
      margin-top: var(--spacing-10);
      display: flex;
      justify-content: center;
      span {
        display: inline-block;
        height: var(--size-20);
        line-height: var(--size-20);
        text-align: center;
        padding: 0 var(--spacing-15);
        border-radius: var(--spacing-10);
        color: #000;
        font-size: var(--font-size-12);
        font-family: 'CN Heavy';
      }
    }
  }
}
</style>
