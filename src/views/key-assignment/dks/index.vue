<template>
  <div class="dks-box">
    <div class="left-config">
      <div class="title-box">
        <div class="title" v-for="(ite, idx) in titleData" :key="ite.name">
          <p>{{ ite.name }}</p>
          <span>{{ idx == 0 || idx == 2 ? Number(db).toFixed(2) + 'mm' : Number(db2).toFixed(2) + 'mm' }}</span>
        </div>
      </div>
      <div>
        <div class="dks-key">
          <div class="key-box" @mouseenter="onMouseEn('key1')" @mouseleave="onMouseLe('key1')">
            <p>{{ keyText[0] }}</p>
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
            <p>{{ keyText[1] }}</p>
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
            <p>{{ keyText[2] }}</p>
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
            <p>{{ keyText[3] }}</p>
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
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { useHighLevelKeyStore, useKeyboardStore } from '@/stores';

import mDialog from '@/components/dialog.vue';

const dksInfo = defineModel('dksInfo', {
  type: Object,
  default: () => ({ dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.5, db2: 3.0 }),
});

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHighLevelKeyStore();

const { maxTouchTravel, minTouchTravel, precision, edit, editKey } = defineProps({
  maxTouchTravel: { type: Number, default: 10 },
  minTouchTravel: { type: Number, default: 0 },
  precision: { type: Number, default: 0 },
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});
const emits = defineEmits(['handleKeyTypeChange', 'handleDialoConfirm']);

const isShow = ref(false);
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

// 根据不同位置设置最大宽度限制
const maxWidths = {
  1: 185, // 第一个span最大宽度 (132 - 78)
  2: 130, // 第二个span最大宽度 (185 - 132)
  3: 80, // 第三个span最大宽度 (240 - 185)
  4: 20, // 最后一个span最大宽度
};

// 添加宽度映射配置
const widthAdjustments = {
  1: [
    { threshold: 60, width: 20 },
    { threshold: 110, width: 80 },
    { threshold: 165, width: 130 },
    { threshold: Infinity, width: 185 },
  ],
  2: [
    { threshold: 60, width: 20 },
    { threshold: 110, width: 80 },
    { threshold: Infinity, width: 130 },
  ],
  3: [
    { threshold: 60, width: 20 },
    { threshold: Infinity, width: 80 },
  ],
};

// 添加点击数据映射配置
const clickDataMapping = {
  1: {
    20: [[0]],
    80: [[0, 1, 2, 3]],
    130: [[0, 1, 2, 3, 4]],
    185: [[0, 1, 2, 3, 4, 5]],
  },
  2: {
    20: [[1]],
    80: [[1, 2, 3]],
    130: [[1, 2, 3, 4, 5]],
  },
  3: {
    20: [[3]],
    80: [[3, 4, 5]],
  },
  4: {
    20: [[5]],
  },
};

// 1 31 63 127 255
onMounted(async () => {
  for (let i = 0; i < 4; i++) {
    clickData[i] = parse8BitToBooleans(dksInfo.value.trps[i]);
  }
  // console.log('onMounted log', clickData);
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
});

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
        delKeyShow[0] = false;
      }
      break;
    case 'key2':
      if (dksInfo.value.dks[1]) {
        dksInfo.value.dks[1] = 0;
        delKeyShow[1] = false;
      }
      break;
    case 'key3':
      if (dksInfo.value.dks[2]) {
        dksInfo.value.dks[2] = 0;
        delKeyShow[2] = false;
      }
      break;
    default:
      if (dksInfo.value.dks[3]) {
        dksInfo.value.dks[3] = 0;
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
    widths[key] = 20; // 初始化宽度
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
      widths[curRow] = 20;
    }
    previousWidths[key] = widths[key];
    widths[key] = 20;
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
      widths[key] = 20;
      currentKeys[keyRow] = null;

      // 同样使用整行赋值的方式更新
      const newRowData = [false, false, false, false, false, false, false];
      const mapping = clickDataMapping[col]?.[20];
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
  console.log('onClick log widths[key]:>>>>>>>>>>', widths[key]);
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
    if (Date.now() - mouseDownTime.value > 200) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', tempMouseMove);
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
    widths[currentKey] += deltaX > 0 ? 3 : -3;

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

  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', stopDrag);
};

const saveConfig = () => {
  if (activeKeys.value.length === 0) return;
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

const handleDksKey = (keyVal) => {
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
  const bits = [0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 7; i++) {
    bits[i] = !!(num & (1 << i));
  }

  if (Number(bits[0]) === 1) {
    result[0] = true;
  }

  if (Number(bits[1]) === 1) {
    result[1] = true;
  }

  if (Number(bits[2]) === 1) {
    result[2] = true;
  }

  if (Number(bits[3]) === 1 && Number(bits[4]) === 1) {
    result[3] = true;
  }

  if (Number(bits[5]) === 1) {
    result[4] = true;
  }

  if (Number(bits[6]) === 1) {
    result[5] = true;
  }

  if (Number(bits[7]) === 1) {
    result[6] = true;
  }
  return result;
};

const save = () => {
  let key = 0;
  if (edit) {
    key = editKey;
  } else {
    // 获取当前键盘的keycode
    const location = keyboardStore.activeKeys[0].split('-');
    const [x, y] = location;
    const { value } = keyboardStore.currentLayoutData[y][x];
    key = value;
  }
  highLevelKeyStore.setDks({ ...dksInfo.value, key });
};
defineExpose({ save });
</script>

<style scoped lang="scss">
.dks-box {
  display: flex;

  .left-config {
    width: 300px;
    height: 290px;
    background-image: url('@/assets/images/click_hold_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;

    .title-box {
      display: flex;
      margin-left: 65px;
      font-size: 11px;
      font-family: 'CN Heavy';
      color: #ccc;
      text-align: center;

      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 20px 10px 0 0;
        p {
          color: #fff;
        }
        span {
          font-size: 8px;
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
        padding: 0 20px 5px 20px;
        // margin-left: 20px;
      }

      .del_btn {
        height: 40px;
        width: 40px;
        position: absolute;
        left: 20px;
        top: 0;
        background-image: url('@/assets/images/del_key.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: pointer;
        transition: all 0.1s;
      }

      p {
        width: 40px;
        height: 40px;
        color: #fff;
        font-size: 12px;
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
        width: 20px;
        height: 20px;
        margin-right: 35px;
        // display: inline-block;
        position: absolute;
        background-image: url('@/assets/images/add.svg');
        background-size: cover;
        background-repeat: no-repeat;
        // background-position: center;
        cursor: pointer;
        &:nth-child(2) {
          left: 78px;
          z-index: 4;
        }
        &:nth-child(3) {
          left: 132px;
          z-index: 3;
        }
        &:nth-child(4) {
          left: 185px;
          z-index: 2;
        }
        &:last-child {
          left: 240px;
        }
      }

      .is-drag {
        background-image: none;
        background-color: rgb(145, 188, 0);
        border-radius: 10px;
      }
    }

    .save-btn {
      width: 170px;
      height: 40px;
      margin-top: 5px;
      margin-left: 65px;
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
</style>
