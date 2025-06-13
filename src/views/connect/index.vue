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
      <h1>{{ $t('messages.connectTip1') }}</h1>
      <span>{{ $t('messages.connectTip2') }}</span>
      <p @click="handleDeviceStoreClick">
        <img src="@/assets/images/link2.svg" alt="" />
        {{ $t('messages.connectKeyBoard') }}
      </p>
    </div>
    <div class="connect-guide">
      <div class="guide-item">
        <p>{{ $t('messages.connectStep1') }}</p>
        <img class="guide-item__icon1" src="@/assets/images/guide1.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          {{ $t('messages.step1') }}
        </div>
      </div>
      <img class="next_icon" src="@/assets/images/next_step.svg" alt="" />
      <div class="guide-item">
        <p>{{ $t('messages.connectStep2') }}</p>
        <img class="guide-item__icon2" src="@/assets/images/guide2.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          {{ $t('messages.step2') }}
        </div>
      </div>
      <img class="next_icon" src="@/assets/images/next_step.svg" alt="" />
      <div class="guide-item">
        <p>{{ $t('messages.connectStep3') }}</p>
        <img class="guide-item__icon3" src="@/assets/images/guide3.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          {{ $t('messages.step3') }}
        </div>
      </div>
    </div>
    <div class="update-box" v-if="isUpdate">
      <!-- <div class="update-box">   -->
      <div>
        <p>升级模式</p>
        <span>正在升级中...</span>
        <el-progress
          :percentage="progress"
          :color="'#91bc00'"
          :stroke-width="scaleValue(16)"
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
import { scaleValue } from '@/utils/responsive.js';
import { showMessage } from '@/utils/message';
import { httpService } from '@/http/api/index.js';

const router = useRouter();
const deviceStore = useDeviceStore();
const appStore = useAppStore();

const isUpdate = ref(false);
const progress = ref(0);

// 连接按钮点击事件
const handleDeviceStoreClick = async () => {
  const result = await deviceStore.connectDevice();
  const version = deviceStore.devices[0]?.usagePage === 65440 ? 'v1' : 'v2';
  localStorage.setItem('keyboardVersion', version);
  await appStore.getBaseInfo();
  // console.log('keyboardRunMode', appStore.baseInfo?.KeyboardRunMode, result);
  if (appStore.baseInfo?.KeyboardRunMode === 255) {
    isUpdate.value = true;
    if (version === 'v2') {
      // TODO 暂未发现v2升级失败进不去驱动
      // await handleOnlineUpdate();
    } else {
      getFirmWarePack('/bin-data/update_esports.bin');
    }
    return;
  } else {
    if (result) {
      router.push({ name: 'performance' });
    }
  }
};

const getFirmWarePack = async (url) => {
  let updateSuc = false;
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
            const curProgress = parseInt((current / total) * 100);
            // console.log('current and total:>>>', curProgress);
            if (updateSuc) return;
            progress.value = curProgress;
            if (curProgress === 100) updateSuc = true;
          });
          console.log('update suc-------------> ', result);
          if (result && result.success) {
            showMessage('升级成功');
          }
          await deviceStore.connectDevice();
        } catch (error) {
          console.log('update failed----------->', error);
          showMessage('升级失败，请重试', 'warning');
        }
        isUpdate.value = false;
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch((error) => {
      console.error('Error fetching the .bin file:', error);
    });
};

const handleOnlineUpdate = async () => {
  try {
    const boardId = deviceStore.info?.boardId.toString(16).padStart(8, '0');
    const vid = deviceStore.device?.vendorId.toString(16).padStart(4, '0');
    const pid = deviceStore.device?.productId.toString(16).padStart(4, '0');
    const params = { board_id: boardId, vid, pid };
    console.log('params:', params);
    // const res = await httpService.getFirmwarePack({ board_id: '00150004', vid: '1CA6', pid: '1504' });
    const res = await httpService.getFirmwarePack(params);
    // console.log('getFirmwarePack res: ', res, params);
    // if (res && res.firmware.firmware_name.toLowerCase().endsWith('.bin')) {
    //   console.log('获取到升级bin包');
    //   selectedFile.value = res;
    //   await getFirmWarePack(res.firmware.firmware_file);
    // }
  } catch (error) {
    console.error('错误:', error.response || error);
  }
};
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
