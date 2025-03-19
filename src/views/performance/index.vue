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
  width: 1600px;
  height: 350px;
  margin-top: 25px;
  display: flex;
  background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  padding-top: 30px;
  overflow: hidden;

  .performance-item {
    width: 200px;
    height: 42px;
    font-size: 20px;
    color: #fff;
    margin: 0 30px;
    line-height: 36px;
    font-family: 'CN oblique';
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('@/assets/images/performance_item_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .display-area {
    width: 1310px;
    height: 290px;
  }
  .is-active {
    background-image: url('@/assets/images/performance_item_bgC.gif');
    color: #000;
  }
}
</style>
