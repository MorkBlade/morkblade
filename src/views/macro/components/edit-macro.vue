<template>
  <div class="edit-macro-container">
    <h3>宏列表</h3>
    <TransitionGroup name="list" tag="div" class="container">
      <div
        v-for="(item, i) in internalMacroData"
        :key="`macro-item-${i}-${item.key || i}`"
        class="item"
        :class="[
          item.keyType === 'key' ? 'key' : 'delay',
          { 'selected-item': selectedCreateTime === item.createTime },
          { dragging: draggingIndex === i },
        ]"
        :style="{
          top: positions[i] + 'px',
          position: 'absolute',
          zIndex: draggingIndex === i ? 999 : '',
        }"
        @click="changeItemInfo($event, item, i)"
      >
        <span class="handle" @mousedown="startDrag($event, i, item.createTime)"></span>
        <div class="content">
          <img :src="item.status === 0 ? keyupIcon : keydownIcon" alt="" v-if="item.keyType === 'key'" />
          <span :class="item.keyType === 'key' ? 'keyVal' : 'delayVal'">
            {{ item.keyType === 'key' ? keyboardWord[item.keyCode] : item.timeDifference + 'ms' }}
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
        :style="{ top: internalMacroData.length * scaleValue(65) + 'px', position: 'absolute' }"
      ></div>
    </TransitionGroup>
    <div class="button-group">
      <div
        v-for="(item, idx) in operationNameList"
        :key="item"
        class="operation-btn"
        :class="{
          'is-active': isAct === idx,
          'is-pending': switchClass(idx),
          'clear-btn': idx === operationNameList.length - 1,
        }"
        @click="onClick(idx)"
        @mouseenter="onMouseEnter(idx)"
        @mouseleave="onMouseLeave(idx)"
      >
        <img :src="!idx ? changeIcon : item.icon" alt="" />
        <span>{{ !idx && isStart ? '结束录制' : item.name }}</span>
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
import { scaleValue } from '@/utils/responsive.js';

import macroEvents from './macro-events.vue';
import macroType from './macro-type.vue';
import keyupIcon from '@/assets/images/keyup_icon.svg';
import keydownIcon from '@/assets/images/keydown_icon.svg';
import startIcon from '@/assets/images/start_icon.svg';
import stopIcon from '@/assets/images/stop_icon.svg';
import delayIcon from '@/assets/images/delay_icon.svg';
import eventsIcon from '@/assets/images/events_icon.svg';
import clearIcon from '@/assets/images/clear_icon.svg';
import keyboardWord from '@/configs/byte-to-key/keyboard';

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
const selectedCreateTime = ref(null);

const operationNameList = [
  { name: '开始录制', icon: startIcon },
  { name: '添加延迟', icon: delayIcon },
  { name: '插入事件', icon: eventsIcon },
  { name: '清除序列', icon: clearIcon },
];

