<template>
  <div class="custom-light">
    <dynamicLightCard
      dynamicType="decorativeLight"
      :dynamicLightMode="lightSettingStore.decorative1.mode - 0"
      @checkDynamicLight="changeDynamicLight"
      @changelightingMode="changelightingMode"
      class="decorative-light-card"
    />

    <!-- logo灯 -->
    <staticLightCard
      v-if="deviceStore.devices[0]?.productId === 5388 && deviceStore.devices[0]?.vendorId === 7334"
      class="static-light"
      staticType="logoLight"
      :staticLightColorList="lightSettingStore.decorative1.staticColors"
      @checkLogoStaticLight="checkLogoStaticLight"
      @changeColorPicker="changeColorPicker"
    />
    <!-- 底灯 -->
    <div v-else class="color-picker-box">
      <div class="color-info">
        <div class="rgb-values">
          <div class="rgb-input">
            <span>R</span>
            <input type="number" v-model.number="rgb.r" min="0" max="255" @input="updateFromRgb" />
          </div>
          <div class="rgb-input">
            <span>G</span>
            <input type="number" v-model.number="rgb.g" min="0" max="255" @input="updateFromRgb" />
          </div>
          <div class="rgb-input">
            <span>B</span>
            <input type="number" v-model.number="rgb.b" min="0" max="255" @input="updateFromRgb" />
          </div>
        </div>
        <div class="scale-values">
          <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
          <input
            type="text"
            v-model="selectedColor"
            @input="updateColor"
            @keypress="validateHexInput"
            @blur="blurUpdateColor"
            maxlength="7"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      </div>
      <div class="color-wheel-container">
        <div ref="colorWheelRef" class="color-wheel"></div>
        <svg>
          <defs>
            <g id="handle">
              <circle
                :cx="scaleValue(6)"
                :cy="scaleValue(6)"
                :r="scaleValue(6)"
                fill="none"
                :stroke-width="scaleValue(1.5)"
                stroke="#fff"
              ></circle>
            </g>
          </defs>
        </svg>
      </div>
      <div class="color-blocks">
        <div
          v-for="color in colorList"
          :key="color"
          :style="{ backgroundColor: color }"
          @click="changeColor(color)"
        ></div>
        <button @click="resetDecorateCustom" class="reset-default-btn">恢复</button>
      </div>
    </div>

    <lightLuminance
      @changeSleepDelay="debouncedChangeSleepDelay"
      @changeLuminance="debouncedChangeLuminance"
      @changeSpeed="debouncedChangeSpeed"
      v-model="lightSettingStore.decorative1"
    />
  </div>
</template>

<script setup>
import iro from '@jaames/iro';
import services from '@/services/index';
import { scaleValue } from '@/utils/responsive.js';
import { useLightSettingStore, usePageStore, useDeviceStore } from '@/stores';
import dynamicLightCard from '../components/dynamic-light-card.vue';
import staticLightCard from '../components/static-light-card.vue';
import lightLuminance from '../components/light-luminance.vue';
import { debounce } from 'lodash';
import { useLightingHook } from '@/hooks';

const lightSettingStore = useLightSettingStore();
const deviceStore = useDeviceStore();
const pageStore = usePageStore();
const keyLighting = defineModel();
const { setLogoLightingPalette } = useLightingHook();

// 颜色预设列表
const colorList = ['#080cfe', '#ff0000', '#ffff00', '#fe00e9', '#00fe2f', '#fe3602', '#ffffff', '#1481fe', '#00ffd8'];

// 色轮相关状态
const colorWheelRef = ref(null);
const selectedColor = ref('#bdd600');
const rgb = ref({ r: 189, g: 214, b: 0 });
let colorPicker = ref(null);

// 初始化色轮
onMounted(async () => {
  // 切换到装饰灯光区域
  lightSettingStore.setArea('Decorate1');

  // 初始化装饰灯光配置
  await initDecorativeLightingData();

  if (colorWheelRef.value) {
    // 获取容器宽度，确保颜色选择器不会太大
    const containerWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--lighting-dynamic-width'),
    );
    const optimalWidth = Math.min(containerWidth * 0.4, scaleValue(165));

    colorPicker = new iro.ColorPicker(colorWheelRef.value, {
      width: optimalWidth,
      color: selectedColor.value,
      handleRadius: 8, // 手柄大小
      // 设置手柄属性
      handleProps: {
        className: 'custom-handle', // 添加自定义类名
      },
      handleSvg: '#handle',
      layout: [
        { component: iro.ui.Wheel }, // 色轮
        { component: iro.ui.Slider, options: { sliderType: 'value' } }, // 亮度滑块
      ],
    });

    // 监听颜色变化事件
    colorPicker.on('color:change', (color) => {
      selectedColor.value = color.hexString;
      rgb.value = color.rgb;
      lightSettingStore.updateCurrentColor(rgb.value);
    });
  }
  pageStore.switchLightingMode('decorativeLighting');
});

