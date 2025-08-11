<template>
  <div class="travel-test-card-container">
    <div class="travel-test-card-header">
      <p>触发键程设置：</p>
      <p class="tip">触发键程越短，响应越快，但会增加误触的风险。</p>
    </div>
    <div class="travel-test-card-content">
      <div class="now-checked">当前已选：</div>
      <span class="color_blue">1个按键</span>
      <!-- <div class="shaft-img">
        <img :src="shaftImg" alt="" />
      </div> -->

      <div class="travel-test-card">
        <div class="scale-box">
          <div class="progress-bar">
             <ELSlider/>
          </div>
        </div>
      </div>
      <div>
        <div class="now-checked">
          <p>死区设置：</p>
          <el-switch v-model="switchValue" />
        </div>
        
        <span class="font_color">自动限制触发键程，以避免误触、断触或不触发的情况。</span>
        <div class="die-box">
          <div class="die-box-item">
            <span>按下死区:</span>
            <ELSlider/>
          </div>
          <div class="die-box-item">
            <span>抬起死区:</span>
            <ELSlider/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePerformanceStore, useKeyboardStore } from '@/stores';
import { ref } from 'vue'
import ELSlider from '@/components/el-slider.vue';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();


const testEnabled = ref(false); // 默认开启
const maxMM = ref(0);
const switchValue = ref(true)
const keyPressTestCount = ref(0);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-left: 45px;
  .travel-test-card-header {
    width: 100%;
    display: flex;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    padding-left: 8px;
    flex-direction: column;
    .tip {
      color: #8d8b8b;
      font-size: 16px;
      margin-top: 5px;
    }
  }
  .travel-test-card-content {
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    .now-checked {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      margin-left: 8px;
      padding-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 470px;
      p {
        font-size: 18px;
        color: #fff;
      }
    }
    .font_color {
      color: #8d8b8b;
    }
    .color_blue {
      color: #2771c5;
    }
    span{
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      margin-left: 8px;
    }
    .die-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      width: 470px;
      .die-box-item {
        width: 42%;
        span {
          margin-bottom: 5px;
          display: inline-block;
        }
      }
    }
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
  margin: 25px 8px;
  // display: flex;
  // background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  
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