const keyValueDictionary = {
  8: 42, // backspace
  9: 43, // tab
  12: 156, // clear
  13: 40, // enter
  16: 225, // l-shift
  17: 224, // l-ctrl
  18: 226, // l-alt
  19: 4279, // pause
  20: 130, // caps lock
  27: 41, // esc
  32: 44, // space
  33: 157, // prior
  34: 174, // next
  35: 77, // end
  36: 74, // home
  37: 80, // left
  38: 82, // up
  39: 79, // right
  40: 81, // down
  41: 119, // select
  42: 70, // print
  43: 116, // execute
  45: 73, // insert
  46: 76, // delete
  47: 117, // help
  48: 39, // 0 equal braceright
  49: 30, // 1 exclam onesuperior
  50: 31, // 2 quotedbl twosuperior
  51: 32, // 3 section threesuperior
  52: 33, // 4 dollar
  53: 34, // 5 percent
  54: 35, // 6 ampersand
  55: 36, // 7 slash braceleft
  56: 37, // 8 parenleft bracketleft
  57: 38, // 9 parenright bracketright
  65: 4, // A
  66: 5, // B
  67: 6, // C
  68: 7, // D
  69: 8, // E
  70: 9, // F
  71: 10, // G
  72: 11, // H
  73: 12, // I
  74: 13, // J
  75: 14, // K
  76: 15, // L
  77: 16, // M
  78: 17, // N
  79: 18, // O
  80: 19, // P
  81: 20, // Q
  82: 21, // R
  83: 22, // S
  84: 23, // T
  85: 24, // U
  86: 25, // V
  87: 26, // W
  88: 27, // X
  89: 28, // Y
  90: 29, // Z
  91: 227, // l-win
  96: 98, // PAD0
  97: 89, // PAD1
  98: 90, // PAD2
  99: 91, // PAD3
  100: 92, // PAD4
  101: 93, // PAD5
  102: 94, // PAD6
  103: 95, // PAD7
  104: 96, // PAD8
  105: 97, // PAD9
  106: 85, // PAD*
  107: 87, // PAD+
  108: 84, // PAD/
  109: 86, // PAD-
  110: 99, // PAD.
  111: 84, // PAD/
  112: 58, // F1
  113: 59, // F2
  114: 60, // F3
  115: 61, // F4
  116: 62, // F5
  117: 63, // F6
  118: 64, // F7
  119: 65, // F8
  120: 66, // F9
  121: 67, // F10
  122: 68, // F11
  123: 69, // F12
  124: 104, // F13
  125: 105, // F14
  126: 106, // F15
  127: 107, // F16
  128: 108, // F17
  129: 109, // F18
  130: 110, // F19
  131: 111, // F20
  132: 112, // F21
  133: 113, // F22
  134: 114, // F23
  135: 115, // F24
  136: 83, // NUM LOCK
  137: 71, // Scroll Lock
  144: 83, // NUM LOCK
  186: 51, // ;
  187: 46, // =
  188: 54, // ,
  189: 45, // -
  190: 55, // 。
  191: 56, // /
  192: 52, // ''
  210: 87, // +
  219: 47, // [
  220: 49, // \
  221: 48, // ]
  222: 52, // ''

  500: 229, // r-shift
  501: 228, // r-ctrl
  502: 230, // r-alt
  503: 231, // r-win
};

const changeIcon = computed(() => {
  return isStart.value ? stopIcon : startIcon;
});

onMounted(() => {
  calcPosition();
  // getKeysByValue('75');
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
    // internalMacroData.value = data;
  },
  { immediate: true, deep: true },
);

const calcPosition = () => {
  positions.value = internalMacroData.value.map((_, index) => index * scaleValue(65)) || [];
  savePositionInfo.value = internalMacroData.value.map((_, index) => index * scaleValue(65)) || [];
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
        keyType: 'delay',
        key: '',
        status: '',
        createTime: Date.now(),
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
    keyCode: keyValueDictionary[keyCode],
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
    keyCode: keyValueDictionary[keyCode],
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
  selectedCreateTime.value = item.createTime;
};

const onMouseEnter = (idx) => {
  isAct.value = idx;
};
const onMouseLeave = (idx) => {
  isAct.value = null;
};

