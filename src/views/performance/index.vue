<template>
  <div class="performance-container">
    <div class="top-menu">
      <div v-for="(item, idx) in performanceItem" :key="item" class="performance-item"
        :class="idx === clickItem ? 'is-active' : ''" @click="changeMenu(idx)">
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <mode v-if="!clickItem" />
      <quickTrigger v-if="clickItem == 1" />
      <!-- <deadZone v-if="clickItem == 2" /> -->
      <preinstall v-if="clickItem == 3" />
      <axisSetting v-if="clickItem == 4" />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores';

import mode from './mode/index.vue';
import quickTrigger from './quick-trigger/index.vue';
// import deadZone from './dead-zone/index.vue';
import preinstall from './preinstall/index.vue';
import axisSetting from './axis-setting/index.vue';
import emitter from '@/utils/app-emitter';

const appStore = useAppStore();
const clickItem = ref(0);
const performanceItem = ['机械模式', '快速触发', '性能预设', '轴体切换'];
const modulesName = ['mechanicalMode', 'quickTrigger', 'preinstall', 'axis'];

const changeMenu = (idx) => {
  clickItem.value = idx;
  if (idx == 1) {
    emitter.emit('rt-enabled', { value: true });
  } else if (!idx) {
    emitter.emit('rt-enabled', { value: false });
  }
  emitter.emit('in-the-where', { value: modulesName[idx] });
  setTimeout(() => {
    // console.log(appStore.changeConfig);
    // emitter.emit('in-the-where', { value: modulesName[4] });
  }, 10000);
};

watch(
  () => appStore.changeConfig,
  (newVal) => {
    if (newVal) {
      // console.log('changeConfig', newVal);
      appStore.changeConfig = false;
      if (clickItem.value == 4) {
        clickItem.value = 4;
        emitter.emit('rt-enabled', { value: false });
        emitter.emit('in-the-where', { value: modulesName[clickItem.value] });
      }
    }
  },
);

onMounted(() => {
  emitter.emit('rt-enabled', { value: false });
  emitter.emit('in-the-where', { value: modulesName[clickItem.value] });
});
</script>

<style scoped lang="scss">
.performance-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  // background-color: #000;
  .top-menu {
    position: relative;
    // width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-left: 120px;

    // background-color: #fff;
    .performance-item {
      width: var(--size-150);
      height: var(--size-40);
      font-size: var(--font-size-16);
      background-image: url('@/assets/images/unselect.png');
      background-size: contain;
      color: #fff;
      margin: 0 var(--spacing-10);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover {
        background-image: url('@/assets/images/select_hover.png');
      }
    }
    .is-active {
      background-image: url('@/assets/images/mysetting_bg.png');
      &:hover {
        background-image: url('@/assets/images/mysetting_bg.png');
      }
    }
  }

  .display-area {
    width: 100%;
    padding: 30px 128px;
  }
}

// .performance-container {
//   width: var(--size-1600);
//   height: var(--size-350);
//   margin-top: var(--spacing-25);
//   display: flex;
//   background-image: url('@/assets/images/performance_bg.svg');
//   background-size: cover;
//   background-repeat: no-repeat;
//   position: relative;
//   box-sizing: border-box;
//   padding-top: var(--spacing-30);
//   overflow: hidden;

//   .performance-item {
//     width: var(--menu-item-width);
//     height: var(--menu-item-height);
//     font-size: var(--font-size-20);
//     color: #fff;
//     margin: 0 var(--spacing-30);
//     line-height: var(--size-36);
//     font-family: 'CN oblique';
//     display: flex;
//     flex-direction: row;
//     justify-content: center;
//     align-items: center;
//     // background-image: url('@/assets/images/performance_item_bg.svg');
//     background-size: cover;
//     background-repeat: no-repeat;
//     margin-bottom: var(--spacing-20);
//     cursor: pointer;
//   }

//   .display-area {
//     width: var(--size-1310);
//     height: var(--size-290);
//   }
//   .is-active {
//     background-image: url('@/assets/images/performance_item_bgC.gif');
//     color: #000;
//   }
// }</style>
