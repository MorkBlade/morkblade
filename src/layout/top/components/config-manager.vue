<template>
  <div class="setting-manager-container" @click="handleClick">
    <img class="setting-icon" src="@/assets/images/share.svg" />
    <span class="setting-text">设置管理</span>
  </div>
  <!-- <Dialog :textContent="'暂未开放，敬请期待'" :isShow="showDialog" @sure="handleSure" @cancel="handleCancel">
  </Dialog> -->
  <DialogSetting
        :isShow="showDialog"
        @sure="handleSure"
        @cancel="handleCancel"
    />
</template>

<script setup>
import { ref } from 'vue';
import DialogSetting from '@/layout/top/components/dialog-config.vue';

const showDialog = ref(false);


const handleClick = async () => {
  // 点击设置管理按钮的处理逻辑
    showDialog.value = true;
};

const handleSure = () => {
    // 确认按钮的处理逻辑
    showDialog.value = false;
};

const handleCancel = () => {
    // 取消按钮的处理逻辑
    showDialog.value = false;
};
</script>

<style scoped lang="scss">
.setting-manager-container {
  position: relative;
  width: var(--size-170);
  height: var(--size-40);
  top: calc(var(--spacing-15) + var(--spacing-2));
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-10);
  background-image: url('@/assets/images/setting_btn_bg.svg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    background-image: url('@/assets/images/setting_btn_bg_hover.svg');
  }

  .setting-icon {
    width: var(--size-18);
    height: var(--size-18);
    object-fit: fill;
    margin-right: var(--spacing-10);
  }

  .setting-text {
    border: none;
    color: #fff;
    display: inline-block;
    font-size: var(--font-size-18);
    background-color: transparent;
    font-weight: 600;
    font-family: 'CN Heavy';
  }
}
</style>