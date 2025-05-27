<template>
  <div class="axis-container">
    <div class="axis-container__setting">
      <!-- :carouselData="performanceStore.axisList" -->
      <mCarousel
        showText
        :carouselData="performanceStore.axisList"
        :btnText="'应用轴体'"
        :offset="scaleValue(25)"
        :width="scaleValue(920)"
        :selected-id="axisID"
        @handleChangeItem="changeAxis"
      />
    </div>
    <div class="axis-container__info">
      <div class="axis-name">
        <span>轴体名称:</span>
        <span>{{ performanceStore.axisList[checkAixsId]?.axis_name }}</span>
      </div>
      <div class="axis-travel">
        <span>轴体行程:</span>
        <span>{{ travelRange }}</span>
        <!-- {{ axisID }} -->
      </div>
      <saveConfigBtn btnText="应用轴体" :verify="true" @saveConfig="handleSaveAxis" />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { KEY_SHAFT } from '@/configs/constant/index.js';
import { usePerformanceHook } from '@/hooks';

import mCarousel from '@/components/carousel.vue';
import saveConfigBtn from '@/components/save-config-btn.vue';
import sureIcon from '@/assets/images/sure.svg';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboards } = storeToRefs(keyboardStore);
const checkAixsId = ref(3);

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const axisID = computed(() => {
  if (activeKeys.value.length > 0) {
    const lastcheckedKey = String(activeKeys.value[activeKeys.value.length - 1]);
    const [key1, key2] = lastcheckedKey.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // console.log(keyboards.value[rowIndex][colIndex].performance.axisID);
    return keyboards.value[rowIndex][colIndex].performance.axisID;
  }
  return 0;
});

const travelRange = computed(() => {
  if (checkAixsId.value === null) return '';
  const axisList = performanceStore.axisList;
  return `${axisList[checkAixsId.value]?.doctrine_range_right}mm-${axisList[checkAixsId.value]?.doctrine_range_left}mm`;
});

const handleSaveAxis = async () => {
  if (activeKeys.value.length !== 0) {
    const { setAxis } = usePerformanceHook();
    console.log('set axis:', keyboards.value, activeKeys.value, checkAixsId.value);
    const res = setAxis(keyboards.value, activeKeys.value, checkAixsId.value);
    if (res) {
      ElMessage({
        grouping: true,
        duration: 1000,
        dangerouslyUseHTMLString: true,
        message: `<span class="custom-message"><img src="${sureIcon}" class="warn-icon"/>修改成功</span>`,
        customClass: 'custom-message-container',
      });
    }
  }
};

const changeAxis = (axisID) => {
  const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
  // if (isVersion2) {
  // } else {
  //   checkAixsId.value = KEY_SHAFT.findIndex((ite) => ite.id === axisID);
  // }
  const axisList = performanceStore.axisList;
  checkAixsId.value = axisList.findIndex((ite) => ite.axis_id === axisID);
  console.log('changeAxis', axisID, checkAixsId.value);
};
</script>

<style scoped lang="scss">
.axis-container {
  display: flex;

  &__setting {
    width: var(--axis-width);
    height: var(--size-290);
    background-image: url('@/assets/images/axis_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;
  }
  &__info {
    width: var(--size-306);
    height: var(--size-290);
    margin-left: var(--spacing-30);
    padding-left: var(--spacing-20);
    box-sizing: border-box;
    background-image: url('@/assets/images/axis_info_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    .axis-name,
    .axis-travel {
      margin-top: var(--spacing-50);
      color: #fff;
      font-size: var(--font-size-15);
      font-family: 'CN Heavy';
      display: flex;
      justify-content: center;
    }

    .axis-travel {
      margin-bottom: var(--spacing-60);
    }
  }
}
</style>
