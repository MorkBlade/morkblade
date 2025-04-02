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
  const baseValue = getComputedStyle(document.documentElement).getPropertyValue('--progress-inner-height');
  const baseHeight = parseInt(baseValue) || 190;

  // 计算高度比例
  const heightRatio = baseHeight / 190; // 使用原始值 190 作为基准

  // 计算动态高度
  const height = -baseHeight + (maxMM.value / 4.0) * ((baseHeight * 260) / 190);

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
  width: var(--travel-card-width);
  height: var(--travel-card-height);
  // display: flex;
  background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;

  .scale-box {
    margin-top: var(--scale-box-margin-top);
    display: flex;
    position: relative;

    &:first-child {
      margin-left: var(--scale-box-margin-left);
    }

    .scale-img {
      width: var(--scale-img-width);
      height: var(--scale-img-height);
      object-fit: cover;
    }

    .progress-bar {
      width: var(--progress-bar-width);
      height: var(--progress-bar-height);
      margin: var(--progress-bar-margin);
      box-sizing: border-box;
      padding-top: var(--progress-bar-padding-top);
      position: relative;
      background-image: url('@/assets/images/progress_bar.svg');
      background-size: cover;
      background-repeat: no-repeat;

      div {
        width: var(--progress-inner-width);
        height: var(--progress-inner-height);
        display: block;
        // height: 0;
        position: absolute;
        border-radius: var(--progress-inner-border-radius);
        top: var(--progress-inner-top);
        left: var(--progress-inner-left);
        overflow: hidden;
      }

      .progress {
        width: 100%;
        height: 100%;
        object-fit: fill;
        transform: translateX(var(--progress-transform-value));
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
      height: var(--nums-height);
      top: var(--nums-top);
      left: var(--nums-left);
      background-color: pink;

      p {
        color: #ccc;
        font-size: var(--scale-font-size);
        position: absolute;
        font-family: 'CN Regular';
      }
      .scale_1 {
        top: var(--scale-1-top);
      }
      .scale_2 {
        top: var(--scale-2-top);
      }
      .scale_3 {
        top: var(--scale-3-top);
      }
      .scale_3_3 {
        top: var(--scale-3-3-top);
      }
    }
  }

  .switch-box {
    width: var(--switch-box-width);
    height: var(--switch-box-height);
    line-height: var(--switch-box-line-height);
    margin: var(--switch-box-margin);
    background-image: url('@/assets/images/switch_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    span {
      font-size: var(--switch-text-font-size);
      color: #ccc;
      font-family: 'CN Heavy';
      // -webkit-text-stroke: 1px #000000;
      margin-left: var(--switch-text-margin-left);
    }

    .el-switch {
      margin-left: var(--switch-margin-left);
      --el-switch-on-color: rgb(145, 188, 0);
      --el-switch-off-color: rgba(0, 0, 0, 0);
      font-family: 'CN Heavy';

      .custom-active-action {
        width: var(--custom-action-width);
        height: var(--custom-action-height);
      }

      // &.is-checked {
      //   color: #000000;
      // }
    }
  }
}
</style>
