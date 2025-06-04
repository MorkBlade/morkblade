<template>
  <div class="dks-box">
    <div class="left-config">
      <div class="title-box">
        <div class="title" v-for="(ite, idx) in titleData" :key="ite.name">
          <p>{{ ite.name }}</p>
          <span @click="idx == 0 || idx == 2 ? (delayPageShow1 = true) : (delayPageShow2 = true)">{{
            idx == 0 || idx == 2 ? Number(db).toFixed(2) + 'mm' : Number(db2).toFixed(2) + 'mm'
          }}</span>
        </div>
      </div>
      <div>
        <div class="dks-key">
          <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
            <p @mouseup="KeydropKey(0)">{{ keyText[0] }}</p>
            <div class="del_btn" @click="onDelKey('key1')" v-show="keyText[0] && delKeyShow[0]"></div>
          </div>
          <span
            v-for="idx in 4"
            :key="idx"
            :ref="
              (el) => {
                if (el) elements[getKey(0, idx)] = el;
              }
            "
            :class="{ 'is-drag': isDragStates[String(0)] && currentKeys[0] === getKey(0, idx) }"
            :style="{ width: `${getWidth(getKey(0, idx))}px` }"
            @click="onClick(getKey(0, idx))"
            @mousedown="onMousedown(getKey(0, idx))"
          ></span>
        </div>
        <div class="dks-key">
          <div class="key-box" @mouseenter="onMouseEn('key2')" @mouseleave="onMouseLe('key2')">
            <p @mouseup="KeydropKey(1)">{{ keyText[1] }}</p>
            <div class="del_btn" @click="onDelKey('key2')" v-show="keyText[1] && delKeyShow[1]"></div>
          </div>
          <span
            v-for="idx in 4"
            :key="idx"
            :ref="
              (el) => {
                if (el) elements[getKey(1, idx)] = el;
              }
            "
            :class="{ 'is-drag': isDragStates[String(1)] && currentKeys[1] === getKey(1, idx) }"
            :style="{ width: `${getWidth(getKey(1, idx))}px` }"
            @click="onClick(getKey(1, idx))"
            @mousedown="onMousedown(getKey(1, idx))"
          ></span>
        </div>
        <div class="dks-key">
          <div class="key-box" @mouseenter="onMouseEn('key3')" @mouseleave="onMouseLe('key3')">
            <p @mouseup="KeydropKey(2)">{{ keyText[2] }}</p>
            <div class="del_btn" @click="onDelKey('key3')" v-show="keyText[2] && delKeyShow[2]"></div>
          </div>
          <span
            v-for="idx in 4"
            :key="idx"
            :ref="
              (el) => {
                if (el) elements[getKey(2, idx)] = el;
              }
            "
            :class="{ 'is-drag': isDragStates[String(2)] && currentKeys[2] === getKey(2, idx) }"
            :style="{ width: `${getWidth(getKey(2, idx))}px` }"
            @click="onClick(getKey(2, idx))"
            @mousedown="onMousedown(getKey(2, idx))"
          ></span>
        </div>
        <div class="dks-key">
          <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
            <p @mouseup="KeydropKey(3)">{{ keyText[3] }}</p>
            <div class="del_btn" @click="onDelKey" v-show="keyText[3] && delKeyShow[3]"></div>
          </div>
          <span
            v-for="idx in 4"
            :key="idx"
            :ref="
              (el) => {
                if (el) elements[getKey(3, idx)] = el;
              }
            "
            :class="{ 'is-drag': isDragStates[String(3)] && currentKeys[3] === getKey(3, idx) }"
            :style="{ width: `${getWidth(getKey(3, idx))}px` }"
            @click="onClick(getKey(3, idx))"
            @mousedown="onMousedown(getKey(3, idx))"
          ></span>
        </div>
      </div>
      <div class="save-btn" @click="saveConfig">
        <img src="@/assets/images/sure.svg" alt="" />
        <span>应用映射</span>
      </div>
    </div>
    <characterCard @handleSendKey="handleDksKey" />
  </div>
  <dksDelay
    v-model:delayPageShow="delayPageShow1"
    :delay="dksInfo.db"
    title="抬起行程"
    @changeDelay="changeDksDelay1"
  />
  <dksDelay
    v-model:delayPageShow="delayPageShow2"
    :delay="dksInfo.db2"
    title="触底行程"
    @changeDelay="changeDksDelay2"
  />
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { useKeyboardStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';
import { scaleValue } from '@/utils/responsive';
import { filterSocdAndRsKey } from '@/utils/filter-key.js';

import mDialog from '@/components/dialog.vue';
import dksDelay from './components/delay.vue';

const dksInfo = defineModel('dksInfo', {
  type: Object,
  default: () => ({ dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.5, db2: 3.0 }),
});

const { setDKS } = useAdvancedHook();
const keyboardStore = useKeyboardStore();

const { maxTouchTravel, minTouchTravel, precision, edit, editKey, isExternalUpdate } = defineProps({
  maxTouchTravel: { type: Number, default: 10 },
  minTouchTravel: { type: Number, default: 0 },
  precision: { type: Number, default: 0 },
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
  isExternalUpdate: { type: Boolean, default: false },
});
const emits = defineEmits(['handleKeyTypeChange', 'handleDialoConfirm']);

const isShow = ref(false);
const delayPageShow1 = ref(false);
const delayPageShow2 = ref(false);
const isDragStates = reactive({
  0: false,
  1: false,
  2: false,
  3: false,
});
const elements = ref([]); // 创建一个空数组用于存储 refs
const dragOffset = reactive({ x: 0, y: 0 });
const lastMouseX = ref(0); // 记录上一次的鼠标 X 坐标
const widths = reactive({}); // 存储每个 span 的宽度
const currentKeys = reactive({
  0: null,
  1: null,
  2: null,
  3: null,
});
const delKeyShow = reactive([false, false, false, false]);
// 添加一个变量来记录鼠标按下的时间
const mouseDownTime = ref(0);
let ignoreClick = false; // 标志位，用于忽略拖拽结束后的点击事件
const previousWidths = reactive({}); // 存储点击前的宽度值
// 添加一个变量来跟踪当前操作的行
const activeRow = ref(null);
// 添加一个标志位来区分更新来源
const recoverDkSData = ref(false);
const clickData = reactive([
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
]);
const titleData = [
  { name: '按键起点', val: '1.50' },
  { name: '按下触底', val: '3.00' },
  { name: '触底抬起', val: '3.00' },
  { name: '完全抬起', val: '1.50' },
];

// 获取CSS变量
// const getDksKeyWidth = (num) => {
//   return parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--dks-key-width${num}`));
// };

// 根据不同位置设置最大宽度限制
const maxWidths = {
  1: scaleValue(185), // 第一个span最大宽度 (132 - 78)
  2: scaleValue(130), // 第二个span最大宽度 (185 - 132)
  3: scaleValue(80), // 第三个span最大宽度 (240 - 185)
  4: scaleValue(20), // 最后一个span最大宽度
};

// 添加宽度映射配置
const widthAdjustments = {
  // 1: [
  //   { threshold: scaleValue(60), width: scaleValue(20) },
  //   { threshold: scaleValue(110), width: scaleValue(80) },
  //   { threshold: scaleValue(165), width: scaleValue(130) },
  //   { threshold: Infinity, width: scaleValue(185) },
  // ],
  1: [
    { threshold: scaleValue(35), width: scaleValue(20) },
    { threshold: scaleValue(65), width: scaleValue(40) },
    { threshold: scaleValue(85), width: scaleValue(75) },
    { threshold: scaleValue(95), width: scaleValue(75) },
    { threshold: scaleValue(120), width: scaleValue(95) },
    { threshold: scaleValue(150), width: scaleValue(130) },
    { threshold: scaleValue(160), width: scaleValue(150) },
    // { threshold: scaleValue(185), width: scaleValue(165) },
    { threshold: Infinity, width: scaleValue(185) },
  ],
  2: [
    { threshold: scaleValue(35), width: scaleValue(20) },
    { threshold: scaleValue(65), width: scaleValue(40) },
    { threshold: scaleValue(85), width: scaleValue(75) },
    { threshold: scaleValue(95), width: scaleValue(75) },
    { threshold: scaleValue(120), width: scaleValue(95) },
    { threshold: scaleValue(150), width: scaleValue(130) },
    { threshold: scaleValue(160), width: scaleValue(150) },
    { threshold: Infinity, width: scaleValue(130) },
  ],
  3: [
    { threshold: scaleValue(35), width: scaleValue(20) },
    { threshold: scaleValue(65), width: scaleValue(40) },
    { threshold: Infinity, width: scaleValue(80) },
  ],
};

// 添加点击数据映射配置
const clickDataMapping = {
  1: {
    [scaleValue(20)]: [[0]],
    [scaleValue(40)]: [[0, 1]],
    [scaleValue(75)]: [[0, 1, 2]],
    [scaleValue(95)]: [[0, 1, 2, 3]],
    [scaleValue(130)]: [[0, 1, 2, 3, 4]],
    [scaleValue(150)]: [[0, 1, 2, 3, 4, 5]],
    [scaleValue(185)]: [[0, 1, 2, 3, 4, 5, 6]],
  },
  2: {
    [scaleValue(20)]: [[2]],
    [scaleValue(40)]: [[2, 3]],
    [scaleValue(75)]: [[2, 3, 4]],
    [scaleValue(95)]: [[2, 3, 4, 5]],
    [scaleValue(130)]: [[2, 3, 4, 5, 6]],
  },
  3: {
    [scaleValue(20)]: [[4]],
    [scaleValue(40)]: [[4, 5]],
    [scaleValue(80)]: [[4, 5, 6]],
  },
  4: {
    [scaleValue(20)]: [[6]],
  },
};

// 1 31 63 127 255
onMounted(async () => {
  recoverDkSData.value = true;
  for (let i = 0; i < 4; i++) {
    clickData[i] = parse8BitToBooleans(dksInfo.value.trps[i]);
  }
  updateUIFromTrps();
  recoverDkSData.value = false;
});

const db = computed(() => dksInfo.value.db);
const db2 = computed(() => dksInfo.value.db2);

const keyText = computed(() => {
  return [
    keyboard[dksInfo.value.dks[0]] || '',
    keyboard[dksInfo.value.dks[1]] || '',
    keyboard[dksInfo.value.dks[2]] || '',
    keyboard[dksInfo.value.dks[3]] || '',
  ];
});

// 计算当前选择的高级键
const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

watch(
  () => isExternalUpdate,
  (newVal) => {
    if (newVal) {
      recoverDkSData.value = true;
      for (let i = 0; i < 4; i++) {
        clickData[i] = parse8BitToBooleans(dksInfo.value.trps[i]);
      }
      updateUIFromTrps();
    }
  },
);

watch(clickData, () => {
  let buf = 0;
  for (let i = 0; i < 4; i++) {
    buf = 0;
    if (clickData[i][0] === true) {
      buf |= 1 << 0;
    }
    if (clickData[i][1] === true) {
      buf |= 1 << 1;
    }
    if (clickData[i][2] === true) {
      buf |= 1 << 2;
    }
    if (clickData[i][3] === true) {
      buf |= 1 << 3;
      buf |= 1 << 4;
    }
    if (clickData[i][4] === true) {
      buf |= 1 << 5;
    }
    if (clickData[i][5] === true) {
      buf |= 1 << 6;
    }
    if (clickData[i][6] === true) {
      buf |= 1 << 7;
    }
    dksInfo.value.trps[i] = buf;
  }
  // console.log('watch clickData: ', dksInfo.value.trps);
});

const updateUIFromTrps = () => {
  if (!recoverDkSData.value) return;
  // 重置宽度
  Object.keys(widths).forEach((key) => {
    widths[key] = 20;
  });
  // console.log('updateUIFromTrpsupdateUIFromTrpsupdateUIFromTrps');
  for (let row = 0; row < 4; row++) {
    // Reset current row state
    isDragStates[row] = false;
    currentKeys[row] = null;

    // Skip if trps is 0
    if (dksInfo.value.trps[row] === 0) continue;

    // Analyze which bits are set to determine which span and what width
    const rowData = clickData[row];

    // Determine which span to highlight and what width to set
    let targetSpan = null;
    let targetWidth = scaleValue(20);

    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxx', rowData, rowData[0]);
    if (rowData[0]) {
      // First bit set - could be span 1 with various widths
      if (rowData[6]) {
        // Bits 0,1,2,3,4,5 set - span 1 with max width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(185);
      } else if (rowData[5]) {
        // Bits 0,1,2,3,4 set - span 1 with large width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(150);
      } else if (rowData[4]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(130);
      } else if (rowData[3]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(95);
      } else if (rowData[2]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(75);
      } else if (rowData[1]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(40);
      } else {
        // Only bit 0 set - span 1 with min width
        targetSpan = getKey(row, 1);
        targetWidth = scaleValue(20);
      }
    } else if (rowData[2]) {
      // Second bit set - span 2 with various widths
      if (rowData[6]) {
        // Bits 0,1,2,3,4,5 set - span 1 with max width
        targetSpan = getKey(row, 2);
        targetWidth = scaleValue(130);
      } else if (rowData[5]) {
        // Bits 0,1,2,3,4 set - span 1 with large width
        targetSpan = getKey(row, 2);
        targetWidth = scaleValue(95);
      } else if (rowData[4]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 2);
        targetWidth = scaleValue(75);
      } else if (rowData[3]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 2);
        targetWidth = scaleValue(40);
      } else if (rowData[2]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 2);
        targetWidth = scaleValue(20);
      }
    } else if (rowData[4]) {
      // Fourth bit set - span 3 with various widths
      if (rowData[6]) {
        // Bits 0,1,2,3,4,5 set - span 1 with max width
        targetSpan = getKey(row, 3);
        targetWidth = scaleValue(80);
      } else if (rowData[5]) {
        // Bits 0,1,2,3,4 set - span 1 with large width
        targetSpan = getKey(row, 3);
        targetWidth = scaleValue(65);
      } else if (rowData[4]) {
        // Bits 0,1,2,3 set - span 1 with medium width
        targetSpan = getKey(row, 3);
        targetWidth = scaleValue(20);
      }
    } else if (rowData[6]) {
      // Bits 0,1,2,3,4,5 set - span 1 with max width
      targetSpan = getKey(row, 4);
      targetWidth = scaleValue(20);
    }

    // Apply changes if a target span was identified
    if (targetSpan) {
      isDragStates[row] = true;
      currentKeys[row] = targetSpan;
      widths[targetSpan] = targetWidth;
      previousWidths[targetSpan] = targetWidth;
    }
  }
};

