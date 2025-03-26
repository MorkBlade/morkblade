<template>
  <div class="macro-type-container">
    <h3>宏类型</h3>
    <div v-for="(item, idx) in types" :key="idx" class="type-item">
      <input type="radio" :id="idx" name="type" :checked="macroSettings.mode === idx" @change="changeMacroType(idx)" />
      <span>{{ item }}</span>
    </div>
    <div class="repeat-numbers">
      <span>重复次数:</span>
      <div class="number-controller">
        <button class="decrement-btn" @click="decrementValue('repeatCount')" :disabled="macroSettings.repeatCount <= 1">
          -
        </button>
        <input
          class="value"
          type="number"
          :min="1"
          v-model.number="macroSettings.repeatCount"
          @change="validateRepeatCount"
        />
        <button class="increment-btn" @click="incrementValue('repeatCount')">+</button>
      </div>
    </div>
    <div class="repeat-numbers">
      <span>重复间隔:</span>
      <div class="number-controller">
        <button
          class="decrement-btn"
          @click="decrementValue('repeatInterval')"
          :disabled="macroSettings.repeatInterval <= 1"
        >
          -
        </button>
        <input
          class="value"
          type="number"
          :min="1"
          v-model.number="macroSettings.repeatInterval"
          @change="validateRepeatInterval"
        />
        <button class="increment-btn" @click="incrementValue('repeatInterval')">+</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  initialMode: { type: Number, default: 0 },
  initialRepeatCount: { type: Number, default: 1 },
  initialRepeatInterval: { type: Number, default: 1 },
});

const emit = defineEmits(['update:settings']);

// 创建宏设置对象
const macroSettings = reactive({
  mode: props.initialMode, // 模式: 0-点击执行, 1-点击重复执行, 2-按下重复执行抬起停止, 3-按下重复执行抬起执行后停止
  repeatCount: props.initialRepeatCount, // 重复次数
  repeatInterval: props.initialRepeatInterval, // 重复间隔 (ms)
});

const types = ['点击执行', '点击重复执行', '按下重复执行,抬起停止', '按下重复执行,抬起执行后停止'];

// 改变宏类型
const changeMacroType = (idx) => {
  macroSettings.mode = parseInt(idx);
  emitSettingsUpdate();
  // console.log('宏模式已更新为:', types[idx], '(索引:', idx, ')');
};

// 验证重复次数
const validateRepeatCount = () => {
  // 确保值大于等于1
  if (macroSettings.repeatCount < 1) {
    macroSettings.repeatCount = 1;
  }
  // 可以根据需要添加上限值检查
  emitSettingsUpdate();
};

// 验证重复间隔
const validateRepeatInterval = () => {
  // 确保值大于等于1
  if (macroSettings.repeatInterval < 1) {
    macroSettings.repeatInterval = 1;
  }
  // 可以根据需要添加上限值检查
  emitSettingsUpdate();
};

// 减少值
const decrementValue = (key) => {
  if (key === 'repeatCount' && macroSettings.repeatCount > 1) {
    macroSettings.repeatCount--;
    emitSettingsUpdate();
  } else if (key === 'repeatInterval' && macroSettings.repeatInterval > 1) {
    macroSettings.repeatInterval--;
    emitSettingsUpdate();
  }
};

// 增加值
const incrementValue = (key) => {
  if (key === 'repeatCount') {
    macroSettings.repeatCount++;
    emitSettingsUpdate();
  } else if (key === 'repeatInterval') {
    macroSettings.repeatInterval++;
    emitSettingsUpdate();
  }
};

// 向父组件发送更新的设置
const emitSettingsUpdate = () => {
  emit('update:settings', { ...macroSettings });
};

// 监听属性变化，更新设置
watch(
  () => [props.initialMode, props.initialRepeatCount, props.initialRepeatInterval],
  ([newMode, newCount, newInterval]) => {
    macroSettings.mode = newMode;
    macroSettings.repeatCount = newCount;
    macroSettings.repeatInterval = newInterval;
  },
);

// 初始化时发送当前设置到父组件
onMounted(() => {
  emitSettingsUpdate();
});
</script>

<style scoped lang="scss">
.macro-type-container {
  width: 300px;
  height: 366px;
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

  .type-item {
    margin-left: 30px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
      color: #fff;
      font-size: 14px;
      font-family: 'CN Heavy';
    }
    /* 移除默认样式 */
    input[type='radio'] {
      appearance: none; /* 移除默认样式 */
      width: 18px;
      height: 18px;
      border: 3px solid #91bc00;
      border-radius: 50%;
      outline: none;
      cursor: pointer;
    }

    /* 鼠标悬停时的样式 */
    input[type='radio']:hover {
      // border-color: #007bff;
    }

    /* 选中状态下的样式 */
    input[type='radio']:checked {
      // border-color: #007bff;
      // background-color: #91bc00;
    }

    /* 选中状态下的小圆点 */
    input[type='radio']:checked::after {
      content: '';
      display: block;
      width: 8px;
      height: 8px;
      margin: 2px;
      border-radius: 50%;
      background-color: #91bc00;
    }
  }

  .repeat-numbers {
    display: flex;
    border-top: 10px solid transparent;
    margin: 0 0 20px 30px;

    span {
      margin-right: 10px;
      font-size: 16px;
      font-family: 'CN Heavy';
      color: #fff;
    }

    .number-controller {
      width: 80px;
      height: 28px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      border: 3px solid #1f1f1f;
      border-radius: 20px;
      overflow: hidden;
      user-select: none;

      .decrement-btn,
      .increment-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        background-color: #181818;
        color: white;
        font-size: 18px;
        font-weight: bold;
        border: none;
        cursor: pointer;
        outline: none;
        padding: 0;
        transition: background-color 0.2s;

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
      .decrement-btn:hover:not(:disabled),
      .increment-btn:hover:not(:disabled) {
        background-color: #333333;
      }

      .decrement-btn:active:not(:disabled),
      .increment-btn:active:not(:disabled) {
        background-color: #444444;
      }
      .value {
        // flex: 1;
        width: 40px;
        height: 100%;
        text-align: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
        font-family: 'Arial', sans-serif;
        background-color: #000;
        border: none;
        outline: none;
      }
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* For Firefox */
      input[type='number'] {
        -moz-appearance: textfield; /* Firefox */
      }
    }
  }
}
</style>
