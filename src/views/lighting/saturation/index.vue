<template>
  <div class="saturation-container">
    <div class="saturation-container__setting">
      <div class="rgb-input">
        <span>R</span>
        <input type="number" v-model.number="rgb.R" :min="min" :max="max" @input="updateFromRgb" />
        <horizontalSlider
          :sliderValue="rgb.R"
          :min="min"
          :max="max"
          @sendSliderVal="(val) => handleSaturation(val, 'R')"
        />
      </div>
      <div class="rgb-input">
        <span>G</span>
        <input type="number" v-model.number="rgb.G" :min="min" :max="max" @input="updateFromRgb" />
        <horizontalSlider
          :sliderValue="rgb.G"
          :min="min"
          :max="max"
          @sendSliderVal="(val) => handleSaturation(val, 'G')"
        />
      </div>
      <div class="rgb-input">
        <span>B</span>
        <input type="number" v-model.number="rgb.B" :min="min" :max="max" @input="updateFromRgb" />
        <horizontalSlider
          :sliderValue="rgb.B"
          :min="min"
          :max="max"
          @sendSliderVal="(val) => handleSaturation(val, 'B')"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { useLightingHook } from '@/hooks';
import { useLightSettingStore } from '@/stores';

import horizontalSlider from '@/components/horizontal-slider.vue';
import { storeToRefs } from 'pinia';

const lightSettingStore = useLightSettingStore();
const { setLightingSaturation } = useLightingHook();
const { saturation: rgb } = storeToRefs(lightSettingStore);

const min = 0;
const max = 255;
let timer = null;

const updateFromRgb = () => {
  // 确保RGB值在有效范围内
  rgb.value.r = Math.min(255, Math.max(0, rgb.value.r));
  rgb.value.g = Math.min(255, Math.max(0, rgb.value.g));
  rgb.value.b = Math.min(255, Math.max(0, rgb.value.b));
};

const handleSaturation = (colorVal, keyCode) => {
  rgb.value[keyCode] = colorVal;
  timer && clearTimeout(timer);
  // 使用setTimeout来延迟执行setLightingSaturation
  timer = setTimeout(async () => {
    const res = await setLightingSaturation();
  }, 200);
};
</script>

<style scoped lang="scss">
.saturation-container {
  width: 1310px;
  height: var(--size-290);
  background-image: url('@/assets/images/saturation_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;

  &__setting {
    width: 324px;
    & .rgb-input {
      width: var(--size-100);
      height: var(--size-36);
      display: flex;
      margin-bottom: var(--spacing-10);
      align-items: center;
      background-image: url('@/assets/images/rgb.svg');
      background-size: cover;
      background-repeat: no-repeat;

      span {
        margin: 0 var(--spacing-18);
        font-size: var(--font-size-13);
        color: #ffffff;
        font-family: 'CN Heavy';
      }
      input {
        width: var(--size-25);
        font-size: var(--font-size-10);
        margin-left: var(--spacing-12);
        margin-right: var(--spacing-30);
        color: #cccccc;
        text-align: center;
        font-family: 'CN Heavy';
        background-color: transparent;
        border: none;
        outline: none;
      }
      /* For Webkit browsers (Chrome, Safari) */
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* For Firefox */
      input[type='number'] {
        -moz-appearance: textfield; /* Firefox */
      }
    }
  }
}
</style>
