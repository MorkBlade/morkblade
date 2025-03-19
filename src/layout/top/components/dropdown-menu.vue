<template>
  <div
    class="dropdown-menu-container"
    @click="toggleDropdown"
    :class="{ 'is-checked': appStore.activeConfigIndex !== null }"
  >
    <img class="change-icon" :src="appStore.activeConfigIndex !== null ? changedIcon : changeIcon" />
    <span class="dropdown-text">
      {{ appStore.configItems[appStore.activeConfigIndex]?.title }}
    </span>
    <img
      class="down-icon"
      :src="appStore.activeConfigIndex !== null ? downArrowed : downArrow"
      :style="{ transform: `rotate(${rotate}deg)` }"
    />
  </div>
  <div class="dropdown-list" :style="{ height: `${defaultHeight}px` }">
    <p>板载配置</p>
    <ul>
      <!-- <ul class="dropdown-list"> -->
      <li
        v-for="(item, index) in appStore.configItems"
        :key="index"
        :class="{ checked: appStore.activeConfigIndex === index }"
        @click="selectItem(index)"
      >
        {{ item.title }}
      </li>
      <template v-if="customItems.length > 0">
        <p style="margin-bottom: 5px">自定义配置</p>
      </template>
      <li
        v-for="(item, index) in customItems"
        :key="index"
        :class="{ checked: appStore.activeConfigIndex === index }"
        @click="selectItem(idx)"
      >
        <img v-if="!item" src="" alt="" />
        {{ item }}
        <span class="del_btn" v-if="item" @click="delConfig(item)"></span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useAppStore, useKeyboardStore, usePerformanceStore } from '@/stores';

import changedIcon from '@/assets/images/changed.svg';
import changeIcon from '@/assets/images/change.svg';
import downArrowed from '@/assets/images/down_icon.svg';
import downArrow from '@/assets/images/down_icon2.svg';

const appStore = useAppStore();
const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const defaultHeight = ref(0);
const rotate = ref(0);
const customItems = reactive([]);

onMounted(async () => {
  await appStore.configID();
  await appStore.getBaseInfo();
  await appStore.keyboardName();
});

const toggleDropdown = () => {
  // isDropdownOpen.value = !isDropdownOpen.value;
  rotate.value = rotate.value ? 0 : 180;
  defaultHeight.value = defaultHeight.value ? 0 : 400;
};
const selectItem = async (index) => {
  if (index === appStore.activeConfigIndex) {
    return;
  }
  rotate.value = rotate.value ? 0 : 180;
  defaultHeight.value = defaultHeight.value ? 0 : 400;

  await appStore.setActiveConfig(index);
  const timer = setTimeout(async () => {
    await keyboardStore.getLayoutKeyInfo();
    await performanceStore.getKeyPerformance(keyboardStore.keyboard);
    clearTimeout(timer);
  }, 1000);
};

const delConfig = (configInfo) => {
  console.log('del config', configInfo);
  const index = customItems.indexOf(configInfo);
  customItems.splice(index, 1);
};
</script>

<style scoped lang="scss">
.dropdown-menu-container {
  position: relative;
  width: 170px;
  height: 40px;
  top: 17px;
  display: flex;
  align-content: center;
  margin-left: 50px;
  background-image: url('@/assets/images/config_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  cursor: pointer;
  /* flex: 1; */

  .change-icon {
    width: 20px;
    height: 20px;
    object-fit: fill;
    transform: rotate(90deg);
    margin: 10px 0 0 10px;
  }

  .dropdown-text {
    border: none;
    color: #fff;
    display: inline-block;
    margin: 8px 0 0 16px;
    font-size: 18px;
    background-color: transparent;
    font-weight: 600;
    font-family: 'CN Heavy';
  }

  .down-icon {
    width: 13px;
    height: 8px;
    object-fit: fill;
    transition: transform 0.3s;
    margin: 18px 0 0 10px;
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
  top: 57px;
  left: 50px;
  width: 170px;
  z-index: 10;
  /* display: none; */
  background-color: transparent;
  transition: height 0.3s ease;
  overflow: hidden;

  p {
    font-size: 14px;
    margin-top: 5px;
    text-align: center;
    color: #cccccc;
  }

  ul {
    background-color: #000;
  }

  li {
    width: 160px;
    height: 40px;
    padding: 10px;
    margin-left: 5px;
    // font-weight: 600;
    margin-bottom: 5px;
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
    width: 10px;
    height: 13px;
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
