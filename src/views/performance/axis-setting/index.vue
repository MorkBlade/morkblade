<template>
  <div class="axis-setting">
    <mCarousel :carouselData="KEY_SHAFT" @handleSave="handleSaveAxis" />
  </div>
</template>

<script setup>
import services from '@/services/index';
import { useKeyboardStore } from '@/stores';

import { KEY_SHAFT } from '@/configs/constant/index.js';
import mCarousel from '@/components/carousel.vue';

const keyboardStore = useKeyboardStore();
const checkAixsId = ref(null);

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const handleSaveAxis = async (axis) => {
  // console.log('handleSaveAxis', axis, activeKeys.value);
  checkAixsId.value = axis - 1;
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
</script>

<style scoped lang="scss">
.axis-setting {
  width: 1310px;
  height: 290px;
  background-image: url('@/assets/images/preinstall_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
}
</style>
