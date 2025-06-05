<template>
  <div class="socd-box">
    <div class="left-config">
      <div class="key-group">
        <div>
          <span>按键1:</span>
          <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
            <template v-if="isVersion2">
              <p :class="{ 'hover-bg': !socdInfo.pos[0] }" @mouseup="KeydropKey(0)">{{ keyText[0] }}</p>
            </template>
            <template v-else>
              <p :class="{ 'hover-bg': !socdInfo.key[0] }" @mouseup="KeydropKey(0)">{{ keyText[2] }}</p>
            </template>
            <div
              class="del_btn"
              @click="onClick('key1')"
              v-show="socdInfo.pos[0] && key1Index === 0 && !keyboardStore.grabStatus"
            ></div>
          </div>
        </div>
        <div>
          <span>按键2:</span>
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <template v-if="isVersion2">
              <p :class="{ 'hover-bg': !socdInfo.pos[1] }" @mouseup="KeydropKey(1)">{{ keyText[1] }}</p>
            </template>
            <template v-else>
              <p :class="{ 'hover-bg': !socdInfo.key[1] }" @mouseup="KeydropKey(1)">{{ keyText[3] }}</p>
            </template>
            <div
              class="del_btn"
              @click="onClick"
              v-show="socdInfo.pos[1] && key2Index === 0 && !keyboardStore.grabStatus"
            ></div>
          </div>
        </div>
      </div>
      <div class="delay-slider">
        <p>延时(单位:ms)</p>
        <div class="slider-block">
          <el-slider v-model="socdInfo.delay" :min="0" :max="200" />
        </div>
      </div>
      <div class="cover-list" :class="DKS_MODES[socdInfo.mode] ? 'is-selected' : ''" @click="toggleDropdown">
        <img class="change-icon" :src="DKS_MODES[socdInfo.mode] ? changedIcon : changeIcon" alt="" />
        <span class="mode-text">{{ DKS_MODES[socdInfo.mode] || '请选择' }}</span>
        <img
          class="down-icon"
          :src="DKS_MODES[socdInfo.mode] ? downIcon1 : downIcon2"
          :style="{ transform: `rotate(${rotate}deg)` }"
        />
        <div class="drop-list" :style="{ height: `${defaultHeight}px` }">
          <ul>
            <li
              v-for="ite in DKS_MODES"
              :key="ite"
              :class="{ 'checked-item': ite == DKS_MODES[socdInfo.mode] }"
              @click.stop="selectItem(ite)"
            >
              {{ ite }}
            </li>
          </ul>
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleSocdKey" />
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { scaleValue } from '@/utils/responsive.js';
import { filterSocdAndRsKey } from '@/utils/filter-key.js';
import { useKeyboardStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';
import changeIcon from '@/assets/images/change.svg';
import changedIcon from '@/assets/images/changed.svg';
import downIcon1 from '/src/assets/images/down_icon.svg';
import downIcon2 from '/src/assets/images/down_icon2.svg';

const { setSocd, delAdvancedConfig } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const defaultHeight = ref(0);
const delay = ref(0);
const rotate = ref(180);
const isShow = ref(false);
const key1Index = ref(-1);
const key2Index = ref(-1);
// const originalSocdInfo = ref(null);
const DKS_MODES = ['后覆盖', '第一个键优先', '第二个键优先', '中性'];
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

const socdInfo = defineModel('socdInfo', {
  type: Object,
  default: () => ({ pos: [0, 0], key: [0, 0], type: 0, mode: 0, delay: 0 }),
});

const { originalSocdInfo } = defineProps({
  originalSocdInfo: {
    type: Object,
    default: null,
  },
});

const emits = defineEmits(['handleKeyTypeChange', 'handleDialoConfirm']);

// watch(
//   () => originalSocdInfo,
//   (newVal) => {
//     if (newVal) {
//       // originalSocdInfo.value = JSON.parse(JSON.stringify(newVal));
//       console.log('socd 源数据：', newVal);
//     }
//   },
//   { deep: true },
// );

const keyText = computed(() => {
  return [
    keyboard[socdInfo.value.pos[0]] || '',
    keyboard[socdInfo.value.pos[1]] || '',
    keyboard[socdInfo.value.key[0]] || '',
    keyboard[socdInfo.value.key[1]] || '',
  ];
});

const toggleDropdown = () => {
  defaultHeight.value = defaultHeight.value ? 0 : scaleValue(200);
  rotate.value = rotate.value ? 0 : 180;
};

const selectItem = (item) => {
  socdInfo.value.mode = DKS_MODES.indexOf(item);
  defaultHeight.value = 0;
};

const onMouseEn = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (socdInfo.value.pos[0]) key1Index.value = 0;
      break;
    default:
      if (socdInfo.value.pos[1]) key2Index.value = 0;
      break;
  }
};

const onMouseLe = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      key1Index.value = -1;
      break;
    default:
      key2Index.value = -1;
      break;
  }
};

