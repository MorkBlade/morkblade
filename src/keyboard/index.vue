<template>
  <div class="key-page" :style="{
    width: `${containerDimensions.width}px`,
  }">
    <div class="side-left-container" v-if="route.path === '/performance'">
      <div class="select-box" :class="{ 'is-checked': selectedKey == 'all-key' }" @click="handleAllSelect"
        @mouseenter="selectedKey = 'all-key'" @mouseleave="selectedKey = ''">{{ $t('keyboard.allSelect') }}</div>
      <div class="select-box" :class="{ 'is-checked': selectedKey == 'cancel-all' }" @click="handleCancelSelect"
        @mouseenter="selectedKey = 'cancel-all'" @mouseleave="selectedKey = ''">{{ $t('keyboard.allDisSelect') }}</div>
      <div class="select-box" :class="{ 'is-checked': selectedKey == 'reverse-key' }" @click="handleReverseSelect"
        @mouseenter="selectedKey = 'reverse-key'" @mouseleave="selectedKey = ''">{{ $t('keyboard.reverseSelect') }}
      </div>
    </div>
    <!-- v1 keyboard -->
    <template v-if="!isVersion2">
      <div class="keyboard-container v1">
        <div class="keyboard" :style="{
          width: `${containerDimensions.width}px`,
            height: `${containerDimensions.height}px`,
          }">
          <template v-for="(row, rowIndex) in layout">
            <div class="row" :class="`row_${rowIndex + 1}`" :key="rowIndex" v-if="row[0].shapeScale?.w">
              <template v-for="(col, colIndex) in row">
                <key v-if="col.shapeScale.w != 0 && col && col.keyItem && col.keyItem.keyValue"
                  :key="`key-${rowIndex}-${colIndex}`" :row="rowIndex" :column="colIndex" :keyItem="col.keyItem"
                  :shapeScale="col.shapeScale" :location="col.location"
                  :active="activeKeys.includes(`${rowIndex}-${colIndex}`)" @click="handleKeyClick(rowIndex, colIndex)"
                  @emits="handleCancelSelect" />
              </template>
            </div>
          </template>
        </div>
        <div class="logo-light-bar">
          <span></span>
        </div>
      </div>
    </template>

    <!-- v2 60配列 -->
    <template v-if="keyboardConfiguration === 60 && isVersion2">
      <div class="keyboard-container v2">
        <div class="keyboard" :style="{
          width: `${containerDimensions.width}px`,
            height: `${containerDimensions.height}px`,
          }">
          <template v-for="(row, rowIndex) in lightLayout">
            <div class="row" :class="`row_${rowIndex + 1}`" :key="rowIndex" v-if="row[0].shapeScale?.w">
              <template v-for="(col, colIndex) in row">
                <key v-if="col.shapeScale.w != 0 && col && col.keyItem && col.keyItem.keyValue"
                  :key="`key-${rowIndex}-${colIndex}`" :row="rowIndex" :column="colIndex" :keyItem="col.keyItem"
                  :shapeScale="col.shapeScale" :location="col.location"
                  :active="activeKeys.includes(`${rowIndex}-${colIndex}`)" @click="handleKeyClick(rowIndex, colIndex)"
                  @emits="handleCancelSelect" />
              </template>
            </div>
          </template>

          <div class="logo-light-bar__left">
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <!-- v2 66配列 -->
    <template v-if="keyboardConfiguration === 66 && isVersion2">
      <div class="keyboard-container v2">
        <div class="keyboard" :style="{
          width: `${containerDimensions.width}px`,
            height: `${containerDimensions.height}px`,
          }">
          <template v-for="(row, rowIndex) in lightLayout">
            <div class="row" :class="`row_${rowIndex + 1}`" :key="rowIndex" v-if="row[0].shapeScale?.w">
              <template v-for="(col, colIndex) in row">
                <key v-if="col.shapeScale.w != 0 && col && col.keyItem && col.keyItem.keyValue"
                  :key="`key-${rowIndex}-${colIndex}`" :row="rowIndex" :column="colIndex" :keyItem="col.keyItem"
                  :shapeScale="col.shapeScale" :location="col.location"
                  :active="activeKeys.includes(`${rowIndex}-${colIndex}`)" @click="handleKeyClick(rowIndex, colIndex)"
                  @emits="handleCancelSelect" />
              </template>
            </div>
          </template>

          <div class="logo-light-bar__left">
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <!-- v2 84配列 -->
    <template v-if="keyboardConfiguration === 84 && isVersion2">
      <div class="keyboard-container v2-three-mode">
        <div class="keyboard" >
          <template v-for="(row, rowIndex) in lightLayout">
            <div class="row row_v2" :class="`row_${rowIndex + 1}`" :key="rowIndex" v-if="row[0].shapeScale?.w">
              <template v-for="(col, colIndex) in row">
                <key v-if="col.shapeScale.w != 0 && col && col.keyItem && col.keyItem.keyValue"
                  :key="`key-${rowIndex}-${colIndex}`" :row="rowIndex" :column="colIndex" :keyItem="col.keyItem"
                  :shapeScale="col.shapeScale" :location="col.location"
                  :active="activeKeys.includes(`${rowIndex}-${colIndex}`)" @click="handleKeyClick(rowIndex, colIndex)"
                  @emits="handleCancelSelect" />
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>


    <div class="side-right-container" v-if="route.path === '/performance'">
      <div class="select-box" :class="{ 'is-checked': selectedKey == 'wasd' }" @click="handleWasdSelect"
        @mouseenter="selectedKey = 'wasd'" @mouseleave="selectedKey = ''">
        WASD
      </div>
      <div class="select-box" :class="{ 'is-checked': selectedKey == 'num-key' }" @click="handleNumSelect"
        @mouseenter="selectedKey = 'num-key'" @mouseleave="selectedKey = ''">{{ $t('keyboard.onlyNumber') }}</div>
      <div class="select-box" :class="{ 'is-checked': selectedKey == 'letter-key' }" @click="handleLetterSelect"
        @mouseenter="selectedKey = 'letter-key'" @mouseleave="selectedKey = ''">{{ $t('keyboard.onlyLetter') }}</div>
    </div>
    <template v-if="route.path === '/key-assignment'">
      <div class="layer-container" v-if="isVersion2 || advancedMenu === 'customKey'"
        @click.capture="(e) => handleFnChange(e, isVersion2)">
        <div class="layer" v-for="(ite, idx) in 4" :key="ite" :class="{ active: idx === checkedFn }" :data-idx="idx">
          {{ $t('keyboard.layer') + ite }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useLightingHook } from '@/hooks';
