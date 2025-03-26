<template>
  <div class="edit-macro-container">
    <h3>宏列表</h3>
    <TransitionGroup name="list" tag="div" class="container">
      <div
        v-for="(item, i) in internalMacroData"
        :key="`macro-item-${i}-${item.key || i}`"
        class="item"
        :class="[item.keyType === 'key' ? 'key' : 'delay', { 'selected-item': selectedItemIndex === i }]"
        :style="{ top: positions[i] + 'px', position: 'absolute', zIndex: draggingIndex === i ? 999 : '' }"
        @click="changeItemInfo($event, item, i)"
      >
        <span class="handle" @mousedown="startDrag($event, i)"></span>
        <div class="content">
          <img :src="item.status === 0 ? keyupIcon : keydownIcon" alt="" v-if="item.keyType === 'key'" />
          <span :class="item.keyType === 'key' ? 'keyVal' : 'delayVal'">
            {{ item.keyType === 'key' ? item.key : item.timeDifference + 'ms' }}
          </span>
          <span class="time-diff" v-if="item.keyType === 'key'">{{ item.timeDifference.toFixed(2) + 'ms' }}</span>
          <img class="copy-icon" src="@/assets/images/copy_icon.svg" alt="" @click="copyItem(item, i)" />
          <img class="del-icon" src="@/assets/images/del_btn.svg" alt="" @click="deleteItem(item)" />
        </div>
      </div>
      <!-- 添加占位元素以保持容器高度 -->
      <div
        class="height-placeholder"
        key="placeholder"
        :style="{ top: internalMacroData.length * 65 + 'px', position: 'absolute' }"
      ></div>
    </TransitionGroup>
    <div class="button-group">
      <div
        v-for="(item, idx) in operationNameList"
        :key="item"
        class="operation-btn"
        :class="{ 'is-active': isAct === idx, 'is-pending': switchClass(idx) }"
        @click="onClick(idx)"
        @mouseenter="onMouseEnter(idx)"
        @mouseleave="onMouseLeave(idx)"
      >
        <img :src="!idx ? changeIcon : item.icon" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
  <div>
    <macroEvents
      :data="macroDataItem"
      @update:key="updateMacroItemKey"
      @update:delay="updateMacroItemDelay"
      @update:status="updateMacroItemStatus"
    />
    <macroType
      :initialMode="macroTypeSettings.mode"
      :initialRepeatCount="macroTypeSettings.repeatCount"
      :initialRepeatInterval="macroTypeSettings.repeatInterval"
      @update:settings="updateMacroTypeSettings"
    />
  </div>
</template>
<script setup>
import macroEvents from './macro-events.vue';
import macroType from './macro-type.vue';
import keyupIcon from '@/assets/images/keyup_icon.svg';
import keydownIcon from '@/assets/images/keydown_icon.svg';
import startIcon from '@/assets/images/start_icon.svg';
import stopIcon from '@/assets/images/stop_icon.svg';
import delayIcon from '@/assets/images/delay_icon.svg';
import eventsIcon from '@/assets/images/events_icon.svg';
import clearIcon from '@/assets/images/clear_icon.svg';

const props = defineProps({
  macroData: { type: Array, default: () => [] },
  parentMacro: { type: Object, default: null },
});

const emit = defineEmits(['updateMacro']);

let dragIndex = 0;
let lastKeyupEventTime = null;
let lastKeydownEventTime = null;
let startY = 0;

const isAct = ref(null);
const positions = ref([]);
const isStart = ref(false);
const localMacros = ref([]);
let draggingIndex = ref(null);
const macroDataItem = ref(null);
const savePositionInfo = ref([]);
const internalMacroData = ref([]);
const keyList = ref({ data: [] });
const selectedItemIndex = ref(null);

const operationNameList = [
  { name: '开始录制', icon: startIcon },
  { name: '添加延迟', icon: delayIcon },
  { name: '插入事件', icon: eventsIcon },
  { name: '清除序列', icon: clearIcon },
];

const changeIcon = computed(() => {
  return isStart.value ? stopIcon : startIcon;
});

onMounted(() => {
  calcPosition();
});

