<template>
  <div class="key-assignment">
    <div class="left-menu">
      <div
        v-for="(item, idx) in performanceItem"
        :key="item"
        class="key-assignment-item"
        :class="idx === clickItem ? 'is-active' : ''"
        :style="{ display: isVersion2 && item === 'RS' ? 'none' : '' }"
        @click="changeMenu(idx)"
      >
        {{ item }}
      </div>
    </div>
    <div class="display-area">
      <custom-key v-if="currentComponent === 'customKey'" />
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
        :is-external-update="isExternalUpdate"
        :edit="edit"
        :edit-key="editKey"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <socd
        v-else-if="currentComponent === 'SOCD'"
        ref="childRef"
        v-model:socd-info="socdInfo"
        :original-socd-info="originalSocdInfo"
        @handleKeyTypeChange="handleKeyTypeChange"
        @handleDialoConfirm="handleDialoConfirm"
      />
      <rs
        v-else-if="currentComponent === 'RS' && !isVersion2"
        ref="childRef"
        v-model:rs-info="rsInfo"
        :edit="edit"
        :edit-key="editKey"
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
    <div class="right-config-box" v-if="currentComponent !== 'customKey'">
      <div>
        <keyConfigCard :advancedData="advancedItems" @del-config="handleDeleteAdvanced" />
      </div>
    </div>
    <template v-if="isShow">
      <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
    </template>
  </div>
</template>

<script setup>
import useSetAdvanced from './useSetAdvanced.js';
import emitter from '@/utils/app-emitter';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';

import mt from './mt/index.vue';
import dks from './dks/index.vue';
import socd from './socd/index.vue';
import rs from './rs/index.vue';
import tgl from './tgl/index.vue';
import mpt from './mpt/index.vue';
import end from './end/index.vue';
import customKey from './custom-key/index.vue';
import mDialog from '@/components/dialog.vue';
import keyConfigCard from './components/key-config-card.vue';

const {
  edit,
  editKey,
  childRef,
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
  resetDefaultValue,
  handleKeyTypeChange,
  handleDialoConfirm,
  advancedItems,
  keyboardStore: hookKeyboardStore,
} = useSetAdvanced();
const { delAdvancedConfig } = useAdvancedHook();

const clickItem = ref(0);
const isShow = ref(false);
const delAdvancedType = ref('');
const delAdvancedItem = ref(null);
const isExternalUpdate = ref(false);
const originalSocdInfo = ref(null);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const performanceItem = ['普通', '单击/长按', 'DKS', 'SOCD', 'RS', 'TGL', 'MPT', 'END'];

const changeMenu = (idx) => {
  clickItem.value = idx;
  hookKeyboardStore.activeKeys.length = 0;
};

// 使用计算属性来确定当前应该显示的组件
const currentComponent = computed(() => {
  let keyCode = 'customKey';
  switch (clickItem.value) {
    case 1:
      keyCode = 'MT';
      break;
    case 2:
      keyCode = 'DKS';
      break;
    case 3:
      keyCode = 'SOCD';
      break;
    case 4:
      keyCode = 'RS';
      break;
    case 5:
      keyCode = 'TGL';
      break;
    case 6:
      keyCode = 'MPT';
      break;
    case 7:
      keyCode = 'END';
      break;
    default:
      keyCode = 'customKey';
      break;
  }
  emitter.emit('advancedMenu', { value: keyCode });
  return keyCode;
});

