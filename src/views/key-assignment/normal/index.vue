<template>
  <div class="normal-box">
    <div class="tabs">
      <div
        class="tab-item"
        v-for="(ite, idx) in characterArr"
        :key="ite.icon"
        :class="checkedIdx == idx ? 'selected' : ''"
        @click="onCheck(idx)"
      >
        <img
          :src="checkedIdx == idx ? `/src/assets/images/${ite.icon}_c.svg` : `/src/assets/images/${ite.icon}.svg`"
          alt=""
        />
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
      <template v-if="checkedIdx === 5">
        <key v-for="ite in macro" :key="ite.id || ite" :key-value="ite" @select="selectItem" />
      </template>
    </div>
  </div>
</template>

<script setup>
import key from '@/components/key.vue';
import emitter from '@/utils/app-emitter';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
const checkedIdx = ref(0);

const currentKeyX = ref(null);
const currentKeyY = ref(null);
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();

const characterArr = [
  { name: '基本字符', icon: 'basic' },
  { name: '扩展字符', icon: 'extend' },
  { name: '特殊字符', icon: 'special' },
  { name: '键盘控制', icon: 'keyboard' },
  { name: '鼠标键', icon: 'mouse' },
  { name: '宏按键', icon: 'macro' },
];

const extend = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
const number = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98];
const special = [45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 56, 57];
const basic = [40, 41, 42, 43, 44, 79, 80, 81, 82, 224, 225, 226, 227, 228, 229, 230, 231];
const macro = JSON.parse(localStorage.getItem('localMacros')) || [];
const keyboard = [
  61696, 61697, 61698, 61699, 61704, 61705, 61706, 61708, 61707, 62217, 62224, 62225, 62226, 62227, 62228, 62229, 62231,
  62245, 62246, 62247, 62248, 62249, 62250, 62251, 62252, 62255,
];
const mouse = [29441, 29442, 29443, 29444, 29445, 29446, 29447, 29448, 29449];

const performanceValue = computed(() => {
  return performanceStore.value;
});

const hasCurrentKey = computed(() => {
  return activeKeys.value.includes(`${currentKeyX.value}-${currentKeyY.value}`);
});

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const onCheck = (idx) => {
  checkedIdx.value = idx;
};

const selectItem = async (keyVal) => {
  console.log('selectItem is', keyVal);
  await keyboardStore.updateSelectKey(keyVal);
  // keyboardStore.updateKey({ colIndex: currentKeyX.value, rowIndex: currentKeyY.value });
};

emitter.on('key-click', ({ colIndex, rowIndex }) => {
  currentKeyX.value = colIndex;
  currentKeyY.value = rowIndex;
  if (hasCurrentKey.value) {
    console.log('hasCurrentKey', activeKeys.value);
    const { touchMode, single } = performanceValue.value[rowIndex][colIndex];
  }
});
</script>

<style scoped lang="scss">
.normal-box {
  width: 1310px;
  height: 290px;
  background-image: url('@/assets/images/preinstall_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;

  .tabs {
    display: flex;
    margin: 30px 0 20px 30px;

    .tab-item {
      width: 150px;
      height: 30px;
      font-size: 15px;
      margin-left: 50px;
      box-sizing: border-box;
      font-family: 'CN Heavy';
      color: #242424;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url('@/assets/images/normal_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
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
      background-image: url('@/assets/images/normal_bgC.gif');
      color: #000000;
    }
  }

  .keys-box {
    width: 1190px;
    margin-left: 60px;
    display: flex;
    flex-wrap: wrap;

    .active {
      background-image: url('@/assets/images/key_bgC.svg');
    }
  }
}
</style>