// 改变logo颜色
const checkLogoStaticLight = async (color, idx) => {
  lightSettingStore.decorative1.selectStaticColor = Number(idx);
  lightSettingStore.decorative1.staticColors[idx].color = color;
  lightSettingStore.decorative1.type = 'static';
  lightSettingStore.setDecorativeLighting();
};
const changeColorPicker = async (color, idx) => {
  lightSettingStore.decorative1.selectStaticColor = Number(idx);
  lightSettingStore.decorative1.staticColors[idx].color = color;
  lightSettingStore.decorative1.type = 'static';
  setLogoLightingPalette();
};

// 从RGB输入更新色轮
const updateFromRgb = () => {
  // 确保RGB值在有效范围内
  rgb.value.r = Math.min(255, Math.max(0, rgb.value.r));
  rgb.value.g = Math.min(255, Math.max(0, rgb.value.g));
  rgb.value.b = Math.min(255, Math.max(0, rgb.value.b));

  const newColor = `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`;
  if (colorPicker) {
    colorPicker.color.set(newColor);
    selectedColor.value = colorPicker.color.hexString;
  }
};

// 验证颜色值是否有效
const isValidColor = (color) => {
  try {
    // 尝试创建一个新的 iro.Color 实例
    new iro.Color(color);
    return true;
  } catch (e) {
    return false;
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

// 更新手动输入的颜色值
const updateColor = (event) => {
  let inputColor = event.target.value;

  // 如果输入的不是以#开头，且长度为6位，则自动添加#
  if (!inputColor.startsWith('#') && inputColor.length === 6) {
    inputColor = '#' + inputColor;
    selectedColor.value = inputColor; // 更新显示的值
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

  selectedColor.value = inputColor;

  // 只有当输入是完整的颜色值时才更新色轮
  if (inputColor.length === 7 && isValidColor(inputColor)) {
    colorPicker.color.set(inputColor);
    const color = colorPicker.color;
    rgb.value = {
      r: Math.round(color.rgb.r),
      g: Math.round(color.rgb.g),
      b: Math.round(color.rgb.b),
    };
  }
};

const blurUpdateColor = () => {
  if (selectedColor.value.length < 6) {
    selectedColor.value = '#000000';
  }
};

const resetDecorateCustom = () => {
  lightSettingStore.resetDecorateCustom();
};

// 组件卸载时销毁实例
onBeforeUnmount(() => {
  if (colorPicker) {
    colorPicker.off('color:change');
    colorPicker = null;
  }
  // 恢复到键盘灯光区域
  lightSettingStore.setArea('Keyboard');
  pageStore.switchLightingMode('single');
});

const changeColor = (clickColor) => {
  selectedColor.value = clickColor;
  colorPicker.color.set(clickColor);
  const color = colorPicker.color;
  rgb.value = {
    r: Math.round(color.rgb.r),
    g: Math.round(color.rgb.g),
    b: Math.round(color.rgb.b),
  };
};

// 初始化装饰灯光数据
const initDecorativeLightingData = async () => {
  try {
    const lightingBase = await services.getLightingBaseV2(
      {
        area: 'Decorate1',
        config: 'Base',
      },
      'SingleLighting',
    );


    if (lightingBase) {
      const { open, mode, luminance, speed, direction, selectStaticColor } = lightingBase;
      lightSettingStore.decorative1.open = open === 'Open';
      lightSettingStore.decorative1.mode = mode;
      lightSettingStore.decorative1.luminance = luminance;
      lightSettingStore.decorative1.speed = speed;
      lightSettingStore.decorative1.direction = direction === 'Forward';
      lightSettingStore.decorative1.selectStaticColor = selectStaticColor;
    }
    console.log('⛔--------初始化装饰灯光数据', lightSettingStore.decorative1.staticColors);
  } catch (error) {
    console.error('初始化装饰灯光失败:', error);
  }
};

// v1 动态灯效切换
const changeDynamicLight = (idx) => {
  lightSettingStore.decorative1.mode = idx;
  setDecorativeLighting();
};

// TODO: 装饰灯效模式切换
// v2 灯效模式切换
const changelightingMode = (idx) => {
  // 0，1，2，3
  lightSettingStore.decorative1.mode = idx;
  lightSettingStore.setDecorativeLighting();
};

const debouncedChangeSleepDelay = async (delay) => {
  lightSettingStore.decorative1.sleepTime = delay;
  await lightSettingStore.setDecorativeLighting();
};

const changeLuminance = async (luminance) => {
  lightSettingStore.decorative1.luminance = luminance;
  await lightSettingStore.setDecorativeLighting();
};

const changeSpeed = async (speed) => {
  lightSettingStore.decorative1.speed = speed;
  await lightSettingStore.setDecorativeLighting();
};
const debouncedChangeLuminance = debounce(changeLuminance, 200);
const debouncedChangeSpeed = debounce(changeSpeed, 200);
</script>

<style scoped lang="scss">
.custom-light {
  width: 100%;
  display: flex;
  justify-content: space-around;
  height: var(--size-290);

  .preinstall-light {
    width: var(--lighting-static-width);
    height: var(--size-290);
    box-sizing: border-box;
    padding: 0 var(--spacing-10) 0 var(--spacing-20);
    background-image: url('@/assets/images/static_light_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    p {
      font-size: var(--font-size-15);
      font-family: 'CN Heavy';
      color: #ccc;
      text-align: center;
      margin: var(--spacing-15) 0 var(--spacing-10) 0;
    }

    .custom-box {
      display: flex;
      flex-wrap: wrap;

      .custom {
        width: var(--size-70);
        height: var(--size-70);
        margin: 0 var(--lighting-item-right) var(--spacing-10) 0;
        font-size: var(--font-size-10);
        padding-top: var(--spacing-10);
        margin-bottom: var(--spacing-10);
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
      }

      .is-checked {
        background-image: url('@/assets/images/checked_light.svg');
      }
    }
  }

  .color-picker-box {
    width: var(--lighting-dynamic-width);
    height: var(--size-290);
    margin: 0 var(--spacing-30);
    padding: 0 var(--spacing-10) 0 var(--spacing-15);
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    font-family: 'CN Heavy';
    background-image: url('@/assets/images/dynamic_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;

    .color-info {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .rgb-values {
      margin: var(--spacing-60) 0 0 var(--spacing-70);

      .rgb-input {
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

    .scale-values {
      width: var(--size-120);
      height: var(--size-36);
      margin-left: var(--spacing-50);
      display: flex;
      align-items: center;
      background-image: url('@/assets/images/scale_values.svg');
      background-size: cover;
      background-repeat: no-repeat;

      .color-preview {
        width: var(--size-15);
        height: var(--size-15);
        margin: 0 var(--spacing-15);
        border-radius: 50%;
      }

      input {
        width: var(--size-50);
        font-size: var(--font-size-10);
        margin-left: var(--spacing-10);
        color: #ffffff;
        text-align: center;
        font-family: 'CN Heavy';
        background-color: transparent;
        border: none;
        outline: none;
      }
    }

    .color-wheel-container {
      width: calc(var(--spacing-150) + var(--spacing-2));
      margin: var(--spacing-38) var(--spacing-50) 0 var(--spacing-50);
    }

    .color-blocks {
      width: var(--size-120);
      margin-top: var(--spacing-50);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      align-content: flex-start;

      div {
        width: var(--size-20);
        height: var(--size-20);
        margin-right: var(--spacing-20);
        margin-bottom: var(--spacing-20);
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }
}

.decorative-light-card {
  width: var(--size-200);
  border-radius: var(--size-20);
}

.color-key {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-top: var(--spacing-2);
  border-radius: var(--spacing-6);
  position: absolute;
  top: -0.0313rem;
  left: -0.0323rem;
  z-index: 5;
  transition: background-color 0.3s ease;
}

.reset-default-btn {
  width: var(--size-120);
  height: var(--size-36);
  margin-top: var(--spacing-50);
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #91bc00;
  border: none;
  text-align: center;
  font-family: 'CN Heavy';
  outline: none;
  border-radius: var(--spacing-6);
  cursor: pointer;
}

.static-light {
  margin: 0 20px;
}
</style>
