<template>
  <div class="socd-box">
    <div class="left-config">
      <div class="key-group">
        <div>
          <span>按键1:</span>
          <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
            <p :class="{ 'hover-bg': !socdInfo.pos[0] }" @click="clickFirKey">{{ keyText[0] }}</p>
            <div class="del_btn" @click="onClick('key1')" v-show="socdInfo.pos[0] && key1Index === 0"></div>
          </div>
        </div>
        <div>
          <span>按键2:</span>
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <p :class="{ 'hover-bg': !socdInfo.pos[1] }" @click="clickSecKey">{{ keyText[1] }}</p>
            <div class="del_btn" @click="onClick" v-show="socdInfo.pos[1] && key2Index === 0"></div>
          </div>
        </div>
      </div>
      <div class="cover-list" :class="DKS_MODES[socdInfo.mode] ? 'is-selected' : ''" @click="toggleDropdown">
        <img
          class="change-icon"
          :src="DKS_MODES[socdInfo.mode] ? '/src/assets/images/changed.svg' : '/src/assets/images/change.svg'"
          alt=""
        />
        <span class="mode-text">{{ DKS_MODES[socdInfo.mode] || '请选择' }}</span>
        <img
          class="down-icon"
          :src="DKS_MODES[socdInfo.mode] ? '/src/assets/images/down_icon.svg' : '/src/assets/images/down_icon2.svg'"
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
import { useHighLevelKeyStore } from '@/stores';

import mDialog from '@/components/dialog.vue';
import characterCard from '@/components/character-card.vue';

const highLevelKeyStore = useHighLevelKeyStore();
const defaultHeight = ref(0);
const isShow = ref(false);
const key1Index = ref(-1);
const key2Index = ref(-1);
const DKS_MODES = ['后覆盖', '第一个键优先', '第二个键优先', '中性'];

const socdInfo = defineModel('socdInfo', {
  type: Object,
  default: () => ({ pos: [0, 0], key: [0, 0], type: 0, mode: 0 }),
});

const keyText = computed(() => {
  return [
    keyboard[socdInfo.value.pos[0]] || '',
    keyboard[socdInfo.value.pos[1]] || '',
    // keyboard[socdInfo.value.key[0]] || '',
    // keyboard[socdInfo.value.key[1]] || '',
  ];
});

const emits = defineEmits(['handleKeyTypeChange', 'handleDialoConfirm']);

const toggleDropdown = () => {
  defaultHeight.value = defaultHeight.value ? 0 : 90;
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
  if (!socdInfo.value.pos[0]) {
    socdInfo.value.pos[0] = keyVal;
    socdInfo.value.key[0] = keyVal;
  } else if (!socdInfo.value.pos[1]) {
    socdInfo.value.pos[1] = keyVal;
    socdInfo.value.key[1] = keyVal;
  }
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

const save = async () => {
  try {
    const res = await highLevelKeyStore.setSocd(socdInfo.value);
    return res;
  } catch (error) {
    console.log('error', error);
  }
};
defineExpose({ save });
</script>

<style scoped lang="scss">
.socd-box {
  display: flex;

  .left-config {
    width: 300px;
    height: 290px;
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .key-group {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 50px 0;

      .key-box {
        position: relative;
        // margin-left: 20px;
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

      div {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      span {
        width: 50px;
        display: flex;
        font-size: 15px;
        font-family: 'CN Heavy';
        color: #fff;
        // margin-left: 20px;
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

    .cover-list {
      width: 170px;
      height: 40px;
      margin-left: 65px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      background-image: url('@/assets/images/select_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      .change-icon {
        width: 20px;
        height: 20px;
        object-fit: fill;
        margin-left: 11px;
      }
      .down-icon {
        width: 13px;
        height: 8px;
        object-fit: fill;
      }

      .mode-text {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100%;
        border: none;
        color: #fff;
        font-size: 18px;
        font-family: 'CN Heavy';
        margin-left: 12px;
        // margin: 5px 10px 0 40px;
      }

      .drop-list {
        position: absolute;
        top: 45px;
        left: 4px;
        z-index: 2;
        box-sizing: border-box;
        padding-right: 5px;
        overflow-y: auto;
        transition: height 0.3s ease;

        ul {
          list-style-type: none;
          background-color: #000;
          li {
            width: 160px;
            height: 40px;
            padding: 10px;
            text-align: center;
            margin-bottom: 5px;
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
          height: 10px;
          width: 5px;
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
