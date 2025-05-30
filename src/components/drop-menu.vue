<template>
  <!-- [selectedIdx !== null ? 'is-selected' : '', disabled] -->
  <div class="cover-list" :class="{ 'is-selected': selectedIdx !== null, disabled }" @click="toggleDropdown">
    <img class="change-icon" :src="selectedIdx !== null ? changedIcon : changeIcon" alt="" />
    <span>{{ items[selectedIdx] || '请选择' }}</span>
    <img
      class="down-icon"
      :src="selectedIdx !== null ? downIcon : downIcon2"
      :style="{ transform: `rotate(${rotate}deg)` }"
    />
    <div class="drop-list" :style="{ height: `${coverListHeight}px` }">
      <ul>
        <li
          v-for="(ite, idx) in items"
          :key="ite"
          :class="{ 'checked-item': idx == selectedIdx }"
          @click.stop="selectItem(idx, ite)"
        >
          {{ ite }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { scaleValue } from '@/utils/responsive.js';

import changeIcon from '@/assets/images/change.svg';
import changedIcon from '@/assets/images/changed.svg';
import downIcon from '@/assets/images/down_icon.svg';
import downIcon2 from '@/assets/images/down_icon2.svg';

const { maxHeight, items, disabled, specialIndex, defaultSelect } = defineProps({
  maxHeight: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  specialIndex: { type: Number },
});

const emit = defineEmits(['sendSelectedIdx']);

const rotate = ref(0);
const selectedIdx = ref(null);
const coverListHeight = ref(0);

const toggleDropdown = () => {
  if (disabled) return;
  coverListHeight.value = coverListHeight.value ? 0 : scaleValue(maxHeight);
  rotate.value = rotate.value ? 0 : 180;
};

watch(
  () => specialIndex,
  (newVal) => {
    if (newVal !== undefined) selectedIdx.value = newVal;
    console.log('specialIndexspecialIndex', newVal, selectedIdx.value);
  },
);

const selectItem = (idx, ite) => {
  if (selectedIdx.value !== idx) {
    emit('sendSelectedIdx', idx, ite);
  }
  selectedIdx.value = idx;
  coverListHeight.value = 0;
  rotate.value = 0;
};
</script>

<style scoped lang="scss">
.cover-list {
  width: var(--size-170);
  height: var(--size-40);
  margin-left: var(--spacing-10);
  display: flex;
  align-items: center;
  background-image: url('@/assets/images/select_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
  &.disabled {
    cursor: not-allowed !important;
  }
  &.is-selected {
    background-image: url('@/assets/images/selected_bg.gif');

    span {
      color: #000 !important;
    }
  }

  .change-icon {
    width: var(--size-20);
    height: var(--size-20);
    object-fit: fill;
    margin-left: calc(var(--spacing-10) + var(--spacing-1));
  }

  .down-icon {
    width: var(--size-13);
    height: var(--size-8);
    object-fit: fill;
    transition: transform 0.3s ease-in-out;
  }

  span {
    width: calc(var(--size-100) + var(--spacing-8));
    height: 100%;
    display: inline-block;
    text-align: center;
    border: none;
    color: #fff;
    height: calc(var(--spacing-30) + var(--spacing-1));
    font-size: var(--font-size-18);
    font-family: 'CN Heavy';
    margin: var(--spacing-5) 0 0 var(--spacing-10);
  }

  .drop-list {
    position: absolute;
    top: var(--spacing-45);
    left: var(--spacing-4);
    z-index: 2;
    box-sizing: border-box;
    padding-right: var(--spacing-5);
    overflow-y: scroll;
    transition: height 0.3s ease;
    background-color: #000;
    /* 滚动条整体样式 */
    &::-webkit-scrollbar {
      height: var(--spacing-10);
      width: var(--spacing-5);
    }

    /* 滚动条轨道 */
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    /* 滚动条手柄 */
    &::-webkit-scrollbar-thumb {
      background: rgb(37, 37, 37);
    }

    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      display: none;
    }

    /* 当容器被悬停时显示滚动条 */
    &:hover::-webkit-scrollbar {
      display: block;
    }

    > ul {
      list-style-type: none;

      li {
        width: var(--size-160);
        height: var(--size-40);
        padding: var(--spacing-10);
        text-align: center;
        margin-bottom: var(--spacing-5);
        color: #fff;
        font-family: 'CN Heavy';
        background-image: url('@/assets/images/item_bg.svg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;

        &.checked-item {
          background-image: url('@/assets/images/item_bg_checked.gif');
        }
      }
    }
  }
}
</style>