const startDrag = (event, index, time) => {
  draggingIndex.value = index;
  selectedCreateTime.value = time;
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

  // 获取拖动元素的中心位置
  const dragItemCenter = positions.value[draggingIndex.value] + scaleValue(25); // 假设元素高度为50px，取中心点

  // 向上交换检测：检查是否应该与上一个元素交换位置
  if (draggingIndex.value > 0) {
    // 获取上一个元素的位置
    const prevItemTop = savePositionInfo.value[draggingIndex.value - 1];
    const prevItemCenter = prevItemTop + scaleValue(25);

    // 使用更小的阈值，让交换更早触发
    // 当拖动项的顶部接近上一项的1/3处时触发交换
    const swapThreshold = scaleValue(15); // 可调整此值改变灵敏度

    if (positions.value[draggingIndex.value] < prevItemTop + swapThreshold) {
      // 保存当前拖动元素的视觉位置
      const currentVisualPosition = positions.value[draggingIndex.value];
      // 数据交换
      [internalMacroData.value[draggingIndex.value], internalMacroData.value[draggingIndex.value - 1]] = [
        internalMacroData.value[draggingIndex.value - 1],
        internalMacroData.value[draggingIndex.value],
      ];

      // 重置所有元素的正确位置
      savePositionInfo.value = internalMacroData.value.map((_, index) => index * scaleValue(65));

      // 使用Vue的过渡系统，保持动画效果
      // 对于被交换的元素，设置新的目标位置，Vue 的transition会处理过渡动画
      for (let i = 0; i < positions.value.length; i++) {
        if (i !== draggingIndex.value && i !== draggingIndex.value - 1) {
          // 其他元素保持在其应有位置
          positions.value[i] = savePositionInfo.value[i];
        }
      }

      // 交换的上一个元素移到拖动元素原来的正确位置
      // positions.value[draggingIndex.value - 1] = savePositionInfo.value[draggingIndex.value];
      positions.value[draggingIndex.value] = savePositionInfo.value[draggingIndex.value];

      // 拖动元素保持在当前视觉位置，继续跟随鼠标
      // positions.value[draggingIndex.value] = positions.value[draggingIndex.value - 1];
      positions.value[draggingIndex.value - 1] = currentVisualPosition;

      // 更新拖动索引
      draggingIndex.value = draggingIndex.value - 1;

      // 调整起始点，保持拖动流畅
      startY = event.clientY;
    }
  }

  // 向下交换检测：检查是否应该与下一个元素交换位置
  if (draggingIndex.value < internalMacroData.value.length - 1) {
    // 获取下一个元素的位置
    const nextItemTop = savePositionInfo.value[draggingIndex.value + 1];
    const nextItemCenter = nextItemTop + scaleValue(25);

    // 使用更小的阈值，让交换更早触发
    // 当拖动项的底部接近下一项的2/3处时触发交换
    const swapThreshold = scaleValue(35); // 可调整此值改变灵敏度

    if (positions.value[draggingIndex.value] + scaleValue(50) > nextItemTop + swapThreshold) {
      // 保存当前拖动元素的视觉位置
      const currentVisualPosition = positions.value[draggingIndex.value];

      // 数据交换
      [internalMacroData.value[draggingIndex.value], internalMacroData.value[draggingIndex.value + 1]] = [
        internalMacroData.value[draggingIndex.value + 1],
        internalMacroData.value[draggingIndex.value],
      ];

      // 更新所有元素的"正确"位置
      savePositionInfo.value = internalMacroData.value.map((_, index) => index * scaleValue(65));

      // 使用Vue的过渡系统，保持动画效果
      // 对于被交换的元素，设置新的目标位置，Vue 的transition会处理过渡动画
      for (let i = 0; i < positions.value.length; i++) {
        if (i !== draggingIndex.value && i !== draggingIndex.value + 1) {
          // 其他元素保持在其应有位置
          positions.value[i] = savePositionInfo.value[i];
        }
      }

      // 交换的下一个元素移到拖动元素原来的正确位置
      // positions.value[draggingIndex.value + 1] = savePositionInfo.value[draggingIndex.value];
      positions.value[draggingIndex.value] = savePositionInfo.value[draggingIndex.value];

      // 拖动元素保持在当前视觉位置，继续跟随鼠标
      // 这里是关键：我们不更新拖动元素的位置，而是更新索引
      // positions.value[draggingIndex.value] = currentVisualPosition;
      positions.value[draggingIndex.value + 1] = currentVisualPosition;

      // 更新拖动索引
      draggingIndex.value = draggingIndex.value + 1;

      // 调整起始点，保持拖动流畅
      startY = event.clientY;
    }
  }
};

const endDrag = () => {
  if (draggingIndex.value === null) return;

  // 标记结束拖动，添加一个变量跟踪拖动结束状态
  const draggedIndex = draggingIndex.value;
  draggingIndex.value = null;

  // 计算最终应该放置的位置
  const finalPositions = internalMacroData.value.map((_, index) => index * scaleValue(65));

  // 允许过渡动画生效的延迟
  setTimeout(() => {
    // 设置元素最终位置
    positions.value = finalPositions;
    savePositionInfo.value = [...finalPositions];
  }, 10); // 小延迟确保状态更新先发生

  // 重置状态
  document.body.style.cursor = 'default'; // 恢复默认光标

  // 移除事件监听器
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);

  // 通知父组件更新数据
  emit('updateMacro', [...internalMacroData.value]);
};

const updateMacroItemKey = (newKey) => {
  // 确保有选中的项和数据
  if (selectedItemIndex.value === null || !macroDataItem.value) return;

  // 更新本地数据
  macroDataItem.value.key = getKeysByValue(newKey);
  macroDataItem.value.keyCode = newKey;

  // 更新内部数组中的项
  if (internalMacroData.value[selectedItemIndex.value]) {
    internalMacroData.value[selectedItemIndex.value].key = getKeysByValue(newKey);
    internalMacroData.value[selectedItemIndex.value].keyCode = newKey;

    // 创建新的引用以确保触发响应式更新
    internalMacroData.value = [...internalMacroData.value];

    // 通知父组件
    emit('updateMacro', internalMacroData.value);
  }
};

