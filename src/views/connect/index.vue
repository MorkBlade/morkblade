<template>
  <div class="connect">
    <div class="connect-header">
      <!-- <img class="connect-logo" src="@/assets/images/banner-logo.png" alt="banner-logo" /> -->
      <!-- <div class="connect-operate">
        <button>FAQ</button>
        <span>中&nbsp;文</span>
        <span>English</span>
      </div> -->
    </div>
    <div class="connect-title">
      <h1>欢迎来到 MORK BLADE</h1>
      <span>仅需三步, 轻松配置您的键盘</span>
      <p @click="handleDeviceStoreClick">
        <img src="@/assets/images/link2.svg" alt="" />
        连接键盘
      </p>
    </div>
    <div class="connect-guide">
      <div class="guide-item">
        <p>点击连接键盘按钮</p>
        <img class="guide-item__icon1" src="@/assets/images/guide1.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          STEP1
        </div>
      </div>
      <img class="next_icon" src="@/assets/images/next_step.svg" alt="" />
      <div class="guide-item">
        <p>允许访问设备</p>
        <img class="guide-item__icon2" src="@/assets/images/guide2.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          STEP2
        </div>
      </div>
      <img class="next_icon" src="@/assets/images/next_step.svg" alt="" />
      <div class="guide-item">
        <p>开始配置键盘</p>
        <img class="guide-item__icon3" src="@/assets/images/guide3.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          STEP3
        </div>
      </div>
    </div>
    <div v-if="isUpdate" class="update-box">
      <!-- <div class="update-box"> -->
      <div>
        <span>升级中...</span>
        <el-progress
          :percentage="progress"
          :color="'#91bc00'"
          :stroke-width="16"
          :text-inside="true"
          :text-color="'#000 !important'"
        ></el-progress>
      </div>
    </div>
  </div>
</template>

<script setup>
// defineOptions({ name: 'ConnectIndex' });

import services from '@/services/index.js';
import { useAppStore, useDeviceStore } from '@/stores';

const router = useRouter();
const deviceStore = useDeviceStore();
const appStore = useAppStore();

const isUpdate = ref(false);
const progress = ref(0);

// 连接按钮点击事件
const handleDeviceStoreClick = async () => {
  const result = await deviceStore.connectDevice();
  await appStore.getBaseInfo();
  console.log('keyboardRunMode', appStore.baseInfo?.KeyboardRunMode, result);
  if (appStore.baseInfo?.KeyboardRunMode === 255) {
    isUpdate.value = true;
    getFirmWarePack('/api/update_esports.bin');
    return;
  } else {
    if (result) {
      router.push({ name: 'performance' });
    }
  }
};

const getFirmWarePack = async (url) => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

      const reader = new FileReader();
      reader.onload = async function (e) {
        const resultArrayBuffer = reader.result;
        try {
          const result = await services.updateBin(resultArrayBuffer, (data) => {
            const { current, total } = data;
            progress.value = parseFloat(((current / total) * 100).toFixed(2));
            console.log('current and total:>>>', current / total);
          });
          console.log('update suc-------------> ', result);
          // updateRes.value = true;
          // deviceStore.updateSuc = true;
          // setTimeout(() => {
          //   router.push({
          //     path: '/key-calibration',
          //     replace: true,
          //   });
          // }, 2000);
          await deviceStore.connectDevice();
        } catch (error) {
          console.log('update failed----------->', error);
          // updateRes.value = false;
        }
        // 假设 updateFile.raw 是一个 Blob 对象
        // updateFile = { raw: blob };
        // console.log(updateFile.raw);
        isUpdate.value = false;
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch((error) => {
      console.error('Error fetching the .bin file:', error);
    });
};
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
