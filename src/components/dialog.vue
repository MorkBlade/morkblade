<template>
  <div class="m-dialog" v-if="isShow">
    <div class="shadow">
      <div class="dialog-content">
        <p>{{ textContent }}</p>
        <div class="btn-group">
          <div class="sure-btn" @click="onSure">
            <img src="@/assets/images/sure_icon.svg" alt="" />
            <span>确认</span>
          </div>
          <div class="cancel-btn" @click="onCancel">
            <img src="@/assets/images/cancel_icon.svg" alt="" />
            <span>取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';

const { textContent, isShow } = defineProps({
  textContent: String,
  isShow: { type: Boolean, default: false },
});

const emits = defineEmits(['update:isShow', 'sure', 'cancel']);

const preventBackgroundScroll = (event) => {
  event.preventDefault();
};
// 监听 isShow 变化来添加/移除事件监听
watch(
  () => isShow,
  (newVal) => {
    if (newVal) {
      // dialog 显示时添加滚动限制
      window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    } else {
      // dialog 隐藏时移除滚动限制
      window.removeEventListener('wheel', preventBackgroundScroll);
    }
  },
);

// 组件卸载时确保移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('wheel', preventBackgroundScroll);
});

const onSure = () => {
  emits('update:isShow', false); // 更新父组件的状态
  emits('sure');
};

const onCancel = () => {
  emits('update:isShow', false); // 更新父组件的状态
  emits('cancel');
};
</script>

<style scoped lang="scss">
.shadow {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: rgba(0, 0, 0, 0.7);

  .dialog-content {
    width: 600px;
    height: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -300px;
    margin-top: -150px;
    background-image: url('@/assets/images/dialog_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    p {
      width: 440px;
      max-height: 132px;
      margin: 80px 0 0 80px;
      font-size: 22px;
      font-family: 'CN Heavy';
      color: #ffffff;
      // overflow-y: scroll;
    }

    .btn-group {
      display: flex;

      .sure-btn,
      .cancel-btn {
        width: 170px;
        height: 40px;
        font-size: 22px;
        font-family: 'CN Heavy';
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        background-image: url('@/assets/images/save_bg.svg');
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        bottom: 20px;

        img {
          width: 20px;
          height: 20px;
          object-fit: fill;
          margin: 0 50px 0 10px;
        }
      }

      .sure-btn {
        left: 60px;
      }

      .cancel-btn {
        left: 370px;
      }
    }
  }
}
</style>