const onMouseEn = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (dksInfo.value.dks[0]) delKeyShow[0] = true;
      break;
    case 'key2':
      if (dksInfo.value.dks[1]) delKeyShow[1] = true;
      break;
    case 'key3':
      if (dksInfo.value.dks[2]) delKeyShow[2] = true;
      break;
    default:
      if (dksInfo.value.dks[3]) delKeyShow[3] = true;
      break;
  }
};

const onMouseLe = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      delKeyShow[0] = false;
      break;
    case 'key2':
      delKeyShow[1] = false;
      break;
    case 'key3':
      delKeyShow[2] = false;
      break;
    default:
      delKeyShow[3] = false;
      break;
  }
};

const onDelKey = (keyCode) => {
  switch (keyCode) {
    case 'key1':
      if (dksInfo.value.dks[0]) {
        dksInfo.value.dks[0] = 0;
        dksInfo.value.trps[0] = 0;
        delKeyShow[0] = false;
      }
      break;
    case 'key2':
      if (dksInfo.value.dks[1]) {
        dksInfo.value.dks[1] = 0;
        dksInfo.value.trps[1] = 0;
        delKeyShow[1] = false;
      }
      break;
    case 'key3':
      if (dksInfo.value.dks[2]) {
        dksInfo.value.dks[2] = 0;
        dksInfo.value.trps[2] = 0;
        delKeyShow[2] = false;
      }
      break;
    default:
      if (dksInfo.value.dks[3]) {
        dksInfo.value.dks[3] = 0;
        dksInfo.value.trps[3] = 0;
        delKeyShow[3] = false;
      }
      break;
  }
};