const saveConfig = () => {
  if (!socdInfo.value.pos[0] || !socdInfo.value.pos[1]) {
    showMessage('请先选择需要修改的按键', 'warning');
    return;
  }
  isShow.value = true;
};

const onSure = () => {
  isShow.value = false;
  emits('handleDialoConfirm');
  emits('handleKeyTypeChange', 'SOCD');
};
const onCancel = () => {
  isShow.value = false;
};

const handleSocdKey = (keyVal) => {
  const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  if (unBinding) {
    showMessage('该键已绑定高级键，请重新选择', 'warning');
    return;
  }
  if (!socdInfo.value.pos[0]) {
    if (socdInfo.value.key[1] === keyVal) {
      showMessage('SOCD键值需不同，请重新选择', 'warning');
    } else {
      socdInfo.value.pos[0] = keyVal;
      socdInfo.value.key[0] = keyVal;
    }
    // socdInfo.value.pos[0] = keyVal;
    // socdInfo.value.key[0] = keyVal;
  } else if (!socdInfo.value.pos[1]) {
    if (socdInfo.value.key[0] === keyVal) {
      showMessage('SOCD键值需不同，请重新选择', 'warning');
    } else {
      socdInfo.value.pos[1] = keyVal;
      socdInfo.value.key[1] = keyVal;
    }
    // socdInfo.value.pos[1] = keyVal;
    // socdInfo.value.key[1] = keyVal;
  }
};

const KeydropKey = (idx) => {
  const keyVal = keyboardStore.selectKey.keyCode;
  const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  if (unBinding) {
    showMessage('该键已绑定高级键，请重新选择', 'warning');
    return;
  }

  // Check if the key value already exists in the other position
  const otherIdx = idx === 0 ? 1 : 0;
  if (socdInfo.value.key[otherIdx] === keyVal) {
    showMessage('SOCD键值需不同，请重新选择', 'warning');
    return;
  }

  socdInfo.value.pos[idx] = keyVal;
  socdInfo.value.key[idx] = keyVal;
};

const onClick = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (socdInfo.value.pos[0]) {
        socdInfo.value.pos[0] = 0;
        socdInfo.value.key[0] = 0;
        key1Index.value = -1;
      }
      break;
    default:
      if (socdInfo.value.pos[1]) {
        socdInfo.value.pos[1] = 0;
        socdInfo.value.key[1] = 0;
        key2Index.value = -1;
      }
      break;
  }
};

const getRowCol = (keys) => {
  const keysArray = [];
  const keyboardStore = useKeyboardStore();
  for (let row = 0; row < keyboardStore.keyboards.length; row++) {
    for (let col = 0; col < keyboardStore.keyboards[row].length; col++) {
      if (keyboardStore.keyboards[row][col].keyValue === keys[0]) {
        keysArray.push(`${row}-${col}`);
      }
      if (keyboardStore.keyboards[row][col].keyValue === keys[1]) {
        keysArray.push(`${row}-${col}`);
      }
    }
  }
  return keysArray;
};

const delayFunc = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const save = async () => {
  try {
    const currentSocdInfo = JSON.parse(JSON.stringify(socdInfo.value));

    if (originalSocdInfo && originalSocdInfo.key[0] && originalSocdInfo.key[1]) {
      const keysArray = getRowCol(originalSocdInfo.key);
      const [[row, col], [row2, col2]] = keysArray.map((item) => item.split('-').map(Number));
      const advancedInfo1 = keyboardStore.keyboards[row][col].advancedKeys;
      const advancedInfo2 = keyboardStore.keyboards[row2][col2].advancedKeys;
      await delAdvancedConfig(advancedInfo1, 'socd');
      await delAdvancedConfig(advancedInfo2, 'socd');
    }
    console.log('save socd log:', currentSocdInfo);
    await delayFunc(500);
    const res = await setSocd(currentSocdInfo); // Use the saved data
    keyboardStore.activeKeys = [];
    return res;
  } catch (error) {
    console.log('error', error);
  }
};