import layouts from '@/configs/layout/index.js';
import emitter from '@/utils/app-emitter';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardPageHook } from './useKeyboardPageHook.js';
import { useAppStore, useKeyboardStore, useDeviceStore, usePerformanceStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';

import key from './key.vue';
import { computed } from 'vue';

const route = useRoute();
const appStore = useAppStore();
const deviceStore = useDeviceStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { initCustomLighting } = useLightingHook();
const { keyboards } = storeToRefs(keyboardStore);
const { getHighLevelKeys } = useAdvancedHook();
const {
  selectedKey,
  checkedFn,
  formData,
  activeKeys,
  handleAllSelect,
  handleCancelSelect,
  handleReverseSelect,
  handleWasdSelect,
  handleNumSelect,
  handleLetterSelect,
  handleOperationKey,
  handleFnChange,
} = useKeyboardPageHook();
const advancedMenu = ref('customKey');

const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');

emitter.on('advancedMenu', ({ value }) => {
  advancedMenu.value = value;
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
  async (newPath) => {
    if (newPath !== '/performance') {
      keyboardStore.cancelSelectKey();
      handleOperationKey('cancelSelect');
    }
    if (newPath !== '/key-assignment') {
      const fnVal = 0;
      checkedFn.value = Number(fnVal);
      formData.fn = fnVal;
      const { fn } = formData;
      // 切换到其他页面时还原到层1(v2暂未做)
      if (isVersion2.value) {
        keyboardStore.checkFnLayer(0);
        keyboardStore.initKeyboard();
      } else {
        await keyboardStore.getLayoutKeyInfo(fn, keyboardStore.keyboards);
      }
    }

    if (newPath === '/key-assignment') await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
  },
);

onMounted(async () => {
  try {
    // First initialize keyboard
    await performanceStore.getGlobalTouchTravel();
    await keyboardStore.initKeyboard();
    // // Then initialize lighting
    // // await initCustomLighting();
    if (isVersion2.value) await deviceStore.getDoubleLighting();
    const data = await appStore.systemMode();
    formData.type = data.currentSystem;
    await appStore.getProtocolVersion(isVersion2.value);
    if (route.path === '/key-assignment' && keyboardStore.keyboards.length > 0) {
      // Add a small delay to ensure component is fully mounted
      await new Promise((resolve) => setTimeout(resolve, 100));
      await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
    }
  } catch (error) {
    console.error('Mounted error:', error);
  }
});

const handleKeyClick = (rowIndex, colIndex) => {
  // 当前类型
  if (route.path === '/key-assignment') {
    // 单选
    // if (advancedMenu.value === 'SOCD' || advancedMenu.value === 'RS') {
    //   handleHighLevelKeyChange({ rowIndex, colIndex });
    // } else {
    //   keyboardStore.handleSelectKeyClick({ rowIndex, colIndex }, 'single');
    // }
    keyboardStore.handleSelectKeyClick({ rowIndex, colIndex }, 'single');
  } else {
    // 多选
    keyboardStore.handleSelectKeyClick({ rowIndex, colIndex });
  }
  emitter.emit('key-click', { rowIndex, colIndex });
};

// 处理高级键的双键绑定
const handleHighLevelKeyChange = ({ rowIndex, colIndex }) => {
  keyboardStore.handleHighLevelKeyClick({ rowIndex, colIndex });
};

// 键盘布局
const keyboardConfiguration = ref(60);
// 匹配布局，暂时用json文件来做
const matchLayout = () => {
  if (!isVersion2.value) {
    return layouts.keyboardLayoutV1;
  }
  if (deviceStore.devices[0]?.productId === 5382 && deviceStore.devices[0]?.vendorId === 7334) {
    keyboardConfiguration.value = 84;
    return layouts.keyboardLayoutV2_threeMode;
  } else if (deviceStore.devices[0]?.productId === 5384 && deviceStore.devices[0]?.vendorId === 7334) {
    keyboardConfiguration.value = 66;
    return layouts.mk66;
  } else {
    keyboardConfiguration.value = 60;
    return layouts.keyboardLayoutV2;
  }
};

const layout = computed(() => {
  const originalLayout = matchLayout();
  // 如果没有数据，直接返回原始布局
  if (!keyboards.value || keyboards.value.length === 0) {
    return originalLayout;
  }

  // 创建一个副本，避免直接修改原始布局
  const result = JSON.parse(JSON.stringify(originalLayout));

  keyboards.value.forEach((row, rowIndex) => {
    // 跳过不存在的行
    if (!result[rowIndex]) {
      return;
    }

    // 对于存在数据的行，更新键位值
    if (row.length > 0) {
      row.forEach((col, colIndex) => {
        // 跳过不存在的列
        if (!result[rowIndex][colIndex]) {
          return;
        }

        // 设置键位值
        result[rowIndex][colIndex].keyItem = col || '';
      });
    }
  });
  return result;
});

// 在现有代码基础上添加空格键拆分处理
const processedLayout = computed(() => {
  // 获取原始布局数据
  const baseLayout = layout.value;

  // 如果不是V2版本，或者84/66配列，直接返回原始布局
  if (!isVersion2.value || keyboardConfiguration.value == 84 || keyboardConfiguration.value == 66) {
    return baseLayout;
  }

  // 创建深拷贝，避免修改原始数据
  const result = JSON.parse(JSON.stringify(baseLayout));

  // 获取空格拆分数量（需要根据实际业务逻辑获取）
  const spaceCount = 5; // 这里需要根据您的业务逻辑获取实际值

  // 处理第6行（空格行）的拆分逻辑
  if (result[5] && spaceCount > 1) {
    // 查找空格键位置
    let spaceKeyIndex = -1;
    let spaceKeyData = null;

    // 遍历第6行，找到空格键
    result[5].forEach((col, colIndex) => {
      // 空格键检测条件
      if (colIndex > 2 &&
        col.location &&
        col.location.x !== 0 &&
        col.location.y !== 0 &&
        col.shapeScale &&
        col.shapeScale.w > 0 &&
        spaceKeyIndex === -1) { // 只取第一个符合条件的键位
        spaceKeyIndex = colIndex;
        spaceKeyData = col;
      }
    });
    // 如果找到空格键，进行拆分处理
    if (spaceKeyIndex !== -1 && spaceKeyData) {
      const originalWidth = spaceKeyData.shapeScale.w;
      const originalX = spaceKeyData.location.x;
      const originalY = spaceKeyData.location.y;
      const subKeyWidth = Number((originalWidth / spaceCount).toFixed(2));
      const newSpaceKeys = [];
      for (let i = 0; i < spaceCount; i++) {
        // 关键：为每个新键分配唯一的 col
        const newColIndex = 4 + i;
        // 关键：keyItem 里也要带上 row/col
        const newKeyItem = {
          ...(spaceKeyData.keyItem || {}),
          row: 5,
          col: newColIndex,
        };
        newSpaceKeys.push({
          ...JSON.parse(JSON.stringify(spaceKeyData)),
          location: {
            x: originalX + i * subKeyWidth,
            y: originalY,
          },
          shapeScale: {
            w: subKeyWidth,
            h: spaceKeyData.shapeScale.h,
          },
          isSpaceWidthStyle: true,
          ratio: 9,
          keyItem: newKeyItem,
        });
      }
      // 替换原有空格键为5个新键
      result[5].splice(spaceKeyIndex, 1, ...newSpaceKeys);
    }
  }

  return result;
});

const lightLayout = computed(() => {
  if (route.path === '/lighting') {
    return processedLayout.value;
  } else {
    return layout.value;
  }
})

// 容器尺寸计算逻辑
const containerDimensions = computed(() => {
  // 默认尺寸
  const defaultDimensions = { width: scaleValue(1040), height: scaleValue(380) };

  if (!layout.value || layout.value.length === 0) {
    return defaultDimensions;
  }

  let maxX = 0;
  let maxY = 0;
  let validKeysCount = 0;

  // 遍历所有键位
  layout.value.forEach((row) => {
    if (!row) return;

    row.forEach((column) => {
      // 基本检查
      if (!column || !column.location) return;

      // 跳过 shapeScale.w === 0 的情况
      if (column.shapeScale?.w === 0) return;

      // 键位值检查 - 与模板中的v-if条件相同
      const hasValue = column.keyItem?.keyValue;
      if (!hasValue) return;

      validKeysCount++;

      const x = column.location.x || 0;
      const y = column.location.y || 0;
      const w = column.shapeScale?.w || 1;
      const h = column.shapeScale?.h || 1;

      // 计算键帽的右下角坐标（考虑基础按键大小50px）
      const rightEdge = scaleValue((x + w) * 50);
      const bottomEdge = scaleValue((y + h) * 50);

      maxX = Math.max(maxX, rightEdge);
      maxY = Math.max(maxY, bottomEdge);
    });
  });

  // 如果没有有效键位，返回默认尺寸
  if (validKeysCount === 0 || (maxX === 0 && maxY === 0)) {
    return defaultDimensions;
  }

  // 计算最终尺寸并添加内边距
  return {
    // width: maxX + scaleValue(13),
    // height: maxY + scaleValue(31),
    width: maxX + scaleValue(52),
    height: maxY + scaleValue(65),
  };
});
</script>

<style scoped lang="scss">
.key-page {
  position: relative;
  width: var(--size-1340);
  display: flex;
  justify-content: center;

  .side-left-container,
  .side-right-container {
    margin-top: var(--spacing-280);
  }

  .keyboard-container {
    width: var(--size-1040);
    height: var(--size-380);
    box-sizing: border-box;
    margin: var(--spacing-25) var(--spacing-20) 0 var(--spacing-20);
    // border-radius: var(--spacing-15);
    // border: var(--spacing-3) solid rgb(37, 37, 37);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: width 0.3s ease-in-out;

    &.v2 .keyboard {
      // 特殊背景图 故需要写死宽高
      width: var(--keyboard-v2-width) !important;
      height: var(--keyboard-v2-height) !important;
      background-image: url('@/assets/images/mk60_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      border: none;
      padding: var(--keyboard-v2-padding);
      transition: width 0.3s ease-in-out;

      &::after {
        content: '';
        width: var(--keyboard-pseudo-element-width);
        height: var(--keyboard-pseudo-element-height);
        box-sizing: border-box;
        border-radius: var(--spacing-15);
        position: absolute;
        top: var(--keyboard-pseudo-element-top);
        left: var(--keyboard-pseudo-element-left);
        border: var(--spacing-3) solid rgb(37, 37, 37);
      }
    }



    .keyboard {
      border-radius: var(--spacing-15);
      border: var(--spacing-3) solid rgb(37, 37, 37);
      position: relative;
      box-sizing: border-box;
      padding: var(--spacing-21) var(--spacing-24);
      background-color: #000;
      transition: width 0.3s ease-in-out;

      &::after {
        content: '';
        width: 99.2%;
        height: 97.9%;
        box-sizing: border-box;
        position: absolute;
        border-radius: var(--spacing-10);
        border: var(--spacing-3) solid rgb(37, 37, 37);
        position: absolute;
        top: var(--spacing-4);
        left: var(--spacing-4);
      }

      .row {
        display: flex;
        height: var(--size-50);
        position: relative;
        margin-bottom: 5px;
        z-index: 2;
        // left: var(--spacing-20);
        // background: rgba(255, 255, 255, 0.5);
        // overflow: hidden;

        &.row_1 {
          margin-bottom: 15px;
          // top: var(--keyboard-row2-top);
        }

        &.row_3 {
          // top: var(--keyboard-row3-top);
        }

        &.row_4 {
          // top: var(--keyboard-row4-top);
        }

        &.row_5 {
          // top: var(--keyboard-row5-top);
        }

        &.row_6 {
          // top: var(--keyboard-row6-top);
        }
      }

      .row_v2 {
        &.row_1 {
            margin-bottom: 5px;
            // top: var(--keyboard-row2-top);
          }
      }
    }

    &.v2-three-mode {
      width: var(--keyboard-v2-three-mode-width) !important;
          height: var(--size-380);
      .keyboard {
        width: var(--keyboard-v2-three-mode-width) !important;
        height: var(--keyboard-v2-three-mode-height) !important;
        padding: var(--keyboard-v2-three-mode-padding);
      }
    }

    .logo-light-bar {
      width: var(--size-160);
      height: var(--size-20);
      background-image: url('@/assets/images/logo_light_bar.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      right: var(--spacing-24);
      top: var(--size-200);

      & span {
        width: calc(var(--spacing-70) - var(--spacing-1));
        height: var(--spacing-4);
        border-radius: var(--spacing-4);
        // background-color: rgba(135, 206, 235, 0.3);
        position: absolute;
        top: var(--spacing-8);
        right: var(--spacing-5);
      }
    }

    .logo-light-bar__left {
      width: var(--size-22);
      height: var(--size-100);
      background-image: url('@/assets/images/left_logo.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      left: calc(var(--spacing-3) * -1);
      top: var(--size-70);
      z-index: 5;
      transform: rotate(180deg);

      & span {
        width: calc(var(--spacing-70) - var(--spacing-1));
        height: var(--spacing-4);
        border-radius: var(--spacing-4);
        // background-color: rgba(135, 206, 235, 0.3);
        position: absolute;
        top: var(--spacing-8);
        left: var(--spacing-5);
      }
    }
  }

  .side-left-container div,
  .side-right-container div {
    width: var(--keyboard-side-width);
    height: var(--spacing-30);
    margin-bottom: var(--spacing-10);
    background-image: url('@/assets/images/side_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
  }

  .layer-container {
    width: var(--keyboard-side-width2);
    position: absolute;
    right: calc(var(--size-160) * -1);
    bottom: 0;
    display: flex;
    flex-wrap: wrap;

    div {
      width: var(--size-55);
      height: var(--size-30);
      margin: 0 var(--spacing-10) var(--spacing-10) 0;
      font-size: var(--font-size-13);
      font-family: 'CN Heavy';
      color: #cccccc;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url('@/assets/images/layer_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .active {
      background-image: url('@/assets/images/layer_check.svg');
      color: #000000;
    }

    div:hover {
      color: #cccccc;
      background-image: url('@/assets/images/layer_hover.svg');
    }
  }

  .select-box {
    cursor: pointer;
    font-size: var(--font-size-13);
    font-family: 'CN Heavy';
    color: #ccc;
    text-align: center;
    line-height: var(--spacing-30);
  }

  .is-checked {
    background-image: url('@/assets/images/side_bgC.svg') !important;
  }
}
</style>
