<!-- :class="keyItem !== 1 ? 'key' + String(keyboardLayout[rowIndex][colIndex]).replace('.', '_') : ''" -->
<template>
  <div class="key" :style="[active ? { border: '2px solid #91bc00' } : '', keyStyle]"
    @click.stop="onChecked(keyItem.keyValue, rowIndex, colIndex)" @dragenter.prevent @dragover.prevent
    @mouseup="(e) => Keydrop(e, rowIndex, colIndex, keyItem.keyValue)">
    <template v-if="isIconKey">
      <p>
        <img :src="getImageSrc(showKeyCode)" alt=""></img>
      </p>
    </template>
    <template v-else>
      <p class="top-key">{{ showKeyCode }}</p>
    </template>
    <!-- <p>{{ keyItem.keyValue }}</p> -->

    <!-- <p class="center-key" v-if="!singleTravel && !rtReleaseTravel && !rtPressTravel">{{ byteToKey[keyItem.keyValue] }}</p> -->
    <!-- 'mechanicalMode', 'quickTrigger' -->
    <div class="show-val-box" v-if="route.path === '/performance'">
      <template v-if="isVersion2">
        <!-- TODO 性能预设要显示啥数据 -->

        <template v-if="currentModel === 'mechanicalMode'">
          <template v-if="isRT">
            <p class="rt-first-travel" v-if="rtPressTravel !== null">{{ rtFirstTravel }}</p>
            <p class="rt-press-travel" v-if="rtPressTravel !== null">{{ rtPressTravel }}</p>
            <p class="rt-release-travel" v-if="rtReleaseTravel !== null">{{ rtReleaseTravel }}</p>
          </template>
          <template v-else>
            <p class="single-travel" v-if="singleTravel !== null">{{ singleTravel }}</p>
          </template>
        </template>
        <template v-else-if="currentModel === 'quickTrigger' || currentModel === 'preinstall'">
          <template v-if="isRT">
            <p class="rt-first-travel" v-if="rtPressTravel !== null">{{ rtFirstTravel }}</p>
            <p class="rt-press-travel" v-if="rtPressTravel !== null">{{ rtPressTravel }}</p>
            <p class="rt-release-travel" v-if="rtReleaseTravel !== null">{{ rtReleaseTravel }}</p>
          </template>
          <template v-else>
            <p class="single-travel" v-if="singleTravel !== null">{{ singleTravel }}</p>
          </template>
        </template>
      </template>
      <template v-else>
        <template v-if="currentModel !== 'deadZone' && currentModel !== 'axis'">
          <p class="single-travel" v-if="singleTravel !== null">{{ singleTravel }}</p>
          <p class="rt-press-travel" v-if="rtPressTravel !== null && isRT">{{ rtPressTravel }}</p>
          <p class="rt-release-travel" v-if="rtReleaseTravel !== null && isRT">{{ rtReleaseTravel }}</p>
        </template>
      </template>
      <template v-if="currentModel === 'deadZone'">
        <p class="rt-release-travel">{{ pressDeadTravel }}</p>
        <p class="rt-release-travel">{{ releaseDead }}</p>
      </template>
    </div>
    <div class="advanced-key-box" v-if="route.path === '/key-assignment'">
      <span class="advanced-tag" v-if="advancedTag">{{ advancedTag }}</span>
    </div>
    <template v-if="!isVersion2 && lightSettingStore.enterCustom">
      <div class="color-key" :style="{ backgroundColor: currentKeyColor }"
        @mousedown.stop="(e) => startMouseDown(e, keyItem.keyValue)" @mouseenter="handleMouseOver(keyItem.keyValue)"
        @mouseleave="onMouseLeave" @mouseup.stop="startMouseUp"
        @contextmenu="(e) => handleContextmenu(e, keyItem.keyValue)">
        <p class="top-key">{{ showKeyCode }}</p>
      </div>
    </template>
    <template v-if="route.path === '/lighting' && isVersion2">
      <div class="color-key" :style="keyColorStyle" @mousedown.stop="(e) => startMouseDown(e, keyItem.keyValue)"
        @mouseenter="handleMouseOver(keyItem.keyValue)" @mouseleave="onMouseLeave" @mouseup.stop="startMouseUp"
        @contextmenu="(e) => handleContextmenu(e, keyItem.keyValue)">
        <p class="top-key">{{ showKeyCode }}</p>
      </div>
    </template>
    <img :src="verifyIcon" class="verify_icon" v-if="route.path === '/key-calibration' && verifySuc" />
    <div v-if="route.path === '/performance' && currentModel == 'axis' && axisVal !== null" class="axis">
      <span :style="{ backgroundColor: axisColor }"></span>
    </div>
  </div>
