<template>
  <div class="lighting-advanced-container">
    <div class="lighting-advanced-container__saturation">
      <div>
        <h4>{{ t('lightingAdvanced.temperature') }}</h4>
        <div class="rgb-input">
          <span>R</span>
          <input type="number" v-model.number="rgb.R" :min="min" :max="max" @input="updateFromRgb" @blur="handleBlur" />
          <i v-if="!isVersion2">%</i>
          <horizontalSlider :sliderValue="rgb.R" :min="min" :max="max"
            @sendSliderVal="(val) => handleSaturation(val, 'R')" />
        </div>
        <div class="rgb-input">
          <span>G</span>
          <input type="number" v-model.number="rgb.G" :min="min" :max="max" @input="updateFromRgb" @blur="handleBlur" />
          <i v-if="!isVersion2">%</i>
          <horizontalSlider :sliderValue="rgb.G" :min="min" :max="max"
            @sendSliderVal="(val) => handleSaturation(val, 'G')" />
        </div>
        <div class="rgb-input">
          <span>B</span>
          <input type="number" v-model.number="rgb.B" :min="min" :max="max" @input="updateFromRgb" @blur="handleBlur" />
          <i v-if="!isVersion2">%</i>
          <horizontalSlider :sliderValue="rgb.B" :min="min" :max="max"
            @sendSliderVal="(val) => handleSaturation(val, 'B')" />
        </div>
      </div>
    </div>
    <template v-if="isVersion2 && appVersionVeify(appStore.baseInfo?.appVersion, isDoubleLighting)">
      <div class="lighting-advanced-container__lamp">
        <h4>{{ t('lightingAdvanced.lamp') }}</h4>
        <div class="lamp-setting">
          <div class="lamp-show">
            <div class="top_lamp" :class="{ active: upOpen }">
              <img src="@/assets/images/sure.svg" alt="" v-if="upOpen" />
            </div>
            <div class="bottom_lamp" :class="{ active: downOpen }">
              <img src="@/assets/images/sure.svg" alt="" v-if="downOpen" />
            </div>
          </div>
          <div class="lamp-control">
            <div class="switch-box">
              <span class="upper-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('lightingAdvanced.up')
                }}</span>
              <el-switch v-model="upOpen" :width="getSwitchWidth()" inline-prompt active-text="ON" inactive-text="OFF"
                @change="handleDoubleLight(1)">
                <template #active-action>
                  <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
                </template>
                <template #inactive-action>
                  <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
                </template>
              </el-switch>
            </div>
            <div class="switch-box">
              <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('lightingAdvanced.down') }}</span>
              <el-switch v-model="downOpen" :width="getSwitchWidth()" inline-prompt active-text="ON" inactive-text="OFF"
                @change="handleDoubleLight(0)">
                <template #active-action>
                  <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
                </template>
                <template #inactive-action>
                  <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
                </template>
              </el-switch>
            </div>
            <div class="switch-box">
              <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('lightingAdvanced.doubleLamp') }}</span>
              <el-switch v-model="allLamp" :width="getSwitchWidth()" inline-prompt active-text="ON" inactive-text="OFF"
                @change="handleAllLight">
                <template #active-action>
                  <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
                </template>
                <template #inactive-action>
                  <img class="custom-active-action" src="@/assets/images/sliding_block.svg" />
                </template>
              </el-switch>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { useLightingHook } from '@/hooks';
import { useAppStore, useLightSettingStore, useDeviceStore } from '@/stores';
import { appVersionVeify } from '@/utils/versionVeify';

import horizontalSlider from '@/components/horizontal-slider.vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const appStore = useAppStore();
const deviceStore = useDeviceStore();
const lightSettingStore = useLightSettingStore();
const { setLighting, setLightingSaturation } = useLightingHook();
const { saturation: rgb, upOpen, downOpen, allLamp } = storeToRefs(lightSettingStore);
const { isDoubleLighting } = storeToRefs(deviceStore);

const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const min = 0;
const max = isVersion2 ? 50 : 100;
const topLamp = ref(false);
const bottomLamp = ref(false);
// const allLamp = ref(upOpen.value && downOpen.value);
let timer = null;

const updateFromRgb = () => {
  // 确保RGB值在有效范围内
  rgb.value.R = Math.min(255, Math.max(0, rgb.value.R));
  rgb.value.G = Math.min(255, Math.max(0, rgb.value.G));
  rgb.value.B = Math.min(255, Math.max(0, rgb.value.B));
};

