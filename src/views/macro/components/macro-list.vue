<template>
  <div class="macro-list-container">
    <h3>宏列表</h3>
    <div class="macro-list">
      <div
        v-for="(item, idx) in macros"
        :key="item.id"
        class="macro"
        :class="{ 'is-checked': curMacroIdx === idx }"
        @click="checkMacro(idx)"
      >
        <h4>{{ item.macroName }}</h4>
        <p class="create-time">创建时间: {{ formatTimestamp(item.createTime) }}</p>
        <p class="length">操作长度: {{ item.data.length }}</p>
        <div class="controls-group" @click.stop>
          <span class="copy-btn" @click="copyMacro(item)">复制</span>
          <span class="del-btn" @click="delMacro(item.id, idx)">删除</span>
        </div>
      </div>
      <template v-if="macros.length < 15">
        <div class="add-macro">
          <div @click="addMacro">
            <span></span>
            新建宏
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { showMessage } from '@/utils/message';
import { useMacroStore, useKeyboardStore } from '@/stores';

const macros = defineModel('macros', { default: () => [] });

// 通知父组件选中的宏索引
const emit = defineEmits(['checkedMacroIdx']);

const macroStore = useMacroStore();
const keyboardStore = useKeyboardStore();
const curMacroIdx = ref(0);

const formatTimestamp = (timestamp) => {
  // 创建一个 Date 对象
  const date = new Date(timestamp);

  // 获取年、月、日、小时和分钟
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // 格式化时间为 YYYY.M.D-HH:mm 的形式
  const formattedDate = `${year}.${month}.${day}-${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return formattedDate;
};

const checkMacro = (idx) => {
  curMacroIdx.value = idx;
  emit('checkedMacroIdx', idx);
};

let flag = false;
const addMacro = () => {
  if (flag) return;
  flag = true;
  if (macros.value.length >= 16) return;

  const times = Date.now();
  const macro = {
    id: parseInt(times / 1000),
    macroName: '宏' + (macros.value.length + 1),
    macroLength: 0,
    createTime: times,
    data: [],
    mode: 0,
    repeatCount: 1,
    repeatInterval: 1,
  };

  // 直接修改模型值
  macros.value = [...macros.value, macro];
  setTimeout(() => {
    flag = false;
  }, 1000);
};

const copyMacro = (macro) => {
  const macroJSON = JSON.parse(JSON.stringify(macro));
  const times = Date.now();
  macroJSON.createTime = times;
  macroJSON.id = parseInt(times / 1000);
  macroJSON.macroName = '宏' + (macros.value.length + 1);

  macroJSON.mode = macro.mode || 0;
  macroJSON.repeatCount = macro.repeatCount || 1;
  macroJSON.repeatInterval = macro.repeatInterval || 1;

  // 直接修改模型值
  macros.value = [...macros.value, macroJSON];
};

const delMacro = (id, idx) => {
  // if (macroStore.usedMacro.indexOf(id) > -1) {
  //   console.log('宏正在使用中，无法删除');
  //   return;
  // }
  if (keyboardStore.keyboards.length === 0) {
    showMessage('页面刷新后请重连获取最新数据', 'warning');
    return;
  }
  let isDel = true;
  for (let row = 0; row < keyboardStore.keyboards.length; row++) {
    for (let col = 0; col < keyboardStore.keyboards[row].length; col++) {
      const advanced = keyboardStore.keyboards[row][col].advancedKeys;
      if (advanced.macro && advanced.macro.macro.macro.id === idx) {
        showMessage('宏正在使用中，无法删除', 'warning');
        isDel = false;
      }
    }
  }
  // 创建新数组以触发响应式更新
  if (isDel) {
    showMessage('宏删除成功');
    macros.value = macros.value.filter((item) => item.id !== id);

    // 如果删除的是当前选中的宏，重置选中状态
    if (curMacroIdx.value === idx) {
      // 如果删除后还有宏，选中第一个宏
      if (macros.value.length > 0) {
        curMacroIdx.value = 0;
        emit('checkedMacroIdx', 0);
      } else {
        // 如果没有宏了，选中-1表示没有选中任何宏
        curMacroIdx.value = -1;
        emit('checkedMacroIdx', -1);
      }
    } else if (curMacroIdx.value > idx) {
      // 如果删除的宏在当前选中宏之前，需要调整选中索引
      curMacroIdx.value--;
      emit('checkedMacroIdx', curMacroIdx.value);
    }
  }
};
</script>

<style scoped lang="scss">
.macro-list-container {
  width: var(--size-300);
  height: var(--macro-height);
  box-sizing: border-box;
  background-color: #000;
  border: var(--spacing-3) solid #202020;
  border-radius: var(--spacing-15);

  h3 {
    margin: var(--spacing-25) 0 calc(var(--spacing-35) - var(--spacing-1)) var(--spacing-30);
    line-height: 1;
    color: #fff;
    font-size: var(--font-size-16);
    font-family: 'CN Heavy';
  }

  .macro-list {
    height: var(--size-670);
    box-sizing: border-box;
    padding-right: var(--spacing-5);
    padding-bottom: var(--spacing-90);
    overflow-y: scroll;

    &::-webkit-scrollbar {
      height: var(--spacing-10);
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
    .macro {
      width: var(--size-250);
      height: var(--size-150);
      margin: 0 0 var(--spacing-20) var(--spacing-25);
      box-sizing: border-box;
      color: #fff;
      background-color: #000;
      border: var(--spacing-3) solid #202020;
      border-radius: var(--spacing-15);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      &.is-checked {
        border-color: #91bc00;
      }

      h4 {
        margin: var(--spacing-20) 0 var(--spacing-15) 0;
        line-height: 1;
        color: #fff;
        font-size: var(--font-size-16);
        font-family: 'CN Heavy';
      }

      p {
        font-size: var(--font-size-10);
      }

      .length {
        margin: var(--spacing-10) 0 var(--spacing-15) 0;
      }

      .controls-group {
        width: var(--size-140);
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
          width: var(--size-60);
          height: var(--size-20);
          color: #000;
          font-size: var(--font-size-12);
          font-family: 'CN Heavy';
          line-height: var(--spacing-20);
          text-align: center;
          vertical-align: middle;
          border-radius: var(--spacing-5);
          cursor: pointer;
        }

        .copy-btn {
          background-color: #91bc00;
        }
        .del-btn {
          background-color: #ff0000;
        }
      }
    }

    .add-macro {
      width: var(--size-250);
      height: var(--size-150);
      margin-left: var(--spacing-25);
      box-sizing: border-box;
      color: #fff;
      background-color: #000;
      border: var(--spacing-3) solid #202020;
      border-radius: var(--spacing-15);
      display: flex;
      align-items: center;
      justify-content: center;

      div {
        width: var(--size-200);
        height: var(--size-30);
        color: #fff;
        font-size: var(--font-size-16);
        font-family: 'CN Heavy';
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        border-radius: var(--spacing-20);
        cursor: pointer;
        &:hover {
          background-color: #91bc00;
          color: #000;
        }

        span {
          width: var(--size-14);
          height: var(--size-14);
          margin-right: var(--spacing-10);
          background-image: url('@/assets/images/add_w.svg');
          background-size: cover;
          background-repeat: no-repeat;
          &:hover {
            background-image: url('@/assets/images/add.svg');
          }
        }
      }
    }
  }
}
</style>
