<template>
  <div class="connect">
    <div class="connect-header">
    </div>
    <div class="connect-title">
      <h1>{{ $t('connect.connectTip1') }}</h1>
      <span>{{ $t('connect.connectTip2') }}</span>
      <p @click="handleDeviceStoreClick">
        <img src="@/assets/images/link2.svg" alt="" />
        {{ $t('connect.connectKeyBoard') }}
      </p>
    </div>
    <div class="connect-guide">
      <div class="guide-item">
        <p>{{ $t('connect.connectStep1') }}</p>
        <img class="guide-item__icon1" src="@/assets/images/guide1.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          {{ $t('connect.step1') }}
        </div>
      </div>
      <img class="next_icon" src="@/assets/images/next_step.svg" alt="" />
      <div class="guide-item">
        <p>{{ $t('connect.connectStep2') }}</p>
        <img class="guide-item__icon2" src="@/assets/images/guide2.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          {{ $t('connect.step2') }}
        </div>
      </div>
      <img class="next_icon" src="@/assets/images/next_step.svg" alt="" />
      <div class="guide-item">
        <p>{{ $t('connect.connectStep3') }}</p>
        <img class="guide-item__icon3" src="@/assets/images/guide3.svg" alt="" />
        <div class="step">
          <img src="@/assets/images/sure.svg" alt="" />
          {{ $t('connect.step3') }}
        </div>
      </div>
    </div>
    <div class="update-box" v-if="isUpdate">
      <div>
        <p>{{ $t('connect.upgradeMode') }}</p>
        <span>{{ $t('connect.upgradeing') }}</span>
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
import services from '@/services/index.js';
import { useAppStore, useDeviceStore } from '@/stores';
import { scaleValue } from '@/utils/responsive.js';
import { showMessage } from '@/utils/message';
import { httpService } from '@/http/api/index.js';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { requestHIDDevice, connectToDevice, checkHIDSupport } from '@/utils/hid-helper.js';
// import { Loading } from '@/utils/loading.js';

const { t } = useI18n();
const router = useRouter();
const deviceStore = useDeviceStore();
const appStore = useAppStore();

const isUpdate = ref(false);
const progress = ref(0);

// 连接按钮点击事件
const handleDeviceStoreClick = async () => {  
  const device = await requestHIDDevice();
  const result = await deviceStore.connectDevice();
  console.log('连接结果: ', result);
  const version = deviceStore.devices[0]?.usagePage === 65440 ? 'v1' : 'v2';
  localStorage.setItem('keyboardVersion', version);
  if (appStore.baseInfo?.KeyboardRunMode === 255) {
    isUpdate.value = true;
    if (version === 'v2') {
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
            showMessage(t('settings.updateSuccess'), 'success');
          }
          await deviceStore.connectDevice();
        } catch (error) {
          console.log('update failed----------->', error);
          showMessage(t('settings.updateFailed'), 'warning');
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
    console.error(t('connect.error'), error.response || error);
  }
};
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
