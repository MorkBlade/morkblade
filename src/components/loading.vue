<template>
  <Teleport to="body">
    <div v-if="visible" class="custom-loading-overlay" :style="{ zIndex: zIndex }">
      <div class="custom-loading-mask" :style="{ backgroundColor: backgroundColor }">
        <div class="custom-loading-content">
          <div class="custom-loading-spinner">
            <div class="spinner-circle"></div>
          </div>
          <div v-if="text" class="custom-loading-text">{{ text }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '加载中...'
  },
  backgroundColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.8)'
  },
  zIndex: {
    type: Number,
    default: 9999
  },
  lock: {
    type: Boolean,
    default: true
  }
});

const emits = defineEmits(['close']);

// 锁定页面滚动
const lockScroll = () => {
  if (props.lock) {
    document.body.style.overflow = 'hidden';
  }
};

const unlockScroll = () => {
  if (props.lock) {
    document.body.style.overflow = '';
  }
};

onMounted(() => {
  if (props.visible) {
    lockScroll();
  }
});

onUnmounted(() => {
  unlockScroll();
});

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    lockScroll();
  } else {
    unlockScroll();
  }
});
</script>

<style scoped lang="scss">
.custom-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.custom-loading-spinner {
  margin-bottom: 16px;
}

.spinner-circle {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #91bc00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.custom-loading-text {
  color: #91bc00;
  font-size: 16px;
  font-weight: bold;
  font-family: 'CN Heavy', sans-serif;
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>