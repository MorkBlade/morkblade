<template>
  <div
    class="key"
    :class="keyItem !== 1 ? 'key' + String(keyboardLayout[rowIndex][colIndex]).replace('.', '_') : ''"
    :style="active ? { border: '2px solid #91bc00' } : ''"
    @click.stop="onChecked(keyItem.key, rowIndex, colIndex)"
    @dragenter.prevent
    @dragover.prevent
    @mouseup="(e) => Keydrop(e, rowIndex, colIndex, keyItem.key)"
  >
    <p class="top-key">{{ showKeyCode }}</p>
    <!-- <p class="center-key" v-if="!singleTravel && !rtReleaseTravel && !rtPressTravel">{{ byteToKey[keyItem.key] }}</p> -->
    <div class="show-val-box" v-if="route.path === '/performance'">
      <p class="single-travel" v-if="singleTravel !== null">{{ singleTravel }}</p>
      <template v-if="currentModel == 'mechanicalMode' || currentModel == 'quickTrigger'">
        <p class="rt-press-travel" v-if="rtPressTravel !== null">{{ rtPressTravel }}</p>
        <p class="rt-release-travel" v-if="rtReleaseTravel !== null">{{ rtReleaseTravel }}</p>
      </template>
      <template v-if="currentModel == 'deadZone'">
        <span class="rt-release-travel">{{ pressDeadTravel + ' / ' }}</span>
        <span class="rt-release-travel">{{ releaseDead }}</span>
      </template>
    </div>
    <div class="advanced-key-box" v-if="route.path === '/key-assignment'">
      <span class="advanced-tag" v-if="advancedTag">{{ advancedTag }}</span>
    </div>
    <div
      class="color-key"
      v-if="lightSettingStore.enterCustom"
      :style="{ backgroundColor: currentKeyColor }"
      @mousedown.stop="(e) => startMouseDown(e, keyItem.key)"
      @mouseenter="handleMouseOver(keyItem.key)"
      @mouseleave="onMouseLeave"
      @mouseup.stop="startMouseUp"
    >
      <p class="top-key" v-if="singleTravel || rtReleaseTravel || rtPressTravel">{{ showKeyCode }}</p>
    </div>
    <img :src="VeriftIcon" class="verify_icon" v-if="route.path === '/key-calibration' && verifySuc" />
    <div v-if="route.path === '/performance' && currentModel == 'axis' && axisVal !== null" class="axis">
      <span :style="{ backgroundColor: KEY_SHAFT?.[axisVal]?.color ?? 'transparent' }"></span>
    </div>
  </div>
</template>

<script setup>
import VeriftIcon from '@/assets/images/sure_icon.svg';
import { KEY_SHAFT } from '@/configs/constant/index.js';

import services from '@/services/index';
import byteToKey from '@/configs/byte-to-key/keyboard.js';
import emitter from '@/utils/app-emitter';
import { usePerformanceStore, useAppStore, useMacroStore, useKeyboardStore, useLightSettingStore } from '@/stores';
import keyboard from '@/configs/byte-to-key/keyboard.js';
import { onBeforeMount } from 'vue';

const {
  row: rowIndex,
  column: colIndex,
  keyItem,
  active,
  selectAll,
} = defineProps({
  row: { type: Number, default: 0 },
  column: { type: Number, default: 0 },
  keyItem: { type: Object },
  active: { type: Boolean, default: false },
  selectAll: { type: Boolean, default: false },
});
const emit = defineEmits(['click']);

const appStore = useAppStore();
const macroStore = useMacroStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const lightSettingStore = useLightSettingStore();
const { keyboards, layout } = storeToRefs(keyboardStore);
const currentModel = ref('mechanicalMode');
const currentPerformanceData = computed(() => performanceStore.value);

const selectedKey = reactive([]);
const route = useRoute();
const isShow = ref(false);
const inChangLight = ref(false);

const keyboardLayout = reactive([
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1, 1, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, 1],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, 1, 1, 1],
]);

