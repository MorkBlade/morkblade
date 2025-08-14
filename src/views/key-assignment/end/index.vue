<template>
  <div class="end-box">
    <div class="left-config">
      <div class="key">
        <span>{{ t('end.key1') }}</span>
        <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
          <p :class="{ 'hover-bg': !endInfo.dks }" @mouseup="KeydropFirst">
            <template v-if="isIconKey">
              <img :src="getImageSrc(keyText)" alt="">
            </template>
            <template v-else>
              {{ keyText }}
            </template>
          </p>
          <div class="del_btn" @click="onClick" v-show="endInfo.dks && keyIndex === 0 && !keyboardStore.grabStatus">
          </div>
        </div>
      </div>
      <div class="delay-slider">
        <p>{{ t('end.delay') }}</p>
        <div class="slider-block">
          <el-slider v-model="endInfo.delay" :min="0" :max="200" />
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>{{ t('end.applyMapping') }}</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleEndKey" />
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboardV1 from '@/configs/byte-to-key/v1/keyboard';
import keyboardV2 from '@/configs/byte-to-key/v2/keyboard-v2';
import { NUM_KEY, NUM_KEY_V2 } from '@/configs/byte-to-key/iconNumKey';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';
import { useAppStore, useKeyboardStore } from '@/stores';
import { filterSocdAndRsKey } from '@/utils/filter-key.js';
import { useI18n } from 'vue-i18n';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const { t } = useI18n();

const endInfo = defineModel('endInfo', {
  type: Object,
  default: () => ({ dks: 0, delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const emits = defineEmits(['handleDialoConfirm', 'handleKeyTypeChange']);

const appStore = useAppStore();
const { setEND } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const isShow = ref(false);
const keyIndex = ref(-1);

const keyboard = computed(() => {
  // 根据键盘版本选择对应的键盘配置
  return isVersion2 ? keyboardV2 : keyboardV1;
});

const keyText = computed(() => {
  return keyboard.value[endInfo.value.dks] || '';
});

// 判断是否是图标键
const isIconKey = computed(() => {
  const keyMap = isVersion2 ? NUM_KEY_V2 : NUM_KEY;
  return Object.values(keyMap).some(mappedValue =>
    mappedValue && mappedValue.toLowerCase() === keyText.value.toLowerCase()
  );
});
// 添加动态导入图片的方法
const getImageSrc = (keyText) => {
  return new URL(`../../../assets/images/${keyText}.avif`, import.meta.url).href;
};


const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const saveConfig = () => {
  if (!activeKeys.value.length) {
    showMessage(t('end.selectKeyTip'), 'warning');
    return;
  }
  if (!endInfo.value.dks) {
    showMessage(t('end.selectKey'), 'warning');
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
  if (endInfo.value.dks) keyIndex.value = 0;
};

const onMouseLe = (keyCode) => {
  keyIndex.value = -1;
};

const handleEndKey = (keyVal) => {
  // const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  // if (unBinding) {
  //   showMessage('该键已绑定高级键，请重新选择', 'warning');
  //   return;
  // }
  endInfo.value.dks = keyVal;
};

const KeydropFirst = () => {
  const keyVal = keyboardStore.selectKey.keyCode;
  // const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  // if (unBinding) {
  //   showMessage('该键已绑定高级键，请重新选择', 'warning');
  //   return;
  // }
  endInfo.value.dks = keyVal;
};

const onClick = (keyCode) => {
  if (endInfo.value.dks) {
    endInfo.value.dks = 0;
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
  console.log('save', key, endInfo.value);
  const res = await setEND({ key, row, col, ...endInfo.value, version: appStore.protocolVersion });
  return res;
};

const reset = () => {
  endInfo.value.dks = 0;
  endInfo.value.delay = 200;
  keyIndex.value = -1;
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.end-box {
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
      padding: var(--spacing-50) 0 var(--spacing-25) 0;

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
        width: var(--size-50);
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