// watch(
//   () => showMacroIdx,
//   (newVal) => {
//     if (localMacros.value[newVal]) macroData.value = localMacros.value[newVal].data;
//     calcPosition();
//   },
// );

watch(
  () => internalMacroData.value?.length,
  () => {
    nextTick(calcPosition);
  },
);

watch(
  () => props.macroData,
  (newVal) => {
    internalMacroData.value = Array.isArray(newVal) ? [...newVal] : [];
  },
  { immediate: true, deep: true },
);

const calcPosition = () => {
  positions.value = internalMacroData.value.map((_, index) => index * 65) || [];
  savePositionInfo.value = internalMacroData.value.map((_, index) => index * 65) || [];
};

const switchClass = (idx) => {
  if (idx === 0) {
    if (isStart.value) {
      return 'is-pending';
    }
  }
};

const onClick = (idx) => {
  isAct.value = idx;

  switch (idx) {
    case 0:
      isStart.value = !isStart.value;
      // console.log('开始录制');
      if (isStart.value) {
        lastKeyupEventTime = Date.now();
        lastKeydownEventTime = Date.now();
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);
      } else {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('keyup', handleKeyup);
      }
      break;
    case 1:
      const value = {
        type: 'delay',
        key: '',
        status: '',
        timeDifference: 20,
      };

      if (internalMacroData.value.length < 64) {
        internalMacroData.value.push(value);
        emit('updateMacro', [...internalMacroData.value]);
      }
      break;
    case 2: // 插入事件
      // 查找最后一个 type 为 key 的项
      const lastKeyEvent = [...internalMacroData.value].reverse().find((item) => item.keyType === 'key');

      if (lastKeyEvent) {
        // 创建深拷贝，避免引用原始对象
        const newEvent = JSON.parse(JSON.stringify(lastKeyEvent));

        // 更新创建时间为当前时间
        newEvent.createTime = Date.now();

        // 如果需要，可以设置时间差为默认值或特定值
        // newEvent.timeDifference = 20; // 默认时间差值，可以根据需求调整

        // 添加到宏数据数组末尾
        if (internalMacroData.value.length < 64) {
          internalMacroData.value.push(newEvent);

          // 通知父组件
          emit('updateMacro', [...internalMacroData.value]);

          // 重新计算位置
          calcPosition();

          // console.log('已插入事件:', newEvent);
        } else {
          // console.warn('宏录入数量已达上限 (64)');
          // 如果需要，这里可以添加提示消息
        }
      } else {
        // console.log('没有找到可以插入的按键事件');
        // 如果找不到按键事件，可以显示提示或执行其他逻辑
      }
      break;
    case 3: // 清除序列
      // console.log('清除序列');
      internalMacroData.value = [];

      isStart.value = false;
      lastKeydownEventTime = null;
      lastKeyupEventTime = null;

      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('keyup', handleKeyup);

      emit('updateMacro', []);

      calcPosition();
      break;
    default:
      break;
  }
};

const handleKeydown = (event) => {
  const createTime = new Date().getTime();
  const { key, keyCode, code, type, timeStamp } = event;
  // console.log('timeStamp', timeStamp);

  const value = {
    keyType: 'key',
    key: key,
    status: 1,
    keyCode,
    code,
    timeStamp,
    type: type,
    timeDifference: 0, // 默认值为0
    createTime,
  };

  // 修复首次计算可能为负数的问题
  if (lastKeydownEventTime === null) {
    // 首次按键，将时间差设为0
    value.timeDifference = 0;
  } else {
    // 非首次按键，计算实际时间差
    const diff = timeStamp - lastKeydownEventTime;
    // 确保时间差为非负数
    value.timeDifference = diff > 0 ? diff : 0;
  }

  // 更新上次按键时间戳
  lastKeydownEventTime = timeStamp;

  // 添加到宏列表
  if (internalMacroData.value.length < 64) {
    internalMacroData.value.push(value);
    emit('updateMacro', [...internalMacroData.value]);
  }
};

