<template>
  <div class="mt-box">
    <div class="left-config-box">
      <div class="key-group">
        <div class="click-box">
          <!-- <span>单击</span> -->
          <span>{{ isVersion2 ? '单击:' : '长按:' }}</span>
          <div class="key-box" @mouseenter="onMouseEn('click')" @mouseleave="onMouseLe('click')">
            <p :class="{ 'hover-bg': !mtInfo.dks[0] }" @mouseup="KeydropKey(0)">{{ keyText[0] }}</p>
            <div
              class="del_btn"
              @click="onClick"
              v-show="mtInfo.dks[0] && clickDelIndex === 0 && !keyboardStore.grabStatus"
            ></div>
          </div>
        </div>
        <div class="hold-box">
          <!-- <span>长按</span> -->
          <span>{{ isVersion2 ? '长按:' : '单击:' }}</span>
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <p :class="{ 'hover-bg': !mtInfo.dks[1] }" @mouseup="KeydropKey(1)">{{ keyText[1] }}</p>
            <div
              class="del_btn"
              @click="onLongPress"
              v-show="mtInfo.dks[1] && longDelIndex === 0 && !keyboardStore.grabStatus"
            ></div>
          </div>
        </div>
      </div>
      <div class="delay-slider">
        <p>长按触发延时(单位:ms)</p>
        <div class="slider-block">
          <el-slider v-model="mtInfo.delay" :min="0" :max="200" :step="1" />
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleMtKey" />
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { showMessage } from '@/utils/message';
import { useKeyboardStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import { filterSocdAndRsKey } from '@/utils/filter-key.js';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const { setMT } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const isShow = ref(false);
const clickDelIndex = ref(-1);
const longDelIndex = ref(-1);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

const mtInfo = defineModel('mtInfo', {
  type: Object,
  default: () => ({ dks: [0, 0], delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const emits = defineEmits(['handleKeyTypeChange', 'handleDialoConfirm']);

const keyText = computed(() => {
  return [keyboard[mtInfo.value.dks[0]] || '', keyboard[mtInfo.value.dks[1]] || ''];
});

// 计算当前选择的高级键
const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const onClick = () => {
  if (mtInfo.value.dks[0]) mtInfo.value.dks[0] = 0;
};
const onLongPress = () => {
  if (mtInfo.value.dks[1]) mtInfo.value.dks[1] = 0;
};

const onMouseEn = (keyCode) => {
  switch (keyCode) {
    case 'click':
      if (mtInfo.value.dks[0]) clickDelIndex.value = 0;
      break;
    default:
      if (mtInfo.value.dks[1]) longDelIndex.value = 0;
      break;
  }
};

const onMouseLe = (keyCode) => {
  switch (keyCode) {
    case 'click':
      clickDelIndex.value = -1;
      break;
    default:
      longDelIndex.value = -1;
      break;
  }
};

const saveConfig = () => {
  console.log(activeKeys.value);
  // console.log('handleKeyTypeChangehandleKeyTypeChangehandleKeyTypeChange', mtInfo.value.dks);
  if (!activeKeys.value.length) {
    showMessage('请先选择需要修改的按键', 'warning');
    return;
  }
  if (!mtInfo.value.dks[0] && !mtInfo.value.dks[1]) {
    showMessage('请选择需要关联的按键', 'warning');
    return;
  }

  isShow.value = true;
};

const onSure = async () => {
  isShow.value = false;
  emits('handleDialoConfirm');
  emits('handleKeyTypeChange', 'MT');
};
const onCancel = () => {
  isShow.value = false;
};

const handleMtKey = (keyVal) => {
  // const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  // if (unBinding) {
  //   showMessage('该键已绑定高级键，请重新选择', 'warning');
  //   return;
  // }
  if (!mtInfo.value.dks[0]) {
    mtInfo.value.dks[0] = keyVal;
  } else if (!mtInfo.value.dks[1]) {
    mtInfo.value.dks[1] = keyVal;
  }
};

const KeydropKey = (idx) => {
  const keyVal = keyboardStore.selectKey.keyCode;
  // const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  // if (unBinding) {
  //   showMessage('该键已绑定高级键，请重新选择', 'warning');
  //   return;
  // }
  mtInfo.value.dks[idx] = keyVal;
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
  const res = await setMT({ key, row, col, ...mtInfo.value });
  return res;
};

const reset = () => {
  mtInfo.value.dks = [0, 0];
  mtInfo.value.delay = 200;
  clickDelIndex.value = -1;
  longDelIndex.value = -1;
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.mt-box {
  display: flex;

  .left-config-box {
    width: var(--assignment-leftbox-width);
    height: var(--size-290);
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    .key-group {
      margin-top: var(--spacing-50);
      margin-bottom: var(--spacing-25);
      display: flex;
      justify-content: center;
      align-items: center;
      .click-box,
      .hold-box {
        display: flex;
        justify-content: center;
        align-items: center;

        .key-box {
          position: relative;
          margin-left: var(--spacing-20);
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
          transition: all 0.3s;
        }

        span {
          font-size: var(--font-size-15);
          font-family: 'CN Heavy';
          color: #fff;
        }
        p {
          height: var(--size-50);
          width: var(--size-50);
          margin-right: var(--spacing-20);
          line-height: 1;
          font-size: var(--font-size-12);
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
          color: #fff;
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
      .click-box {
        // margin-top: 50px;
      }
      .hold-box {
        // margin: 20px 0 50px 0;
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
        margin: var(--mt-el-button-margin);
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