const getKey = (containerIdx, itemIdx) => {
  return `${containerIdx}-${itemIdx}`;
};

const getWidth = (key) => {
  if (!(key in widths)) {
    widths[key] = scaleValue(20); // 初始化宽度
  }
  return widths[key];
};

const onClick = (key) => {
  if (ignoreClick) {
    setTimeout(() => {
      ignoreClick = false; // 在短暂延迟后重置标志位
    }, 300);
    return;
  }
  // if (!isDrag.value) {
  //   //   // 第一次点击，保存当前宽度并设置为20
  //   //   previousWidths[key] = widths[key];
  //   //   widths[key] = 20;
  //   // } else {
  //   //   // 再次点击，如果有之前保存的宽度则还原
  //   if (key in previousWidths) {
  //     widths[key] = previousWidths[key];
  //   }
  // } else {
  //   previousWidths[key] = widths[key];
  //   widths[key] = 20;
  // }
  const [row, col] = key.split('-').map(Number);
  const keyRow = String(row);
  const curRow = currentKeys[keyRow];

  if (curRow !== key) {
    // 点击同一行的不同 span
    if (curRow) {
      // widths[curRow] = previousWidths[curRow] || 20;
      widths[curRow] = scaleValue(20);
    }
    previousWidths[key] = widths[key];
    widths[key] = scaleValue(20);
    isDragStates[keyRow] = true;
    currentKeys[keyRow] = key;

    // 使用整行赋值的方式更新 clickData
    const newRowData = [false, false, false, false, false, false, false];
    const mapping = clickDataMapping[col]?.[widths[key]];
    if (mapping) {
      mapping.forEach((indices) => {
        indices.forEach((index) => {
          newRowData[index] = true;
        });
      });
    }
    clickData[row] = [...newRowData]; // 使用展开运算符创建新数组
  } else {
    // 点击当前选中的 span
    isDragStates[keyRow] = !isDragStates[keyRow];
    if (!isDragStates[keyRow]) {
      // widths[key] = previousWidths[key] || 20;
      widths[key] = scaleValue(20);
      currentKeys[keyRow] = null;

      // 同样使用整行赋值的方式更新
      const newRowData = [false, false, false, false, false, false, false];
      const mapping = clickDataMapping[col]?.[scaleValue(20)];
      if (mapping) {
        mapping.forEach((indices) => {
          indices.forEach((index) => {
            newRowData[index] = true;
          });
        });
      }
      clickData[row] = [...newRowData];
    }
  }
  // console.log('onClick log widths[key]:>>>>>>>>>>', widths[key]);
};

