<template>
  <div class="travel-test-card">
    <div class="scale-box">
      <img class="scale-img isreverse" src="@/assets/images/scale.svg" alt="" />
      <div class="progress-bar">
        <div>
          <img
            class="progress"
            src="@/assets/images/progress.png"
            :style="{ transform: `translateY(${dynamicHeight}px)` }"
          />
        </div>
      </div>
      <img class="scale-img" src="@/assets/images/scale.svg" alt="" />
      <div class="nums">
        <p class="scale_0">0.00</p>
        <p class="scale_1">1.00</p>
        <p class="scale_2">2.00</p>
        <p class="scale_3">3.00</p>
        <p class="scale_3_3">3.30</p>
      </div>
    </div>
    <div class="switch-box">
      <span>行程测试</span>
      <el-switch
        v-model="testEnabled"
        :width="getSwitchWidth()"
        inline-prompt
        active-text="ON"
        inactive-text="OFF"
        @change="handleSwitchChange"
      >
        <template #active-action>
          <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
        </template>
        <template #inactive-action>
          <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
        </template>
      </el-switch>
    </div>
  </div>
</template>

<script setup>
import { usePerformanceStore } from '@/stores';

const performanceStore = usePerformanceStore();

const testEnabled = ref(false);
const maxMM = ref(0);
const pressStatus = ref(0);
const keyPressTestCount = ref(0);

const handleSwitchChange = (value) => {
  if (!value) {
    maxMM.value = 0;
  }
  keyPressTestCount.value++;
};

watch(keyPressTestCount, async () => {
  if (testEnabled.value) {
    const result = await performanceStore.getRm6X21Travel();
    maxMM.value = result.max;
    pressStatus.value = result.press;
    keyPressTestCount.value++;
  }
});

const dynamicHeight = computed(() => {
  // 使用 CSS 变量获取基准值
  const baseValue = getComputedStyle(document.documentElement).getPropertyValue('--size-260');
  const baseHeight = parseInt(baseValue) || 190;

  // 计算高度比例
  const heightRatio = baseHeight / 190; // 使用原始值 190 作为基准

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

// 添加一个获取开关宽度的函数
const getSwitchWidth = () => {
  const switchWidthValue = getComputedStyle(document.documentElement).getPropertyValue('--switch-width');
  return parseInt(switchWidthValue) || 73; // 提供一个默认值以防 CSS 变量未定义
};
</script>

<style scoped lang="scss">
.travel-test-card {
  width: var(--size-260);
  height: var(--size-290);
  // display: flex;
  background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;

  .scale-box {
    margin-top: var(--spacing-20);
    display: flex;
    position: relative;

    &:first-child {
      margin-left: var(--spacing-60);
    }

    .scale-img {
      width: var(--spacing-25);
      height: var(--size-200);
      object-fit: cover;
    }

    .progress-bar {
      width: var(--spacing-30);
      height: var(--size-200);
      margin: 0 var(--spacing-10);
      padding-top: var(--spacing-5);
      box-sizing: border-box;
      position: relative;
      background-image: url('@/assets/images/progress_bar.svg');
      background-size: cover;
      background-repeat: no-repeat;

      div {
        width: var(--spacing-20);
        height: var(--size-190);
        display: block;
        // height: 0;
        position: absolute;
        border-radius: var(--spacing-5);
        top: var(--spacing-5);
        left: var(--spacing-5);
        overflow: hidden;
      }

      .progress {
        width: 100%;
        height: 100%;
        object-fit: fill;
        transform: translateX(var(--translate-x-value));
        transition: all 0.2s ease-in-out;
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

    .nums {
      position: absolute;
      height: var(--size-200);
      top: calc(var(--spacing-5) - var(--spacing-10));
      left: var(--spacing-110);
      background-color: pink;

      p {
        color: #ccc;
        font-size: var(--font-size-13);
        position: absolute;
        font-family: 'CN Regular';
      }
      .scale_1 {
        top: var(--scale-54);
      }
      .scale_2 {
        top: var(--scale-114);
      }
      .scale_3 {
        top: var(--scale-172);
      }
      .scale_3_3 {
        top: var(--scale-191);
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
