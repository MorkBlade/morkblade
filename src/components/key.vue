<template>
  <div class="key" @click="handleClick" @mousedown="startDrag" draggable="false">
    <p>{{ keyText }}</p>
  </div>
  <div ref="dragElement" class="key key-mirror" v-if="isDragging" :style="isDragging ? defaultOffset : ''">
    <p>{{ keyText }}</p>
  </div>
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
import { useKeyboardStore } from '@/stores';

const keyboardStore = useKeyboardStore();

const { keyValue } = defineProps({
  keyValue: { type: [Number, Object], required: true },
  // selectIdx: { type: Number, default: false },
});

const emits = defineEmits(['select']);

const isDragging = ref(false);
const dragElement = ref(null);
const defaultOffset = reactive({ left: 0, top: 0 });
let dragStartTime = 0;

const keyText = computed(() => {
  return typeof keyValue === 'object' && keyValue.macroName ? keyValue.macroName : keyboard[keyValue] || '';
});

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
    if (keyboardStore.selectKey.value !== keyValue) keyboardStore.updateSelectKey(keyValue);
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
};
</script>

<style lang="scss" scoped>
.key {
  width: 50px;
  height: 50px;
  line-height: 1;
  font-size: 12px;
  margin: 0 10px 10px 0;
  text-align: center;
  font-family: 'CN Heavy';
  background-image: url('@/assets/images/key_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  cursor: pointer;

  p {
    width: 100%;
    height: 100%;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
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
