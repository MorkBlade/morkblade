<template>
  <div class="key-assignment">
    <div class="left-menu">
      <div
        v-for="(item, idx) in performanceItem"
        :key="item"
        class="key-assignment-item"
        :class="idx === clickItem ? 'is-active' : ''"
        @click="changeMenu(idx)"
      >
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <normal v-if="currentComponent === 'normal'" />
      <mt
        v-else-if="currentComponent === 'MT'"
        ref="childRef"
        v-model:mt-info="mtInfo"
        :edit="edit"
        :edit-key="editKey"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <dks
        v-else-if="currentComponent === 'DKS'"
        ref="childRef"
        v-model:dks-info="dksInfo"
        :max-touch-travel="maxTouchTravel"
        :min-touch-travel="minTouchTravel"
        :precision="precision"
        :edit="edit"
        :edit-key="editKey"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <socd
        v-else-if="currentComponent === 'SOCD'"
        ref="childRef"
        v-model:socd-info="socdInfo"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <rs
        v-else-if="currentComponent === 'RS'"
        ref="childRef"
        v-model:rs-info="rsInfo"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <tgl
        v-else-if="currentComponent === 'TGL'"
        ref="childRef"
        v-model:tgl-info="tglInfo"
        :edit="edit"
        :edit-key="editKey"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <mpt
        v-else-if="currentComponent === 'MPT'"
        ref="childRef"
        v-model:mpt-info="mptInfo"
        :edit="edit"
        :edit-key="editKey"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <end
        v-else-if="currentComponent === 'END'"
        ref="childRef"
        v-model:end-info="endInfo"
        :edit="edit"
        :edit-key="editKey"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
    </div>
    <div class="right-config-box" v-show="currentComponent !== 'normal'">
      <div>
        <keyConfigCard :advancedData="advancedItems" @delConfig="delConfig" />
      </div>
    </div>
  </div>
</template>

<script setup>
import useSetAdvanced from './useSetAdvanced.js';
import { useHighLevelKeyStore, useKeyboardStore, usePerformanceStore } from '@/stores';

import normal from './normal/index.vue';
import mt from './mt/index.vue';
import dks from './dks/index.vue';
import socd from './socd/index.vue';
import rs from './rs/index.vue';
import tgl from './tgl/index.vue';
import mpt from './mpt/index.vue';
import end from './end/index.vue';
import keyConfigCard from '@/components/key-config-card.vue';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const highLevelKeyStore = useHighLevelKeyStore();

const clickItem = ref(0);
const performanceItem = ['普通', '单击/长按', 'DKS', 'SOCD', 'RS', 'TGL', 'MPT', 'END'];

const changeMenu = (idx) => {
  clickItem.value = idx;
};
// 使用计算属性来确定当前应该显示的组件
const currentComponent = computed(() => {
  switch (clickItem.value) {
    case 1:
      return 'MT';
    case 2:
      return 'DKS';
    case 3:
      return 'SOCD';
    case 4:
      return 'RS';
    case 5:
      return 'TGL';
    case 6:
      return 'MPT';
    case 7:
      return 'END';
    default:
      return 'normal';
  }
});

const {
  edit,
  editKey,
  socdInfo,
  dksInfo,
  mtInfo,
  rsInfo,
  mptInfo,
  tglInfo,
  endInfo,
  maxTouchTravel,
  minTouchTravel,
  precision,
  handleKeyTypeChange,
  handleDialoConfirm,
  handleDelete,
  advancedItems,
} = useSetAdvanced();

const delConfig = async (keyId) => {
  console.log('delConfigdelConfigdelConfig');
  await highLevelKeyStore.deleteHighLevelKey(keyId);
  await performanceStore.getKeyPerformance(keyboardStore.keyboard);
};
</script>

<style scoped lang="scss">
.key-assignment {
  width: var(--size-1600);
  height: var(--size-350);
  margin-top: var(--spacing-25);
  display: flex;
  background-image: url('@/assets/images/performance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  padding-top: var(--spacing-30);
  overflow: hidden;

  .left-menu {
    width: var(--assignment-menu-width);
    height: var(--size-300);
    margin-right: var(--spacing-15);
    padding-right: var(--spacing-5);
    box-sizing: border-box;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      height: var(--size-10);
      width: var(--size-8);
    }

    /* 滚动条轨道 */
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    /* 滚动条手柄 */
    &::-webkit-scrollbar-thumb {
      background: #000;
      border-radius: var(--spacing-1) 0px;
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

  .key-assignment-item {
    width: var(--menu-item-width);
    height: var(--menu-item-height);
    font-size: var(--font-size-20);
    color: #fff;
    margin-left: var(--spacing-30);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN oblique';
    background-image: url('@/assets/images/performance_item_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-bottom: var(--spacing-20);
    cursor: pointer;
  }

  .display-area {
    width: calc(var(--axis-width) + var(--size-10));
    height: var(--size-290);
  }
  .is-active {
    background-image: url('@/assets/images/performance_item_bgC.gif');
    color: #000;
  }

  .right-config-box {
    width: var(--size-300);
    height: var(--size-290);
    padding-top: var(--spacing-20);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding-left: var(--spacing-20);
    // align-items: center;
    background-image: url('@/assets/images/right_config_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    overflow-y: scroll;

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