emitter.on('in-the-where', ({ value }) => {
  currentModel.value = value;
  performanceStore.currentModel = value;
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

const currentKeyColor = computed(() => {
  return lightSettingStore.getKeyColor(keyItem.key) || 'rgba(255, 255, 255,0)';
});

const showKeyCode = computed(() => {
  if (keyboards.value.length > 0) {
    const keyCap = keyboards.value[rowIndex][colIndex];
    const customKeysKeyName = `fn${layout.value}`;
    const { bindKeyValue } = keyCap.customKeys[customKeysKeyName];
    return keyboard[bindKeyValue];
  }

  return keyboard[0];
});

const verifySuc = computed(() => {
  return performanceStore.veifyKey[keyItem.key];
});

const PerformanceData = computed(() => {
  if (keyboards.value[rowIndex]?.[colIndex]) {
    return keyboards.value[rowIndex][colIndex].performance;
  }
  return null;
});

// 高级键
const advancedTag = computed(() => {
  // 确保 R、G、B 值在有效范围内
  let type = null;
  let color = '0, 0, 0';
  if (route.path === '/key-assignment') {
    const mode = PerformanceData.value?.advancedKeyMode;
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
      type = 'MCR';
    } else if (mode === 8) {
      type = 'SOCD';
    } else if (mode === 9) {
      type = 'RS';
    }
  }
  return type;
});

// 显示rtPressTravel
const rtPressTravel = computed(() => {
  if (currentModel.value === 'mechanicalMode' || currentModel.value === 'quickTrigger') {
    return PerformanceData.value?.rtPressValue;
  }
  return null;
});

// 显示rtReleaseTravel
const rtReleaseTravel = computed(() => {
  if (currentModel.value === 'mechanicalMode' || currentModel.value === 'quickTrigger') {
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

const pressDeadTravel = computed(() => {
  if (currentModel.value === 'deadZone') {
    return PerformanceData.value?.deadBandPressValue;
  }
  return null;
});

const releaseDead = computed(() => {
  if (currentModel.value === 'deadZone') {
    return PerformanceData.value?.deadBandReleaseValue;
  }
  return null;
});

const axisVal = computed(() => {
  if (currentModel.value === 'axis') {
    return keyboards.value?.[rowIndex]?.[colIndex]?.performance?.axisID ?? null;
  }
  return null;
});

const changeKeyLightColor = async (key) => {
  const { r, g, b } = lightSettingStore.currentColor;
  const color = `rgb(${r}, ${g}, ${b})`;
  lightSettingStore.setKeyColor(key, color);
  await services.setCustomLighting({ key, ...lightSettingStore.currentColor });
};

const onChecked = async () => {
  // console.log('onCheckedonCheckedonChecked');
  if (route.path !== '/lighting' || (route.path == '/lighting' && !lightSettingStore.enterCustom)) {
    emit('click');
  }
};

const startMouseDown = (e, key) => {
  // console.log('xxxxxx');
  if (e.button === 0) {
    // console.log('asda');
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
    console.log('拖拽的是宏按键');

    if (macroStore && macroStore.macroInfo) {
      macroStore.macroInfo.dks = key;
      await macroStore.setMacro();
    }
  } else {
    keyboardStore.updateKey({ rowIndex, colIndex });
  }
};
</script>

<style scoped lang="scss">
.key {
  width: var(--key--default-width);
  height: var(--size-50);
  flex-shrink: 1;
  line-height: 1;
  border-radius: var(--size-10);
  display: flex;
  flex-direction: column;
  align-items: center;
  // background-color: rgba(255, 255, 255, 0.2);
  margin-right: var(--key-default-right);
  position: relative;
  box-sizing: border-box;
  padding-top: var(--spacing-2);
  cursor: pointer;
  border: var(--spacing-3) solid transparent;
  transition: border-color 0.2s ease;
  // border: 3px solid #91bc00;
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
  .single-travel {
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
  border-radius: var(--spacing-6);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  transition: all 0.2s ease-in-out;
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

.key1_25 {
  width: var(--key-width1);
}
.key1_5 {
  width: var(--key-width2);
}
.key1_75 {
  width: var(--key-width3);
}
.key2 {
  width: var(--key-width4);
}
.key2_25 {
  width: var(--key-width5);
}
.key2_75 {
  width: var(--key-width6);
}
.key6_25 {
  width: var(--key-width7);
}

.key:hover {
  background-color: rgb(36, 36, 36);
}
.key:nth-child(15) {
  position: absolute;
  right: var(--key-nth15-right);
}
.key:nth-child(16) {
  position: absolute;
  right: var(--key-fifth-row-right);
}
.key:nth-child(17) {
  position: absolute;
  right: var(--spacing-20);
}
.row:nth-child(5) .key:last-child {
  position: absolute;
  right: var(--key-fifth-row-right);
}
.row:last-child {
  .key:nth-child(9) {
    position: absolute;
    right: var(--key-nth15-right);
  }
  .key:nth-child(10) {
    position: absolute;
    right: calc(var(--spacing-75) - var(--spacing-1));
  }
  .key:last-child {
    position: absolute;
    right: var(--spacing-20);
  }
}
</style>
