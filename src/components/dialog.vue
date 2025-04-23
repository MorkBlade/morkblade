<template>
  <div class="m-dialog" v-if="isShow">
    <div class="shadow">
      <div class="dialog-content">
        <h3>{{ dialogTitle }}</h3>
        <template v-if="!isUpdate">
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
        </template>
        <template v-else>
          <!-- <div class="progress" v-if="enterUpdate"> -->
          <!-- <p v-if="updateSuc || updateRes !== null" class="update-tip">
            {{ updateRes ? '升级之后请重新校准' : '升级失败请重试' }}
          </p> -->
          <div class="update-progress" v-if="enterUpdate">
            <!-- <span>升级中...</span> -->
            <el-progress :percentage="progress" :color="'#91bc00'" :show-text="false" :stroke-width="10"></el-progress>
            <span>{{ `${progress}%` }}</span>
          </div>
          <!-- </div> -->
          <div class="btn-group">
            <p>{{ textContent }}</p>
            <div class="update-btn" :style="updateStep !== 0 ? { left: '215px' } : ''" @click="onSure('enterBoot')">
              <img class="update-img" src="@/assets/images/sure_icon.svg" alt="" />
              <span class="update-text">{{ text[updateStep] }}</span>
            </div>
            <div class="cancel-btn" @click="onCancel" v-if="updateStep === 0">
              <img src="@/assets/images/cancel_icon.svg" alt="" />
              <span>取消升级</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const { dialogTitle, textContent, isShow, isUpdate, progress, updateRes } = defineProps({
  dialogTitle: String,
  textContent: { type: String, default: '是否应用修改？' },
  isShow: { type: Boolean, default: false },
  isUpdate: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  updateRes: Boolean,
});

const emits = defineEmits(['update:isShow', 'sure', 'cancel']);

const router = useRouter();
const enterUpdate = ref(false);
const updateSuc = ref(false);
const updateStep = ref(0);
const updating = ref(false);
const text = ['进入升级模式', '连接', '升级', '确认'];

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

watch(
  () => updateRes,
  (newVal) => {
    // console.log('update res is:>>>>>>>>', updateRes);
    if (newVal) {
      updateSuc.value = true;
    }
  },
);

// 组件卸载时确保移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('wheel', preventBackgroundScroll);
});

const onSure = () => {
  if (updateRes) {
    router.push({
      path: '/',
      replace: true,
    });
    return;
  }
  if (updating.value) return;
  if (!isUpdate) {
    updateStep.value = 0;
    emits('update:isShow', false); // 更新父组件的状态
  }

  let keyCode;
  if (!updateStep.value) {
    keyCode = 'enterBoot';
  } else if (updateStep.value === 1) {
    keyCode = 'reconnect';
  } else if (updateStep.value === 2) {
    keyCode = 'update';
    updating.value = true;
    enterUpdate.value = true;
  }
  updateStep.value++;
  emits('sure', keyCode);
};

const onCancel = () => {
  updateStep.value = 0;
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
    width: var(--size-600);
    height: var(--size-300);
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: calc(var(--size-300) * -1);
    margin-top: calc(var(--size-150) * -1);
    background-image: url('@/assets/images/dialog_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;

    h3 {
      font-size: var(--font-size-18);
      font-weight: 500;
      color: #ffffff;
      font-family: 'CN Heavy';
      margin-left: var(--spacing-65);
      margin-top: var(--spacing-15);
    }

    p {
      width: var(--size-440);
      height: var(--size-160);
      margin: var(--spacing-25) 0 0 var(--spacing-80);
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: var(--font-size-18);
      font-family: 'CN Heavy';
      color: #ffffff;
      white-space: pre-line;
      // overflow-y: scroll;
    }

    .update-progress {
      width: 100%;
      height: var(--size-10);
      position: absolute;
      bottom: var(--spacing-80);
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;

      &::before {
        content: '';
        width: calc(var(--size-510) - var(--spacing-3));
        height: var(--size-17);
        background-image: url('@/assets/images/update_progress_bd.svg');
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        top: calc(var(--spacing-3) * -1);
        left: var(--spacing-36);
      }

      span {
        display: inline-block;
        font-size: var(--font-size-10);
        font-family: 'CN Heavy';
        color: #fff;
        margin-left: var(--spacing-5);
      }

      ::v-deep(.el-progress-bar) {
        width: var(--size-500);
      }
    }

    .btn-group {
      display: flex;
      overflow: hidden;

      .sure-btn,
      .update-btn,
      .cancel-btn {
        width: var(--size-170);
        height: var(--size-40);
        font-size: var(--font-size-22);
        font-family: 'CN Heavy';
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        background-image: url('@/assets/images/save_bg.svg');
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        bottom: var(--spacing-20);

        img {
          width: var(--size-20);
          height: var(--size-20);
          object-fit: fill;
          margin: 0 var(--spacing-10) 0 var(--spacing-10);
        }

        span {
          display: inline-block;
          width: calc(var(--size-120) - var(--spacing-5));
          text-align: center;
        }

        .update-img {
          margin-right: 0;
        }
        .update-text {
          display: inline-block;
          width: var(--size-120);
          height: var(--size-30);
          text-align: center;
          font-size: var(--font-size-20);
          margin-left: var(--spacing-13);
        }
      }
      .reconnect {
        width: var(--size-100);
        height: var(--size-50);
        background-color: skyblue;
        margin: var(--spacing-50) var(--spacing-10) 0 0;
      }

      .sure-btn,
      .update-btn {
        left: var(--spacing-60);
      }

      .cancel-btn {
        left: calc(var(--size-400) - var(--size-30));
      }
    }

    .update-tip {
      margin: 0;
      width: var(--size-600);
      text-align: center;
      position: absolute;
      left: 0;
    }
  }
}
</style>
