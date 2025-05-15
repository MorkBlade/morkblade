<template>
  <div class="saturation-container">
    <div class="saturation-container__setting">
      <div class="rgb-input">
        <span>R</span>
        <input type="number" v-model.number="rgb.R" :min="min" :max="max" @input="updateFromRgb" @blur="handleBlur" />
        <i v-if="!isVersion2">%</i>
        <horizontalSlider
          :sliderValue="rgb.R"
          :min="min"
          :max="max"
          @sendSliderVal="(val) => handleSaturation(val, 'R')"
        />
      </div>
      <div class="rgb-input">
        <span>G</span>
        <input type="number" v-model.number="rgb.G" :min="min" :max="max" @input="updateFromRgb" @blur="handleBlur" />
        <i v-if="!isVersion2">%</i>
        <horizontalSlider
          :sliderValue="rgb.G"
          :min="min"
          :max="max"
          @sendSliderVal="(val) => handleSaturation(val, 'G')"
        />
      </div>
      <div class="rgb-input">
        <span>B</span>
        <input type="number" v-model.number="rgb.B" :min="min" :max="max" @input="updateFromRgb" @blur="handleBlur" />
        <i v-if="!isVersion2">%</i>
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

const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const min = 0;
const max = isVersion2 ? 255 : 100;
let timer = null;

const updateFromRgb = () => {
  // 确保RGB值在有效范围内
  rgb.value.R = Math.min(255, Math.max(0, rgb.value.R));
  rgb.value.G = Math.min(255, Math.max(0, rgb.value.G));
  rgb.value.B = Math.min(255, Math.max(0, rgb.value.B));
};

const handleBlur = () => {
  console.log('handleBlur');
  if (isVersion2) {
    if (rgb.value.R > 255) rgb.value.R = 255;
    if (rgb.value.G > 255) rgb.value.G = 255;
    if (rgb.value.B > 255) rgb.value.B = 255;
  } else {
    console.log(rgb.value);
    if (rgb.value.R > 100) rgb.value.R = 100;
    if (rgb.value.G > 100) rgb.value.G = 100;
    if (rgb.value.B > 100) rgb.value.B = 100;
  }
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
      position: relative;

      span {
        margin: 0 var(--spacing-18);
        font-size: var(--font-size-13);
        color: #ffffff;
        font-family: 'CN Heavy';
      }

      i {
        font-style: normal;
        font-size: var(--font-size-10);
        color: #cccccc;
        position: absolute;
        right: var(--spacing-10);
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
