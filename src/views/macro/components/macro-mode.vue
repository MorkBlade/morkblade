<template>
  <div class="macro-mode-container">
    <h3>{{ $t('macroModeV1.macroType') }}</h3>
    <div v-for="(item, idx) in types" :key="idx" class="type-item">
      <input type="radio" :id="idx" name="type" :checked="macroSettings.mode === idx" @change="changeMacroType(idx)" />
      <span class="type-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ item }}</span>
    </div>
    <div class="repeat-numbers">
      <span>{{ $t('macroModeV1.repeatCount') }}:</span>
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
      <span>{{ $t('macroModeV1.repeatInterval') }}:</span>
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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

const types = computed(() => [t('macroModeV1.clickExecute'), t('macroModeV1.clickExecute2'), t('macroModeV1.clickExecute3'), t('macroModeV1.clickExecute4')]);

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
// onMounted(() => {
//   emitSettingsUpdate();
// });
</script>

<style scoped lang="scss">
.macro-mode-container {
  width: var(--size-300);
  height: var(--macro-card-height);
  box-sizing: border-box;
  background-color: #000;
  border: var(--spacing-3) solid #202020;
  border-radius: var(--spacing-15);

  h3 {
    margin: var(--spacing-25) 0 var(--spacing-34) var(--spacing-30);
    line-height: 1;
    color: #fff;
    font-size: var(--font-size-16);
    font-family: 'CN Heavy';
  }

  .type-item {
    margin-left: var(--spacing-30);
    margin-bottom: var(--spacing-20);
    display: flex;
    align-items: center;

    .type-text {
      margin-left: var(--spacing-10);
      color: #fff;
      font-size: var(--font-size-14);
      font-family: 'CN Heavy';
      width: var(--spacing-230);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
    /* 移除默认样式 */
    input[type='radio'] {
      appearance: none; /* 移除默认样式 */
      width: var(--size-18);
      min-width: var(--size-18);
      height: var(--size-18);
      border: var(--spacing-3) solid #91bc00;
      border-radius: 50%;
      outline: none;
      cursor: pointer;

      /* 选中状态下的小圆点 */
      &:checked::after {
        content: '';
        display: block;
        width: var(--size-8);
        height: var(--size-8);
        margin: var(--spacing-2);
        border-radius: 50%;
        background-color: #91bc00;
      }
    }
  }

  .repeat-numbers {
    display: flex;
    border-top: var(--spacing-10) solid transparent;
    margin: 0 0 var(--spacing-20) var(--spacing-30);

    span {
      margin-right: var(--spacing-10);
      font-size: var(--font-size-16);
      font-family: 'CN Heavy';
      color: #fff;
    }

    .number-controller {
      width: var(--size-80);
      height: var(--size-28);
      display: flex;
      align-items: center;
      box-sizing: border-box;
      border: var(--spacing-3) solid #1f1f1f;
      border-radius: var(--spacing-20);
      overflow: hidden;
      user-select: none;

      .decrement-btn,
      .increment-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--size-28);
        height: var(--size-28);
        background-color: #181818;
        color: white;
        font-size: var(--font-size-18);
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
        width: var(--size-40);
        height: 100%;
        text-align: center;
        color: white;
        font-size: var(--font-size-14);
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
