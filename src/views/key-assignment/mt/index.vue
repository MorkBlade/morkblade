<template>
  <div class="mt-box">
    <div class="left-config-box">
      <div class="key-group">
        <div class="click-box">
          <span>单击:</span>
          <div class="key-box" @mouseenter="onMouseEn('click')" @mouseleave="onMouseLe('click')">
            <p :class="{ 'hover-bg': !mtInfo.dks[0] }" @mouseup="KeydropFirst">{{ keyText[0] }}</p>
            <div class="del_btn" @click="onClick" v-show="mtInfo.dks[0] && clickDelIndex === 0"></div>
          </div>
        </div>
        <div class="hold-box">
          <span>长按:</span>
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <p :class="{ 'hover-bg': !mtInfo.dks[1] }" @mouseup="KeydropSec">{{ keyText[1] }}</p>
            <div class="del_btn" @click="onLongPress" v-show="mtInfo.dks[1] && longDelIndex === 0"></div>
          </div>
        </div>
      </div>
      <div class="delay-slider">
        <p>长按触发延时(单位:ms)</p>
        <div class="slider-block">
          <el-slider v-model="mtInfo.delay" :min="0" :max="200" />
        </div>
      </div>
      <div class="save-btn" @click="handleKeyTypeChange">
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
import { useHighLevelKeyStore, useKeyboardStore } from '@/stores';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHighLevelKeyStore();

const isShow = ref(false);
const clickDelIndex = ref(-1);
const longDelIndex = ref(-1);

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

const handleKeyTypeChange = () => {
  console.log(activeKeys.value);
  // console.log('handleKeyTypeChangehandleKeyTypeChangehandleKeyTypeChange', mtInfo.value.dks);
  if (!activeKeys.value.length) return;

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
  if (!mtInfo.value.dks[0]) {
    mtInfo.value.dks[0] = keyVal;
  } else if (!mtInfo.value.dks[1]) {
    mtInfo.value.dks[1] = keyVal;
  }
};

const KeydropFirst = () => {
  if (!mtInfo.value.dks[0]) mtInfo.value.dks[0] = keyboardStore.selectKey.value;
};

const KeydropSec = () => {
  if (!mtInfo.value.dks[1]) mtInfo.value.dks[1] = keyboardStore.selectKey.value;
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
  const res = await highLevelKeyStore.setMT({ key, ...mtInfo.value });
  return res;
};
defineExpose({ save });
</script>

<style scoped lang="scss">
.mt-box {
  display: flex;

  .left-config-box {
    width: 300px;
    height: 290px;
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    .key-group {
      margin-top: 50px;
      margin-bottom: 25px;
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
          margin-left: 20px;
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
          transition: all 0.3s;
        }

        span {
          font-size: 15px;
          font-family: 'CN Heavy';
          color: #fff;
        }
        p {
          height: 50px;
          width: 50px;
          line-height: 1;
          font-size: 12px;
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
      padding: 0 50px;
      margin-bottom: 15px;
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