const getKeysByValue = (targetValue) => {
  return Object.keys(keyValueDictionary).filter((key) => keyValueDictionary[key] === targetValue);
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
  width: var(--size-960);
  height: var(--macro-height);
  box-sizing: border-box;
  background-color: #000;
  border: var(--spacing-3) solid #202020;
  border-radius: var(--spacing-15);
  margin: 0 var(--spacing-20);
  position: relative;

  h3 {
    margin: var(--spacing-25) 0 calc(var(--spacing-35) - var(--spacing-1)) var(--spacing-30);
    line-height: 1;
    color: #fff;
    font-size: var(--font-size-16);
    font-family: 'CN Heavy';
  }

  .container {
    height: var(--size-510);
    box-sizing: border-box;
    padding-right: var(--spacing-5);
    position: relative;
    overflow-y: scroll;
    .height-placeholder {
      width: 100%;
      min-height: var(--spacing-65);
      position: static; /* 不使用绝对定位 */
      pointer-events: none; /* 不阻挡点击事件 */
    }

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

    .item {
      width: var(--macro-edit-page-width);
      height: var(--size-50);
      display: flex;
      justify-content: center;
      align-items: center;
      transition: top 0.3s ease; /* 启用此过渡效果 */
    }

    .key,
    .delay {
      display: flex;
      box-sizing: border-box;
      border-radius: var(--spacing-30);
      border: var(--spacing-3) solid #202020;
      background-color: #000;
      cursor: pointer;

      &:hover {
        border-color: #91bc00;
      }

      &.selected-item {
        border-color: #91bc00 !important;
        box-shadow: 0 0 var(--spacing-10) rgba(145, 188, 0, 0.5);
      }

      & .handle {
        width: var(--size-54);
        height: var(--size-48);
        object-fit: fill;
        margin: calc(var(--spacing-2) * -1) 0 0 calc(var(--spacing-2) * -1);
        background-image: url('@/assets/images/header_icon.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }

      .content {
        width: calc(100% - var(--size-54));
        height: 100%;
        color: #fff;
        font-size: var(--font-size-20);
        font-family: 'CN Heavy';
        display: flex;
        align-items: center;
        justify-content: center;

        & img {
          width: var(--size-16);
          height: var(--size-16);
          object-fit: fill;
        }

        .keyVal {
          width: auto;
          min-width: var(--size-30);
          height: var(--size-30);
          box-sizing: border-box;
          padding: 0 var(--spacing-2);
          border: var(--spacing-2) solid #fff;
          border-radius: var(--spacing-5);
          margin-left: var(--spacing-10);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .time-diff {
          font-size: var(--font-size-14);
          position: absolute;
          right: var(--spacing-130);
        }
        .copy-icon {
          width: var(--size-20);
          height: var(--size-20);
          position: absolute;
          right: var(--spacing-70);
        }
        .del-icon {
          width: var(--size-20);
          height: var(--size-20);
          position: absolute;
          right: var(--spacing-30);
        }
      }
    }
    .key {
      width: var(--macro-key-width);
      height: var(--size-50);
      margin-left: var(--spacing-50);
    }

    .delay {
      width: var(--macro-delay-width);
      height: var(--size-50);
      margin-left: var(--spacing-265);
    }

    /* 拖动中的元素不应用过渡 */
    .dragging {
      opacity: 0.9;
      transform: scale(1.02);
      box-shadow: 0 var(--spacing-5) var(--spacing-15) rgba(0, 0, 0, 0.3);
      transition: none !important; /* 启用此覆盖 */
    }
  }

  .button-group {
    display: flex;
    position: absolute;
    left: var(--spacing-110);
    bottom: var(--spacing-20);

    .operation-btn {
      width: var(--size-170);
      height: var(--size-40);
      margin-right: var(--spacing-20);
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;

      img {
        width: var(--size-20);
        height: var(--size-20);
        object-fit: fill;
        position: absolute;
        top: var(--spacing-10);
        left: var(--spacing-10);
      }

      span {
        font-size: var(--font-size-18);
        color: #fff;
        position: absolute;
        top: var(--spacing-6);
        left: var(--spacing-65);
      }
    }
    .is-active {
      background-image: url('/src/assets/images/save_bgc.svg');
    }
    .is-pending {
      background-image: url('/src/assets/images/pending_bg.svg');
    }
    .clear-btn:hover {
      background-image: url('/src/assets/images/pending_bg.svg');
    }
  }
}

.moveing {
  // opacity: 0;
}

/* 恢复列表过渡效果 */
.list-move {
  // transition: transform 0.3s ease;
}

.list-enter-active,
.list-leave-active {
  // transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(var(--spacing-30));
}
</style>
