<template>
  <div class="edit-macro-container">
    <h3>宏列表</h3>
    <TransitionGroup name="list" tag="div" class="container">
      <div
        v-for="(item, i) in demoMacroData"
        :key="item.key"
        class="item"
        :class="item.type === 'key' ? 'key' : 'delay'"
        :style="{ top: positions[i] + 'px', position: 'absolute', zIndex: draggingIndex === i ? 999 : '' }"
      >
        <!-- @dragstart="dragstart($event, i)"
        draggable="true"
        @dragenter="dragenter($event, i)"
        @dragend="dragend"
        @dragover="dragover" -->
        <span class="handle" @mousedown="startDrag($event, i)"></span>
        <div class="content">
          <img :src="item.status === 'up' ? keyupIcon : keydownIcon" alt="" v-if="item.type === 'key'" />
          <span :class="item.type === 'key' ? 'keyVal' : 'delayVal'">
            {{ item.type === 'key' ? item.key : item.delay + 'ms' }}
          </span>
          <img class="copy-icon" src="@/assets/images/copy_icon.svg" alt="" />
          <img class="del-icon" src="@/assets/images/del_btn.svg" alt="" />
        </div>
      </div>
    </TransitionGroup>
    <div class="button-group">
      <div
        v-for="(item, idx) in operationNameList"
        :key="item"
        class="operation-btn"
        :class="{ 'is-active': isAct === idx }"
        @click="onClick(idx)"
        @mouseenter="onMouseEnter(idx)"
        @mouseleave="onMouseLeave(idx)"
      >
        <img :src="item.icon" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import keyupIcon from '@/assets/images/keyup_icon.svg';
import keydownIcon from '@/assets/images/keydown_icon.svg';
import startIcon from '@/assets/images/start_icon.svg';
import delayIcon from '@/assets/images/delay_icon.svg';
import eventsIcon from '@/assets/images/events_icon.svg';
import clearIcon from '@/assets/images/clear_icon.svg';

const demoMacroData = reactive([
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
  {
    type: 'key',
    key: 'k',
    status: 'up',
    delay: 200,
  },
  {
    type: 'delay',
    key: '',
    status: '',
    delay: 200,
  },
]);

let dragIndex = 0;
const operationNameList = [
  { name: '开始录制', icon: startIcon },
  { name: '添加延迟', icon: delayIcon },
  { name: '插入事件', icon: eventsIcon },
  { name: '清除序列', icon: clearIcon },
];
// const isShow = ref(false);
const isAct = ref(null);

const onClick = (idx) => {
  isAct.value = idx;
  // isShow.value = true;
};

const onMouseEnter = (idx) => {
  isAct.value = idx;
};
const onMouseLeave = (idx) => {
  isAct.value = null;
};

function dragstart(e, index) {
  e.stopPropagation();
  dragIndex = index;
  setTimeout(() => {
    e.target.classList.add('moveing');
  }, 0);
}
function dragenter(e, index) {
  e.preventDefault();
  // 拖拽到原位置时不触发
  if (dragIndex !== index) {
    const source = demoMacroData[dragIndex];
    demoMacroData.splice(dragIndex, 1);
    demoMacroData.splice(index, 0, source);

    // 更新节点位置
    dragIndex = index;
  }
}
function dragover(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}
function dragend(e) {
  e.target.classList.remove('moveing');
}

const positions = ref([]);
let draggingIndex = ref(null);
let startY = 0;
const savePositionInfo = ref([]);
let swapPrevIndex = null; // 用于标记需要交换的位置
let swapNextIndex = null; // 用于标记需要交换的位置

onMounted(() => {
  // 初始化位置
  positions.value = demoMacroData.map((_, index) => index * 65); // 假设每个项的高度为60px
  savePositionInfo.value = demoMacroData.map((_, index) => index * 65); // 假设每个项的高度为60px
});

function startDrag(event, index) {
  draggingIndex.value = index;

  // 记录鼠标开始拖动时的位置
  startY = event.clientY;

  // 为拖动项添加一个样式类
  document.body.style.cursor = 'grabbing'; // 设置为抓取中的手型
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);

  // 防止事件冒泡和默认行为
  event.preventDefault();
  event.stopPropagation();
}

