<template>
  <div class="key" @click="handleClick" @mousedown="startDrag" draggable="false" v-if="keyText"
    @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- <template v-if="keyValue === 129">
      <p>
        <img src="@/assets/images/Volume-down.svg" alt=""></img>
      </p>
    </template>
    <template v-else>
      <p>{{ keyText }}</p>
      <p>{{ keyValue }}</p>
    </template> -->
    <p>{{ keyText }}</p>
    <!-- V2键盘有提示 -->
    <template v-if="showTip && isVersion2 && keyboardMap[keyValue]?.comm">
      <span :style="tipStyle">{{ keyboardMap[keyValue]?.comm }}</span>
    </template>

  </div>
  <div ref="dragElement" class="key key-mirror" v-if="isDragging" :style="isDragging ? defaultOffset : ''">
    <p>{{ keyText }}</p>
  </div>
</template>

<script setup>
import { keyboard_zh_CN, keyboardV2_zh_CN, keyboardMap_zh_CN, keyboard_en_US, keyboardV2_en_US, keyboardMap_en_US } from '@/configs/byte-to-key';
import { useKeyboardStore } from '@/stores';
import { scaleValue } from '@/utils/responsive';
import { useI18n } from 'vue-i18n';


const { keyValue } = defineProps({
  keyValue: { type: [Number, Object], required: true },
  // selectIdx: { type: Number, default: false },
});



const emits = defineEmits(['select']);

const keyboardStore = useKeyboardStore();
const { t, locale } = useI18n();

const isDragging = ref(false);
const dragElement = ref(null);
const showTip = ref(false);
const tipStyle = ref();
const defaultOffset = reactive({ left: 0, top: 0 });
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
let dragStartTime = 0;

// 更通用的多语言键位映射方案，便于后续扩展更多语言
const keyboardLangMap = {
  zh_CN: {
    keyboard: keyboard_zh_CN,
    keyboardV2: keyboardV2_zh_CN,
    keyboardMap: keyboardMap_zh_CN,
  },
  en_US: {
    keyboard: keyboard_en_US,
    keyboardV2: keyboardV2_en_US,
    keyboardMap: keyboardMap_en_US,
  },
  // 以后新增语言只需在此处添加
};

const currentLang = computed(() => locale.value in keyboardLangMap ? locale.value : 'zh_CN');
const keyboard = computed(() => keyboardLangMap[currentLang.value].keyboard);
const keyboardV2 = computed(() => keyboardLangMap[currentLang.value].keyboardV2);
const keyboardMap = computed(() => keyboardLangMap[currentLang.value].keyboardMap);

const keyText = computed(() => {
  if (isVersion2) {
    return typeof keyValue === 'object' && keyValue.macroName
      ? keyValue.macroName
      : keyValue === 61696
        ? 'Fn'
        : keyboardV2.value[keyValue] || '';
  }
  console.log(keyboard.value, );
  return typeof keyValue === 'object' && keyValue.macroName ? keyValue.macroName : keyboard.value[keyValue] || '';
});


const onMouseEnter = (e) => {
  showTip.value = !showTip.value;
  if (!showTip.value) return;

  nextTick(() => {
    const keyRect = e.currentTarget.getBoundingClientRect();
    const tipHeight = scaleValue(24); // tip高度，和css保持一致
    tipStyle.value = {
      left: `${keyRect.left + keyRect.width / 2}px`,
      top: `${keyRect.top - tipHeight - scaleValue(8)}px`, // 8px为间距，可调整
    };
  });
};
const onMouseLeave = (e) => {
  e.stopPropagation();
  showTip.value = false;
};

const handleClick = (e) => {
  e.preventDefault(); // 阻止默认行为
  if (Date.now() - dragStartTime < 200) {
    emits('select', keyValue);
  }
  // keyboardStore.updateSelectKey(props.keyValue);
};

const startDrag = (e) => {
  e.stopPropagation();
  dragStartTime = Date.now(); // 记录鼠标按下的时间
  document.body.style.cursor = 'grabbing';
  // 更新初始位置
  updatePosition(e);

  document.addEventListener('mousemove', updatePosition);
  document.addEventListener('mouseup', stopDrag, { once: true });
};

const updatePosition = async (e) => {
  if (dragElement.value) {
    if (keyboardStore.selectKey.value !== keyValue) {
      keyboardStore.updateGrabStatus(true);
      keyboardStore.updateSelectKeyCode(keyValue);
    }
    dragElement.value.style.left = `${e.pageX - 10}px`;
    dragElement.value.style.top = `${e.pageY - 10}px`;
  } else {
    // 阻止click触发mousemove
    if (Date.now() - dragStartTime > 100) {
      isDragging.value = true;
      keyboardStore.isDraging = true;
      defaultOffset.left = `${e.pageX}px`;
      defaultOffset.top = `${e.pageY}px`;
    }
  }
};

const stopDrag = () => {
  isDragging.value = false;
  keyboardStore.isDraging = false;
  document.body.style.cursor = 'default';
  document.removeEventListener('mousemove', updatePosition);
  // 停止抓取后重置
  setTimeout(() => {
    keyboardStore.updateGrabStatus(false);
    keyboardStore.updateSelectKeyCode(0);
  }, 200);
};

// 语言切换将自动通过上面的 computed 生效，无需额外 onMounted 赋值



</script>

<style lang="scss" scoped>
.key {
  width: var(--size-50);
  height: var(--size-50);
  line-height: 1;
  font-size: var(--font-size-12);
  margin: 0 var(--character-card-key-right) var(--spacing-10) 0;
  text-align: center;
  font-family: 'CN Heavy';
  background-image: url('@/assets/images/key_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  cursor: pointer;
  position: relative;

  > p {
    width: 100%;
    height: 100%;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    word-break: break-all;
  }

  > span {
    height: var(--spacing-24);
    padding: 0 var(--spacing-5);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: var(--font-size-10);
    font-family: 'CN Heavy';
    border: var(--spacing-2) solid #242424;
    border-radius: var(--spacing-5);
    background-color: #000;
    transform: translateX(-50%);
    cursor: pointer;
    position: fixed;
    z-index: 5;
  }

  &:hover {
    background-image: url('@/assets/images/key_bgC.svg');
  }

  &-mirror {
    position: fixed;
    pointer-events: none;
    transform: rotate(10deg);
    z-index: 1000;
  }
}
</style>