</template>

<script setup>
import verifyIcon from '@/assets/images/sure_icon.svg';
import { KEY_SHAFT } from '@/configs/constant/zh_CN/index.js';

import services from '@/services/index';
import emitter from '@/utils/app-emitter';
import { usePerformanceStore, useMacroStore, useKeyboardStore, useLightSettingStore } from '@/stores';
import { scaleValue } from '@/utils/responsive.js';
import { useLightingHook, useMacroHook, useAdvancedHook } from '@/hooks';
import { useI18n } from 'vue-i18n';
import {NUM_KEY, NUM_KEY_V2} from '@/configs/byte-to-key/iconNumKey';
import keyboardV1 from '@/configs/byte-to-key/v1/keyboard';
import keyboardV2 from '@/configs/byte-to-key/v2/keyboard-v2';

const {
  row: rowIndex,
  column: colIndex,
  keyItem,
  active,
  selectAll,
  shapeScale,
  location,
} = defineProps({
  row: { type: Number, default: 0 },
  column: { type: Number, default: 0 },
  keyItem: { type: Object },
  active: { type: Boolean, default: false },
  selectAll: { type: Boolean, default: false },
  shapeScale: { type: Object, default: () => ({ w: 1, h: 1 }) },
  location: { type: Object, default: () => ({ x: 0, y: 0 }) },
});

const emit = defineEmits(['click']);

const macroStore = useMacroStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const lightSettingStore = useLightSettingStore();
const { keyboards, layout } = storeToRefs(keyboardStore);
const { setCustomLighting } = useLightingHook();
const { setMacroV1 } = useMacroHook();
const { getMacro } = useAdvancedHook();
const currentModel = ref('mechanicalMode');
const { locale } = useI18n();
const route = useRoute();
const isShow = ref(false);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const shape = { height: scaleValue(50), width: scaleValue(50) };

emitter.on('in-the-where', ({ value }) => {
  currentModel.value = value;
  performanceStore.currentModel = value;
});

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/performance') {
      isShow.value = true;
    } else {
      isShow.value = false;
    }
    if (newPath !== 'lighting') lightSettingStore.updateEnterCustom(false);
  },
  { immediate: true },
);


const shapeComputed = computed(() => {
  const { w, h } = shapeScale;
  const shapeWidth = w * shape.width;
  const shapeHeight = h * shape.height;
  const contentWidth = shapeWidth;
  const contentHeight = shapeHeight - 12;
  const labelHeight = shapeHeight - 18;
  const labelWidth = shapeWidth - 18;
  return { shapeWidth, shapeHeight, contentWidth, contentHeight, labelHeight, labelWidth };
});

const locationComputed = computed(() => {
  const { y, x } = location;
  const { width, height } = shape;
  const keyBorderTop = y * width;
  const keyBorderLeft = x * height;
  const top = keyBorderTop + 5;
  const left = keyBorderLeft;
  return { x, y, top, left, keyBorderTop, keyBorderLeft };
});

const keyStyle = computed(() => {
  const { top, left } = locationComputed.value;
  const { contentWidth, contentHeight } = shapeComputed.value;
  return {
    // top: `${top}px`,
    left: `${left}px`,
    width: `${contentWidth}px`,
    // height: `${contentHeight}px`,
  };
});

const currentKeyColor = computed(() => {
  const { R, G, B } = currentKey.value.customLight || { R: 100, G: 100, B: 255, isCustom: false };
  if (!R && !G && !B) {
    return 'rgba(255, 255, 255,0)';
  }
  return `rgb(${R}, ${G}, ${B})`;
});

