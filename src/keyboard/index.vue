<template>
  <div class="key-page">
    <div class="side-left-container" v-if="route.path === '/performance'">
      <div
        class="select-box"
        :class="{ 'is-checked': selectedKey == 'all-key' }"
        @click="handleAllSelect"
        @mouseenter="onMouseEn('all-key')"
        @mouseleave="onMouseLe"
      >
        全选
      </div>
      <div
        class="select-box"
        :class="{ 'is-checked': selectedKey == 'cancel-all' }"
        @click="handleCancelSelect"
        @mouseenter="onMouseEn('cancel-all')"
        @mouseleave="onMouseLe"
      >
        全不选
      </div>
      <div
        class="select-box"
        :class="{ 'is-checked': selectedKey == 'reverse-key' }"
        @click="handleReverseSelect"
        @mouseenter="onMouseEn('reverse-key')"
        @mouseleave="onMouseLe"
      >
        反选
      </div>
    </div>
    <div class="keyboard-container">
      <div class="keyboard">
        <div class="row" v-for="(item, rowIndex) in currentLayoutData" :key="item">
          <key
            v-for="(ite, colIndex) in item"
            :key="colIndex"
            :row="rowIndex"
            :column="colIndex"
            :keyItem="ite"
            :active="activeKeys.includes(`${colIndex}-${rowIndex}`)"
            @click="onclick(colIndex, rowIndex)"
            @emits="handleCancelSelect"
          />
        </div>
      </div>
      <div class="logo-light-bar">
        <span></span>
      </div>
    </div>
    <div class="side-right-container" v-if="route.path === '/performance'">
      <div
        class="select-box"
        :class="{ 'is-checked': selectedKey == 'wasd' }"
        @click="handleWasdSelect"
        @mouseenter="onMouseEn('wasd')"
        @mouseleave="onMouseLe"
      >
        WASD
      </div>
      <div
        class="select-box"
        :class="{ 'is-checked': selectedKey == 'num-key' }"
        @click="handleNumSelect"
        @mouseenter="onMouseEn('num-key')"
        @mouseleave="onMouseLe"
      >
        仅数字
      </div>
      <div
        class="select-box"
        :class="{ 'is-checked': selectedKey == 'letter-key' }"
        @click="handleLetterSelect"
        @mouseenter="onMouseEn('letter-key')"
        @mouseleave="onMouseLe"
      >
        仅字母
      </div>
    </div>
    <div class="layer-container" v-if="route.path === '/key-assignment'" @click.capture="handleFnChange">
      <div class="layer" v-for="(ite, idx) in 4" :key="ite" :class="{ active: idx === checkedFn }" :data-idx="idx">
        {{ '层' + ite }}
      </div>
    </div>
  </div>
</template>

<script setup>
import services from '@/services/index';
import { useAppStore, useKeyboardStore, usePerformanceStore, useLightSettingStore } from '@/stores';
import emitter from '@/utils/app-emitter';

import key from './key.vue';

const route = useRoute();
const appStore = useAppStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const lightSettingStore = useLightSettingStore();
const { currentLayoutData } = storeToRefs(keyboardStore);

const selectedKey = ref('');
const rtEnabled = ref(false);
const checkedFn = ref(0);
const formData = reactive({ type: 'win', fn: 0 });

watch(
  () => route.path,
  (newPath) => {
    if (newPath !== '/performance') {
      keyboardStore.cancelSelectKey();
      handleOperationKey('cancelSelect');
    }
    if (newPath !== '/key-assignment') {
      const fnVal = 0;
      checkedFn.value = Number(fnVal);
      formData.fn = fnVal;
      const { fn } = formData;
      keyboardStore.getLayoutKeyInfo(fn);
    }
  },
);

onMounted(async () => {
  // console.log('keyboard onMounted');
  try {
    // 您的mounted逻辑
    await keyboardStore.defKey();
  } catch (error) {
    console.error('Mounted error:', error);
    // 处理错误，比如显示错误提示
  }

  const data = await appStore.systemMode();
  formData.type = data.currentSystem;

  // 获取所有按键颜色并初始化 store
  const colorUpdates = {};
  for (const [row, rowData] of currentLayoutData.value.entries()) {
    for (const [col, item] of rowData.entries()) {
      const res = await services.getCustomLighting(item.key);
      const { key, R, G, B } = res;
      const color = `rgb(${R},${G},${B})`;
      colorUpdates[key] = color;
    }
  }

  // 一次性更新 store 中的所有颜色
  lightSettingStore.$patch((state) => {
    state.keyColors = colorUpdates;
  });

  // console.log('初始化键盘颜色完成:', lightSettingStore.keyColors);
});

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const handleAllSelect = () => {
  selectedKey.value = 'all-key';
  keyboardStore.selectAllKey();
  handleOperationKey('allSelect');
};

const handleCancelSelect = () => {
  selectedKey.value = 'cancel-all';
  keyboardStore.cancelSelectKey();
  handleOperationKey('cancelSelect');
};

const handleReverseSelect = () => {
  selectedKey.value = 'reverse-key';
  keyboardStore.reverseSelectKey();
  handleOperationKey('reverseSelect');
};

