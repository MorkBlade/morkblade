<template>
  <div class="dropdown-menu-container" @click="toggleDropdown"
    :class="{ 'is-checked': appStore.activeConfigIndex !== null }">
    <img class="change-icon" :src="appStore.activeConfigIndex !== null ? changedIcon : changeIcon" />
    <span class="dropdown-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }">
      <!-- TODO 目前写死翻译名字，后续需要优化 -->
      {{ $t(`connect.keyboardConfig${appStore.activeConfigIndex}`) }}
      <!-- {{ $t(`messages.keyboardConfig${appStore.activeConfigIndex}`) }} -->
    </span>
    <img class="down-icon" :src="appStore.activeConfigIndex !== null ? downArrowed : downArrow"
      :style="{ transform: `rotate(${rotate}deg)` }" />
  </div>
  <div class="dropdown-list" :style="{ height: `${defaultHeight}px` }">
    <p>{{ $t('dropdownMenu.boardConfig') }}</p>
    <ul>
      <!-- <ul class="dropdown-list"> -->
      <li v-for="(item, index) in appStore.configList" :key="index"
        :class="{ checked: appStore.activeConfigIndex === index }" @click="selectItem(index)">
        {{ $t(`connect.keyboardConfig${index}`) }}
      </li>
      <template v-if="customItems.length > 0">
        <p style="margin-bottom: 5px">{{ $t('dropdownMenu.customConfig') }}</p>
      </template>
      <li v-for="(item, index) in customItems" :key="index" :class="{ checked: appStore.activeConfigIndex === index }"
        @click="selectItem(idx)">
        <img v-if="!item" src="" alt="" />
        {{ item }}
        <span class="del_btn" v-if="item" @click="delConfig(item)"></span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useAppStore, useKeyboardStore, usePerformanceStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import emitter from '@/utils/app-emitter';

import changedIcon from '@/assets/images/changed.svg';
import changeIcon from '@/assets/images/change.svg';
import downArrowed from '@/assets/images/down_icon.svg';
import downArrow from '@/assets/images/down_icon2.svg';

const appStore = useAppStore();
const keyboardStore = useKeyboardStore();
const { getHighLevelKeys } = useAdvancedHook();

const defaultHeight = ref(0);
const rotate = ref(0);
const customItems = reactive([]);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');


emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

onMounted(async () => {
  await appStore.getConfigID(isVersion2.value);
  await appStore.getBaseInfo(isVersion2.value);
});

const toggleDropdown = () => {
  // isDropdownOpen.value = !isDropdownOpen.value;
  rotate.value = rotate.value ? 0 : 180;
  defaultHeight.value = defaultHeight.value ? 0 : 400;
};
const selectItem = async (index) => {
  // v1 配置切换
  rotate.value = rotate.value ? 0 : 180;
  defaultHeight.value = defaultHeight.value ? 0 : 400;

  if (index === appStore.activeConfigIndex) {
    return;
  }

  const res = await appStore.setActiveConfig(index, isVersion2.value);
  if (res) {
    if (!isVersion2.value) {
      const timer = setTimeout(async () => {
        // TODO v2 配置切换之后获取的数据是一样的
        // await keyboardStore.getLayoutKeyInfo(keyboardStore.layout, keyboardStore.keyboards);
        // await performanceStore.getKeyPerformanceV1(keyboardStore.keyboards);
        if (res) {
          await keyboardStore.initKeyboard();
          await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
          appStore.changeConfig = true;
          appStore.activeConfigIndex = index;
        }
        clearTimeout(timer);
      }, 1000);
    } else {
      await keyboardStore.initKeyboard();
      await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
    }
  }
};

const delConfig = (configInfo) => {
  const index = customItems.indexOf(configInfo);
  customItems.splice(index, 1);
};
</script>

<style scoped lang="scss">
.dropdown-menu-container {
  position: relative;
  width: var(--size-170);
  height: var(--size-40);
  top: calc(var(--spacing-15) + var(--spacing-2));
  display: flex;
  align-content: center;
  align-items: center;
  margin-left: var(--spacing-50);
  background-image: url('@/assets/images/config_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  cursor: pointer;
  /* flex: 1; */

  .change-icon {
    width: var(--size-20);
    height: var(--size-20);
    object-fit: fill;
    transform: rotate(90deg);
    // margin: var(--spacing-10) 0 0 var(--spacing-10);
    margin-left: 10px;
  }

  .dropdown-text {
    border: none;
    color: #fff;
    display: flex;
    // margin: 10px 0 0 var(--spacing-16);
    margin-left: var(--spacing-16);
    font-size: var(--font-size-18);
    background-color: transparent;
    font-weight: 600;
    font-family: 'CN Heavy';
    width: var(--spacing-100);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .down-icon {
    width: var(--size-13);
    height: var(--size-8);
    object-fit: fill;
    transition: transform 0.3s;
    // margin: calc(var(--spacing-15) + 0) 0 0 var(--spacing-10);
    margin-left: var(--spacing-3);
  }
}

.is-checked {
  background-image: url('@/assets/images/config_bg_checked.gif');
  .dropdown-text {
    color: #000;
  }
}

.dropdown-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  position: absolute;
  top: calc(var(--spacing-60) - var(--spacing-3));
  left: var(--spacing-50);
  width: var(--size-170);
  z-index: 10;
  /* display: none; */
  background-color: transparent;
  transition: height 0.3s ease;
  overflow: hidden;

  p {
    font-size: var(--font-size-14);
    margin-top: var(--spacing-5);
    text-align: center;
    color: #cccccc;
  }

  ul {
    background-color: #000;
  }

  li {
    width: var(--size-160);
    height: var(--size-40);
    padding: var(--spacing-10);
    margin-left: var(--spacing-5);
    // font-weight: 600;
    margin-bottom: var(--spacing-5);
    text-align: center;
    font-family: 'CN Heavy';
    background-image: url('@/assets/images/item_bg.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: #ffffff;
    cursor: pointer;
    box-sizing: border-box;
  }

  &.show {
    display: block;
  }

  .del_btn {
    display: inline-block;
    width: var(--size-10);
    height: var(--size-13);
    background-image: url('@/assets/images/del_btn.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .checked {
    background-image: url('@/assets/images/item_bg_checked.gif');
    color: #000;
  }
}
</style>
