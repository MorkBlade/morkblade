<template>
  <div class="tgl-box">
    <div class="left-config">
      <div class="key">
        <span>切换开关TGL:</span>
        <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
          <p :class="{ 'hover-bg': !tglInfo.dks }" @mouseup="KeydropFirst">{{ keyText }}</p>
          <div class="del_btn" @click="onClick" v-show="tglInfo.dks && keyIndex === 0"></div>
        </div>
      </div>
      <div class="delay-slider">
        <p>长按触发延时(单位:ms)</p>
        <div class="slider-block">
          <el-slider v-model="tglInfo.delay" :min="0" :max="200" tooltip-class="custom-tooltip" />
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleTglKey" />
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { useKeyboardStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const tglInfo = defineModel('tglInfo', {
  type: Object,
  default: () => ({ dks: 0, delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const emits = defineEmits(['handleDialoConfirm', 'handleKeyTypeChange']);

const { setTGL } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const isShow = ref(false);
const keyIndex = ref(-1);

const keyText = computed(() => {
  return keyboard[tglInfo.value.dks] || '';
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
  if (tglInfo.value.dks) keyIndex.value = 0;
};

const onMouseLe = (keyCode) => {
  keyIndex.value = -1;
};

const handleTglKey = (keyVal) => {
  if (!tglInfo.value.dks) tglInfo.value.dks = keyVal;
};

const KeydropFirst = () => {
  if (!tglInfo.value.dks) tglInfo.value.dks = keyboardStore.selectKey.keyCode;
};

const onClick = (keyCode) => {
  if (tglInfo.value.dks) {
    tglInfo.value.dks = 0;
    keyIndex.value = -1;
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
  const res = await setTGL({ key, row, col, ...tglInfo.value });
  return res;
};

const reset = () => {
  tglInfo.value.dks = 0;
  tglInfo.value.delay = 200;
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.tgl-box {
  display: flex;

  .left-config {
    width: var(--assignment-leftbox-width);
    height: var(--size-290);
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .key {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: var(--spacing-50) 0 var(--spacing-25) var(--spacing-20);

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
      margin-bottom: var(--spacing-25);
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
        height: var(--size-20);
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
        background-image: url('@/assets/images/luminance_btn.svg');
        background-size: cover;
        background-repeat: no-repeat;
      }
      ::v-deep(.el-slider__bar) {
        height: calc(var(--size-20) - var(--size-8));
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
