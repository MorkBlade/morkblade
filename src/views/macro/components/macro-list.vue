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
          <span class="del-btn" @click="delMacro(item.id)">删除</span>
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
import { useMacroStore } from '@/stores';

const macros = defineModel('macros', { default: () => [] });

// 通知父组件选中的宏索引
const emit = defineEmits(['checkedMacroIdx']);

const macroStore = useMacroStore();
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
  if (macros.value.length >= 15) return;

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

const delMacro = (id) => {
  if (macroStore.usedMacro.indexOf(id) > -1) {
    console.log('宏正在使用中，无法删除');
    return;
  }
  // 创建新数组以触发响应式更新
  macros.value = macros.value.filter((item) => item.id !== id);
};
</script>

<style scoped lang="scss">
.macro-list-container {
  width: 300px;
  height: 756px;
  box-sizing: border-box;
  background-color: #000;
  border: 3px solid #202020;
  border-radius: 15px;

  h3 {
    margin: 25px 0 34px 30px;
    line-height: 1;
    color: #fff;
    font-size: 16px;
    font-family: 'CN Heavy';
  }

  .macro-list {
    height: 670px;
    box-sizing: border-box;
    padding-right: 5px;
    padding-bottom: 90px;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      height: 10px;
      width: 5px;
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
      width: 250px;
      height: 150px;
      margin: 0 0 20px 25px;
      box-sizing: border-box;
      color: #fff;
      background-color: #000;
      border: 3px solid #202020;
      border-radius: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      &.is-checked {
        border-color: #91bc00;
      }

      h4 {
        margin: 20px 0 15px 0;
        line-height: 1;
        color: #fff;
        font-size: 16px;
        font-family: 'CN Heavy';
      }

      p {
        font-size: 10px;
      }

      .length {
        margin: 10px 0 15px 0;
      }

      .controls-group {
        width: 140px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
          width: 60px;
          height: 20px;
          color: #000;
          font-size: 12px;
          font-family: 'CN Heavy';
          line-height: 20px;
          text-align: center;
          vertical-align: middle;
          border-radius: 5px;
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
      width: 250px;
      height: 150px;
      margin-left: 25px;
      box-sizing: border-box;
      color: #fff;
      background-color: #000;
      border: 3px solid #202020;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;

      div {
        width: 200px;
        height: 30px;
        color: #fff;
        font-size: 16px;
        font-family: 'CN Heavy';
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        border-radius: 20px;
        cursor: pointer;
        &:hover {
          background-color: #91bc00;
          color: #000;
        }

        span {
          width: 14px;
          height: 14px;
          margin-right: 10px;
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