const reset = () => {
  socdInfo.value.pos = [0, 0];
  socdInfo.value.key = [0, 0];
  socdInfo.value.type = 0;
  socdInfo.value.mode = 0;
  key1Index.value = -1;
  key2Index.value = -1;
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.socd-box {
  display: flex;

  .left-config {
    width: var(--assignment-leftbox-width);
    height: var(--size-290);
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .key-group {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: var(--spacing-20) 0 var(--spacing-15) 0;

      .key-box {
        position: relative;
        // margin-left: 20px;
      }

      .del_btn {
        height: var(--size-50);
        width: var(--size-50);
        position: absolute;
        left: 0;
        top: 0;
        background-image: url('@/assets/images/del_key.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: pointer;
        transition: all 0.1s;
      }

      div {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      span {
        width: var(--size-50);
        display: flex;
        font-size: var(--font-size-15);
        font-family: 'CN Heavy';
        color: #fff;
        // margin-left: 20px;
      }
      p {
        height: var(--size-50);
        width: var(--size-50);
        line-height: 1;
        font-size: var(--font-size-12);
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: var(--spacing-20);
        text-align: center;
        box-sizing: border-box;
        font-family: 'Arial Bold';
        background-image: url('@/assets/images/key_bg.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: pointer;

        &.hover-bg:hover {
          background-image: url('@/assets/images/key_bgC.svg');
        }
      }
    }

    .delay-slider {
      padding: 0 var(--spacing-50);
      margin-bottom: var(--spacing-15);
      box-sizing: border-box;

      p {
        margin-bottom: var(--spacing-20);
        text-align: center;
        color: #fff;
        font-size: var(--font-size-15);
        font-family: 'CN Heavy';
      }

      .slider-block {
        width: var(--size-200);
        height: var(--socd-slider-height);
        box-sizing: border-box;
        padding: 0 var(--spacing-4);
        background-image: url('@/assets/images/luminance.svg');
        background-size: cover;
        background-repeat: no-repeat;
      }
      ::v-deep(.el-slider) {
        width: calc(var(--size-200) - var(--size-8));
        height: var(--size-14);
        transition: all 0.1s ease-in-out;
      }
      ::v-deep(.el-slider__button) {
        display: block;
        width: calc(var(--size-32) - var(--size-8));
        height: calc(var(--size-32) - var(--size-8));
        margin: var(--socd-el-button-margin);
        border: none;
        background-color: transparent;
        background-image: url('@/assets/images/luminance_btn.svg');
        background-size: cover;
        background-repeat: no-repeat;
      }
      ::v-deep(.el-slider__bar) {
        height: calc(var(--size-20) - var(--size-8));
      }
    }

    .cover-list {
      width: var(--size-170);
      height: var(--size-40);
      margin-left: var(--spacing-65);
      margin-bottom: var(--spacing-10);
      display: flex;
      align-items: center;
      background-image: url('@/assets/images/select_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      .change-icon {
        width: var(--size-20);
        height: var(--size-20);
        object-fit: fill;
        margin-left: calc(var(--spacing-10) + var(--spacing-1));
      }
      .down-icon {
        width: var(--size-13);
        height: var(--size-8);
        object-fit: fill;
        transition: transform 0.3s;
      }

      .mode-text {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--size-100);
        height: 100%;
        border: none;
        color: #fff;
        font-size: var(--font-size-16);
        font-family: 'CN Heavy';
        margin-left: var(--spacing-12);
        // margin: 5px 10px 0 40px;
      }

      .drop-list {
        position: absolute;
        bottom: var(--spacing-45);
        left: var(--spacing-4);
        z-index: 2;
        box-sizing: border-box;
        padding-right: var(--spacing-5);
        overflow-y: auto;
        transition: height 0.3s ease;
        transform-origin: bottom;
        display: flex;
        flex-direction: column-reverse;

        ul {
          list-style-type: none;
          background-color: #000;
          display: flex;
          flex-direction: column-reverse;

          li {
            width: calc(var(--size-200) - var(--size-40));
            height: var(--size-40);
            padding: var(--spacing-10);
            text-align: center;
            margin-bottom: var(--spacing-5);
            color: #fff;
            font-family: 'CN Heavy';
            background-image: url('@/assets/images/item_bg.svg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }

          .checked-item {
            background-image: url('@/assets/images/item_bg_checked.gif');
          }
        }

        /* 滚动条整体样式 */
        &::-webkit-scrollbar {
          height: var(--size-10);
          width: var(--spacing-5);
        }

        /* 滚动条轨道 */
        &::-webkit-scrollbar-track {
          background: transparent;
        }

        /* 滚动条手柄 */
        &::-webkit-scrollbar-thumb {
          background: rgb(37, 37, 37);
        }

        /* 隐藏滚动条 */
        &::-webkit-scrollbar {
          display: none;
        }

        /* 当容器被悬停时显示滚动条 */
        &:hover::-webkit-scrollbar {
          display: block;
        }
      }
    }
    .is-selected {
      background-image: url('@/assets/images/selected_bg.gif');

      span {
        color: #000 !important;
      }

      // li {
      //   color: #000 !important;
      //   background-image: url('@/assets/images/item_bg_checked.gif') !important;
      // }
    }

    .save-btn {
      width: var(--size-170);
      height: var(--size-40);
      margin-left: var(--spacing-65);
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      &:hover {
        background-image: url('/src/assets/images/saved_bg.svg');
      }

      img {
        width: var(--size-20);
        height: var(--size-20);
        object-fit: fill;
        position: absolute;
        top: var(--spacing-10);
        left: var(--spacing-10);
      }

      span {
        font-size: var(--font-size-18);
        color: #fff;
        position: absolute;
        top: var(--spacing-6);
        left: var(--spacing-65);
      }
    }
    .is-active {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
  }
}
</style>
