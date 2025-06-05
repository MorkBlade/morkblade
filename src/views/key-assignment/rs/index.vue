<template>
  <div class="rs-box">
    <div class="left-config">
      <div class="key-group">
        <div>
          <span>按键1:</span>
          <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
            <p :class="{ 'hover-bg': !rsInfo.dks[0] }" @mouseup="KeydropKey(0)">{{ keyText[0] }}</p>
            <div
              class="del_btn"
              @click="onClick('key1')"
              v-show="rsInfo.dks[0] && key1Index === 0 && !keyboardStore.grabStatus"
            ></div>
          </div>
        </div>
        <div>
          <span>按键2:</span>
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <p :class="{ 'hover-bg': !rsInfo.dks[1] }" @mouseup="KeydropKey(1)">{{ keyText[1] }}</p>
            <div
              class="del_btn"
              @click="onClick"
              v-show="rsInfo.dks[1] && key2Index === 0 && !keyboardStore.grabStatus"
            ></div>
          </div>
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleRsKey" />
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { useKeyboardStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';
import { filterSocdAndRsKey } from '@/utils/filter-key.js';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const rsInfo = defineModel('rsInfo', {
  type: Object,
  default: () => ({ dks: [0, 0], delay: 0 }),
});

const { edit, editKey, originalRsInfo } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
  originalRsInfo: {
    type: Object,
    default: null,
  },
});

const emits = defineEmits(['handleDialoConfirm', 'handleKeyTypeChange']);

const { setRS, delAdvancedConfig } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const isShow = ref(false);
const key1Index = ref(-1);
const key2Index = ref(-1);

const keyText = computed(() => {
  return [keyboard[rsInfo.value.dks[0]] || '', keyboard[rsInfo.value.dks[1]] || ''];
});

const saveConfig = () => {
  if (!rsInfo.value.dks[0] || !rsInfo.value.dks[1]) {
    showMessage('请先选择需要修改的按键', 'warning');
    return;
  }
  isShow.value = true;
};

const onSure = () => {
  isShow.value = false;
  emits('handleDialoConfirm');
  emits('handleKeyTypeChange', 'RS');
};
const onCancel = () => {
  isShow.value = false;
};

const onMouseEn = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (rsInfo.value.dks[0]) key1Index.value = 0;
      break;
    default:
      if (rsInfo.value.dks[1]) key2Index.value = 0;
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

const handleRsKey = (keyVal) => {
  const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  if (unBinding) {
    showMessage('该键已绑定高级键，请重新选择', 'warning');
    return;
  }
  // if (!rsInfo.value.dks[0]) {
  //   rsInfo.value.dks[0] = keyVal;
  // } else if (!rsInfo.value.dks[1]) {
  //   rsInfo.value.dks[1] = keyVal;
  // }
  if (!rsInfo.value.dks[0]) {
    if (rsInfo.value.dks[1] === keyVal) {
      showMessage('RS键值需不同，请重新选择', 'warning');
    } else {
      rsInfo.value.dks[0] = keyVal;
    }
    // rsInfo.value.dks[0] = keyVal;
  } else if (!rsInfo.value.dks[1]) {
    if (rsInfo.value.dks[0] === keyVal) {
      showMessage('RS键值需不同，请重新选择', 'warning');
    } else {
      rsInfo.value.dks[1] = keyVal;
    }
    // rsInfo.value.dks[1] = keyVal;
  }
};

const KeydropKey = (idx) => {
  const keyVal = keyboardStore.selectKey.keyCode;
  const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  if (unBinding) {
    showMessage('该键已绑定高级键，请重新选择', 'warning');
    return;
  }
  const otherIdx = idx === 0 ? 1 : 0;
  if (rsInfo.value.dks[otherIdx] === keyVal) {
    showMessage('SOCD键值需不同，请重新选择', 'warning');
    return;
  }
  rsInfo.value.dks[idx] = keyVal;
};

const onClick = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (rsInfo.value.dks[0]) {
        rsInfo.value.dks[0] = 0;
        key1Index.value = -1;
      }
      break;
    default:
      if (rsInfo.value.dks[1]) {
        rsInfo.value.dks[1] = 0;
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

const save = async () => {
  try {
    const currentRsInfo = JSON.parse(JSON.stringify(rsInfo.value));

    if (originalRsInfo && originalRsInfo.dks[0] && originalRsInfo.dks[1]) {
      const keysArray = getRowCol(originalRsInfo.dks);
      const [[row, col], [row2, col2]] = keysArray.map((item) => item.split('-').map(Number));
      const advancedInfo1 = keyboardStore.keyboards[row][col].advancedKeys;
      const advancedInfo2 = keyboardStore.keyboards[row2][col2].advancedKeys;
      await delAdvancedConfig(advancedInfo1, 'rs');
      await delAdvancedConfig(advancedInfo2, 'rs');
    }
    // const res = await setRS(rsInfo.value);
    const res = await setRS(currentRsInfo);
    return res;
  } catch (error) {
    console.log('error', error);
  }
};

const reset = () => {
  rsInfo.value.dks = [0, 0];
  rsInfo.value.delay = 0;
  key1Index.value = -1;
  key2Index.value = -1;
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.rs-box {
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
      padding: var(--spacing-80) 0 var(--spacing-90) 0;

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