const onMousedown = (key) => {
  const keyRow = String(key).split('-')[0];
  mouseDownTime.value = Date.now();
  ignoreClick = false; // 重置标志位
  activeRow.value = keyRow; // 保存当前操作的行
  const rect = elements.value[key].getBoundingClientRect();
  dragOffset.x = event.clientX - rect.left;
  dragOffset.y = event.clientY - rect.top;
  lastMouseX.value = event.clientX; // 初始化上一次的鼠标 X 坐标

  // 添加一个临时的 mousemove 监听器来检测是否开始拖动
  const tempMouseMove = (event) => {
    // 如果鼠标移动且按下时间超过 200ms，则认为是拖拽操作
    if (Date.now() - mouseDownTime.value > 100) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', tempMouseMove);

      elements.value[key].classList.add('grabbing');
    }
  };

  document.addEventListener('mousemove', tempMouseMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', tempMouseMove);
  });
};

const onMouseMove = (event) => {
  if (!activeRow.value || !isDragStates[activeRow.value] || !currentKeys[activeRow.value]) return;

  ignoreClick = true; // 重置标志位
  const deltaX = event.clientX - lastMouseX.value; // 计算鼠标移动的距离

  if (deltaX !== 0) {
    const currentKey = currentKeys[activeRow.value];
    // widths[currentKey] += deltaX > 0 ? 3 : -3;
    widths[currentKey] += deltaX; // 根据鼠标移动的实际距离调整宽度

    // 获取当前span的索引
    const currentIndex = parseInt(currentKey.split('-')[1]);

    // 设置最小宽度限制
    widths[currentKey] = Math.max(20, widths[currentKey]);

    widths[currentKey] = Math.min(maxWidths[currentIndex], widths[currentKey]);
    previousWidths[currentKey] = widths[currentKey];
    // console.log('Width:', widths[currentKey]);
  }
  lastMouseX.value = event.clientX; // 更新上一次的鼠标 X 坐标
};

