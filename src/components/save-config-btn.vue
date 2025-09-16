<template>
  <div
    class="save-btn"
    :class="[{ 'is-active': isAct }, type]"
    @click="confirmConfig"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <img :src="icon" alt="" />
    <span class="save-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ $t(btnText) }}</span>
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import { showMessage } from '@/utils/message';
import { useKeyboardStore } from '@/stores';
import { useI18n } from 'vue-i18n';

import mDialog from '@/components/dialog.vue';
import defaultIcon from '@/assets/images/save_icon.svg';

const { t } = useI18n();

const { btnText, tag, disabled, needKeys, type, verify } = defineProps({
  btnText: {
    type: String,
    default: ('saveConfigBtn.saveText'),
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
  needKeys: {
    type: Boolean,
    default: true,
  },
  type: { type: String, default: 'normal' },
  verify: { type: Boolean },
});
const emits = defineEmits(['saveConfig']);

const keyboardStore = useKeyboardStore();
const isShow = ref(false);
const isAct = ref(false);

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const confirmConfig = () => {
  if (disabled || !verify) return;
  if (type === 'warning') {
    emits('saveConfig');
    return;
  }
  if (activeKeys.value.length === 0 && needKeys) {
    showMessage(t('saveConfigBtn.saveTip'), 'warning');
    return;
  }
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
  display: flex;
  cursor: pointer;

  &.is-active {
    background-image: url('/src/assets/images/save_bgc.svg');

    &.primary {
      background-image: url('/src/assets/images/save_bg_primary.svg');
    }

    &.warning {
      background-image: url('/src/assets/images/pending_bg.svg');
    }

    &.danger {
      background-image: url('/src/assets/images/save_bg_danger.svg');
    }
  }

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
    left: var(--spacing-50);
  }
  .save-text {
    display: flex;
    width: var(--spacing-105);
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-align: center;
    margin-top: 5px;
    justify-content: center;
    align-items: center;
  }
}
</style>
