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
  'basic': {
    default: basicIcon,
    checked: basicIconChecked
  },
  'extend': {
    default: extendIcon,
    checked: extendIconChecked
  },
  'special': {
    default: specialIcon,
    checked: specialIconChecked
  },
  'keyboard': {
    default: keyboardIcon,
    checked: keyboardIconChecked
  },
  'mouse': {
    default: mouseIcon,
    checked: mouseIconChecked
  }
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

const extend = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
const number = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98];
const special = [45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 56, 57];
const basic = [40, 41, 42, 43, 44, 79, 80, 81, 82, 224, 225, 226, 227, 228, 229, 230, 231];
const keyboard = [
  61696, 61697, 61698, 61699, 61704, 61705, 61706, 61708, 61707, 62217, 62224, 62225, 62226, 62227, 62228, 62229, 62231,
  62245, 62246, 62247, 62248, 62249, 62250, 62251, 62252, 62255,
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
  width: 650px;
  height: 290px;
  background-image: url('@/assets/images/character_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  margin: 0 30px;

  .tabs {
    display: flex;
    margin: 20px 0 20px 20px;

    .tab-item {
      width: 110px;
      height: 30px;
      line-height: 1;
      font-size: 15px;
      margin-left: 10px;
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
        width: 20px;
        height: 20px;
        object-fit: fill;
        vertical-align: middle;
        margin-right: 5px;
      }
    }

    .selected {
      background-image: url('@/assets/images/tab_bgC.gif');
      color: #000000;
    }
  }

  .keys-box {
    width: 650px;
    margin-left: 30px;
    display: flex;
    flex-wrap: wrap;
    overflow-y: scroll;

    .active {
      background-image: url('@/assets/images/key_bgC.svg');
    }
  }
}
</style>
