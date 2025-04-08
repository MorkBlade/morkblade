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
    console.log('update res is:>>>>>>>>', updateRes);
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

    h3 {
      font-size: 18px;
      font-weight: 500;
      color: #ffffff;
      font-family: 'CN Heavy';
      margin-left: 65px;
      margin-top: 15px;
    }

    p {
      width: 440px;
      height: 160px;
      margin: 25px 0 0 80px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-family: 'CN Heavy';
      color: #ffffff;
      white-space: pre-line;
      // overflow-y: scroll;
    }

    .update-progress {
      width: 100%;
      height: 10px;
      position: absolute;
      bottom: 80px;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;

      &::before {
        content: '';
        width: 507px;
        height: 17px;
        background-image: url('@/assets/images/update_progress_bd.svg');
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        top: -3px;
        left: 36px;
      }

      span {
        display: inline-block;
        font-size: 10px;
        font-family: 'CN Heavy';
        color: #fff;
        margin-left: 5px;
      }

      ::v-deep(.el-progress-bar) {
        width: 500px;
      }
    }

    .btn-group {
      display: flex;
      overflow: hidden;

      .sure-btn,
      .update-btn,
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
          margin: 0 10px 0 10px;
        }

        span {
          display: inline-block;
          width: 125px;
          text-align: center;
        }

        .update-img {
          margin-right: 0;
        }
        .update-text {
          display: inline-block;
          width: 120px;
          height: 30px;
          text-align: center;
          font-size: 20px;
          margin-left: 13px;
        }
      }
      .reconnect {
        width: 100px;
        height: 50px;
        background-color: skyblue;
        margin: 50px 10px 0 0;
      }

      .sure-btn,
      .update-btn {
        left: 60px;
      }

      .cancel-btn {
        left: 370px;
      }
    }

    .update-tip {
      margin: 0;
      width: 600px;
      text-align: center;
      position: absolute;
      left: 0;
    }
  }
}
</style>
