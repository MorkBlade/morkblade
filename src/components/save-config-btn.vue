<template>
  <div
    class="save-btn"
    :class="{ 'is-active': isAct }"
    @click="saveConfig"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <img :src="icon" alt="" />
    <span>{{ btnText }}</span>
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import mDialog from '@/components/dialog.vue';
import defaultIcon from '@/assets/images/save_icon.svg';

const { btnText, tag, disabled } = defineProps({
  btnText: {
    type: String,
    default: '保存更改',
  },
  tag: {
    // 标识要保存什么数据
    type: String,
  },
  icon: {
    type: String,
    default: defaultIcon,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['saveConfig']);

const isShow = ref(false);
const isAct = ref(false);

const saveConfig = () => {
  if (disabled) return;
  isAct.value = false;
  isShow.value = true;
};

const onMouseEnter = () => {
  isAct.value = true;
};
const onMouseLeave = () => {
  isAct.value = false;
};

const onSure = () => {
  isShow.value = false;
  emits('saveConfig');
};
const onCancel = () => {
  isShow.value = false;
};
</script>

<style scoped lang="scss">
.save-btn {
  width: var(--size-170);
  height: var(--size-40);
  margin-left: var(--spacing-45);
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
</style>
