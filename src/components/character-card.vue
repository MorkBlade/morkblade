<template>
  <div class="character-card">
    <div class="tabs">
      <div
        class="tab-item"
        v-for="(ite, idx) in characterArr"
        :key="ite.icon"
        :class="checkedIdx == idx ? 'selected' : ''"
        @click="onCheck(idx)"
      >
        <img :src="getImageUrl(ite.icon, checkedIdx == idx)" alt="" />
        <span>{{ ite.name }}</span>
      </div>
    </div>
    <div class="keys-box">
      <template v-if="!checkedIdx">
        <key v-for="ite in basic" :key="ite" :key-value="ite" @select="selectItem" />
      </template>
      <template v-if="checkedIdx === 1">
        <key v-for="ite in extend" :key="ite" :key-value="ite" @select="selectItem" />
      </template>
      <template v-if="checkedIdx === 2">
        <key v-for="ite in special" :key="ite" :key-value="ite" @select="selectItem" />
      </template>
      <template v-if="checkedIdx === 3">
        <key v-for="ite in keyboard" :key="ite" :key-value="ite" @select="selectItem" />
      </template>
      <template v-if="checkedIdx === 4">
        <key v-for="ite in mouse" :key="ite" :key-value="ite" @select="selectItem" />
      </template>
    </div>
  </div>
</template>

<script setup>
import key from './key.vue';
import emitter from '@/utils/app-emitter';

// 导入所有需要的图标
import basicIcon from '@/assets/images/basic.svg';
import basicIconChecked from '@/assets/images/basic_c.svg';
import extendIcon from '@/assets/images/extend.svg';
import extendIconChecked from '@/assets/images/extend_c.svg';
import specialIcon from '@/assets/images/special.svg';
import specialIconChecked from '@/assets/images/special_c.svg';
import keyboardIcon from '@/assets/images/keyboard.svg';
import keyboardIconChecked from '@/assets/images/keyboard_c.svg';
import mouseIcon from '@/assets/images/mouse.svg';
import mouseIconChecked from '@/assets/images/mouse_c.svg';

// 创建图标映射对象
const iconMap = {
  basic: {
    default: basicIcon,
    checked: basicIconChecked,
  },
  extend: {
    default: extendIcon,
    checked: extendIconChecked,
  },
  special: {
    default: specialIcon,
    checked: specialIconChecked,
  },
  keyboard: {
    default: keyboardIcon,
    checked: keyboardIconChecked,
  },
  mouse: {
    default: mouseIcon,
    checked: mouseIconChecked,
  },
};

const emit = defineEmits(['handleSendKey']);
const checkedIdx = ref(0);
const characterArr = [
  { name: '基本字符', icon: 'basic' },
  { name: '扩展字符', icon: 'extend' },
  { name: '特殊字符', icon: 'special' },
  { name: '键盘控制', icon: 'keyboard' },
  { name: '鼠标键', icon: 'mouse' },
];

const extend = [
  41, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 43, 42, 73, 76, 74, 77, 75, 78, 131, 130, 40, 89, 90,
  91, 92, 93, 94, 95, 96, 97, 98, 84, 85, 86, 87, 224, 225, 226, 227, 228, 229, 230, 231, 44, 118,
];
const special = [129, 128, 127, 173, 176, 174, 181, 183, 182];
const basic = [
  4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
  35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 56,
];
const keyboard = [
  61696, 61697, 61698, 61699, 62217, 62224, 62225, 62226, 62227, 62228, 62229, 62231, 62245, 62246, 62247, 62248, 62249,
  62250, 62251, 62252, 62255,
];
const mouse = [29441, 29442, 29443, 29444, 29445, 29446, 29447, 29448, 29449];

const onCheck = (ite) => {
  checkedIdx.value = ite;
};

const getImageUrl = (icon, isChecked) => {
  return isChecked ? iconMap[icon].checked : iconMap[icon].default;
};

const selectItem = (keyVal) => {
  emit('handleSendKey', keyVal);
  emitter.emit('highLevelKeyClickstart', keyVal);
};
</script>

<style scoped lang="scss">
.character-card {
  width: var(--character-card-width);
  height: var(--character-card-height);
  background-image: url('@/assets/images/character_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  margin: 0 var(--spacing-25) 0 var(--spacing-30);

  .tabs {
    display: flex;
    margin: var(--spacing-20) 0 var(--spacing-20) var(--spacing-20);

    .tab-item {
      width: var(--character-card-tab-width);
      height: var(--size-30);
      line-height: 1;
      font-size: var(--font-size-15);
      margin-left: var(--spacing-10);
      box-sizing: border-box;
      font-family: 'CN Heavy';
      color: #505050;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url('@/assets/images/tab_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      text-align: center;
      cursor: pointer;

      img {
        width: var(--size-20);
        height: var(--size-20);
        object-fit: fill;
        vertical-align: middle;
        margin-right: var(--spacing-5);
      }
    }

    .selected {
      background-image: url('@/assets/images/tab_bgC.gif');
      color: #000000;
    }
  }

  .keys-box {
    width: var(--size-650);
    height: var(--character-card-small-height);
    margin-left: var(--spacing-30);
    display: flex;
    flex-wrap: wrap;
    overflow-y: scroll;
    &.active {
      background-image: url('@/assets/images/key_bgC.svg');
    }
    /* 滚动条整体样式 */
    &::-webkit-scrollbar {
      height: var(--size-10);
      width: var(--spacing-5);
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
</style>
