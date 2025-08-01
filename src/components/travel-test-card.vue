<template>
  <div class="travel-test-card-container">
    <div class="travel-test-card-header">
      <p>触发效果演示：</p>
    </div>
    <div class="travel-test-card-content">
      <div class="shaft-img">
        <img :src="shaftImg" alt="" />
      </div>

      <div class="travel-test-card">
        <div class="scale-box">
          <div class="progress-bar">
            <div>
              <img class="progress" src="@/assets/images/progress.svg"
                :style="{ transform: `translateY(${testEnabled ? dynamicHeight : -400}px)` }" />
            </div>
          </div>
          <div class="arrow-nums" 
            :style="{ transform: `translateY(${currentSingleTravel * 70}px)` }"
          >
            <img class="arrow-left" src="@/assets/images/arrow_left.svg" alt="">
            <p>{{ currentSingleTravel }}mm</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePerformanceStore, useKeyboardStore } from '@/stores';
import shaftImg from '@/assets/images/shaft_img.svg';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const props = defineProps({
  sliderVal: {
    type: Number,
    default: 0
  }
});

const testEnabled = ref(true); // 默认开启
const maxMM = ref(0);
const keyPressTestCount = ref(0);
const currentSingleTravel = ref(props.sliderVal);
console.log(currentSingleTravel.value)
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
// const sliderHeight = computed(() => {
//   return getComputedStyle(document.documentElement).getPropertyValue('--slider-height').trim();
// }); 

// 组件挂载时自动开始数据获取
onMounted(() => {
  keyPressTestCount.value++;
});

watch(keyPressTestCount, async () => {
  if (testEnabled.value) {
    if (isVersion2) {
      // const { max } = await performanceStore.getRm6X21CalibrationV2(keyboardStore.keyboards);
      const { max } = await performanceStore.getRm6X21Travel(keyboardStore.keyboards, isVersion2);
      maxMM.value = max;
    } else {
      const { max } = await performanceStore.getRm6X21Travel();
      maxMM.value = max;
    }
    keyPressTestCount.value++;
  }
});

const dynamicHeight = computed(() => {
  // 使用 CSS 变量获取基准值
  const baseValue = getComputedStyle(document.documentElement).getPropertyValue('--size-260');
  const baseHeight = parseInt(baseValue) || 190;

  // 计算动态高度
  const height = -baseHeight + (maxMM.value / 4.0) * ((baseHeight * baseHeight) / 190);

  // 限制最大高度
  return Math.min(Math.max(height, -baseHeight), 0);
});

// 组件销毁
onUnmounted(() => {
  testEnabled.value = false;
});

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms));
  return Promise.race([promise, timeout]);
};


</script>

<style scoped lang="scss">
.travel-test-card-container {
  // width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .travel-test-card-header {
    width: 100%;
    height: 100%;
    display: flex;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    padding-left: 8px;
    flex-direction: column;
    margin-bottom: 25px;
  }
  .travel-test-card-content {
    display: flex;
    .shaft-img {
      width: 175px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-left: -18px;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.travel-test-card {
  width: 252px;
  height: 342px;
  // display: flex;
  // background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.2);

  .scale-box {
    margin-top: var(--spacing-20);
    margin-left: 46px;
    display: flex;
    position: relative;


    .scale-img {
      width: var(--spacing-25);
      height: var(--size-200);
      object-fit: cover;
    }

    .progress-bar {
      width: 80px;
      height: 240px;
      margin: 30px 5px;
      padding-top: 5px;
      box-sizing: border-box;
      position: relative;
      background-image: url('@/assets/images/progress_bar.svg');
      background-size: cover;
      background-repeat: no-repeat;

      div {
        width: 40px;
          height: 226px;
          display: block;
          // height: 0;
          position: absolute;
          top: 8px;
          left: 33px;
          overflow: hidden;
      }

      .progress {
        width: 100%;
        height: 100%;
        object-fit: fill;
        transform: translateX(var(--translate-x-value));
        transition: transform 0.1s ease-in-out;
        // background-image: url('@/assets/images/progress.png');
        // background-size: cover;
        // background-repeat: no-repeat;
        // background-size: 100% auto;
        // background-position: center;
        // scale: 0.8;
      }
    }

    .isreverse {
      transform: rotateY(180deg) rotateZ(0deg);
    }

    .arrow-nums {
      position: absolute;
      height: 10px;
      left: 80px;
      top: 30px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .arrow-left {
        width: 4px;
        height: 10px;
        margin: 0 4px 0 14px;
      }
      p {
        width: 30px;
        color: #fff;
        font-size: 10px;
        font-family: 'CN Regular';
      }
    }
  }

  .switch-box {
    width: var(--size-170);
    height: var(--size-36);
    line-height: var(--size-34);
    margin: var(--spacing-14) 0 0 var(--spacing-40);
    background-image: url('@/assets/images/switch_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    span {
      font-size: var(--font-size-13);
      color: #ccc;
      font-family: 'CN Heavy';
      // -webkit-text-stroke: 1px #000000;
      margin-left: var(--spacing-16);
    }

    .el-switch {
      margin-left: var(--spacing-20);
      --el-switch-on-color: rgb(145, 188, 0);
      --el-switch-off-color: rgba(0, 0, 0, 0);
      font-family: 'CN Heavy';

      .custom-active-action {
        width: var(--size-22);
        height: var(--size-22);
      }

      // &.is-checked {
      //   color: #000000;
      // }
    }

    ::v-deep(.el-switch__core) {
      border-radius: var(--spacing-10);
      height: var(--size-20) !important;
    }
  }
}
</style>
