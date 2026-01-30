# V1 版本宏功能实现指南

> 本文档详细说明宏（Macro）功能的完整实现逻辑，可作为其他项目实现相同功能的参考。

---

## 目录

- [1. 功能概述](#1-功能概述)
- [2. 数据结构定义](#2-数据结构定义)
- [3. 状态管理 (Store)](#3-状态管理-store)
- [4. 宏列表管理](#4-宏列表管理)
- [5. 宏录制功能](#5-宏录制功能)
- [6. 宏数据编辑](#6-宏数据编辑)
- [7. 宏模式设置](#7-宏模式设置)
- [8. 发送宏到设备](#8-发送宏到设备)
- [9. 宏绑定到按键](#9-宏绑定到按键)
- [10. 完整数据流](#10-完整数据流)

---

## 1. 功能概述

### 1.1 核心特性

- **本地存储**：宏数据保存在 `localStorage`，应用重启后数据保留
- **实时录制**：通过监听键盘事件录制按键序列
- **可视化编辑**：支持拖拽排序、复制、删除、修改按键和延迟
- **多种执行模式**：支持单次执行、重复执行、按住执行等模式
- **绑定到按键**：将宏绑定到键盘特定按键上

### 1.2 限制条件

| 项目 | 限制值 |
|------|--------|
| 最大宏数量 | 16 个 |
| 单个宏最大事件数 | 64 条 |

---

## 2. 数据结构定义

### 2.1 宏对象 (Macro)

```javascript
{
  id: 1704067200,              // 唯一标识（时间戳 / 1000）
  macroName: "宏1",            // 宏名称
  macroLength: 10,             // 宏事件数量
  createTime: 1704067200000,   // 创建时间戳 (ms)
  data: [],                    // 宏事件数组
  mode: 0,                     // 执行模式 (0-3)
  repeatCount: 1,              // 重复次数
  repeatInterval: 1,           // 重复间隔 (ms)
}
```

### 2.2 宏事件 - 按键类型

```javascript
{
  keyType: 'key',              // 事件类型：按键
  key: 'a',                    // 原始按键名
  keyCode: 4,                  // HID 键码
  code: 'KeyA',                // 键盘代码
  status: 1,                   // 1 = 按下, 0 = 抬起
  type: 'keydown',             // 'keydown' 或 'keyup'
  timeDifference: 50,          // 与前一事件的时间差 (ms)
  timeStamp: 12345.67,         // 原始事件时间戳
  createTime: 1704067200000,   // 创建时间
}
```

### 2.3 宏事件 - 延迟类型

```javascript
{
  keyType: 'delay',            // 事件类型：延迟
  key: '',
  status: '',
  timeDifference: 100,         // 延迟时间 (ms)
  createTime: 1704067200000,
}
```

### 2.4 执行模式说明

| mode 值 | 名称 | 说明 |
|---------|------|------|
| 0 | 点击执行 | 点击一次，执行一次完整宏序列 |
| 1 | 点击重复执行 | 点击一次，重复执行指定次数 |
| 2 | 按下重复执行 | 按住时持续执行，松开立即停止 |
| 3 | 按下重复执行（完整） | 按住时持续执行，松开后完成当前循环再停止 |

---

## 3. 状态管理 (Store)

### 3.1 State 定义

```javascript
import { defineStore } from 'pinia';

const useMacroStore = defineStore('macro', {
  state: () => ({
    // 当前选中的宏（用于绑定按键时）
    selectMacro: null,
    
    // 宏配置信息
    macroInfo: {
      dks: 0,              // 绑定的按键值
      mode: 0,             // 执行模式
      repeatCount: 1,      // 重复次数
      repeatDelay: 1,      // 重复间隔
      macroMode: 0,
      selectName: null,
    },
    
    // 已使用（已绑定到按键）的宏 ID 列表
    usedMacro: [],
    
    // 宏数据列表
    localMacros: [],
    
    // 是否正在录制
    recording: false,
  }),

  getters: {
    // 获取宏列表
    macros: (state) => state.localMacros,
  },

  actions: {
    // 初始化：从 localStorage 读取
    initLocalMacros() {
      try {
        const storedMacros = localStorage.getItem('localMacros');
        if (storedMacros && storedMacros !== '[]') {
          this.localMacros = JSON.parse(storedMacros);
        } else {
          this.localMacros = [];
        }
      } catch (error) {
        console.error('Failed to parse localMacros:', error);
        this.localMacros = [];
      }
    },

    // 更新宏数据并持久化
    setMacroData(macroData) {
      this.localMacros = macroData;
      localStorage.setItem('localMacros', JSON.stringify(macroData));
    },

    // 更新录制状态
    updateMacroRecord(flag) {
      this.recording = flag;
    },
  },
});

export default useMacroStore;
```

### 3.2 初始化时机

在宏页面挂载时初始化数据：

```javascript
onMounted(() => {
  if (macroStore.localMacros.length === 0) {
    macroStore.initLocalMacros();
  }
});
```

---

## 4. 宏列表管理

### 4.1 新建宏

```javascript
const addMacro = () => {
  if (macros.value.length >= 16) {
    showMessage('宏数量已达上限', 'warning');
    return;
  }

  const timestamp = Date.now();
  const newMacro = {
    id: parseInt(timestamp / 1000),
    macroName: `宏${macros.value.length + 1}`,
    macroLength: 0,
    createTime: timestamp,
    data: [],
    mode: 0,
    repeatCount: 1,
    repeatInterval: 1,
  };

  macros.value = [...macros.value, newMacro];
};
```

### 4.2 复制宏

```javascript
const copyMacro = (macro) => {
  if (macros.value.length >= 16) {
    showMessage('宏数量已达上限', 'warning');
    return;
  }

  const timestamp = Date.now();
  const copiedMacro = {
    ...JSON.parse(JSON.stringify(macro)),
    id: parseInt(timestamp / 1000),
    macroName: `宏${macros.value.length + 1}`,
    createTime: timestamp,
  };

  macros.value = [...macros.value, copiedMacro];
};
```

### 4.3 删除宏

```javascript
const deleteMacro = (id, index) => {
  // 检查宏是否正在使用（已绑定到按键）
  const isInUse = checkMacroInUse(id);
  if (isInUse) {
    showMessage('该宏正在使用中，无法删除', 'warning');
    return;
  }

  macros.value = macros.value.filter((item) => item.id !== id);
  showMessage('删除成功');
};

// 检查宏是否被按键绑定
const checkMacroInUse = (macroId) => {
  for (let row = 0; row < keyboards.length; row++) {
    for (let col = 0; col < keyboards[row].length; col++) {
      const advanced = keyboards[row][col].advancedKeys;
      if (advanced.advancedType === 6 && 
          advanced.macro?.macro?.macro?.id === macroId) {
        return true;
      }
    }
  }
  return false;
};
```

---

## 5. 宏录制功能

### 5.1 JS 键码 → HID 键码映射表

```javascript
const keyValueDictionary = {
  // 控制键
  8: 42,    // Backspace
  9: 43,    // Tab
  13: 40,   // Enter
  20: 130,  // Caps Lock
  27: 41,   // Escape
  32: 44,   // Space
  
  // 功能键
  112: 58,  // F1
  113: 59,  // F2
  114: 60,  // F3
  115: 61,  // F4
  116: 62,  // F5
  117: 63,  // F6
  118: 64,  // F7
  119: 65,  // F8
  120: 66,  // F9
  121: 67,  // F10
  122: 68,  // F11
  123: 69,  // F12
  
  // 修饰键
  16: 225,  // Left Shift
  17: 224,  // Left Ctrl
  18: 226,  // Left Alt
  91: 227,  // Left Win
  500: 229, // Right Shift (自定义)
  501: 228, // Right Ctrl (自定义)
  502: 230, // Right Alt (自定义)
  503: 231, // Right Win (自定义)
  
  // 导航键
  33: 157,  // Page Up
  34: 174,  // Page Down
  35: 77,   // End
  36: 74,   // Home
  37: 80,   // Left Arrow
  38: 82,   // Up Arrow
  39: 79,   // Right Arrow
  40: 81,   // Down Arrow
  45: 73,   // Insert
  46: 76,   // Delete
  
  // 数字键 (主键盘)
  48: 39, 49: 30, 50: 31, 51: 32, 52: 33,
  53: 34, 54: 35, 55: 36, 56: 37, 57: 38,
  
  // 字母键
  65: 4,  66: 5,  67: 6,  68: 7,  69: 8,
  70: 9,  71: 10, 72: 11, 73: 12, 74: 13,
  75: 14, 76: 15, 77: 16, 78: 17, 79: 18,
  80: 19, 81: 20, 82: 21, 83: 22, 84: 23,
  85: 24, 86: 25, 87: 26, 88: 27, 89: 28,
  90: 29,
  
  // 小键盘
  96: 98,   // Numpad 0
  97: 89,   // Numpad 1
  98: 90,   // Numpad 2
  99: 91,   // Numpad 3
  100: 92,  // Numpad 4
  101: 93,  // Numpad 5
  102: 94,  // Numpad 6
  103: 95,  // Numpad 7
  104: 96,  // Numpad 8
  105: 97,  // Numpad 9
  106: 85,  // Numpad *
  107: 87,  // Numpad +
  109: 86,  // Numpad -
  110: 99,  // Numpad .
  111: 84,  // Numpad /
  144: 83,  // Num Lock
  
  // 符号键
  186: 51,  // ; :
  187: 46,  // = +
  188: 54,  // , <
  189: 45,  // - _
  190: 55,  // . >
  191: 56,  // / ?
  192: 52,  // ` ~
  219: 47,  // [ {
  220: 49,  // \ |
  221: 48,  // ] }
  222: 52,  // ' "
};
```

### 5.2 开始/停止录制

```javascript
const isRecording = ref(false);
let lastEventTime = null;

const toggleRecording = () => {
  isRecording.value = !isRecording.value;
  macroStore.updateMacroRecord(isRecording.value);

  if (isRecording.value) {
    // 开始录制
    lastEventTime = Date.now();
    document.addEventListener('keydown', handleKeyEvent);
    document.addEventListener('keyup', handleKeyEvent);
    showMessage('开始录制');
  } else {
    // 停止录制
    document.removeEventListener('keydown', handleKeyEvent);
    document.removeEventListener('keyup', handleKeyEvent);
    showMessage('录制完成');
  }
};
```

### 5.3 捕获键盘事件

```javascript
const handleKeyEvent = (event) => {
  // 检查是否超过最大事件数
  if (currentMacro.value.data.length >= 64) {
    showMessage('宏事件数已达上限', 'warning');
    toggleRecording(); // 自动停止录制
    return;
  }

  const { key, keyCode, code, type, timeStamp } = event;
  
  // 计算时间差
  let timeDiff = 0;
  if (lastEventTime !== null) {
    timeDiff = Math.max(0, timeStamp - lastEventTime);
  }
  lastEventTime = timeStamp;

  // 构建事件对象
  const keyEvent = {
    keyType: 'key',
    key: key,
    keyCode: keyValueDictionary[keyCode] || keyCode,
    code: code,
    status: type === 'keydown' ? 1 : 0,
    type: type,
    timeDifference: timeDiff,
    timeStamp: timeStamp,
    createTime: Date.now(),
  };

  // 添加到宏数据
  currentMacro.value.data.push(keyEvent);
  currentMacro.value.macroLength = currentMacro.value.data.length;
  
  // 通知更新
  emit('updateMacro:data', [...currentMacro.value.data]);
};
```

---

## 6. 宏数据编辑

### 6.1 添加延迟

```javascript
const addDelay = () => {
  if (currentMacro.value.data.length >= 64) {
    showMessage('宏事件数已达上限', 'warning');
    return;
  }

  const delayEvent = {
    keyType: 'delay',
    key: '',
    status: '',
    timeDifference: 20,  // 默认 20ms
    createTime: Date.now(),
  };

  currentMacro.value.data.push(delayEvent);
  emit('updateMacro:data', [...currentMacro.value.data]);
};
```

### 6.2 插入按键事件

```javascript
const insertKeyEvent = () => {
  if (currentMacro.value.data.length >= 64) {
    showMessage('宏事件数已达上限', 'warning');
    return;
  }

  // 复制最后一个按键事件
  const lastKeyEvent = [...currentMacro.value.data]
    .reverse()
    .find((item) => item.keyType === 'key');

  if (lastKeyEvent) {
    const newEvent = {
      ...JSON.parse(JSON.stringify(lastKeyEvent)),
      createTime: Date.now(),
    };
    currentMacro.value.data.push(newEvent);
    emit('updateMacro:data', [...currentMacro.value.data]);
  }
};
```

### 6.3 复制事件

```javascript
const copyEvent = (event, index) => {
  if (currentMacro.value.data.length >= 64) {
    showMessage('宏事件数已达上限', 'warning');
    return;
  }

  const copiedEvent = {
    ...JSON.parse(JSON.stringify(event)),
    createTime: Date.now(),
  };

  // 在当前位置后插入
  currentMacro.value.data.splice(index + 1, 0, copiedEvent);
  emit('updateMacro:data', [...currentMacro.value.data]);
};
```

### 6.4 删除事件

```javascript
const deleteEvent = (event) => {
  const index = currentMacro.value.data.findIndex((item) => item === event);
  if (index !== -1) {
    currentMacro.value.data.splice(index, 1);
    emit('updateMacro:data', [...currentMacro.value.data]);
  }
};
```

### 6.5 修改按键

```javascript
const updateEventKey = (newKeyCode) => {
  if (selectedIndex.value === null) return;

  const event = currentMacro.value.data[selectedIndex.value];
  if (event && event.keyType === 'key') {
    event.keyCode = newKeyCode;
    event.key = getKeyNameByCode(newKeyCode);
    emit('updateMacro:data', [...currentMacro.value.data]);
  }
};
```

### 6.6 修改延迟时间

```javascript
const updateEventDelay = (newDelay) => {
  if (selectedIndex.value === null) return;

  const event = currentMacro.value.data[selectedIndex.value];
  if (event) {
    event.timeDifference = newDelay;
    emit('updateMacro:data', [...currentMacro.value.data]);
  }
};
```

### 6.7 修改按键状态

```javascript
const updateEventStatus = (newStatus) => {
  if (selectedIndex.value === null) return;

  const event = currentMacro.value.data[selectedIndex.value];
  if (event && event.keyType === 'key') {
    event.status = newStatus;  // 1 = 按下, 0 = 抬起
    event.type = newStatus === 1 ? 'keydown' : 'keyup';
    emit('updateMacro:data', [...currentMacro.value.data]);
  }
};
```

### 6.8 清空宏序列

```javascript
const clearMacro = () => {
  currentMacro.value.data = [];
  currentMacro.value.macroLength = 0;
  
  // 如果正在录制，停止录制
  if (isRecording.value) {
    toggleRecording();
  }
  
  emit('updateMacro:clear');
};
```

---

## 7. 宏模式设置

### 7.1 模式切换

```javascript
const macroSettings = reactive({
  mode: 0,           // 执行模式
  repeatCount: 1,    // 重复次数
  repeatInterval: 1, // 重复间隔 (ms)
});

const changeMode = (newMode) => {
  macroSettings.mode = newMode;
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:settings', { ...macroSettings });
};
```

### 7.2 重复次数控制

```javascript
const incrementRepeatCount = () => {
  macroSettings.repeatCount++;
  emitUpdate();
};

const decrementRepeatCount = () => {
  if (macroSettings.repeatCount > 1) {
    macroSettings.repeatCount--;
    emitUpdate();
  }
};

const validateRepeatCount = () => {
  if (macroSettings.repeatCount < 1) {
    macroSettings.repeatCount = 1;
  }
  emitUpdate();
};
```

---

## 8. 发送宏到设备

### 8.1 延迟处理算法

发送前需要将独立的延迟事件合并到按键事件中：

```javascript
const processDelays = (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].keyType !== 'delay') continue;
    
    const delayValue = data[i].timeDifference;

    // 找到前一个非 delay 事件
    let prevIndex = i - 1;
    while (prevIndex >= 0 && data[prevIndex].keyType === 'delay') {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      // 累加到前一个按键事件
      data[prevIndex].timeDifference += delayValue;
    } else {
      // 没有前置按键，找后一个按键事件
      let nextIndex = i + 1;
      while (nextIndex < data.length && data[nextIndex].keyType === 'delay') {
        nextIndex++;
      }
      if (nextIndex < data.length) {
        data[nextIndex].timeDifference += delayValue;
      }
    }

    // 清除 delay 事件的时间值
    data[i].timeDifference = 0;
  }
};
```

### 8.2 构建发送数据

```javascript
const setMacroToDevice = async (macroList) => {
  const selectedMacro = macroStore.selectMacro;
  if (!selectedMacro) return;

  // 1. 找到宏在列表中的索引
  const index = macroList.findIndex((m) => m.id === selectedMacro.id);
  if (index === -1) return;

  // 2. 构建宏配置数据
  const configData = {
    index: index,
    len: selectedMacro.macroLength,
    mode: selectedMacro.mode,
    key: macroStore.macroInfo.dks,   // 绑定的按键值
    num: selectedMacro.repeatCount,
    delay: selectedMacro.repeatInterval,
  };

  // 3. 处理延迟
  const macroData = JSON.parse(JSON.stringify(selectedMacro.data));
  processDelays(macroData);

  // 4. 过滤并转换事件数据
  const events = macroData
    .filter((item) => item.keyType === 'key')
    .map((item) => ({
      keyCode: item.keyCode,
      timeDifference: item.timeDifference,
      type: item.type === 'keyup' ? 0 : 1,
      status: item.status,
    }));

  // 5. 调用 SDK 发送
  const result = await services.setMacro(configData, events);

  // 6. 记录已使用的宏
  if (!macroStore.usedMacro.includes(selectedMacro.id)) {
    macroStore.usedMacro.push(selectedMacro.id);
  }

  // 7. 清除选中状态
  macroStore.selectMacro = null;

  return result;
};
```

---

## 9. 宏绑定到按键

### 9.1 高级键类型

宏作为高级键类型 `6` 存储在按键配置中：

```javascript
// 按键的高级键数据结构
keyboards[row][col].advancedKeys = {
  advancedType: 6,  // 6 = 宏
  macro: {
    keyValue: 0x04,   // 按键值
    type: 'macro',
    macro: {
      id: 1704067200,
      // ... 其他宏信息
    },
  },
  // 其他高级键类型的数据
  dks: null,
  mpt: null,
  mt: null,
  tgl: null,
  end: null,
  socd: null,
};
```

### 9.2 获取按键绑定的宏

```javascript
const getMacro = async (params) => {
  const { keyValue, row, col, mode } = params;

  // 从设备获取宏配置
  const result = await services.getMacro(keyValue);

  // 更新键盘状态
  const macroData = {
    keyValue,
    type: 'macro',
    macro: { keyValue, type: 'macro', macro: { ...result } },
  };

  keyboards[row][col].advancedKeys = {
    ...keyboards[row][col].advancedKeys,
    macro: macroData,
    advancedType: mode,
  };
};
```

### 9.3 初始化所有高级键

```javascript
const initAdvancedKeys = async (keyboards) => {
  for (let row = 0; row < keyboards.length; row++) {
    for (let col = 0; col < keyboards[row].length; col++) {
      const { keyValue, performance } = keyboards[row][col];
      if (!keyValue) continue;

      const advancedMode = performance.advancedKeyMode;
      
      // 根据模式类型获取对应数据
      if (advancedMode === 6) {
        await getMacro({ keyValue, row, col, mode: advancedMode });
      }
      // ... 其他高级键类型处理
    }
  }
};
```

### 9.4 删除宏绑定

```javascript
const deleteMacroBinding = async (advanced) => {
  const { keyValue, row, col } = advanced;
  
  // 获取按键的触发模式
  const touchMode = getTouchMode(keyboards[row][col].performance);
  
  // 调用 SDK 删除
  await services.deleteKey(keyValue, touchMode);
  
  // 重置按键的高级键数据
  keyboards[row][col].advancedKeys = {
    advancedType: '',
    value: 0,
    dks: null,
    mpt: null,
    mt: null,
    tgl: null,
    end: null,
    socd: null,
    macro: null,
  };
  
  // 刷新按键数据
  await refreshKeyboardData();
};
```

---

## 10. 完整数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        宏功能数据流                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐ │
│  │ localStorage │◄──────►│ Pinia Store │◄──────►│  Vue 组件   │ │
│  │             │  持久化 │             │  watch │             │ │
│  │ localMacros │        │ localMacros │        │ macros ref  │ │
│  └─────────────┘        └─────────────┘        └─────────────┘ │
│                                │                      │        │
│                                │                      ▼        │
│                                │               ┌─────────────┐ │
│                                │               │   用户操作   │ │
│                                │               │ ┌─────────┐ │ │
│                                │               │ │ 新建宏  │ │ │
│                                │               │ │ 录制    │ │ │
│                                │               │ │ 编辑    │ │ │
│                                │               │ │ 删除    │ │ │
│                                │               │ └─────────┘ │ │
│                                │               └─────────────┘ │
│                                │                               │
│                                ▼                               │
│                         ┌─────────────┐                        │
│                         │ selectMacro │◄── 选择要绑定的宏      │
│                         └─────────────┘                        │
│                                │                               │
│                                ▼                               │
│                         ┌─────────────┐                        │
│                         │ setMacro()  │                        │
│                         │ 数据转换    │                        │
│                         │ - 处理延迟  │                        │
│                         │ - 过滤事件  │                        │
│                         │ - 格式转换  │                        │
│                         └─────────────┘                        │
│                                │                               │
│                                ▼                               │
│                         ┌─────────────┐                        │
│                         │   SDK API   │                        │
│                         │ HID 通信    │                        │
│                         └─────────────┘                        │
│                                │                               │
│                                ▼                               │
│                         ┌─────────────┐                        │
│                         │  键盘固件   │                        │
│                         │  执行宏    │                        │
│                         └─────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 附录：SDK API 参考

| 方法 | 参数 | 说明 |
|------|------|------|
| `services.setMacro(config, events)` | config: 宏配置, events: 事件列表 | 发送宏到设备 |
| `services.getMacro(keyValue)` | keyValue: 按键值 | 获取按键绑定的宏 |
| `services.deleteKey(keyValue, mode)` | keyValue: 按键值, mode: 触发模式 | 删除按键配置 |

---

## 实现检查清单

- [ ] 定义宏数据结构（Macro, Event）
- [ ] 实现 Pinia Store（状态、持久化）
- [ ] 实现宏列表管理（增删复制）
- [ ] 实现键盘事件录制
- [ ] 实现事件编辑功能
- [ ] 实现模式设置
- [ ] 实现延迟处理算法
- [ ] 实现 SDK 通信
- [ ] 实现按键绑定管理
