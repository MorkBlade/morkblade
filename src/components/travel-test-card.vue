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
        :width="73"
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
  const height = -190 + (maxMM.value / 4.0) * 260;
  // 限制最大高度为 190px
  return Math.min(Math.max(height, -190), 0);
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
.travel-test-card {
  width: 260px;
  height: 290px;
  // display: flex;
  background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;

  .scale-box {
    margin-top: 20px;
    display: flex;
    position: relative;

    &:first-child {
      margin-left: 60px;
    }

    .scale-img {
      width: 25px;
      height: 200px;
      object-fit: cover;
    }

    .progress-bar {
      width: 30px;
      height: 200px;
      margin: 0 10px;
      box-sizing: border-box;
      padding-top: 5px;
      position: relative;
      background-image: url('@/assets/images/progress_bar.svg');
      background-size: cover;
      background-repeat: no-repeat;

      div {
        width: 20px;
        height: 190px;
        display: block;
        // height: 0;
        position: absolute;
        border-radius: 5px;
        top: 5px;
        left: 5px;
        overflow: hidden;
      }

      .progress {
        width: 100%;
        height: 100%;
        object-fit: fill;
        transform: translateX(-190px);
        transition:
          all 0.2,
          s ease-in-out;
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
      height: 200px;
      top: -5px;
      left: 110px;
      background-color: pink;

      p {
        color: #ccc;
        font-size: 13px;
        position: absolute;
        font-family: 'CN Regular';
      }
      .scale_1 {
        top: 54px;
      }
      .scale_2 {
        top: 114px;
      }
      .scale_3 {
        top: 172px;
      }
      .scale_3_3 {
        top: 191px;
      }
    }
  }

  .switch-box {
    width: 170px;
    height: 36px;
    line-height: 34px;
    margin: 14px 0 0 40px;
    background-image: url('@/assets/images/switch_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    span {
      font-size: 13px;
      color: #ccc;
      font-family: 'CN Heavy';
      // -webkit-text-stroke: 1px #000000;
      margin-left: 16px;
    }

    .el-switch {
      margin-left: 20px;
      --el-switch-on-color: rgb(145, 188, 0);
      --el-switch-off-color: rgba(0, 0, 0, 0);
      font-family: 'CN Heavy';

      .custom-active-action {
        width: 18px;
        height: 18px;
      }

      // &.is-checked {
      //   color: #000000;
      // }
    }
  }
}
</style>