const dynamicKeyColor = computed(() => {
  // console.log(keyboardStore.customLighting, keyItem.row, keyItem.col);
  const { R, G, B } = keyboardStore.customLighting[keyItem.row][keyItem.col] || { R: 100, G: 100, B: 255 };
  if (!R && !G && !B) {
    return 'rgba(255, 255, 255,0)';
  }
  return `rgb(${R}, ${G}, ${B})`;
});

const currentKey = computed(() => {
  // console.log('keyItem', keyItem);
  const rowData = keyboards.value[keyItem.row];
  let colData = {};
  for (let colIdx = 0; colIdx < rowData.length; colIdx++) {
    if (rowData[colIdx].row === keyItem.row && rowData[colIdx].col === keyItem.col) {
      colData = rowData[colIdx];
    }
  }

  return colData;
});

const showKeyCode = computed(() => {
  if (keyboards.value.length > 0) {
    const customKeysKeyName = `fn${layout.value}`;
    // console.log('currentKey.value', currentKey.value, customKeysKeyName);
    const { bindKeyValue } = currentKey.value.customKeys[customKeysKeyName];
    // console.log('keyboardV2.value[bindKeyValue]', keyboardV2.value[bindKeyValue]);
    return !isVersion2.value
      ? keyboardV1[bindKeyValue]
      : bindKeyValue === 61696
        ? 'Fn'
        : keyboardV2[bindKeyValue];
  }

  return isVersion2.value ? keyboardV2[0] : keyboardV1[0];
});

// 添加动态导入图片的方法
const getImageSrc = (keyText) => {
  return new URL(`../assets/images/${keyText}.avif`, import.meta.url).href;
};

const ImageSrc = computed(() => {
// 名称
  return getImageSrc(showKeyCode.value);
});


// 判断是否是图标键 - 检查当前键是否应该显示为图标
const isIconKey = computed(() => {
  const keyName = (showKeyCode.value || '').trim();
  
  // 如果键名为空，则不是图标键
  if (!keyName) {
    return false;
  }
  // 根据版本选择对应的键值映射表
  const keyMapping = isVersion2.value ? NUM_KEY_V2 : NUM_KEY;

  // 检查键名是否存在于图标键映射表中（忽略大小写）
  return Object.values(keyMapping).some(mappedValue => 
    mappedValue && mappedValue.toLowerCase() === keyName.toLowerCase()
  );
});

onMounted(() => {
  // console.log('isIconKey.value', isIconKey.value);
});

const verifySuc = computed(() => {
  return performanceStore.veifyKey[keyItem.keyValue];
});

const PerformanceData = computed(() => {
  if (currentKey.value) {
    return currentKey.value.performance;
  }
  return null;
});

// 高级键
const advancedTag = computed(() => {
  // 确保 R、G、B 值在有效范围内
  let type = null;
  let color = '0, 0, 0';
  if (route.path === '/key-assignment') {
    const mode = currentKey.value.advancedKeys.advancedType;
    if (mode === 1) {
      type = 'DKS';
    } else if (mode === 2) {
      type = 'MPT';
    } else if (mode === 3) {
      type = 'MT';
    } else if (mode === 4) {
      type = 'TGL';
    } else if (mode === 5) {
      type = 'END';
    } else if (mode === 6) {
      // TODO v2 是socd  v1是mcr
      type = isVersion2.value ? 'SOCD' : 'MCR';
    } else if (mode === 7) {
      type = 'RS';
    } else if (mode === 8) {
      type = 'SOCD';
    } else if (mode === 9) {
      type = 'RS';
    }
  }
  return type;
});

// 显示rtFirstTravel
const rtFirstTravel = computed(() => {
  if (currentModel !== 'deadZone' && currentModel !== 'axis' && PerformanceData.value?.rtFirstTouch) {
    // console.log('rtrtFirstTravel: ', PerformanceData.value?.rtFirstTouch);
    return PerformanceData.value?.rtFirstTouch;
  }
  return null;
});

