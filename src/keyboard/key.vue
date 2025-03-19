<template>
  <div
    class="key"
    :class="keyItem !== 1 ? 'key' + String(keyboardLayout[rowIndex][colIndex]).replace('.', '_') : ''"
    :style="active ? { borderColor: '#91bc00' } : ''"
    @click="onChecked(keyItem.key, rowIndex, colIndex)"
  >
    <p class="top-key">{{ byteToKey[keyItem.value] }}</p>
    <!-- <p class="center-key" v-if="!singleTravel && !rtReleaseTravel && !rtPressTravel">{{ byteToKey[keyItem.key] }}</p> -->
    <div class="show-val-box" v-if="route.path === '/performance'">
      <p class="single-travel" v-if="singleTravel !== null">{{ singleTravel }}</p>
      <template v-if="currentModel == 'mechanicalMode' || currentModel == 'quickTrigger'">
        <span class="rt-press-travel" v-if="rtPressTravel !== null">{{ rtPressTravel + ' / ' }}</span>
        <span class="rt-release-travel" v-if="rtReleaseTravel !== null">{{ rtReleaseTravel }}</span>
      </template>
      <template v-if="currentModel == 'deadZone'">
        <span class="rt-release-travel">{{ pressDeadTravel + ' / ' }}</span>
        <span class="rt-release-travel">{{ releaseDead }}</span>
      </template>
    </div>
    <div class="advanced-key-box" v-if="route.path === '/key-assignment'">
      <span class="advanced-tag" v-if="advancedTag">{{ advancedTag }}</span>
    </div>
    <div class="color-key" v-if="lightSettingStore.enterCustom" :style="{ backgroundColor: currentKeyColor }">
      <p class="top-key" v-if="singleTravel || rtReleaseTravel || rtPressTravel">{{ byteToKey[keyItem.value] }}</p>
    </div>
    <img :src="VeriftIcon" class="verify_icon" v-if="route.path === '/key-calibration' && verifySuc" />
    <div class="axis" v-if="axisVal !== null">{{ KEY_SHAFT[axisVal]?.name }}</div>
  </div>
</template>

<script setup>
import VeriftIcon from '@/assets/images/sure_icon.svg';
import { KEY_SHAFT } from '@/configs/constant/index.js';

import services from '@/services/index';
import byteToKey from '@/configs/byte-to-key/keyboard.js';
import emitter from '@/utils/app-emitter';
import { usePerformanceStore, useAppStore, useKeyboardStore, useLightSettingStore } from '@/stores';

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
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const lightSettingStore = useLightSettingStore();
const currentLayoutData = computed(() => keyboardStore.currentLayoutData);
const currentModel = ref('mechanicalMode');
const currentPerformanceData = computed(() => performanceStore.value);

const selectedKey = reactive([]);
const route = useRoute();
const isShow = ref(false);

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
});

const currentKeyColor = computed(() => {
  return lightSettingStore.getKeyColor(keyItem.key) || 'rgba(255, 255, 255,0)';
});

const verifySuc = computed(() => {
  return performanceStore.veifyKey[keyItem.key];
});

const PerformanceData = computed(() => {
  if (currentPerformanceData.value[rowIndex]?.[colIndex]) {
    return currentPerformanceData.value[rowIndex][colIndex];
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
    return PerformanceData.value?.rt.pressTravel;
  }
  return null;
});

// 显示rtReleaseTravel
const rtReleaseTravel = computed(() => {
  if (currentModel.value === 'mechanicalMode' || currentModel.value === 'quickTrigger') {
    return PerformanceData.value?.rt.releaseTravel;
  }
  return null;
});

// 显示singleTravel
const singleTravel = computed(() => {
  return PerformanceData.value?.single.singleTravel || null;
});

const pressDeadTravel = computed(() => {
  if (currentModel.value === 'deadZone') {
    return performanceStore.deadZoneValue[rowIndex][colIndex].pressDead;
  }
  return null;
});

const releaseDead = computed(() => {
  if (currentModel.value === 'deadZone') {
    return performanceStore.deadZoneValue[rowIndex][colIndex].releaseDead;
  }
  return null;
});

const axisVal = computed(() => {
  if (currentModel.value === 'axis') {
    return keyboardStore.currentLayoutData[rowIndex][colIndex].axis;
  }
  return null;
});

const onChecked = async (key, rowIndex, colIndex) => {
  // console.log(key, lightSettingStore.currentColor);
  const result = await services.setCustomLighting({ key, ...lightSettingStore.currentColor });
  const { R, G, B } = result;
  const color = `rgb(${R}, ${G}, ${B})`;
  lightSettingStore.setKeyColor(key, color);
  // console.log('onChecked set custom light', result);
  if (route.path !== '/lighting' || (route.path == '/lighting' && !lightSettingStore.enterCustom)) {
    emit('click');
  }
};

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
</script>

<style scoped lang="scss">
.key {
  width: 50px;
  height: 50px;
  flex-shrink: 1;
  line-height: 1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  // background-color: rgba(255, 255, 255, 0.2);
  margin-right: 5px;
  position: relative;
  box-sizing: border-box;
  padding-top: 2px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.2s ease;
  // border: 3px solid #91bc00;
  p {
    text-align: center;
    color: #fff;
    font-size: 14px;
    font-family: 'Arial BOLD';
    margin-top: 1px;
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
    font-size: 10px;
    color: #91bc00;
    // margin-top: 5px;
    font-family: 'Arial Refular';
  }

  .rt-release-travel,
  .rt-press-travel {
    bottom: 2px;
    font-size: 10px;
    color: #fcff00;
    font-family: 'Arial Refular';
  }

  .advanced-tag {
    display: inline-block;
    width: 30px;
    box-sizing: border-box;
    padding: 1px 0;
    margin-top: 8px;
    line-height: 1;
    text-align: center;
    border-radius: 10px;
    background-color: #91bc00;
    font-size: 8px;
    font-family: 'CN Heavy';
    color: #000;
  }
}
.color-key {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  transition: all 0.2s ease-in-out;
}

.verify_icon {
  width: 16px;
  height: 16px;
  object-fit: fill;
  position: absolute;
  bottom: 5px;
}

.axis {
  width: 100%;
  height: 12px;
  color: #fcff00;
  font-size: 12px;
  font-family: 'CN Heavy';
  text-align: center;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分用省略号表示 */
  position: absolute;
  left: 0;
  bottom: 1px;
}

.key1_25 {
  width: 62.5px;
}
.key1_5 {
  width: 75px;
}
.key1_75 {
  width: 87.5px;
}
.key2 {
  width: 100px;
}
.key2_25 {
  width: 116.5px;
}
.key2_75 {
  width: 142.5px;
}
.key6_25 {
  width: 342.5px;
}

.key:hover {
  background-color: rgb(36, 36, 36);
}
.key:nth-child(15) {
  position: absolute;
  right: 128px;
}
.key:nth-child(16) {
  position: absolute;
  right: 72px;
}
.key:nth-child(17) {
  position: absolute;
  right: 20px;
}
.row:nth-child(5) .key:last-child {
  position: absolute;
  right: 72px;
}
.row:last-child {
  .key:nth-child(9) {
    position: absolute;
    right: 128px;
  }
  .key:nth-child(10) {
    position: absolute;
    right: 74px;
  }
  .key:last-child {
    position: absolute;
    right: 20px;
  }
}
</style>
