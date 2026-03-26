<template>
  <div class="settings-container">
    <div class="settings-center">
      <div class="device-info">
        <p>{{ t('settings.deviceInfo') }}</p>
        <div class="content-box">
          <span>{{ t('settings.deviceName') }}:</span>
          <span>{{ keyboardName }}</span>
        </div>
        <div class="content-box">
          <span>{{ t('settings.deviceSN') }}:</span>
          <span>{{ KeyboardSN }}</span>
        </div>
      </div>
      <div class="firmware-version">
        <p>{{ t('settings.firmwareInfo') }}</p>
        <div class="content-box">
          <span>{{ t('settings.firmwareVersion') }}:</span>
          <span>{{ appVersion }}</span>
        </div>
        <div class="content-box">
          <span>{{ t('settings.firmwareDate') }}:</span>
          <span>{{ appVersionTime }}</span>
        </div>
      </div>
      <div class="device-set">
        <p>{{ t('settings.deviceSetting') }}</p>
        <div class="set-box">
          <div class="grid-item rate-of-return">
            <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('settings.returnRateSwitch') }}:</span>
            <dropMenu :max-height="320" :items="RateOfReturnList" :special-index="selectedRateIdx"
              @sendSelectedIdx="handleSelectedRate" />
          </div>
          <div class="grid-item reset-box">
            <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('settings.factoryReset') }}:</span>
            <div class="save-btn" :class="{ 'is-active': restBtnStatus }" @click="handleRecover"
              @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
              <img src="@/assets/images/reset_icon.svg" alt="" />
              <span class="reset-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('settings.factoryReset')
                }}</span>
            </div>
          </div>

          <template v-if="appStore.isThreeMode">
            <div class="grid-item sleep-time">
              <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('settings.shallowSleepTime') }}:</span>
              <dropMenu :max-height="220" :items="sleepTimeList" :special-index="selectedShallowSleepTimeIdx"
                @sendSelectedIdx="handleSelectedShallowSleepTime" />
            </div>

            <div class="grid-item sleep-time">
              <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('settings.deepSleepTime') }}:</span>
              <dropMenu :max-height="220" :items="sleepTimeList" :special-index="selectedDeepSleepTimeIdx"
                @sendSelectedIdx="handleSelectedDeepSleepTime" />
            </div>
          </template>
        </div>
      </div>
      <div class="firmware-set">
        <p>{{ t('settings.firmwareSetting') }}</p>
        <div class="firmware-update">
          <div class="firmware-update__choose-version">
            <template v-if="isVersion2">
              <span class="online-update-text" style="display: flex;" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{
                t('settings.onlineUpdate') }}:</span>
              <div class="online-upload" :class="{ loading }" @click="handleOnlineUpdate">
                <span class="online-download-text" :class="{ hasFile: bindData.length > 0 && onlineUpload }"
                  v-ellipsis-marquee="{ duration: 5, gap: 24 }">
                  {{ bindData.length > 0 && onlineUpload ? t('settings.downloadedFirmware') :
                  t('settings.clickDownloadFirmware') }}
                </span>
                <!-- v-if="loading" progress-->
                <p class="online-pack-name" v-if="!loading && onlineUpload">
                  {{ selectedFile ? selectedFile.name + '_' + selectedFile.firmware.firmware_version : '' }}
                </p>
                <div class="uploader-progress" v-if="loading && onlineUpload">
                  <el-progress :percentage="progress.current" :color="'#91bc00'" />
                </div>
              </div>
            </template>
            <template v-if="isVersion2">
              <span :style="{ marginLeft: `${scaleValue(20)}px` }" class="localUpdate-btn"
                v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ t('settings.localUpdate') }}:</span>
              <el-upload ref="uploadRef" class="uploader" :class="{ loading }" :limit="1" :auto-upload="false"
                :disabled="loading" accept=".bin" :on-exceed="handleExceed" :on-remove="handleRemove"
                :on-change="handleFileChange">
                <div class="uploader-text" :class="{ hasFile: bindData.length > 0 && !onlineUpload }">
                  {{ bindData.length > 0 && !onlineUpload ? t('settings.reselect') : t('settings.selectFirmware') }}
                </div>
                <!-- v-if="loading" progress-->
                <div class="uploader-progress" v-if="loading && !onlineUpload">
                  <el-progress :percentage="progress.current" :color="'#91bc00'" />
                </div>
              </el-upload>
            </template>
            <template v-if="!isVersion2">
              <!-- <span :style="{ marginLeft: `${scaleValue(20)}px` }">子版本选择:</span> -->
              <span :style="{ marginLeft: `${scaleValue(20)}px` }">{{ t('settings.onlineUpdate') }}:</span>
              <!-- :disabled="firmwareVerIdx === null" -->
              <dropMenu :max-height="135" :items="subVersionList" @sendSelectedIdx="handleSelectedSubVer" />
            </template>
          </div>
          <template v-if="isVersion2 && bindData.length > 0">
            <div>
              <span>{{ t('settings.firmwareUpdate') }}:</span>
              <div class="update-btn" @click="startUpdate">
                <img src="@/assets/images/update_icon.svg" alt="" />
                <span>{{ loading ? t('settings.updating') : t('settings.updateFirmware') }}</span>
              </div>
            </div>
          </template>
          <template v-if="!isVersion2 && subVersionIdx !== null">
            <div>
              <span>{{ t('settings.firmwareUpdate') }}:</span>
              <div class="update-btn" :class="{ 'is-active': updateBtnStatus }" @click="updateFirware"
                @mouseenter="onMouseEnter('firmware')" @mouseleave="onMouseLeave('firmware')">
                <img src="@/assets/images/update_icon.svg" alt="" />
                <span>{{ t('settings.updateFirmware') }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="update-log">
      <p>{{ t('settings.updateLog') }}</p>
      <div class="outer-box">
        <template v-if="isVersion2">
          <div class="inter-box" v-for="item in UPDATE_LOG_V2" :key="item.version"
            @click.stop="handleSelectedVerInfo(item.version)">
            <div>
              <span>{{ t('settings.firmwareVersionNumber') }}:</span>
              <!-- <span>{{ item.version }}</span> -->
              <span>{{ appVersion }}</span>
            </div>
            <div>
              <span>{{ t('settings.releaseDate') }}:</span>
              <!-- <span>{{ item.date }}</span> -->
              <span>{{ appVersionTime }}</span>
            </div>
            <img src="@/assets/images/right_expand.svg" alt="" />
            <div class="update-changes" v-if="item.version === showVersion">
              <h4>{{ t('settings.updateContent') }}</h4>
              <ul>
                <li v-for="(item, index) in item.changes" :key="index">{{ item }}</li>
              </ul>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="inter-box" v-for="item in UPDATE_LOG_V1" :key="item.version"
            @click.stop="handleSelectedVerInfo(item.version)">
            <div>
              <span>{{ t('settings.firmwareVersionNumber') }}:</span>
              <span>{{ item.version }}</span>
            </div>
            <div>
              <span>{{ t('settings.releaseDate') }}:</span>
              <span>{{ item.date }}</span>
            </div>
            <img src="@/assets/images/right_expand.svg" alt="" />
            <div class="update-changes" v-if="item.version === showVersion">
              <h4>{{ t('settings.updateContent') }}</h4>
              <ul>
                <li v-for="(item, index) in item.changes" :key="index">{{ item }}</li>
              </ul>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  <mDialog v-model:isShow="isShow" :isUpdate="isUpdate" :dialogTitle="updateTitle" :textContent="textContent"
    :progress="progress.current" :updateRes="updateRes" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import services from '@/services/index.js';
import emitter from '@/utils/app-emitter';
import { scaleValue } from '@/utils/responsive.js';
import { showMessage } from '@/utils/message';
import { genFileId, ElLoading } from 'element-plus';
import { updateLog_zh_CN, updateLog_en_US, updateLog_ja_JP } from '@/configs/update-log';
import { useAppStore, useDeviceStore, usePerformanceStore, useKeyboardStore, useMacroStore } from '@/stores';
import { useAdvancedHook, useLightingHook } from '@/hooks';
import { httpService } from '@/http/api/index.js';
import { useI18n } from 'vue-i18n';

import mDialog from '@/components/dialog.vue';
import dropMenu from '@/components/drop-menu.vue';

const { t, locale } = useI18n();
// 更通用的多语言更新日志映射方案，便于后续扩展更多语言
const updateLogLangMap = {
  zh_CN: {
    UPDATE_LOG_V1: updateLog_zh_CN.UPDATE_LOG_V1,
    UPDATE_LOG_V2: updateLog_zh_CN.UPDATE_LOG_V2,
  },
  en_US: {
    UPDATE_LOG_V1: updateLog_en_US.UPDATE_LOG_V1,
    UPDATE_LOG_V2: updateLog_en_US.UPDATE_LOG_V2,
  },
  ja_JP: {
    UPDATE_LOG_V1: updateLog_ja_JP.UPDATE_LOG_V1,
    UPDATE_LOG_V2: updateLog_ja_JP.UPDATE_LOG_V2,
  },
  // 以后新增语言只需在此处添加
};

const currentLogLang = computed(() => locale.value in updateLogLangMap ? locale.value : 'zh_CN');
const UPDATE_LOG_V1 = computed(() => updateLogLangMap[currentLogLang.value].UPDATE_LOG_V1);
const UPDATE_LOG_V2 = computed(() => updateLogLangMap[currentLogLang.value].UPDATE_LOG_V2);

const router = useRouter();
const appStore = useAppStore();
const macroStore = useMacroStore();
const keyboardStore = useKeyboardStore();
const deviceStore = useDeviceStore();
const performanceStore = usePerformanceStore();
const { initLighting } = useLightingHook();
const { getHighLevelKeys } = useAdvancedHook();

const isShow = ref(false); // dialog 显示状态
const isUpdate = ref(false); // dialog 是否显示升级样式
const eventType = ref(null); // update/recover
const textContent = ref(''); // 弹窗提示内容
const updateTitle = ref(''); // dialog 标题

const subVersionIdx = ref(null); // 子版本index
const firmwareVerIdx = ref(null); // 固件版本index
const selectedRateIdx = ref(null); // 回报率index
const selectedShallowSleepTimeIdx = ref(null); // 浅度休眠时间index
const selectedDeepSleepTimeIdx = ref(null); // 深度休眠时间index

// 按钮状态
const restBtnStatus = ref(false);
const updateBtnStatus = ref(false);
const updateRes = ref(null);
const showVersion = ref(''); // 显示的版本号

const uploadRef = ref(null);
const fileList = ref([]);
const selectedFile = ref(null);
const bindData = ref([]);
const updating = ref(false);
// const progress = ref(0); // 升级进度
const loading = ref(false);
const onlineUpload = ref(false); // v2在线升级
const progress = reactive({
  current: 0,
  total: 0,
});
const config = ref(null);
const elLoading = ref(null);
const firmwareList = ref([]);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
// const urlList = ['/bin-data/update_esports.bin', '/bin-data/update_highlight.bin', '/bin-data/update_beta.bin'];
const urlList = [
  '/fw/XS117_KB987_App_v1.1.3.1_20250421a.bin',
  '/fw/XS117_KB987_App_v1.1.3.1_20250421a.bin',
  '/fw/XS117_KB987_App_v1.1.3.1_20250421a.bin',
];
const keyboardName = computed(() => {
  if (!isVersion2.value) {
    const device = deviceStore.devices.find(
      // (item) => item.usagePage === 65440 && item.vendorId === 7331 && item.productId === 257,
      (item) => item.usagePage === 65440,
    );
    return device?.productName || '--';
  } else {
    console.log('isVersion2.value:', deviceStore.devices);
    const device = deviceStore.devices.find(
      // (item) => item.usagePage === 65456 && item.vendorId === 7334 && item.productId === 5380,
      (item) => item.usagePage === 65456 || item.usagePage === 65408,
    );
    return device?.productName || '--';
  }
});
const KeyboardSN = computed(() => appStore.baseInfo?.KeyboardSN || appStore.baseInfo?.sn || '--');
const appVersion = computed(() => appStore.baseInfo?.appVersion || '--');
// const keyboardRunMode = computed(() => appStore.baseInfo?.KeyboardRunMode);
const appVersionTime = computed(() => appStore.baseInfo?.appBuildDate || appStore.baseInfo?.timestamp || '--');

emitter.on('resetData', (flag) => {
  if (flag) {
    regainKeyboardData();
  }
});

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

// 获取三模设备数据的通用函数
const loadThreeModeData = async () => {
  try {
    const [sleepTime] = await Promise.all([
      appStore.getSleepTime(),
    ]);

    if (sleepTime?.shallowSleepTime !== undefined) {
      selectedShallowSleepTimeIdx.value = sleepTimeList.value.findIndex(
        item => item === `${sleepTime.shallowSleepTime}min`
      );
    }
    if (sleepTime?.deepSleepTime !== undefined) {
      selectedDeepSleepTimeIdx.value = sleepTimeList.value.findIndex(
        item => item === `${sleepTime.deepSleepTime}min`
      );
    }
  } catch (error) {
    console.error('获取三模设备数据失败:', error);
  }
};

// 监听 isThreeMode 状态变化
watch(() => appStore.isThreeMode, (newValue) => {
  if (newValue) loadThreeModeData();
}, { immediate: false });

onMounted(async () => {
  // 确保基础信息已初始化，包括 isThreeMode 状态
  await appStore.getBaseInfo(isVersion2.value);

  const rate = await performanceStore.getRateOfReturn(isVersion2.value);
  selectedRateIdx.value = rate;

  if (appStore.isThreeMode) {
    await loadThreeModeData();
  }
  window.addEventListener('click', handleGlobalClick);
  getConfig();
});

const subVersionList = computed(() => {
  return [t('settings.eSportsVersion'), t('settings.highlightVersion'), t('settings.testVersion')];
});

const firmwareVersionList = computed(() => {
  return [t('settings.latestVersion'), t('settings.version7'), t('settings.version6'), t('settings.version5')];
});

const RateOfReturnList = computed(() => {
  return ['8KHz', '4KHz', '2KHz', '1KHz', '500Hz', '250Hz', '125Hz'];
});

// 休眠时间
const sleepTimeList = computed(() => {
  return ['10min', '30min', '60min', '120min', '240min', '360min'];
});


// 处理选中的浅度睡眠时间
const handleSelectedShallowSleepTime = (idx, item) => {
  // 浅度睡眠
  const shallowSleepTime = sleepTimeList.value[idx].slice(0, -3);
  // 深度睡眠
  const deepSleepTime = sleepTimeList.value[selectedDeepSleepTimeIdx.value].slice(0, -3);
  appStore.setSleepTime(shallowSleepTime, deepSleepTime);
};

// 处理选中的深度睡眠时间
const handleSelectedDeepSleepTime = (idx, item) => {
  // 浅度睡眠
  const shallowSleepTime = sleepTimeList.value[selectedShallowSleepTimeIdx.value].slice(0, -3);
  // 深度睡眠
  const deepSleepTime = sleepTimeList.value[idx].slice(0, -3);
  appStore.setSleepTime(shallowSleepTime, deepSleepTime);
};



const getConfig = async () => {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    config.value = data;
    if (data.firmwareList) {
      firmwareList.value = JSON.parse(data.firmwareList.replace(/'/g, '"'));
    }
    console.log('config: ', config.value.firmwareList, firmwareList.value.length);
    // 你可以在这里处理 data，比如 data.firmwareList
  } catch (error) {
    console.error('Error fetching config.json:', error);
  }
};

const handleSelectedRate = (idx, ite) => {
  performanceStore.setRateOfReturn(idx, ite, isVersion2.value);
};

const handleSelectedSubVer = (idx) => {
  subVersionIdx.value = idx;
};

const handleSelectedVerInfo = (version, event) => {
  showVersion.value = showVersion.value === version ? '' : version;
  // console.log('handleSelectedVerInfo version: ', version, showVersion.value);
};

const handleGlobalClick = () => {
  showVersion.value = '';
};

const handleRecover = () => {
  textContent.value = t('settings.recoverConfirm');
  updateTitle.value = '';
  isUpdate.value = false;
  restBtnStatus.value = false;
  isShow.value = true;
  eventType.value = 'rest';
};

const onMouseEnter = (keyCode) => {
  switch (keyCode) {
    case 'firmware':
      updateBtnStatus.value = true;
      break;
    default:
      restBtnStatus.value = true;
      break;
  }
};

const onMouseLeave = (keyCode) => {
  switch (keyCode) {
    case 'firmware':
      updateBtnStatus.value = false;
      break;
    default:
      restBtnStatus.value = false;
      break;
  }
};

const updateFirware = () => {
  textContent.value = t('settings.updateConfirm');
  updateTitle.value = t('settings.updateTitle');
  updateRes.value = null;
  isUpdate.value = true;
  updateBtnStatus.value = false;
  isShow.value = true;
  eventType.value = 'update';
};

const onSure = async (keyCode) => {
  if (eventType.value === 'rest') {
    const res = await deviceStore.factoryDataReset(isVersion2.value);
    if (res) {
      showMessage(t('settings.recoverSuccess'));
    }
  } else {
    // console.log('asdasdasd', keyCode);
    // if (keyCode === 'enterBoot') {
    //   toBoot();
    // } else if (keyCode === 'reconnect') {
    //   reconnect();
    // } else if (keyCode === 'update' && keyboardRunMode.value !== 255) {
    getFirmWarePack(firmwareList.value[subVersionIdx.value]);
    // }
  }
  eventType.value = null;
};

const onCancel = () => {
  isShow.value = false;
};

const toBoot = async () => {
  await services.toBoot();
};

const reconnect = async () => {
  await deviceStore.connectDevice();
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
          emitter.emit('isUpdate', true);
          const result = await services.updateBin(resultArrayBuffer, ({ current, total }) => {
            // console.log('current: ', current);
            if (current === 100) {
              progress.current = 100;
            } else {
              progress.current = parseInt((current / total) * 100);
            }
            progress.total = total;
            // updateStatus.value = status;
          });
          console.log('update suc-------------> ', result);
          if (result.success === true) {
            emitter.emit('isUpdate', false);
            updateRes.value = true;
            deviceStore.updateSuc = true;
            progress.current = 0;
            // isShow.value = false;
            showMessage(t('settings.updateSuccess'));
          }

          // setTimeout(() => {
          //   // 10s后检查是否在进行
          //   if (!progress.value) {
          //     isShow.value = false;
          //     router.push({
          //       path: '/',
          //       replace: true,
          //     });
          //   }
          // }, 10000);
        } catch (error) {
          console.log('update failed----------->', error);
          progress.current = 0;
          updateRes.value = false;
          isShow.value = false;
          showMessage(t('settings.deviceNotConnected'), 'warning');
          setTimeout(() => {
            router.push({
              path: '/',
              replace: true,
            });
          }, 1000);
        }
        // 假设 updateFile.raw 是一个 Blob 对象
        // updateFile = { raw: blob };
        // console.log(updateFile.raw);
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch((error) => {
      console.error('Error fetching the .bin file:', error);
    });
};

/* v2升级 */
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const handleExceed = (files) => {
  uploadRef.value?.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  uploadRef.value?.handleStart(file);
};

const handleRemove = () => {
  // console.log(uploadFile, uploadFiles);
  // console.log('clear');
  bindData.value = [];
};

const handleFileChange = (files) => {
  if (files) {
    const file = files.raw;
    if (file.name.toLowerCase().endsWith('.bin')) {
      // console.log("file.name.toLowerCase().endsWith('.bin')", file.name.toLowerCase().endsWith('.bin'));
      const reader = new FileReader();
      onlineUpload.value = false;
      selectedFile.value = file;
      fileList.value = files;
      reader.onload = (evt) => {
        const arrayBuffer = evt.target.result;
        bindData.value = new Uint8Array(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else {
      showMessage(t('settings.pleaseSelectCorrectFirmware'), 'warning');
      uploadRef.value?.clearFiles();
      fileList.value = selectedFile.value ? [{ raw: selectedFile.value }] : [];
    }
  } else if (fileList.value.length === 0) {
    selectedFile.value = null;
  }
};

const updateDisplayProgress = (targetProgress) => {
  if (targetProgress < progress.value) {
    // updateProgress.value = targetProgress;
    return;
  }
  // console.log('targetProgress:', targetProgress);
  progress.current = Math.max(progress.value, targetProgress);
  // progress.value = targetProgress - 0;
};

const startUpdate = async () => {
  if (!selectedFile.value) {
    showMessage(t('settings.pleaseSelectFirmware'), 'warning');
    return;
  }

  try {
    emitter.emit('isUpdate', true);
    uploadRef.value?.clearFiles();
    updating.value = true;
    loading.value = true;
    // updateProgress.value = 0;
    progress.value = 0;
    elLoading.value = ElLoading.service({
      lock: true,
      text: t('settings.updating'),
      background: 'rgba(0, 0, 0, 0.5)',
      customClass: 'custom-loading',
    });
    const res = await deviceStore.updateDevice(bindData.value, ({ percentage }) => {
      updateDisplayProgress(percentage);
    });
    if (!res) {
      showMessage(t('settings.updateFailed'), 'warning');
      throw new Error(t('settings.updateFailed'));
    }

    // 更新轴体V2
    showMessage(t('settings.updateSuccess'));
    elLoading.value.close();
    resetStates();
    regainKeyboardData();
    await delay(2000);
    emitter.emit('isUpdate', false);
    await deviceStore.getDoubleLighting();
    await appStore.getConfigID(isVersion2.value);
    await appStore.getBaseInfo(isVersion2.value);
    if (isVersion2.value) {
      await performanceStore.getAixsList(isVersion2.value);
    }
  } catch (error) {
    console.error(t('settings.updateFailedMessage'), error);
    elLoading.value.close();
    showMessage(t('settings.updateFailed'), 'warning');
    resetStates();
    regainKeyboardData();
  } finally {
    console.log('upload finally');
    loading.value = false;
  }
};

const resetStates = () => {
  // 重置 loadingId
  // if (loadingId.value !== null) {
  //   MessagePlugin.close(loadingId.value);
  //   loadingId.value = null;
  // }

  // 直接重置每个响应式变量
  updating.value = false;
  loading.value = false;
  // updateProgress.value = 0;
  progress.current = 0;
  progress.total = 0;
  fileList.value = [];
  selectedFile.value = null;
  bindData.value = [];
  uploadRef.value?.clearFiles();
  onlineUpload.value = false;
};

// 选择固件版本
const handleSelectedVer = (idx) => {
  firmwareVerIdx.value = idx;
};

const regainKeyboardData = async () => {
  appStore.getBaseInfo(isVersion2.value);
  // 获取键盘数据
  keyboardStore.checkFnLayer(0);
  await keyboardStore.initKeyboard();
  // await initLighting();
  // const keyboards = await keyboardStore.getKeyLayout({ layer: keyboardStore.fnLayer });
  // console.log('regain keyboards data:', keyboards);
  // 获取性能数据
  // await performanceStore.getPerformance(keyboards);
  // 获取高级键
  // console.log('isVersion2: ', isVersion2.value);
  await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
  if (isVersion2.value) {
    // 获取宏数据
    await macroStore.getMacroAllData();
  } else {
    localStorage.removeItem('localMacros');
  }
};

const handleOnlineUpdate = async () => {
  if (loading.value) return;
  try {
    const boardId = appStore.baseInfo?.boardId.toString(16).padStart(8, '0');
    const vid = deviceStore.device?.vendorId.toString(16).padStart(4, '0');
    const pid = deviceStore.device?.productId.toString(16).padStart(4, '0');
    const params = { board_id: boardId, vid, pid };
    // const res = await httpService.getFirmwarePack({ board_id: '00150004', vid: '1CA6', pid: '1504' });
    const res = await httpService.getFirmwarePack(params);
    resetStates();
    onlineUpload.value = true;
    // console.log('handleOnlineUpdate', res, params);
    if (res && res.firmware.firmware_name.toLowerCase().endsWith('.bin')) {
      selectedFile.value = res;
      await getOnlineFirmWarePack(res.firmware.firmware_file);
    }
  } catch (error) {
    console.error(t('settings.error'), error.response || error);
  }
};

const getOnlineFirmWarePack = async (url) => {
  const relativeUrl = url.replace('https://api.sparklinkplayjoy.com', '');
  fetch(relativeUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        // console.log('arrayBuffer: ', arrayBuffer);
        bindData.value = new Uint8Array(arrayBuffer);
        // console.log('arrayBuffer: ', bindData.value);
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch((error) => {
      console.error('Error fetching the .bin file:', error);
    });
};

onBeforeUnmount(() => {
  if (elLoading.value) {
    elLoading.value.close();
    elLoading.value = null;
  }
  window.removeEventListener('click', handleGlobalClick);
});
</script>

<style scoped lang="scss">
@use './index.scss';
</style>

<style lang="scss">
.custom-loading {
  .el-loading-spinner {
    .circular {
      width: 42px;
      height: 42px;
      animation: loading-rotate 2s linear infinite;
    }

    .el-loading-text {
      color: #91bc00;
      font-size: 16px;
      font-family: 'CN Heavy';
    }
  }

  .el-loading-spinner .path {
    stroke: #91bc00;
  }

}

.online-update-text {
  width: var(--spacing-130);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  text-align: center;
}

.online-download-text {
  width: var(--spacing-130);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  text-align: center;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