const handleWasdSelect = () => {
  selectedKey.value = 'wasd';
  keyboardStore.selectWasdKey();
  handleOperationKey('wasdSelect');
};

const handleNumSelect = () => {
  selectedKey.value = 'num-key';
  keyboardStore.selectNumKey();
  handleOperationKey('numSelect');
};

const handleLetterSelect = () => {
  selectedKey.value = 'letter-key';
  keyboardStore.selectLetterKey();
  handleOperationKey('letterSelect');
};

const onMouseEn = (keyCode) => {
  // selectedKey.value = keyCode;
};

const onMouseLe = () => {
  selectedKey.value = '';
};

const onclick = (colIndex, rowIndex) => {
  // 当前类型
  if (route.path === '/key-assignment') {
    // 单选
    keyboardStore.handleSelectKeyClick({ colIndex, rowIndex }, 'single');
  } else {
    // 多选
    keyboardStore.handleSelectKeyClick({ colIndex, rowIndex });
  }
  emitter.emit('key-click', { colIndex, rowIndex });
};

const handleFnChange = (event) => {
  console.log('event.target', event.target.dataset.idx);
  const fnVal = event.target.dataset.idx;
  checkedFn.value = Number(fnVal);
  formData.fn = fnVal;
  const { fn } = formData;
  keyboardStore.getLayoutKeyInfo(fn);
};

const handleOperationKey = (value) => {
  if (value === 'wasdSelect' || value === 'numSelect' || value === 'letterSelect' || value === 'allSelect') {
    const selectedKeyValues = keyboardStore.activeKeys;
    const performanceValue = performanceStore.value;
    let enabled = false;
    if (selectedKeyValues.length > 0) {
      selectedKeyValues.map(async (keyLocation) => {
        const [key1, key2] = keyLocation.split('-');
        const x = Number(key1);
        const y = Number(key2);
        const { touchMode, rt } = performanceValue[y][x];
        if (touchMode === 'rt' && !enabled) {
          enabled = true;
          rtEnabled.value = true;
          // rtPressTravel.value = rt.pressTravel;
          // rtReleaseTravel.value = rt.releaseTravel;
          // emitter.emit('rt-enabled', { value: true });
        }
      });
    }
  }
  if (value === 'cancelSelect') {
    rtEnabled.value = false;
    // emitter.emit('rt-enabled', { value: false });
  }
};
</script>

<style scoped lang="scss">
.key-page {
  position: relative;
  width: var(--size-1340);
  display: flex;
  justify-content: center;

  .side-left-container,
  .side-right-container {
    margin-top: var(--spacing-280);
  }

  .keyboard-container {
    width: var(--size-1040);
    height: var(--size-380);
    margin: var(--spacing-25) var(--spacing-20) 0 var(--spacing-20);
    background-image: url('@/assets/images/keyboard-bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;

    .keyboard {
      width: 100%;
      height: 100%;
      background-image: url('@/assets/images/keyboard_layout.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      box-sizing: border-box;
      padding: var(--spacing-21) var(--spacing-24);

      .row {
        display: flex;
        height: var(--size-50);
        margin-bottom: var(--key-row-bottom);
        overflow: hidden;
      }
      .row:first-child {
        margin-bottom: var(--key-first-row-bottom);

        .key:first-child,
        .key:nth-child(5),
        .key:nth-child(9) {
          margin-right: var(--key-first-row-right);
        }
        .key:nth-child(14) {
          margin-left: var(--spacing-13);
        }
      }
    }

    .logo-light-bar {
      width: var(--size-160);
      height: var(--size-20);
      background-image: url('@/assets/images/logo_light_bar.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      right: var(--spacing-24);
      top: var(--size-200);

      & span {
        width: calc(var(--spacing-70) - var(--spacing-1));
        height: var(--spacing-4);
        border-radius: var(--spacing-4);
        // background-color: rgba(135, 206, 235, 0.3);
        position: absolute;
        top: var(--spacing-8);
        right: var(--spacing-5);
      }
    }
  }

  .side-left-container div,
  .side-right-container div {
    width: var(--keyboard-side-width);
    height: var(--spacing-30);
    margin-bottom: var(--spacing-10);
    background-image: url('@/assets/images/side_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
  }

  .layer-container {
    width: var(--keyboard-side-width2);
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    flex-wrap: wrap;

    div {
      width: var(--size-55);
      height: var(--size-30);
      margin: 0 var(--spacing-10) var(--spacing-10) 0;
      font-size: var(--font-size-13);
      font-family: 'CN Heavy';
      color: #cccccc;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url('@/assets/images/layer_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      cursor: pointer;
    }
    .active {
      background-image: url('@/assets/images/layer_check.svg');
      color: #000000;
    }

    div:hover {
      color: #cccccc;
      background-image: url('@/assets/images/layer_hover.svg');
    }
  }

  .select-box {
    cursor: pointer;
    font-size: var(--font-size-13);
    font-family: 'CN Heavy';
    color: #ccc;
    text-align: center;
    line-height: var(--spacing-30);
  }
  .is-checked {
    background-image: url('@/assets/images/side_bgC.svg') !important;
  }
}
</style>
