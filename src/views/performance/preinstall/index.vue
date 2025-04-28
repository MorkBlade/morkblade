<template>
  <div class="preinstall-box">
    <mCarousel :carouselData="PRESET_SETTINGS" @handleChangeItem="handleChangePreset" @handleSave="handleSavePreset" />
    <div class="bottom-taskbar">
      <saveConfigBtn btnText="应用预设" :needKeys="false" @saveConfig="handleSavePreset" />
    </div>
  </div>
</template>

<script setup>
import { PRESET_SETTINGS } from '@/configs/constant/index.js';
import { useKeyboardStore } from '@/stores';
import { usePerformanceHook } from '@/hooks/usePerformanceHook';

import mCarousel from '@/components/carousel.vue';

const keyboardStore = useKeyboardStore();
const { setPreset } = usePerformanceHook();
const checkedPreset = ref(PRESET_SETTINGS[3]);

const handleChangePreset = (id) => {
  checkedPreset.value = PRESET_SETTINGS[id - 1];
};

const handleSavePreset = async () => {
  setPreset(keyboardStore.keyboards, checkedPreset.value);
};
</script>

<style scoped lang="scss">
.preinstall-box {
  width: var(--size-1310);
  height: var(--size-290);
  background-image: url('@/assets/images/preinstall_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  position: relative;

  & .bottom-taskbar {
    position: absolute;
    top: var(--size-230);
    left: calc(var(--size-510) - var(--spacing-5));
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
