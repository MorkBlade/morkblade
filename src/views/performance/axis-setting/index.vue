<template>
  <div class="axis-container">
    <div class="axis-container__setting">
      <mCarousel
        :carouselData="KEY_SHAFT"
        :btnText="'应用轴体'"
        :offset="scaleValue(25)"
        :width="scaleValue(920)"
        showText
        @changeAxis="changeAxis"
      />
    </div>
    <div class="axis-container__info">
      <div class="axis-name">
        <span>轴体名称:</span>
        <span>{{ KEY_SHAFT[checkAixsId]?.name }}</span>
      </div>
      <div class="axis-travel">
        <span>轴体名称:</span>
        <span>{{ travelRange }}</span>
      </div>
      <saveConfigBtn btnText="应用轴体" @saveConfig="handleSaveAxis" :disabled="activeKeys.length === 0" />
    </div>
  </div>
</template>

<script setup>
import services from '@/services/index';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore } from '@/stores';
import { KEY_SHAFT } from '@/configs/constant/index.js';

import mCarousel from '@/components/carousel.vue';
import saveConfigBtn from '@/components/save-config-btn.vue';

const keyboardStore = useKeyboardStore();
const checkAixsId = ref(3);

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const travelRange = computed(() => {
  if (checkAixsId.value === null) return '';
  return (
    KEY_SHAFT[checkAixsId.value]?.minTravel / 1000 + 'mm' + '-' + KEY_SHAFT[checkAixsId.value]?.maxTravel / 1000 + 'mm'
  );
});

const handleSaveAxis = async () => {
  // console.log('handleSaveAxis', axis, activeKeys.value);
  // checkAixsId.value = axis - 1;
  const { currentLayoutData } = keyboardStore;
  if (activeKeys.value.length !== 0) {
    const promises = activeKeys.value.map(async (keyLocation) => {
      const [key1, key2] = keyLocation.split('-');
      const x = Number(key1);
      const y = Number(key2);
      currentLayoutData[y][x].axis = checkAixsId.value;
      const keyValue = currentLayoutData[y][x];
      services.setAxis(keyValue.value, checkAixsId.value);
    });
    await Promise.all(promises);
  }
};

const changeAxis = (axisID) => {
  checkAixsId.value = KEY_SHAFT.findIndex((ite) => ite.id === axisID);
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