const stopDrag = () => {
  if (!activeRow.value || !isDragStates[activeRow.value] || !currentKeys[activeRow.value]) return;

  const currentKey = currentKeys[activeRow.value];
  const [row, col] = currentKey.split('-').map(Number);

  // 调整宽度
  if (col < 4) {
    const adjustments = widthAdjustments[col];
    const adjustment = adjustments.find((adj) => widths[currentKey] < adj.threshold);
    widths[currentKey] = adjustment ? adjustment.width : 20;
  }

  // 重置当前行的所有点击状态
  clickData[row] = [false, false, false, false, false, false, false];

  // 更新点击数据
  const mapping = clickDataMapping[col]?.[widths[currentKey]];
  if (mapping) {
    mapping.forEach((indices) => {
      indices.forEach((index) => {
        clickData[row][index] = true;
      });
    });
  }
  console.log('stop drag: ', clickData[0], mapping, widths[currentKey]);

  elements.value[currentKey].classList.remove('grabbing');
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', stopDrag);
};

const saveConfig = () => {
  if (activeKeys.value.length === 0) {
    showMessage('请先选择需要修改的按键', 'warning');
    return;
  }
  isShow.value = true;
};

const onSure = () => {
  isShow.value = false;
  emits('handleDialoConfirm');
  emits('handleKeyTypeChange', 'DKS');
};
const onCancel = () => {
  isShow.value = false;
};

