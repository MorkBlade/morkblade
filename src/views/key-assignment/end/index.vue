<template>
  <div class="end-box">
    <div class="left-config">
      <div class="key">
        <span>按键1:</span>
        <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
          <p :class="{ 'hover-bg': !endInfo.dks }" @mouseup="KeydropFirst">{{ keyText }}</p>
          <div class="del_btn" @click="onClick" v-show="endInfo.dks && keyIndex === 0"></div>
        </div>
      </div>
      <div class="delay-slider">
        <p>延时(单位:ms)</p>
        <div class="slider-block">
          <el-slider v-model="endInfo.delay" :min="0" :max="200" />
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleEndKey" />
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { useAppStore, useHighLevelKeyStore, useKeyboardStore } from '@/stores';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const endInfo = defineModel('endInfo', {
  type: Object,
  default: () => ({ dks: 0, delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const emits = defineEmits(['handleDialoConfirm', 'handleKeyTypeChange']);

const highLevelKeyStore = useHighLevelKeyStore();
const keyboardStore = useKeyboardStore();
const appStore = useAppStore();

const isShow = ref(false);
const keyIndex = ref(-1);

const keyText = computed(() => {
  return keyboard[endInfo.value.dks] || '';
});

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const saveConfig = () => {
  if (!activeKeys.value.length) return;
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
  if (!endInfo.value.dks) endInfo.value.dks = keyVal;
};

const KeydropFirst = () => {
  if (!endInfo.value.dks) endInfo.value.dks = keyboardStore.selectKey.value;
};

const onClick = (keyCode) => {
  if (endInfo.value.dks) {
    endInfo.value.dks = 0;
    keyIndex.value = -1;
  }
};

const save = async () => {
  let key = 0;
  if (edit) {
    key = editKey;
  } else {
    // 获取当前键盘的keycode
    const location = keyboardStore.activeKeys[0].split('-');
    const [x, y] = location;
    const { value } = keyboardStore.currentLayoutData[y][x];
    key = value;
  }
  console.log('save', key, endInfo.value);
  const res = await highLevelKeyStore.setEnd({ key, ...endInfo.value }, appStore.protocolVersion);
  return res;
};
defineExpose({ save });
</script>

<style scoped lang="scss">
.end-box {
  display: flex;

  .left-config {
    width: 300px;
    height: 290px;
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .key {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 50px 0 25px 0;

      .key-box {
        position: relative;
      }

      .del_btn {
        height: 50px;
        width: 50px;
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
        width: 50px;
        display: flex;
        font-size: 15px;
        font-family: 'CN Heavy';
        color: #fff;
        margin-right: 10px;
      }
      p {
        height: 50px;
        width: 50px;
        line-height: 1;
        font-size: 12px;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 20px;
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
      padding: 0 50px;
      margin-bottom: 25px;
      box-sizing: border-box;

      p {
        margin-bottom: 20px;
        text-align: center;
        color: #fff;
        font-size: 15px;
        font-family: 'CN Heavy';
      }

      .slider-block {
        width: 200px;
        height: 20px;
        box-sizing: border-box;
        padding: 0 4px;
        background-image: url('@/assets/images/luminance.svg');
        background-size: cover;
        background-repeat: no-repeat;
      }
      ::v-deep(.el-slider) {
        width: 192px;
        height: 14px;
      }
      ::v-deep(.el-slider__button) {
        display: block;
        width: 24px;
        height: 24px;
        margin: 10px 10px;
        border: none;
        background-image: url('@/assets/images/luminance_btn.svg');
        background-size: cover;
        background-repeat: no-repeat;
      }
      ::v-deep(.el-slider__bar) {
        height: 12px;
      }
    }

    .save-btn {
      width: 170px;
      height: 40px;
      margin-left: 65px;
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
        width: 20px;
        height: 20px;
        object-fit: fill;
        position: absolute;
        top: 10px;
        left: 10px;
      }

      span {
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 6px;
        left: 65px;
      }
    }
    .is-active {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
  }
}
</style>
