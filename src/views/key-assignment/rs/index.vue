<template>
  <div class="rs-box">
    <div class="left-config">
      <div class="key-group">
        <div>
          <span>按键1:</span>
          <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
            <p :class="{ 'hover-bg': !rsInfo.dks[0] }" @mouseup="KeydropFirst">{{ keyText[0] }}</p>
            <div class="del_btn" @click="onClick('key1')" v-show="rsInfo.dks[0] && key1Index === 0"></div>
          </div>
        </div>
        <div>
          <span>按键2:</span>
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <p :class="{ 'hover-bg': !rsInfo.dks[1] }" @mouseup="KeydropSec">{{ keyText[1] }}</p>
            <div class="del_btn" @click="onClick" v-show="rsInfo.dks[1] && key2Index === 0"></div>
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
import { ElMessage } from 'element-plus';
import { useHighLevelKeyStore, useKeyboardStore } from '@/stores';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';
import warnIcon from '@/assets/images/warn_icon.svg';

const rsInfo = defineModel('rsInfo', {
  type: Object,
  default: () => ({ dks: [0, 0] }),
});

const emits = defineEmits(['handleDialoConfirm', 'handleKeyTypeChange']);

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHighLevelKeyStore();

const isShow = ref(false);
const key1Index = ref(-1);
const key2Index = ref(-1);

const keyText = computed(() => {
  return [keyboard[rsInfo.value.dks[0]] || '', keyboard[rsInfo.value.dks[1]] || ''];
});

const saveConfig = () => {
  if (!rsInfo.value.dks[0] || !rsInfo.value.dks[1]) {
    ElMessage({
      grouping: true,
      duration: 1000,
      dangerouslyUseHTMLString: true,
      message: `<span class="custom-message"><img src="${warnIcon}" class="warn-icon"/>请先选择需要修改的按键</span>`,
      customClass: 'custom-message-container',
    });
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
  console.log('asfdasfdaws', keyVal);
  if (!rsInfo.value.dks[0]) {
    rsInfo.value.dks[0] = keyVal;
  } else if (!rsInfo.value.dks[1]) {
    rsInfo.value.dks[1] = keyVal;
  }
};

const KeydropFirst = () => {
  if (!rsInfo.value.dks[0]) rsInfo.value.dks[0] = keyboardStore.selectKey.value;
};

const KeydropSec = () => {
  if (!rsInfo.value.dks[1]) rsInfo.value.dks[1] = keyboardStore.selectKey.value;
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

const save = async () => {
  try {
    const res = await highLevelKeyStore.setRS({ key: rsInfo.value.dks[0], dks: rsInfo.value.dks[1] });
    return res;
  } catch (error) {
    console.log('error', error);
  }
};
defineExpose({ save });
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
