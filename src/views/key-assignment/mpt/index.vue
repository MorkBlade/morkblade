<template>
  <div class="mpt-box">
    <div class="left-config">
      <div class="key">
        <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
          <p :class="{ 'hover-bg': !mptInfo.dks[0] }" @mouseup="KeydropFirst">{{ keyText[0] }}</p>
          <div class="del_btn" @click="onClick('key1')" v-show="keyText[0] && delKeyShow[0]"></div>
        </div>
        <div class="slider-block">
          <el-slider v-model="mptInfo.dbs[0]" :max="option.max" :min="option.min" :step="option.step" />
        </div>
      </div>
      <div class="key">
        <div class="key-box" @mouseenter="onMouseEn('key2')" @mouseleave="onMouseLe('key2')">
          <p :class="{ 'hover-bg': !mptInfo.dks[1] }" @mouseup="KeydropFirst">{{ keyText[1] }}</p>
          <div class="del_btn" @click="onClick('key2')" v-show="keyText[1] && delKeyShow[1]"></div>
        </div>
        <div class="slider-block">
          <el-slider v-model="mptInfo.dbs[1]" :max="option.max" :min="option.min" :step="option.step" />
        </div>
      </div>
      <div class="key">
        <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
          <p :class="{ 'hover-bg': !mptInfo.dks[2] }" @mouseup="KeydropFirst">{{ keyText[2] }}</p>
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
import { useAppStore, useHighLevelKeyStore, useKeyboardStore } from '@/stores';

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

const highLevelKeyStore = useHighLevelKeyStore();
const keyboardStore = useKeyboardStore();
const appStore = useAppStore();

const isShow = ref(false);
const delKeyShow = reactive([false, false, false, false]);

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

const onMouseLe = (keyCode) => {
  keyIndex.value = -1;
};

const handleMptKey = (keyVal) => {
  if (!mptInfo.value.dks[0]) {
    mptInfo.value.dks[0] = keyVal;
  } else if (!mptInfo.value.dks[1]) {
    mptInfo.value.dks[1] = keyVal;
  } else if (!mptInfo.value.dks[2]) {
    mptInfo.value.dks[2] = keyVal;
  }
};

const KeydropFirst = () => {
  if (!mptInfo.value.dks) mptInfo.value.dks = keyboardStore.selectKey.value;
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
  if (edit) {
    key = editKey;
  } else {
    // 获取当前键盘的keycode
    const location = keyboardStore.activeKeys[0].split('-');
    const [x, y] = location;
    const { value } = keyboardStore.currentLayoutData[y][x];
    key = value;
  }
  const res = await highLevelKeyStore.setMpt({ key, ...mptInfo.value });
  return res;
};
defineExpose({ save });
</script>

<style scoped lang="scss">
.mpt-box {
  display: flex;

  .left-config {
    width: 300px;
    height: 290px;
    box-sizing: border-box;
    padding-top: 20px;
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
        width: 200px;
        height: 20px;
        padding: 0 4px;
        margin-top: 20px;
        box-sizing: border-box;
        background-image: url('@/assets/images/luminance.svg');
        background-size: cover;
        background-repeat: no-repeat;

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
    }

    .save-btn {
      width: 170px;
      height: 40px;
      margin-left: 65px;
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