const handleBlur = () => {
  if (isVersion2) {
    if (rgb.value.R > 50) rgb.value.R = 50;
    if (rgb.value.G > 50) rgb.value.G = 50;
    if (rgb.value.B > 50) rgb.value.B = 50;
  } else {
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

// 添加一个获取开关宽度的函数
const getSwitchWidth = () => {
  const switchWidthValue = getComputedStyle(document.documentElement).getPropertyValue('--switch-width');
  return parseInt(switchWidthValue) || 73; // 提供一个默认值以防 CSS 变量未定义
};

const handleDoubleLight = async (flag) => {
  let keyCode = 'Open';
  if (!downOpen.value && !upOpen.value) {
    lightSettingStore.updateSwitch(false);
    keyCode = 'Close';
    allLamp.value = false;
  } else if (downOpen.value && upOpen.value) {
    keyCode = 'Open';
    lightSettingStore.updateSwitch(true);
    allLamp.value = true;
  } else if (!downOpen.value || upOpen.value) {
    keyCode = 'OpenUp';
    allLamp.value = false;
    lightSettingStore.updateSwitch(true);
  } else if (downOpen.value || !upOpen.value) {
    keyCode = 'OpenDown';
    allLamp.value = false;
    lightSettingStore.updateSwitch(true);
  }
  await setLighting('DoubleLighting', keyCode);
};

const handleAllLight = async () => {
  let keyCode;
  if (allLamp.value) {
    keyCode = 'Open';
    upOpen.value = true;
    downOpen.value = true;
    lightSettingStore.updateSwitch(true);
  } else if (!allLamp.value) {
    keyCode = 'Close';
    upOpen.value = false;
    downOpen.value = false;
    lightSettingStore.updateSwitch(false);
  }
  await setLighting('DoubleLighting', keyCode);
};
</script>

<style scoped lang="scss">
.lighting-advanced-container {
  width: var(--size-1310);
  height: var(--size-290);
  // background-image: url('@/assets/images/saturation_bg.svg');
  // background-size: cover;
  // background-repeat: no-repeat;
  display: flex;
  align-items: center;

  &__saturation {
    height: 100%;
    flex: 1;
    background-color: #000;
    border-radius: var(--spacing-20);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    >div {
      width: var(--saturation-width);

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
          -moz-appearance: textfield;
          /* Firefox */
        }
      }
    }
  }

  &__lamp {
    height: 100%;
    flex: 1;
    background-color: #000;
    border-radius: var(--spacing-20);
    margin-left: var(--spacing-30);
    position: relative;

    & .lamp-setting {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      & .lamp-show {
        width: var(--size-140);
        height: var(--size-140);
        background-image: url('@/assets/images/lamp_bg.svg');
        background-size: cover;
        background-repeat: no-repeat;
        position: relative;

        .top_lamp,
        .bottom_lamp {
          width: var(--size-30);
          height: var(--size-20);
          box-sizing: border-box;
          border: var(--spacing-1) solid rgb(27, 27, 27);
          position: absolute;
          left: 50%;
          margin-left: calc(var(--spacing-15) * -1);
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            border-color: rgb(145, 188, 0);
          }

          >img {
            width: var(--size-12);
            height: var(--size-12);
            object-fit: fill;
          }
        }

        .top_lamp {
          top: var(--spacing-15);
        }

        .bottom_lamp {
          bottom: var(--spacing-15);
        }
      }

      & .lamp-control {
        height: 100%;
        box-sizing: border-box;
        padding-top: var(--lamp-item-gap);

        & .switch-box {
          width: var(--size-170);
          height: var(--size-36);
          line-height: var(--size-34);
          margin: 0 0 var(--spacing-30) var(--spacing-40);
          background-image: url('@/assets/images/switch_bg.svg');
          background-size: cover;
          background-repeat: no-repeat;
          display: flex;

          span {
            margin-left: var(--spacing-25);
            font-size: var(--font-size-13);
            color: #ccc;
            font-family: 'CN Heavy';
            display: inline-block;
            width: 55px;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
            overflow: hidden;
            // -webkit-text-stroke: 1px #000000;
          }

          .el-switch {
            margin-left: var(--spacing-12);
            margin-top: var(--spacing-2);
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
    }
  }

  & h4 {
    width: var(--size-100);
    text-align: center;
    font-weight: 500;
    font-family: 'CN Heavy';
    font-size: var(--font-size-14);
    color: rgb(221, 221, 221);
    position: absolute;
    top: var(--spacing-15);
    left: 50%;
    margin-left: calc(var(--spacing-50) * -1);
  }
}
</style>