const handleKeyup = (event) => {
  const createTime = new Date().getTime();
  const { key, keyCode, code, type, timeStamp } = event;

  const value = {
    keyType: 'key',
    key: key,
    status: 0,
    keyCode,
    code,
    timeStamp,
    type: type,
    timeDifference: 0, // 默认值为0
    createTime,
  };

  // 修复首次计算可能为负数的问题
  if (lastKeyupEventTime === null) {
    // 首次按键释放，将时间差设为0
    value.timeDifference = 0;
  } else {
    // 非首次按键释放，计算实际时间差
    const diff = timeStamp - lastKeyupEventTime;
    // 确保时间差为非负数
    value.timeDifference = diff > 0 ? diff : 0;
  }

  // 更新上次按键释放时间戳
  lastKeyupEventTime = timeStamp;

  // 添加到宏列表
  if (internalMacroData.value.length < 64) {
    internalMacroData.value.push(value);
    emit('updateMacro', [...internalMacroData.value]);
  }
};

const copyItem = (item, index) => {
  // 创建深拷贝，避免引用原始对象
  const copiedItem = JSON.parse(JSON.stringify(item));

  // 更新创建时间为当前时间
  copiedItem.createTime = Date.now();

  // 找到当前项在数组中的索引
  const itemIndex = internalMacroData.value.findIndex((dataItem) => dataItem === item);

  // 如果找到了项，且宏总数未超过限制
  if (itemIndex !== -1 && internalMacroData.value.length < 64) {
    // 在当前项后面插入复制项
    internalMacroData.value.splice(itemIndex + 1, 0, copiedItem);

    // 通知父组件更新数据
    emit('updateMacro', [...internalMacroData.value]);

    // 重新计算位置
    calcPosition();

    // console.log('已复制并插入项:', copiedItem);
  } else if (internalMacroData.value.length >= 64) {
    // console.warn('宏录入数量已达上限 (64)');
    // 这里可以添加用户提示，例如使用消息组件提示用户
  } else {
    // console.error('找不到要复制的项');
  }
};

const deleteItem = (item) => {
  const itemIndex = internalMacroData.value.findIndex((dataItem) => dataItem === item);

  if (itemIndex !== -1) {
    internalMacroData.value.splice(itemIndex, 1);
    emit('updateMacro', [...internalMacroData.value]);
    calcPosition();
    // console.log('已删除项:', item);
  }
};

const changeItemInfo = (e, item, index) => {
  e.stopPropagation();
  macroDataItem.value = JSON.parse(JSON.stringify(item));
  selectedItemIndex.value = index;
};

const onMouseEnter = (idx) => {
  isAct.value = idx;
};
const onMouseLeave = (idx) => {
  isAct.value = null;
};

const startDrag = (event, index) => {
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
};

