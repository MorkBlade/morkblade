<template>
  <div class="performance-container">
    <div class="left-menu">
      <div
        v-for="(item, idx) in performanceItem"
        :key="item"
        class="performance-item"
        :class="idx === clickItem ? 'is-active' : ''"
        @click="changeMenu(idx)"
      >
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <mode v-if="!clickItem" />
      <quickTrigger v-if="clickItem == 1" />
      <deadZone v-if="clickItem == 2" />
      <preinstall v-if="clickItem == 3" />
      <axisSetting v-if="clickItem == 4" />
    </div>
  </div>
</template>

<script setup>
import mode from './mode/index.vue';
import quickTrigger from './quick-trigger/index.vue';
import deadZone from './dead-zone/index.vue';
import preinstall from './preinstall/index.vue';
import axisSetting from './axis-setting/index.vue';
import emitter from '@/utils/app-emitter';

const clickItem = ref(0);
const performanceItem = ['机械模式', '快速触发', '死区', '性能预设', '轴体切换'];
const modulesName = ['mechanicalMode', 'quickTrigger', 'deadZone', 'preinstall', 'axis'];

const changeMenu = (idx) => {
  clickItem.value = idx;
  if (idx == 1) {
    emitter.emit('rt-enabled', { value: true });
  } else if (!idx) {
    emitter.emit('rt-enabled', { value: false });
  }
  emitter.emit('in-the-where', { value: modulesName[idx] });
};

onMounted(() => {
  emitter.emit('rt-enabled', { value: false });
  emitter.emit('in-the-where', { value: modulesName[clickItem.value] });
});
</script>

<style scoped lang="scss">
.performance-container {
  width: var(--performance-container-width);
  height: var(--performance-container-height);
  margin-top: var(--performance-container-margin-top);
  display: flex;
  background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  padding-top: var(--performance-container-padding-top);
  overflow: hidden;

  .performance-item {
    width: var(--performance-item-width);
    height: var(--performance-item-height);
    font-size: var(--performance-item-font-size);
    color: #fff;
    margin: var(--performance-item-margin);
    line-height: var(--performance-item-line-height);
    font-family: 'CN oblique';
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('@/assets/images/performance_item_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-bottom: var(--performance-item-margin-bottom);
    cursor: pointer;
  }

  .display-area {
    width: var(--display-area-width);
    height: var(--display-area-height);
  }
  .is-active {
    background-image: url('@/assets/images/performance_item_bgC.gif');
    color: #000;
  }
}
</style>