// 显示rtPressTravel
const rtPressTravel = computed(() => {
  if (currentModel !== 'deadZone' && currentModel !== 'axis' && PerformanceData.value?.rtPressValue) {
    return PerformanceData.value?.rtPressValue;
  }
  return null;
});

// 显示rtReleaseTravel
const rtReleaseTravel = computed(() => {
  if (currentModel !== 'deadZone' && currentModel !== 'axis' && PerformanceData.value?.rtReleaseValue) {
    return PerformanceData.value?.rtReleaseValue;
  }
  return null;
});

// 显示singleTravel
const singleTravel = computed(() => {
  if (PerformanceData.value?.singleTriggeringValue) {
    return PerformanceData.value?.singleTriggeringValue;
  }
  return null;
});

// key rt模式
const isRT = computed(() => {
  if (PerformanceData.value?.isRt) {
    return PerformanceData.value?.isRt;
  }
  return null;
});
// key single模式
const isSingle = computed(() => {
  if (PerformanceData.value?.isSingle) {
    return PerformanceData.value?.isSingle;
  }
  return null;
});

const pressDeadTravel = computed(() => {
  if (currentModel.value === 'deadZone' && PerformanceData.value?.deadBandPressValue) {
    return PerformanceData.value?.deadBandPressValue;
  }
  return null;
});

const releaseDead = computed(() => {
  if (currentModel.value === 'deadZone' && PerformanceData.value?.deadBandReleaseValue) {
    return PerformanceData.value?.deadBandReleaseValue;
  }
  return null;
});

//TODO 
const axisVal = computed(() => {
  if (currentModel.value === 'axis') {
    // V2轴在这里应该要获取axisID
    if (performanceStore.isAxisStatus === 'v2') {
      const axisV2Id = PerformanceData.value?.axisV2Id ?? null;

      return axisV2Id;
    } else {
      const axisID = PerformanceData.value?.axisID ?? null;

      return axisID;
    }
    
  }
  return null;
});

const axisColor = computed(() => {
  const list = performanceStore.axisList;
  if (performanceStore.isAxisStatus === 'v2') {
    const item = list.find((item) => item.axis_id === axisVal.value);
    return item ? item.axis_color : 'transparent';
  } else {
    // v1 情况下，axisVal.value 是 axis_id，需要查找对应的项目
    const item = list[axisVal.value]?.axis_color ?? 'transparent';
    return item;
  }
});

const changeKeyLightColor = async (key, isCustom = true) => {
  const { r, g, b } = lightSettingStore.currentColor;
  currentKey.value.customLight = { R: r, G: g, B: b, isCustom };
  const { row, col } = currentKey.value;
  // TODO 空格键包含5个键位灯，暂时先这么处理
  if (isVersion2.value && row === 5 && col === 6) {
    keyboards.value[row][col - 2].customLight = { R: r, G: g, B: b, isCustom };
    keyboards.value[row][col - 1].customLight = { R: r, G: g, B: b, isCustom };
    keyboards.value[row][col + 1].customLight = { R: r, G: g, B: b, isCustom };
    keyboards.value[row][col + 2].customLight = { R: r, G: g, B: b, isCustom };
  }
  setCustomLighting(key);
  // await services.setCustomLighting({ key, ...lightSettingStore.currentColor });
};

const onChecked = async (key) => {
  // if (route.path !== '/lighting' || (route.path == '/lighting' && !lightSettingStore.enterCustom)) {
  if (route.path !== '/lighting') {
    emit('click');
  }
};

const startMouseDown = (e, key) => {
  if (e.button === 0) {
    keyboardStore.inChangLight = true;
    changeKeyLightColor(key);
  }
};

const handleMouseOver = (key) => {
  if (keyboardStore.inChangLight) {
    changeKeyLightColor(key);
  }
};

const startMouseUp = (e) => {
  if (e.button === 0) {
    keyboardStore.inChangLight = false;
  }
};