const changeDksDelay1 = (delay) => {
  dksInfo.value.db = delay;
};
const changeDksDelay2 = (delay) => {
  dksInfo.value.db2 = delay;
};

const handleDksKey = (keyVal) => {
  // const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  // if (unBinding) {
  //   showMessage('该键已绑定高级键，请重新选择', 'warning');
  //   return;
  // }
  if (!dksInfo.value.dks[0]) {
    dksInfo.value.dks[0] = keyVal;
  } else if (!dksInfo.value.dks[1]) {
    dksInfo.value.dks[1] = keyVal;
  } else if (!dksInfo.value.dks[2]) {
    dksInfo.value.dks[2] = keyVal;
  } else if (!dksInfo.value.dks[3]) {
    dksInfo.value.dks[3] = keyVal;
  }
};

const parse8BitToBooleans = (num) => {
  // 确保输入是一个8位的数字
  if (num < 0 || num > 255) {
    throw new Error('Input must be an 8-bit number.');
  }

  // 创建一个长度为7的数组来存储结果
  const result = [false, false, false, false, false, false, false];
  const bits = new Array(8);

  for (let i = 0; i < 8; i++) {
    // eslint-disable-next-line no-bitwise
    bits[i] = !!(num & (1 << i));
  }
  // eslint-disable-next-line prefer-destructuring
  result[0] = bits[0];
  // eslint-disable-next-line prefer-destructuring
  result[1] = bits[1];
  // eslint-disable-next-line prefer-destructuring
  result[2] = bits[2];
  result[3] = bits[3] && bits[4];
  // eslint-disable-next-line prefer-destructuring
  result[4] = bits[5];
  // eslint-disable-next-line prefer-destructuring
  result[5] = bits[6];
  // eslint-disable-next-line prefer-destructuring
  result[6] = bits[7];

  return result;
};

const KeydropKey = (idx) => {
  // const keyVal = keyboardStore.selectKey.keyCode;
  // const unBinding = filterSocdAndRsKey(keyboardStore.keyboards, keyVal);
  // if (unBinding) {
  //   showMessage('该键已绑定高级键，请重新选择', 'warning');
  //   return;
  // }
  dksInfo.value.dks[idx] = keyboardStore.selectKey.keyCode;
};

