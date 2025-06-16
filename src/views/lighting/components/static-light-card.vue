<template>
  <div class="static-light">
    <p>静态灯光</p>
    <div class="light-box">
      <div
        class="light"
        v-for="(ite, idx) in staticLightColorList"
        :key="idx"
        :class="{ 'is-checked': currentChecked(idx) }"
        @click="onClick(idx)"
      >
        <template v-if="isVersion2">
          <template v-if="!idx">
            <img src="@/assets/images/colorful.png" alt="" />
          </template>
          <template v-else>
            <div class="show-color" :style="{ backgroundColor: ite.color }" @click="showColorPicker(idx)">
              <div v-if="showColorPickerIdx === idx">
                <t-color-picker-panel
                  v-model="ite.color"
                  :colorModes="['monochrome']"
                  :recentColors="[]"
                  :show-primary-color-preview="false"
                  @change="onChange"
                />
                <input
                  type="text"
                  v-model="ite.color"
                  maxlength="7"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  @input="updateColor"
                  @keypress="validateHexInput"
                  @blur="blurUpdateColor"
                />
                <span class="clear-color" @click="clearLightingColor(idx)">清除</span>
              </div>
            </div>
          </template>
          <span class="color-text">{{ !idx ? '彩色' : `灯光${idx}` }}</span>
        </template>
        <template v-else>
          <div class="show-color" :style="{ backgroundColor: ite.color }" @click="showColorPicker(idx)">
            <div v-if="showColorPickerIdx === idx">
              <t-color-picker-panel
                v-model="ite.color"
                :colorModes="['monochrome']"
                :recentColors="[]"
                :show-primary-color-preview="false"
                @change="onChange"
              />
              <input
                type="text"
                v-model="ite.color"
                maxlength="7"
                pattern="^#[0-9A-Fa-f]{6}$"
                @input="updateColor"
                @keypress="validateHexInput"
                @blur="blurUpdateColor"
              />
              <span class="clear-color" @click="clearLightingColor(idx)">清除</span>
            </div>
          </div>
          <span class="color-text">{{ idx === 7 ? '彩色' : `灯光${idx + 1}` }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLightSettingStore } from '@/stores';
import emitter from '@/utils/app-emitter';

const { staticLightColorList, staticType } = defineProps({
  staticLightColorList: {
    type: Array,
  },
  staticType: {
    type: String,
  },
});

const lightSettingStore = useLightSettingStore();
const checkedLight = ref(0);
const checkedColor = ref(null);
const showColorPickerIdx = ref(null);
const emits = defineEmits(['checkStaticLight', 'checkLogoStaticLight', 'changeColorPicker', 'changeLogoColorPicker']);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

const currentChecked = computed(() => {
  return (idx) => {
    if (staticType === 'keyLight') {
      checkedLight.value = lightSettingStore.light.selectStaticColor;
      return !lightSettingStore.light.mode && lightSettingStore.light.selectStaticColor === idx;
    } else {
      checkedLight.value = lightSettingStore.logo.selectStaticColor;
      return !lightSettingStore.logo.mode && lightSettingStore.logo.selectStaticColor === idx;
    }
  };
});

// TODO 灯光初始化
const onClick = (idx) => {
  console.log('onClick-----------------------');
  checkedLight.value = idx;
  checkedColor.value = staticLightColorList[idx].color;
  // console.log('checkedColor.value', checkedColor.value);
  if (staticType === 'keyLight') {
    emits('checkStaticLight', checkedColor.value, idx);
  } else {
    emits('checkLogoStaticLight', checkedColor.value, idx);
  }
};

const onChange = (color, context) => {
  console.log('color picker change:>>>>>>', color, checkedLight.value, context);
  if (staticType === 'keyLight') {
    emits('changeColorPicker', context.color.hex, checkedLight.value, isVersion2.value);
  } else {
    // TODO v2暂无logo灯
    emits('changeLogoColorPicker', context.color.hex, checkedLight.value, isVersion2.value);
  }
};

// 添加点击外部区域隐藏颜色选择器的逻辑
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event) => {
  // 检查点击是否在颜色选择器面板内
  const colorPickerPanel = event.target.closest('.t-color-picker-panel');
  const colorInput = event.target.closest('input[type="text"]');
  const clearButton = event.target.closest('.clear-color');

  // 如果点击的是颜色选择器面板、输入框或清除按钮，不隐藏
  if (colorPickerPanel || colorInput || clearButton) {
    return;
  }

  // 检查点击是否在颜色块内
  const colorBlock = event.target.closest('.show-color');
  if (colorBlock) {
    return;
  }

  // 如果点击在其他地方，隐藏颜色选择器
  showColorPickerIdx.value = null;
};

const showColorPicker = (idx) => {
  if (showColorPickerIdx.value === idx) {
    // showColorPickerIdx.value = null;
  } else {
    showColorPickerIdx.value = idx;
  }
};

