<template>
  <div class="mpt-box">
    <div class="left-config">
      <div class="key">
        <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe(0)">
          <p :class="{ 'hover-bg': !mptInfo.dks[0] }" @mouseup="KeydropKey(0)">{{ keyText[0] }}</p>
          <div class="del_btn" @click="onClick('key1')" v-show="keyText[0] && delKeyShow[0]"></div>
        </div>
        <div class="slider-block">
          <el-slider v-model="mptInfo.dbs[0]" :max="option.max" :min="option.min" :step="option.step" />
        </div>
      </div>
      <div class="key">
        <div class="key-box" @mouseenter="onMouseEn('key2')" @mouseleave="onMouseLe(1)">
          <p :class="{ 'hover-bg': !mptInfo.dks[1] }" @mouseup="KeydropKey(1)">{{ keyText[1] }}</p>
          <div class="del_btn" @click="onClick('key2')" v-show="keyText[1] && delKeyShow[1]"></div>
        </div>
        <div class="slider-block">
          <el-slider v-model="mptInfo.dbs[1]" :max="option.max" :min="option.min" :step="option.step" />
        </div>
      </div>
      <div class="key">
        <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe(2)">
          <p :class="{ 'hover-bg': !mptInfo.dks[2] }" @mouseup="KeydropKey(2)">{{ keyText[2] }}</p>
          <div class="del_btn" @click="onClick" v-show="keyText[2] && delKeyShow[2]"></div>
        </div>
        <div class="slider-block">
          <el-slider v-model="mptInfo.dbs[2]" :max="option.max" :min="option.min" :step="option.step" />
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleMptKey" />
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

const mptInfo = defineModel('mptInfo', {
  type: Object,
  default: () => ({ dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const emits = defineEmits(['handleDialoConfirm', 'handleKeyTypeChange']);

const { setMPT } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const isShow = ref(false);
const delKeyShow = reactive([false, false, false]);

const keyText = computed(() => {
  return [
    keyboard[mptInfo.value.dks[0]] || '',
    keyboard[mptInfo.value.dks[1]] || '',
    keyboard[mptInfo.value.dks[2]] || '',
  ];
});

const option = computed(() => {
  return { max: 3.3, min: 0.005, step: 0.005, tooltipVisible: true };
});

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const saveConfig = () => {
  if (!activeKeys.value.length) {
    showMessage('请先选择需要修改的按键', 'warning');
    return;
  }
  isShow.value = true;
};

const onSure = () => {
  isShow.value = false;
  emits('handleDialoConfirm');
  emits('handleKeyTypeChange', 'END');
};
const onCancel = () => {
  isShow.value = false;
};

const onMouseEn = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (mptInfo.value.dks[0]) delKeyShow[0] = true;
      break;
    case 'key2':
      if (mptInfo.value.dks[1]) delKeyShow[1] = true;
      break;
    default:
      if (mptInfo.value.dks[2]) delKeyShow[2] = true;
      break;
  }
};

const onMouseLe = (idx) => {
  delKeyShow[idx] = false;
};

const handleMptKey = (keyVal) => {
  const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  if (unBinding) {
    showMessage('该键已绑定高级键，请重新选择', 'warning');
    return;
  }
  if (!mptInfo.value.dks[0]) {
    mptInfo.value.dks[0] = keyVal;
  } else if (!mptInfo.value.dks[1]) {
    mptInfo.value.dks[1] = keyVal;
  } else if (!mptInfo.value.dks[2]) {
    mptInfo.value.dks[2] = keyVal;
  }
};

const KeydropKey = (idx) => {
  const keyVal = keyboardStore.selectKey.keyCode;
  const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  if (unBinding) {
    showMessage('该键已绑定高级键，请重新选择', 'warning');
    return;
  }
  // if (!mptInfo.value.dks[idx]) mptInfo.value.dks[idx] = keyboardStore.selectKey.keyCode;
  mptInfo.value.dks[idx] = keyVal;
};

const onClick = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (mptInfo.value.dks[0]) {
        mptInfo.value.dks[0] = 0;
        delKeyShow[0] = false;
      }
      break;
    case 'key2':
      if (mptInfo.value.dks[1]) {
        mptInfo.value.dks[1] = 0;
        delKeyShow[1] = false;
      }
      break;
    default:
      if (mptInfo.value.dks[2]) {
        mptInfo.value.dks[2] = 0;
        delKeyShow[2] = false;
      }
      break;
  }
};

const save = async () => {
  let key = 0;
  let row = 0;
  let col = 0;
  if (edit) {
    key = editKey;
  } else {
    // 获取当前键盘的keycode
    const location = keyboardStore.activeKeys[0].split('-');
    const [rowIndex, colIndex] = location;
    const { keyValue } = keyboardStore.keyboards[rowIndex][colIndex];
    key = keyValue;
    row = +rowIndex;
    col = +colIndex;
  }
  const res = await setMPT({ key, row, col, ...mptInfo.value });
  return res;
};

const reset = () => {
  mptInfo.value.dks = [0, 0, 0];
  mptInfo.value.dbs = [0.5, 1.0, 1.5];
  delKeyShow.value = [false, false, false];
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.mpt-box {
  display: flex;

  .left-config {
    width: var(--assignment-leftbox-width);
    height: var(--size-290);
    box-sizing: border-box;
    padding-top: var(--spacing-20);
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .key {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      // padding-top: 20px;
      margin-bottom: 15px;

      .key-box {
        position: relative;
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

      span {
        display: flex;
        font-size: var(--font-size-15);
        font-family: 'CN Heavy';
        color: #fff;
        margin-right: var(--spacing-10);
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
        margin-right: 10px;
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

      .slider-block {
        width: var(--size-200);
        height: var(--socd-slider-height);
        padding: 0 var(--spacing-4);
        margin-top: var(--spacing-20);
        box-sizing: border-box;
        background-image: url('@/assets/images/luminance.svg');
        background-size: cover;
        background-repeat: no-repeat;

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
    }

    .save-btn {
      width: var(--size-170);
      height: var(--size-40);
      margin-left: var(--spacing-65);
      box-sizing: border-box;
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