const save = async () => {
  let key = 0;
  let row = 0;
  let col = 0;
  if (edit) {
    key = editKey;
  } else {
    // 获取当前键盘的keycode
    const location = keyboardStore.activeKeys[0].split('-');
    const [rowIndex, colIndex] = location;
    const { keyValue } = keyboardStore.keyboards[rowIndex][colIndex];
    key = keyValue;
    row = +rowIndex;
    col = +colIndex;
  }
  // console.log('dks save log info: ', dksInfo.value);
  const res = await setDKS({ key, row, col, ...dksInfo.value });
  reset();
  return res;
};

const reset = () => {
  // 重置DKS组件状态
  dksInfo.value.dks = [0, 0, 0, 0];
  dksInfo.value.trps = [0, 0, 0, 0];
  dksInfo.value.db = 1.5;
  dksInfo.value.db2 = 3.0;

  // 重置拖拽和点击状态
  for (let i = 0; i < 4; i++) {
    isDragStates[i] = false;
    currentKeys[i] = null;
    delKeyShow[i] = false;
    clickData[i] = [false, false, false, false, false, false, false];
  }

  // 重置宽度
  Object.keys(widths).forEach((key) => {
    widths[key] = 20;
  });
};
defineExpose({ save, reset });
</script>

<style scoped lang="scss">
.dks-box {
  display: flex;

  .left-config {
    width: var(--assignment-leftbox-width);
    height: var(--size-290);
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .title-box {
      display: flex;
      margin-left: var(--spacing-65);
      font-size: var(--font-size-11);
      font-family: 'CN Heavy';
      color: #ccc;
      text-align: center;

      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: var(--spacing-20) var(--spacing-10) 0 0;
        text-decoration: underline;
        cursor: pointer;
        p {
          color: #fff;
        }
        span {
          font-size: var(--font-size-8);
        }
      }
    }

    .dks-key {
      display: flex;
      align-items: center;
      position: relative;

      .key-box {
        position: relative;
        box-sizing: border-box;
        padding: 0 var(--spacing-20) var(--spacing-5) var(--spacing-20);
        // margin-left: 20px;
      }

      .del_btn {
        height: var(--size-40);
        width: var(--size-40);
        position: absolute;
        left: var(--spacing-20);
        top: 0;
        background-image: url('@/assets/images/del_key.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: pointer;
        transition: all 0.1s;
      }

      p {
        width: var(--size-40);
        height: var(--size-40);
        color: #fff;
        font-size: var(--font-size-12);
        font-family: 'Arial Bold';
        // margin: 0 20px 5px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        background-image: url('@/assets/images/small_key.svg');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        cursor: pointer;

        &:hover {
          background-image: url('@/assets/images/small_key_checked.svg');
        }
      }

      span {
        // width: var(--size-20);
        height: var(--dks-key-height);
        margin-right: var(--spacing-35);
        // display: inline-block;
        position: absolute;
        background-image: url('@/assets/images/add.svg');
        background-size: cover;
        background-repeat: no-repeat;
        // background-position: center;
        cursor: pointer;
        &:nth-child(2) {
          left: var(--dks-key-left1);
          z-index: 4;
        }
        &:nth-child(3) {
          left: var(--dks-key-left2);
          z-index: 3;
        }
        &:nth-child(4) {
          left: var(--dks-key-left3);
          z-index: 2;
        }
        &:last-child {
          left: var(--dks-key-left4);
        }
      }

      .is-drag {
        background-image: none;
        background-color: rgb(145, 188, 0);
        border-radius: var(--spacing-10);
        cursor: grab;

        &.grabbing {
          cursor: grabbing; // 拖动时的状态
        }
      }
    }

    .save-btn {
      width: var(--size-170);
      height: var(--size-40);
      margin-top: var(--spacing-5);
      margin-left: var(--spacing-65);
      font-family: 'CN Heavy';
      background-image: url('/src/assets/images/save_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      cursor: pointer;
      &:hover {
        background-image: url('/src/assets/images/save_bgc.svg');
      }

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
  }
}
</style>