// 更新手动输入的颜色值
const updateColor = (event) => {
  let inputColor = event.target.value;

  // 如果输入的不是以#开头，且长度为6位，则自动添加#
  if (!inputColor.startsWith('#') && inputColor.length === 6) {
    inputColor = '#' + inputColor;
  }

  // 移除所有非十六进制字符
  inputColor = inputColor.replace(/[^0-9A-Fa-f#]/g, '');

  // 确保只有一个 # 号，并且它在开头
  if (inputColor.indexOf('#') > 0) {
    inputColor = '#' + inputColor.replace(/#/g, '');
  }

  // 限制长度为7（包括#号）
  if (inputColor.length > 7) {
    inputColor = inputColor.slice(0, 7);
  }

  // 更新输入框的值
  event.target.value = inputColor;

  // 如果颜色值有效（7位且以#开头），则更新颜色
  if (inputColor.length === 7 && inputColor.startsWith('#')) {
    if (staticType === 'keyLight') {
      emits('changeColorPicker', inputColor, checkedLight.value, isVersion2.value);
    } else {
      emits('changeLogoColorPicker', inputColor, checkedLight.value, isVersion2.value);
    }
  }
};

// 验证十六进制输入
const validateHexInput = (event) => {
  const char = event.key;
  // 允许输入 # 号
  if (char === '#') {
    return true;
  }
  // 只允许输入 0-9 和 a-f/A-F
  if (!/^[0-9A-Fa-f]$/.test(char)) {
    event.preventDefault();
    return false;
  }
  return true;
};

const blurUpdateColor = (event) => {
  const inputColor = event.target.value;
  if (!inputColor || inputColor.length < 6) {
    // 如果输入为空或长度不足，设置为黑色
    event.target.value = '#000000';
    if (staticType === 'keyLight') {
      emits('changeColorPicker', '#000000', checkedLight.value, isVersion2.value);
    } else {
      emits('changeLogoColorPicker', '#000000', checkedLight.value, isVersion2.value);
    }
  } else if (!inputColor.startsWith('#')) {
    // 如果没有#前缀，添加#
    const newColor = '#' + inputColor;
    event.target.value = newColor;
    if (staticType === 'keyLight') {
      emits('changeColorPicker', newColor, checkedLight.value, isVersion2.value);
    } else {
      emits('changeLogoColorPicker', newColor, checkedLight.value, isVersion2.value);
    }
  }
};

const clearLightingColor = () => {
  if (staticType === 'keyLight') {
    emits('changeColorPicker', '#000000', checkedLight.value, isVersion2.value);
  } else {
    // TODO v2暂无logo灯
    emits('changeLogoColorPicker', '#000000', checkedLight.value, isVersion2.value);
  }
};
</script>

<style scoped lang="scss">
.static-light {
  width: var(--lighting-static-width);
  height: var(--size-290);
  box-sizing: border-box;
  padding: 0 var(--spacing-10) 0 var(--spacing-20);
  background-image: url('@/assets/images/static_light_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  // overflow: hidden;

  p {
    font-size: var(--font-size-15);
    font-family: 'CN Heavy';
    color: #ccc;
    text-align: center;
    margin: var(--spacing-15) 0 var(--spacing-10) 0;
  }

  .light-box {
    display: flex;
    flex-wrap: wrap;

    .light {
      width: var(--size-70);
      height: var(--size-70);
      margin: 0 var(--lighting-item-right) var(--spacing-10) 0;
      font-size: var(--font-size-10);
      padding-top: var(--spacing-10);
      font-family: 'CN Heavy';
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      cursor: pointer;
      background-image: url('@/assets/images/light_item.svg');
      background-size: cover;
      background-repeat: no-repeat;

      img {
        width: var(--size-30);
        height: var(--size-30);
        object-fit: fill;
      }

      span {
        margin-top: var(--spacing-5);
      }

      & .show-color {
        width: var(--size-25);
        height: var(--size-25);
        border-radius: 50%;
        position: relative;

        > div {
          width: var(--size-260);
          height: var(--size-220);
          background-color: #000;
          border-radius: var(--spacing-5);
          border: var(--spacing-2) solid #000; /* 内边框 */
          box-shadow: 0 0 0 var(--spacing-3) #242424; /* 外边框 */
          position: absolute;
          bottom: var(--spacing-50);
          z-index: 999;

          > input {
            width: var(--size-60);
            height: var(--size-20);
            font-size: var(--font-size-8);
            margin-left: var(--spacing-20);
            color: #ffffff;
            text-align: center;
            font-family: 'CN Heavy';
            background-color: transparent;
            background-image: url('@/assets/images/color_input_bg.svg');
            background-size: cover;
            background-repeat: no-repeat;
            border: none;
            outline: none;
          }

          > .clear-color {
            width: var(--size-40);
            height: var(--size-15);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--spacing-10);
            // margin-top: 0;
            color: #ccc;
            background-color: #242424;
            font-size: var(--spacing-8);
            font-family: 'CN Heavy';
            cursor: pointer;
            margin-left: var(--spacing-105);
            &:hover {
              background-color: red;
              color: #000;
            }
          }
        }
      }

      ::v-deep(.t-input--auto-width) {
        min-width: 0;

        > .t-input {
          background-color: transparent;
          border: none;

          > .t-input__inner {
            display: none;
          }

          > .t-input__prefix:not(:empty) {
            margin-right: 0;
          }

          span {
            border-radius: 50%;
          }
        }
      }
      // .t-color-picker__slider-wrapper
      ::v-deep(.t-color-picker__sliders-wrapper) {
        width: var(--size-200);
        height: var(--size-15);
        margin: var(--spacing-10) 0;
        margin-left: var(--spacing-25);
        border-radius: var(--size-8);
        border: var(--spacing-2) solid #000; /* 内边框 */
        box-shadow: 0 0 0 var(--spacing-3) #242424; /* 外边框 */

        > .t-color-picker__sliders {
          height: var(--size-10);
        }

        & .t-color-picker__slider-wrapper {
          border-radius: var(--size-8);
        }
        & .t-color-picker__slider {
          height: var(--size-10);
        }
        & .t-color-picker__thumb {
          width: var(--size-22);
          height: var(--size-22);
          color: transparent !important;
          background-color: transparent;
          background-image: url('@/assets/images/luminance_btn.svg');
          background-size: cover;
          background-repeat: no-repeat;
        }
      }

      ::v-deep(.t-color-picker__thumb) {
        // color: transparent !important;
      }
    }

    .is-checked {
      background-image: url('@/assets/images/checked_light.svg');
    }
  }
}
</style>