const Keydrop = async (e, rowIndex, colIndex, key) => {
  if (!keyboardStore.isDraging) return;
  e.preventDefault();
  if (macroStore.selectMacro) {
    // console.log('拖拽的是宏按键');

    if (macroStore && macroStore.macroInfo) {
      macroStore.macroInfo.dks = key;
      await setMacroV1();
      await getMacro({ keyValue: key, row: rowIndex, col: colIndex, mode: 6 });
    }
  } else {
    const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
    isVersion2 ? keyboardStore.updateKeyV2({ rowIndex, colIndex }) : keyboardStore.updateKey({ rowIndex, colIndex });
  }
};

const keyColorStyle = computed(() => {
  if (route.path === '/lighting' && !lightSettingStore.enterCustom) {
    // 使用 CSS 变量
    return {
      backgroundColor: `var(--key-color-${keyItem.row}-${keyItem.col}, rgba(0, 0, 0,0))`,
    };
  }
  return { backgroundColor: currentKeyColor.value };
});

const onMouseLeave = () => {
  // Implementation of onMouseLeave
};

const handleContextmenu = (e, key) => {
  if (!isVersion2.value) return;
  // console.log('handleMouseOver');
  e.preventDefault();
  if (currentKey.value.customLight?.isCustom) {
    changeKeyLightColor(key, false);
  }
};

const changeKeyCustomLight = async (e, isCustom = true) => {
  if (inLightingPage.value) {
    let color;
    if (!isCustom) {
      color = { R: 0, G: 0, B: 0 };
    } else {
      color = lightingStore.colorPickerPanel;
    }
    keyboardStore.setKeyColor(rowIndex, colIndex, color, isCustom);
  }
};


</script>

<style scoped lang="scss">
.key {
  width: var(--key--default-width);
  height: var(--size-50);
  flex-shrink: 1;
  line-height: 1;
  border-radius: var(--size-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  background-color: rgba(24, 24, 24);
  border: var(--spacing-2) solid rgb(37, 37, 37);
  // margin-right: var(--key-default-right);
  position: absolute;
  top: 0;
  box-sizing: border-box;
  padding-top: var(--spacing-2);
  cursor: pointer;
  // border: var(--spacing-3) solid transparent;
  transition: border-color 0.2s ease;
  // border: 3px solid #91bc00;
  &:hover {
    background-color: rgb(36, 36, 36);
  }

  p {
    text-align: center;
    color: #fff;
    font-size: var(--font-size-12);
    font-weight: 600;
    font-family: 'Arial';
    margin-bottom: var(--spacing-2);
    // margin-top: 1px;
  }

  // .center-key {
  //   // color: #fff;
  //   // font-size: 14px;
  //   // font-family: 'Arial BOLD';
  //   width: 100%;
  //   height: 100%;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  // }
  .single-travel,
  .rt-first-travel {
    font-size: var(--font-size-8);
    font-weight: 100;
    color: #91bc00;
    margin-bottom: var(--spacing-1);
    // margin-top: 5px;
    font-family: 'Arial';
  }

  .rt-release-travel,
  .rt-press-travel {
    // bottom: 2px;
    font-size: var(--font-size-8);
    margin-bottom: var(--spacing-1);
    color: #fcff00;
    font-family: 'Arial';
  }

  .advanced-tag {
    display: inline-block;
    width: var(--size-30);
    box-sizing: border-box;
    padding: var(--spacing-1) 0;
    margin-top: var(--spacing-8);
    line-height: 1;
    text-align: center;
    border-radius: var(--size-10);
    background-color: #91bc00;
    font-size: var(--font-size-8);
    font-family: 'CN Heavy';
    color: #000;
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
  will-change: background-color;
  transition: background-color 0.1s linear;
  transform: translateZ(0); /* 开启硬件加速 */
  contain: strict;
}

.verify_icon {
  width: var(--size-16);
  height: var(--size-16);
  object-fit: fill;
  position: absolute;
  bottom: var(--spacing-5);
}

.axis {
  width: 100%;
  // height: 20px;
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  bottom: var(--spacing-1);

  span {
    display: inline-block;
    width: var(--size-30);
    height: var(--size-10);
    line-height: var(--size-16);
    text-align: center;
    padding: 0 var(--spacing-2);
    border-radius: var(--size-10);
    color: #000;
    font-size: var(--font-size-10);
    font-family: 'CN Heavy';
  }
}
</style>
