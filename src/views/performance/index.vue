<template>
  <div class="performance-container">
    <div class="top-menu">
      <div v-for="(item, idx) in performanceItem" :key="item" class="performance-item"
        :class="idx === clickItem ? 'is-active' : ''" @click="changeMenu(idx)">
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <!-- <mode v-if="!clickItem" /> -->
      <quickTrigger v-if="clickItem == 0" />
      <!-- <deadZone v-if="clickItem == 2" />
      <preinstall v-if="clickItem == 3" /> -->
      <axisSetting v-if="clickItem == 3" />
      <div class="switch-box" v-if="clickItem == 1">
        <div class="switch-item-box" style="margin-right: 75px;">
          <p style="color: #fff; font-size: 18px; font-weight: bold;">当前已选：</p>
          <span style="color: #329be2; font-size: 16px; font-weight: bold;">1个按键</span>
          <div class="switch-content-box" style="border-right: 1px solid rgba(255, 255, 255, 0.2);">
            <div class="switch-item" v-for="(item, idx) in ttcAxis" :key="item">
              <p :style="{backgroundColor: item.axis_color || '#fff'}" class="line"></p>
              <div :style="{backgroundColor: item.axis_color || '#fff',}">{{ 'T'+idx }}</div>
              <p style="color: #fff; font-size: 16px; font-weight: bold;">{{ item.axis_name }}</p>
              <span class="switch-button" :selected-id="item.axis_id" @click="handleSaveAxis(item.axis_id)">替换轴体</span>
            </div>
          </div>
        </div>
        <div class="switch-item-box">
          <p style="color: #fff; font-size: 18px; font-weight: bold;">当前已选：</p>
          <span style="color: #329be2; font-size: 16px; font-weight: bold;">已绑定类型：TTC万磁王、万磁王RGB、天王轴</span>
          <div class="switch-content-box">
            <div class="select-switch-item">
              <div style="background-color: #2bc2bd;">T1</div>
              <p style="color: #fff; font-size: 16px; font-weight: bold;">天王轴</p>
            </div>
            <div class="select-switch-item">
              <div style="background-color: #a04444;">T0</div>
              <p style="color: #fff; font-size: 16px; font-weight: bold;">万磁王RGB</p>
            </div>
            <div class="select-switch-item">
              <div style="background-color: #c5ff6e;">T1</div>
              <p style="color: #fff; font-size: 16px; font-weight: bold;">TTC万磁王</p>
            </div>
          </div>
        </div>
      </div>
      <keyCalibration v-if="clickItem == 2" />
    </div>
  </div>
</template>

<script setup>
import { useAppStore, usePerformanceStore, useKeyboardStore } from '@/stores';

import mode from './mode/index.vue';
import { showMessage } from '@/utils/message';
import quickTrigger from './quick-trigger/index.vue';
// import deadZone from './dead-zone/index.vue';
import preinstall from './preinstall/index.vue';
import axisSetting from './axis-setting/index.vue';
import keyCalibration from '../key-calibration/index.vue';
import emitter from '@/utils/app-emitter';
import { color } from 'echarts';
import { usePerformanceHook } from '@/hooks';

const appStore = useAppStore();
const clickItem = ref(0);
const performanceStore = usePerformanceStore();
const keyboardStore = useKeyboardStore();
const { keyboards } = storeToRefs(keyboardStore);
const checkAixsId = ref(2);
const axisList = computed(() => performanceStore.axisList);
//const performanceItem = ['机械模式', '快速触发', '轴体切换', '按键校准'];
const performanceItem = ['快速触发', '轴体切换', '按键校准'];
const modulesName = ['quickTrigger', 'axis', 'keyCalibration'];
//const modulesName = ['mechanicalMode', 'quickTrigger', 'axis', 'keyCalibration'];

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

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
const ttcAxis = axisList.value.filter((ite) => {
  return ite.factory_name === 'TTC';
});


const handleSaveAxis = async (id) => {
  if (activeKeys.value.length == 1) {
    const { setAxis } = usePerformanceHook();
    checkAixsId.value = axisList.value.findIndex((ite) => ite.axis_id === id);
    console.log(axisList.value);
    const res = setAxis(keyboards.value, activeKeys.value, checkAixsId.value);
    if (res) {
      showMessage('修改成功');
    }
  } else {
    showMessage('请选择一个按键进行轴体替换', 'warning');
  }
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
  width: 2000px;
  height: 100%;
  overflow: hidden;

  // background-color: #000;
  .top-menu {
    position: relative;
    // width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    //margin-left: 140px;

    // background-color: #fff;
    .performance-item {
      width: var(--size-150);
      height: var(--size-40);
      font-size: var(--font-size-16);
      background-image: url('@/assets/images/unselect.png');
      background-size: contain;
      color: #fff;
      margin: 0 15px;
      display: flex;
      font-weight: bold;
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
    padding: 30px 8px;
    .switch-box {
      display: flex;
      .switch-item-box {
        width: 50%;

        .switch-content-box {
          display: flex;
          flex-wrap: wrap;
          padding-right: 50px;
          margin-top: 10px;
          justify-content: space-between;
          
          .switch-item {
            width: 42%;
            display: flex;
            align-items: center;
            background-image: url('@/assets/images/axis_switch_bg.svg');
            //background-size: cover;
            background-repeat: no-repeat;
            margin: 18px 0;
            padding-right: 15px;
            height: 42px;
            background-size: contain;
            
            .switch-button {
              cursor: pointer;
              color: #eee; 
              font-size: 12px; 
              font-weight: bold;
              padding: 2px 10px;
              background-color: #232121;
              border-radius: 10px;
              margin-left: auto;
              &:hover {
                color: #fff;
                font-size: 14px
              }
            };
            .line {
              width: 2px;
              display: block;
              display: block;
              height: 100%;
            }
            div {
              font-weight: bold;
              font-size: 12px;
              margin: 6px 10px;
              padding: 3px 5px;
            }
          }
          .select-switch-item {
            width: 24%;
            display: flex;
            align-items: center;
            margin: 18px 0;
            height: 60px;
            background-image: url('@/assets/images/select_switch_bg.svg');
            background-size: contain;
             div {
              font-weight: bold;
              font-size: 14px;
              margin: 6px 10px;
              padding: 4px 6px;
            }
          }
        }
        
      }
    }
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
