<template>
  <div class="key" @click="handleClick">
    <p>{{ keyText }}</p>
  </div>
</template>
<!-- :class="{ draggable: !hold, draggable_hold: hold, active: active }" -->

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';
// import { useKeyboardStore } from '@/stores';

// const keyboardStore = useKeyboardStore();

const { keyValue } = defineProps({
  keyValue: { type: Number, required: true },
  // selectIdx: { type: Number, default: false },
});
const emits = defineEmits(['select']);

const keyText = computed(() => {
  return keyboard[keyValue];
});

const handleClick = (ite) => {
  emits('select', keyValue);
  // keyboardStore.updateSelectKey(props.keyValue);
};

const hold = computed(() => {
  const value = [61696, 61697, 61698, 61699, 61704, 61705, 61706, 61707, 61708].includes(props.keyValue.value);
  return value;
});
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
}
</style>