const onDrag = (event) => {
  if (draggingIndex.value === null) return;

  // 计算拖动的距离
  const deltaY = event.clientY - startY;

  // 直接根据鼠标移动的距离来更新元素位置
  positions.value[draggingIndex.value] = savePositionInfo.value[draggingIndex.value] + deltaY;
  // console.log(positions.value[draggingIndex.value]);
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
      [internalMacroData.value[draggingIndex.value], internalMacroData.value[draggingIndex.value - 1]] = [
        internalMacroData.value[draggingIndex.value - 1],
        internalMacroData.value[draggingIndex.value],
      ];

      // 更新所有元素的"正确"位置
      savePositionInfo.value = internalMacroData.value.map((_, index) => index * 65);

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
  if (draggingIndex.value < internalMacroData.value.length - 1) {
    // 获取下一个元素的位置
    const nextItemCenter = savePositionInfo.value[draggingIndex.value + 1] + 25;

    // 如果拖动元素中心位置超过了下一个元素的中心位置，进行交换
    if (dragItemCenter > nextItemCenter) {
      // 保存当前拖动元素的实际视觉位置
      const currentVisualPosition = positions.value[draggingIndex.value];

      // 交换数据数组中的元素
      [internalMacroData.value[draggingIndex.value], internalMacroData.value[draggingIndex.value + 1]] = [
        internalMacroData.value[draggingIndex.value + 1],
        internalMacroData.value[draggingIndex.value],
      ];

      // 更新所有元素的"正确"位置
      savePositionInfo.value = internalMacroData.value.map((_, index) => index * 65);

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
};

const endDrag = () => {
  if (draggingIndex.value === null) return;

  // 计算最终应该放置的位置(匀速动画)
  const finalPositions = internalMacroData.value.map((_, index) => index * 65);

  // 设置元素最终位置
  positions.value = finalPositions;
  savePositionInfo.value = [...finalPositions];

  // 重置状态
  draggingIndex.value = null;
  document.body.style.cursor = 'default'; // 恢复默认光标

  // 移除事件监听器
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
};

const updateMacroItemKey = (newKey) => {
  // 确保有选中的项和数据
  if (selectedItemIndex.value === null || !macroDataItem.value) return;

  // 更新本地数据
  macroDataItem.value.key = newKey;

  // 更新内部数组中的项
  if (internalMacroData.value[selectedItemIndex.value]) {
    internalMacroData.value[selectedItemIndex.value].key = newKey;

    // 创建新的引用以确保触发响应式更新
    internalMacroData.value = [...internalMacroData.value];

    // 通知父组件
    emit('updateMacro', internalMacroData.value);

    // console.log('已更新按键值:', newKey);
  }
};

const updateMacroItemDelay = (newDelay) => {
  // 确保有选中的项和数据
  if (selectedItemIndex.value === null || !macroDataItem.value) return;

  // 更新本地数据
  macroDataItem.value.timeDifference = newDelay;

  // 更新内部数组中的项
  if (internalMacroData.value[selectedItemIndex.value]) {
    internalMacroData.value[selectedItemIndex.value].timeDifference = newDelay;

    // 创建新的引用以确保触发响应式更新
    internalMacroData.value = [...internalMacroData.value];

    // 通知父组件
    emit('updateMacro', internalMacroData.value);

    // console.log('已更新延迟时间:', newDelay);
  }
};

const updateMacroItemStatus = (newStatus) => {
  // 确保有选中的项和数据
  if (selectedItemIndex.value === null || !macroDataItem.value) return;

  // 更新本地数据
  macroDataItem.value.status = newStatus;

  // 更新内部数组中的项
  if (internalMacroData.value[selectedItemIndex.value]) {
    internalMacroData.value[selectedItemIndex.value].status = newStatus;

    // 创建新的引用以确保触发响应式更新
    internalMacroData.value = [...internalMacroData.value];

    // 通知父组件
    emit('updateMacro', internalMacroData.value);

    // console.log('已更新按键状态:', newStatus);
  }
};

// 宏类型设置，从 props.macroData 获取初始值
const macroTypeSettings = computed(() => {
  // 查找当前选中宏的类型设置
  if (props.parentMacro) {
    return {
      mode: props.parentMacro.mode || 0,
      repeatCount: props.parentMacro.repeatCount || 1,
      repeatInterval: props.parentMacro.repeatInterval || 1,
    };
  }
  // 默认设置
  return {
    mode: 0,
    repeatCount: 1,
    repeatInterval: 1,
  };
});

// 处理宏类型设置更新
const updateMacroTypeSettings = (newSettings) => {
  // console.log('宏类型设置已更新:', newSettings);

  // 通知父组件同时更新数据和设置
  emit('updateMacro', internalMacroData.value, newSettings);
};
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
    height: 510px;
    box-sizing: border-box;
    padding-right: 5px;
    position: relative;
    overflow-y: scroll;
    .height-placeholder {
      width: 100%;
      min-height: 65px;
      position: static; /* 不使用绝对定位 */
      pointer-events: none; /* 不阻挡点击事件 */
    }

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

      &.selected-item {
        border-color: #91bc00 !important;
        box-shadow: 0 0 10px rgba(145, 188, 0, 0.5);
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
          width: auto;
          min-width: 30px;
          height: 30px;
          box-sizing: border-box;
          padding: 0 2px;
          border: 2px solid #fff;
          border-radius: 5px;
          margin-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .time-diff {
          font-size: 14px;
          position: absolute;
          right: 130px;
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
      margin-left: 50px;
    }

    .delay {
      width: 430px;
      height: 50px;
      margin-left: 265px;
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
    .is-pending {
      background-image: url('/src/assets/images/pending_bg.svg');
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
