<template>
  <div class="custom-light">
    <div class="preinstall-light">
      <p>预设</p>
      <div class="custom-box">
        <div
          class="custom"
          v-for="(ite, idx) in 9"
          :key="ite"
          :class="{ 'is-checked': currentPreset === idx }"
          @click="changePreinstall(idx)"
        >
          <img :src="customLightImages[idx]" alt="" />
          <span class="color-text">{{ customList[idx] }}</span>
        </div>
      </div>
    </div>
    <div class="color-picker-box">
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
          <input type="text" v-model="selectedColor" @input="updateColor" />
        </div>
      </div>
      <div class="color-wheel-container">
        <div ref="colorWheelRef" class="color-wheel"></div>
        <svg>
          <defs>
            <g id="handle">
              <!-- 手柄的svg内容开始 -->
              <!-- <rect x="0" y="0" width="6" height="6" r="2" fill="none" stroke-width="2" stroke="#fff"></rect> -->
              <!-- <rect x="0" y="0" width="6" height="6" r="2" fill="none" stroke-width="2" stroke="#fff"></rect> -->
              <circle
                :cx="scaleValue(6)"
                :cy="scaleValue(6)"
                :r="scaleValue(6)"
                fill="none"
                :stroke-width="scaleValue(1.5)"
                stroke="#fff"
              ></circle>
              <!-- <circle cx="6" cy="6" r="4" fill="none" stroke-width="2" stroke="#fff"></circle> -->
              <!-- 手柄的svg内容结束 -->
              <!-- <image href="@/assets/images/luminance_btn.svg" x="0" y="0" width="20" height="20" /> -->
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
      </div>
    </div>
  </div>
</template>

<script setup>
import iro from '@jaames/iro';
import services from '@/services/index';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, useLightSettingStore } from '@/stores';
import { useLightingHook } from '@/hooks/useLightingHook';
import preInstallColorList from '@/configs/customColor/index.js';

const keyboardStore = useKeyboardStore();
const lightSettingStore = useLightSettingStore();
const { currentPreset } = storeToRefs(lightSettingStore);
const { setCustomLighting } = useLightingHook();
// const checked = ref(null);
const customList = ['彩虹', '海浪', '炼狱', '迈阿密', '夏日微风', '交流发电机', '粘土', 'Lekker', 'Love'];
const colorList = ['#080cfe', '#ff0000', '#ffff00', '#fe00e9', '#00fe2f', '#fe3602', '#ffffff', '#1481fe', '#00ffd8'];
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const colorWheelRef = ref(null);
const selectedColor = ref('#bdd600');
const rgb = ref({ r: 189, g: 214, b: 0 });
let colorPicker = ref(null);

// Import all custom light images
const customLightImages = {
  0: new URL('@/assets/images/customlight1.svg', import.meta.url).href,
  1: new URL('@/assets/images/customlight2.svg', import.meta.url).href,
  2: new URL('@/assets/images/customlight3.svg', import.meta.url).href,
  3: new URL('@/assets/images/customlight4.svg', import.meta.url).href,
  4: new URL('@/assets/images/customlight5.svg', import.meta.url).href,
  5: new URL('@/assets/images/customlight6.svg', import.meta.url).href,
  6: new URL('@/assets/images/customlight7.svg', import.meta.url).href,
  7: new URL('@/assets/images/customlight8.svg', import.meta.url).href,
  8: new URL('@/assets/images/customlight9.svg', import.meta.url).href,
};

// 初始化色轮
onMounted(() => {
  if (keyboardStore.activeKeys.length > 0) {
    keyboardStore.cancelSelectKey();
  }
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
});

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

// 更新手动输入的颜色值
const updateColor = (event) => {
  let inputColor = event.target.value;

  // 如果输入的不是以#开头，且长度为6位，则自动添加#
  if (!inputColor.startsWith('#') && inputColor.length === 6) {
    inputColor = '#' + inputColor;
    selectedColor.value = inputColor; // 更新显示的值
  }

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

// 组件卸载时销毁实例
onBeforeUnmount(() => {
  if (colorPicker) {
    colorPicker.off('color:change');
    colorPicker = null;
  }
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

const changePreinstall = async (idx) => {
  lightSettingStore.setCurrentPreset(idx);

  const apiCalls = [];

  // 遍历键盘布局
  keyboardStore.keyboards.forEach((row, rowIndex) => {
    row.forEach((key, colIndex) => {
      // 检查key是否存在且有效
      if (key && key.keyValue > 0) {
        const color = preInstallColorList[idx][key.keyValue];
        if (color) {
          const rgbMatch = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
          if (rgbMatch) {
            const [_, r, g, b] = rgbMatch;
            // 更新键盘按键的customLight值
            // if (col.row === 5 && col.col === 5) {
            //   console.log('空格键需要多加两个灯', col);
            //   const customLight = col.customLight;
            //   // customLightData[rowIndex].push(customLight);
            //   // customLightData[rowIndex].push(customLight);
            // }
            key.customLight = {
              R: Number(r),
              G: Number(g),
              B: Number(b),
              isCustom: true,
            };
            if (key.row === 5 && key.col === 6) {
              const { row, col, customLight } = key;
              keyboardStore.keyboards[row][col - 2].customLight = customLight;
              keyboardStore.keyboards[row][col - 1].customLight = customLight;
              keyboardStore.keyboards[row][col + 1].customLight = customLight;
              keyboardStore.keyboards[row][col + 2].customLight = customLight;
            }

            // 收集API调用
            apiCalls.push({
              key: key.keyValue,
              r: Number(r),
              g: Number(g),
              b: Number(b),
            });
          }
        }
      }
    });
  });

  // 并行执行所有API调用
  isVersion2 ? setCustomLighting() : debounceApiCalls(apiCalls);
};

let debounceTimer = null;
const debounceApiCalls = (apiCalls) => {
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // 设置新的定时器，延迟500ms执行
  debounceTimer = setTimeout(async () => {
    await Promise.all(apiCalls.map((params) => services.setCustomLighting(params)));
    debounceTimer = null;
  }, 200);
};

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
});
</script>

<style scoped lang="scss">
.custom-light {
  display: flex;
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
          -moz-appearance: textfield; /* Firefox */
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
</style>