watch(
  () => hookKeyboardStore.activeKeys,
  (newVal) => {
    if (newVal.length > 0) {
      const [row, col] = newVal[0].split('-');
      // console.log('has new active key: ', newVal, row, col, hookKeyboardStore.keyboards[row][col]);
      const { advancedKeys } = hookKeyboardStore.keyboards[row][col];
      let type = '';
      switch (advancedKeys.advancedType) {
        case 1:
          clickItem.value = 2;
          isExternalUpdate.value = true;
          const { dks: dksAll, trps, db, db2 } = advancedKeys.dks;
          Object.assign(dksInfo, { dks: [...dksAll], trps, db, db2 });
          console.log('当前选中键是dks!', advancedKeys.dks);
          type = 'DKS';
          setTimeout(() => {
            isExternalUpdate.value = false;
          }, 100);
          break;
        case 2:
          clickItem.value = 6;
          const { dbs, dks } = advancedKeys.mpt;
          Object.assign(mptInfo, { dks: [...dks], dbs: [...dbs] });
          // console.log('当前选中键是mpt!', advancedKeys.mpt, dbs, dks);
          break;
        case 3:
          clickItem.value = 1;
          const { mt } = advancedKeys.mt;
          Object.assign(mtInfo, { dks: [mt.dksAll[0], mt.dksAll[1]], delay: mt.delay });
          // console.log('当前选中键是MT!', advancedKeys.mt);
          break;
        case 4:
          clickItem.value = 5;
          const { tgl } = advancedKeys.tgl;
          Object.assign(tglInfo, { dks: tgl.dksAll[0], delay: tgl.delay });
          // console.log('当前选中键是TGL!', advancedKeys.tgl, tgl, tgl.delay, tgl.dksAll[0]);
          break;
        case 5:
          clickItem.value = 7;
          const { end } = advancedKeys.end;
          Object.assign(endInfo, { dks: end.dks[1], delay: end.delay });
          // console.log('当前选中键是end!', advancedKeys.end);
          break;
        case 6:
        case 8:
          if (!advancedKeys.socd) return;
          clickItem.value = 3;
          const { socd, socdMode, delay, kcs } = advancedKeys.socd;
          for (let row = 0; row < hookKeyboardStore.keyboards.length; row++) {
            for (let col = 0; col < hookKeyboardStore.keyboards[row].length; col++) {
              if (isVersion2) {
                if (
                  hookKeyboardStore.keyboards[row][col].keyValue === socd[0] ||
                  hookKeyboardStore.keyboards[row][col].keyValue === socd[1]
                ) {
                  // console.log(hookKeyboardStore.keyboards[row][col]);
                  // console.log('includes: ', hookKeyboardStore.activeKeys.includes(`${row}-${col}`));
                  if (!hookKeyboardStore.activeKeys.includes(`${row}-${col}`)) {
                    hookKeyboardStore.activeKeys.push(`${row}-${col}`);
                  }
                }
              } else {
                if (
                  hookKeyboardStore.keyboards[row][col].keyValue === kcs[0] ||
                  hookKeyboardStore.keyboards[row][col].keyValue === kcs[1]
                ) {
                  if (!hookKeyboardStore.activeKeys.includes(`${row}-${col}`)) {
                    hookKeyboardStore.activeKeys.push(`${row}-${col}`);
                  }
                }
              }
            }
          }
          if (isVersion2) {
            Object.assign(socdInfo, { pos: [...socd], key: [...socd], type: 0, mode: socdMode, delay });
          } else {
            Object.assign(socdInfo, { pos: [...socd], key: [...kcs], type: 0, mode: socdMode, delay });
          }
          originalSocdInfo.value = JSON.parse(JSON.stringify(socdInfo));
          // console.log('原始socd数据： ', originalSocdInfo.value);
          // console.log('当前选中键是socd!', advancedKeys.socd);
          break;
        case 7:
        case 9:
          clickItem.value = 4;
          const { rs } = advancedKeys.rs;
          for (let row = 0; row < hookKeyboardStore.keyboards.length; row++) {
            for (let col = 0; col < hookKeyboardStore.keyboards[row].length; col++) {
              if (
                hookKeyboardStore.keyboards[row][col].keyValue === rs[0] ||
                hookKeyboardStore.keyboards[row][col].keyValue === rs[1]
              ) {
                // console.log(hookKeyboardStore.keyboards[row][col]);
                // console.log('includes: ', hookKeyboardStore.activeKeys.includes(`${row}-${col}`));
                if (!hookKeyboardStore.activeKeys.includes(`${row}-${col}`)) {
                  hookKeyboardStore.activeKeys.push(`${row}-${col}`);
                }
              }
            }
          }
          Object.assign(rsInfo, { dks: [...rs] });
          // console.log('当前选中键是rs!', advancedKeys.rs);
          break;
        default:
          originalSocdInfo.value = null;
          resetDefaultValue();
          break;
      }
    } else {
      originalSocdInfo.value = null;
      resetDefaultValue();
    }
  },
);

const handleDeleteAdvanced = (item, type) => {
  isShow.value = true;
  delAdvancedItem.value = item;
  delAdvancedType.value = type;
};

const onSure = async () => {
  isShow.value = false;
  // console.log('del advanced: ', delAdvancedItem.value, delAdvancedType.value);
  delAdvancedConfig(delAdvancedItem.value, delAdvancedType.value);
  resetDefaultValue();
  showMessage('删除成功!');
  // emits('delConfig', advancedVal.value);
};

const onCancel = () => {
  isShow.value = false;
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
  // overflow: hidden;

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
