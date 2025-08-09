<template>
  <div class="calibration-mode">
    <div ref="chartRef" class="chart-container"></div>
    <img src="@/assets/images/echarts_bg.svg" alt="" />
    <div class="calibration-nums">
      <span>0.0</span>
      <span>1.0</span>
      <span>2.0</span>
      <span>3.0</span>
      <span>4.0</span>
    </div>
  </div>
</template>
<script setup>
defineOptions({ name: 'DeviceCalibrationMode' });

import emitter from '@/utils/app-emitter';
import echarts from '@/configs/echarts/index.js';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, usePerformanceStore } from '@/stores';

const performanceStore = usePerformanceStore();
const keyboardStore = useKeyboardStore();
const { isStart } = defineProps({
  isStart: { type: Boolean, default: false },
});
const enabled = ref(false);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const chartRef = ref(null);
const chartInstance = ref(null);
const keyPressTestCount = ref(0);
const count = ref(0);
const notification = ref(null);
const option = {
  tooltip: {},
  grid: {
    left: scaleValue(15),
    right: scaleValue(15),
    top: scaleValue(10),
    bottom: scaleValue(10),
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: 200,
    axisLabel: { show: false }, // 隐藏刻度
    axisTick: { show: false }, // 隐藏刻度线
    axisLine: { show: false }, // 隐藏轴线
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 4,
    interval: 0.5,
    inverse: true, // 实现从顶部往下绘制
    axisLabel: { formatter: '{value}' },
    axisLabel: { show: false }, // 隐藏刻度
    axisTick: { show: false }, // 隐藏刻度线
    axisLine: { show: false }, // 隐藏轴线
    splitLine: { show: false },
  }, // 每个刻度为1000
  series: [
    {
      name: '实时行程',
      type: 'line',
      showSymbol: false,
      data: [],
      lineStyle: {
        color: 'rgb(145, 188, 0)', // 线条颜色，这里设置为绿色
        width: 2, // 线条宽度
        type: 'solid', // 线条类型：'solid'|'dashed'|'dotted'
      },
      areaStyle: {
        // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
          {
            offset: 0,
            color: 'rgba(145, 188, 0, 0.3)', // 渐变起始颜色，半透明绿色
          },
          {
            offset: 1,
            color: 'rgba(0, 255, 0, 0)', // 渐变结束颜色，完全透明
          },
        ]),
      },
    },
  ], // 隐藏数据点的圆圈
};

onMounted(() => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value);
    chartInstance.value.setOption(option);
  }
});

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

const handleEnabledChange = async (value) => {
  if (value) {
    isVersion2.value ? performanceStore.calibrationStartV2() : performanceStore.calibrationStart();
  } else {
    performanceStore.isTravelTest = false;
    isVersion2.value ? performanceStore.calibrationEndV2() : performanceStore.calibrationEnd();
  }
  // emitter.emit('calibration-mode', { value });
  keyPressTestCount.value++;
};

watch(
  () => isStart,
  (newVal) => {
    if (newVal) {
      handleEnabledChange(newVal);
    }
  },
  // { immediate: true },
);

// TODO 偶现无法进入校准模式/卡死
watch(keyPressTestCount, async () => {
  if (isStart) {
    let mmBuff = 0;
    if (isVersion2.value) {
      performanceStore.isTravelTest = true;
      const { max } = await performanceStore.getRm6X21CalibrationV2(keyboardStore.keyboards);
      mmBuff = max;
    } else {
      const { max } = await performanceStore.getRm6X21Calibration(keyboardStore.keyboards);
      mmBuff = max;
    }
    option.series[0].data.push([count.value, mmBuff]);

    if (count.value > 200) {
      // x轴范围向右移动
      option.xAxis.max = count.value;
      option.xAxis.min = count.value - 200;
    }

    count.value++;

    if (option.series[0].data.length > 200) {
      option.series[0].data.shift(); // 移除数组中的第一个元素
    }
    if (chartInstance.value) {
      chartInstance.value.setOption(option);
    }
    keyPressTestCount.value++;
  }
});

onUnmounted(() => {
  enabled.value = false;
  if (isStart) {
    isVersion2.value ? performanceStore.calibrationEndV2() : performanceStore.calibrationEnd();
  }
});
</script>

<style scoped lang="scss">
.calibration-mode {
  position: relative;

  &-header {
    display: flex;
    align-items: center;
  }

  .chart-container {
    width: 1075px;
    height: 260px;
    position: absolute;
    z-index: 1;
    margin: 43px 0 0 135px;
  }

  img {
    width: 1280px;
    height: 325px;
    object-fit: fill;
    position: absolute;
    left: 10px;
    top: 10px;
  }

  .calibration-nums {
    width: var(--size-20);
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 32px;
    font-size: var(--font-size-15);
    color: #a19595;
    font-family: 'CN Regular';
    position: absolute;
    top: calc(var(--spacing-50) - var(--spacing-3));
    left: var(--spacing-55);
  }
}
</style>