function onDrag(event) {
  if (draggingIndex.value === null) return;

  // 计算拖动的距离
  const deltaY = event.clientY - startY;

  // 直接根据鼠标移动的距离来更新元素位置
  positions.value[draggingIndex.value] = savePositionInfo.value[draggingIndex.value] + deltaY;

  // 获取拖动元素的中心位置
  const dragItemCenter = positions.value[draggingIndex.value] + 25; // 假设元素高度为50px，取中心点

  // 向上交换检测：检查是否应该与上一个元素交换位置
  if (draggingIndex.value > 0) {
    // 获取上一个元素的位置
    const prevItemCenter = savePositionInfo.value[draggingIndex.value - 1] + 25;

    // 如果拖动元素中心位置超过了上一个元素的中心位置，进行交换
    if (dragItemCenter < prevItemCenter) {
      // 保存当前拖动元素的实际视觉位置
      const currentVisualPosition = positions.value[draggingIndex.value];

      // 交换数据数组中的元素
      [demoMacroData[draggingIndex.value], demoMacroData[draggingIndex.value - 1]] = [
        demoMacroData[draggingIndex.value - 1],
        demoMacroData[draggingIndex.value],
      ];

      // 更新所有元素的"正确"位置
      savePositionInfo.value = demoMacroData.map((_, index) => index * 65);

      // 更新非拖动元素的位置
      const newPositions = [...savePositionInfo.value];

      // 保持拖动元素的视觉位置不变
      const oldIndex = draggingIndex.value;
      draggingIndex.value = draggingIndex.value - 1;
      newPositions[draggingIndex.value] = currentVisualPosition;

      // 应用新位置
      positions.value = newPositions;

      // 调整startY以反映新的位置关系，保持拖动的连贯性
      startY = event.clientY;
    }
  }

  // 向下交换检测：检查是否应该与下一个元素交换位置
  if (draggingIndex.value < demoMacroData.length - 1) {
    // 获取下一个元素的位置
    const nextItemCenter = savePositionInfo.value[draggingIndex.value + 1] + 25;

    // 如果拖动元素中心位置超过了下一个元素的中心位置，进行交换
    if (dragItemCenter > nextItemCenter) {
      // 保存当前拖动元素的实际视觉位置
      const currentVisualPosition = positions.value[draggingIndex.value];

      // 交换数据数组中的元素
      [demoMacroData[draggingIndex.value], demoMacroData[draggingIndex.value + 1]] = [
        demoMacroData[draggingIndex.value + 1],
        demoMacroData[draggingIndex.value],
      ];

      // 更新所有元素的"正确"位置
      savePositionInfo.value = demoMacroData.map((_, index) => index * 65);

      // 更新非拖动元素的位置
      const newPositions = [...savePositionInfo.value];

      // 保持拖动元素的视觉位置不变
      const oldIndex = draggingIndex.value;
      draggingIndex.value = draggingIndex.value + 1;
      newPositions[draggingIndex.value] = currentVisualPosition;

      // 应用新位置
      positions.value = newPositions;

      // 调整startY以反映新的位置关系，保持拖动的连贯性
      startY = event.clientY;
    }
  }
}

function endDrag() {
  if (draggingIndex.value === null) return;

  // 计算最终应该放置的位置(匀速动画)
  const finalPositions = demoMacroData.map((_, index) => index * 65);

  // 设置元素最终位置
  positions.value = finalPositions;
  savePositionInfo.value = [...finalPositions];

  // 重置状态
  draggingIndex.value = null;
  document.body.style.cursor = 'default'; // 恢复默认光标

  // 移除事件监听器
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
}
</script>

<style lang="scss" scoped>
.edit-macro-container {
  width: 960px;
  height: 756px;
  box-sizing: border-box;
  background-color: #000;
  border: 3px solid #202020;
  border-radius: 15px;
  margin: 0 20px;
  position: relative;

  h3 {
    margin: 25px 0 34px 30px;
    line-height: 1;
    color: #fff;
    font-size: 16px;
    font-family: 'CN Heavy';
  }

  .container {
    display: flex;
    height: 510px;
    flex-direction: column;
    align-items: center;
    position: relative;
    box-sizing: border-box;
    padding-right: 5px;
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

    .item {
      width: 940px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .key,
    .delay {
      display: flex;
      box-sizing: border-box;
      border-radius: 30px;
      border: 3px solid #202020;
      background-color: #000;
      transition: transform 0.3s ease-in-out;
      cursor: pointer;

      &:hover {
        border-color: #91bc00;
      }

      & .handle {
        width: 54px;
        height: 48px;
        object-fit: fill;
        margin: -2px 0 0 -2px;
        background-image: url('@/assets/images/header_icon.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: grab;
      }

      .content {
        width: calc(100% - 54px);
        height: 100%;
        color: #fff;
        font-size: 20px;
        font-family: 'CN Heavy';
        display: flex;
        align-items: center;
        justify-content: center;
        // position: relative;

        & img {
          width: 16px;
          height: 16px;
          object-fit: fill;
        }

        .keyVal {
          width: 30px;
          height: 30px;
          border: 2px solid #fff;
          border-radius: 5px;
          margin-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .copy-icon {
          width: 20px;
          height: 20px;
          position: absolute;
          right: 70px;
        }
        .del-icon {
          width: 20px;
          height: 20px;
          position: absolute;
          right: 30px;
        }
      }
    }
    .key {
      width: 860px;
      height: 50px;
    }

    .delay {
      width: 430px;
      height: 50px;
    }
  }

  .button-group {
    display: flex;
    position: absolute;
    left: 110px;
    bottom: 20px;

    .operation-btn {
      width: 170px;
      height: 40px;
      margin-right: 20px;
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      img {
        width: 20px;
        height: 20px;
        object-fit: fill;
        position: absolute;
        top: 10px;
        left: 10px;
      }

      span {
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 6px;
        left: 65px;
      }
    }
    .is-active {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
  }
}

.moveing {
  opacity: 0;
}

.list-move, /* 对移动中的元素应用的过渡 */
    .list-enter-active,
    .list-leave-active {
  transition: all 0.2s ease;
}
</style>
