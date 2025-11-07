<template>
  <div class="key" @click="handleClick" @mousedown="startDrag" draggable="false" v-if="keyText"
    @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">

    <template v-if="isIconKey">
      <p>
        <img :src="getImageSrc(isVersion2 ? NUM_KEY_V2[keyValue] : NUM_KEY[keyValue])" alt="" @mousedown.stop="startDrag" draggable="false"></img>
      </p>
    </template>
    <template v-else>
      <p>{{ keyText }}</p>
    </template>
    
    <template v-if="showTip && keyboardMap[keyValue]?.comm">
      <span :style="tipStyle">{{ keyboardMap[keyValue]?.comm }}</span>
      
    </template>

  </div>
  <div ref="dragElement" class="key key-mirror" v-if="isDragging" :style="isDragging ? defaultOffset : ''">
    <!-- 复制原始按键的完整内容 -->
    <template v-if="isIconKey">
      <p>
        <img :src="getImageSrc(isVersion2 ? NUM_KEY_V2[keyValue] : NUM_KEY[keyValue])" alt="" @mousedown.stop="startDrag" draggable="false"></img>
      </p>
    </template>
    <template v-else>
      <p>{{ keyText }}</p>
    </template>
  </div>
</template>

<script setup>
// import { keyboard_zh_CN, keyboardV2_zh_CN, keyboardMap_zh_CN, keyboard_en_US, keyboardV2_en_US, keyboardMap_en_US } from '@/configs/byte-to-key';

// import keyboard from '@/configs/byte-to-key/keyboard';
// import keyboardV2 from '@/configs/byte-to-key/keyboard-v2';
// import keyboardMap from '@/configs/byte-to-key/keyboard-map';

// V1键盘
import keyboardV1 from '@/configs/byte-to-key/v1/keyboard';
import keyboardMapV1_zh_CN from '@/configs/byte-to-key/v1/zh_CN/keyboard-map';
import keyboardMapV1_en_US from '@/configs/byte-to-key/v1/en_US/keyboard-map';

// V2键盘
import keyboardV2 from '@/configs/byte-to-key/v2/keyboard-v2';
import {keyboardMapV2 as keyboardMapV2_zh_CN} from '@/configs/byte-to-key/v2/zh_CN/keyboard-map';
import {keyboardMapV2 as keyboardMapV2_en_US} from '@/configs/byte-to-key/v2/en_US/keyboard-map';

import { useKeyboardStore } from '@/stores';
import { scaleValue } from '@/utils/responsive';
import { useI18n } from 'vue-i18n';
import {NUM_KEY, NUM_KEY_V2} from '@/configs/byte-to-key/iconNumKey';



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

// 根据语言来选择keyboard-map文件
// 更通用的多语言键位映射方案，便于后续扩展更多语言
const keyboardLangMap = {
  zh_CN: {
    keyboardMapV1: keyboardMapV1_zh_CN,
    keyboardMapV2: keyboardMapV2_zh_CN,
  },
  en_US: {
    keyboardMapV1: keyboardMapV1_en_US,
    keyboardMapV2: keyboardMapV2_en_US,
  },
  // 以后新增语言只需在此处添加
};

const currentLang = computed(() => locale.value in keyboardLangMap ? locale.value : 'zh_CN');
const keyboardMap = computed(() => {
  // 根据键盘版本选择对应的键位映射
  if (isVersion2) {
    return keyboardLangMap[currentLang.value].keyboardMapV2;
  } else {
    return keyboardLangMap[currentLang.value].keyboardMapV1;
  }
});


const keyText = computed(() => {
  if (isVersion2) {
    // 检查是否为宏按键对象
    if (typeof keyValue === 'object' && keyValue.macroName) {
      return keyValue.macroName;
    }
    
    // 特殊处理 Fn 键 (键值 61696)
    if (keyValue === 61696) {
      return 'Fn';
    }

    // 返回对应的键位名称，如果不存在则返回空字符串
    return keyboardV2[keyValue] || '';
  }
  return typeof keyValue === 'object' && keyValue.macroName ? keyValue.macroName : keyboardV1[keyValue] || '';
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

// 判断是否是图标键
const isIconKey = computed(() => {
  if (isVersion2) {
    return NUM_KEY_V2[keyValue];
  }
  return NUM_KEY[keyValue];
});

// 添加动态导入图片的方法
const getImageSrc = (keyText) => {
  return new URL(`../assets/images/${keyText}.avif`, import.meta.url).href
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
