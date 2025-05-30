<template>
  <div class="settings-container">
    <div class="settings-center">
      <div class="device-info">
        <p>设备信息</p>
        <div class="content-box">
          <span>设备名称:</span>
          <span>{{ keyboardName }}</span>
        </div>
        <div class="content-box">
          <span>序列号:</span>
          <span>{{ KeyboardSN }}</span>
        </div>
      </div>
      <div class="firmware-version">
        <p>固件信息</p>
        <div class="content-box">
          <span>固件版本:</span>
          <span>{{ appVersion }}</span>
        </div>
        <div class="content-box">
          <span>固件日期:</span>
          <span>{{ appVersionTime }}</span>
        </div>
      </div>
      <div class="device-set">
        <p>设备设置</p>
        <div class="rate-of-return">
          <span>回报率切换:</span>
          <dropMenu
            :max-height="320"
            :items="RateOfReturnList"
            :special-index="selectedRateIdx"
            @sendSelectedIdx="handleSelectedRate"
          />
        </div>
        <div class="reset-box">
          <span>恢复出厂设置:</span>
          <div
            class="save-btn"
            :class="{ 'is-active': restBtnStatus }"
            @click="handleRecover"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
          >
            <img src="@/assets/images/reset_icon.svg" alt="" />
            <span>恢复出厂设置</span>
          </div>
        </div>
      </div>
      <div class="firmware-set">
        <p>固件设置</p>
        <div class="firmware-update">
          <div class="firmware-update__choose-version">
            <!-- <template v-if="!isVersion2">
              <span>在线升级:</span>
              <dropMenu :max-height="180" :items="firmwareVersionList" @sendSelectedIdx="handleSelectedVer" />
            </template> -->
            <template v-if="isVersion2">
              <span>在线升级:</span>
              <div class="online-upload" :class="{ loading }" @click="handleOnlineUpdate">
                <span :class="{ hasFile: bindData.length > 0 && onlineUpload }">
                  {{ bindData.length > 0 && onlineUpload ? '已下载固件' : '点击下载固件' }}
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
              <span :style="{ marginLeft: `${scaleValue(20)}px` }">本地升级:</span>
              <el-upload
                ref="uploadRef"
                class="uploader"
                :class="{ loading }"
                :limit="1"
                :auto-upload="false"
                :disabled="loading"
                accept=".bin"
                :on-exceed="handleExceed"
                :on-remove="handleRemove"
                :on-change="handleFileChange"
              >
                <div class="uploader-text" :class="{ hasFile: bindData.length > 0 && !onlineUpload }">
                  {{ bindData.length > 0 && !onlineUpload ? '重新选择' : '选择固件' }}
                </div>
                <!-- v-if="loading" progress-->
                <div class="uploader-progress" v-if="loading && !onlineUpload">
                  <el-progress :percentage="progress.current" :color="'#91bc00'" />
                </div>
              </el-upload>
            </template>
            <template v-if="!isVersion2">
              <!-- <span :style="{ marginLeft: `${scaleValue(20)}px` }">子版本选择:</span> -->
              <span :style="{ marginLeft: `${scaleValue(20)}px` }">在线升级:</span>
              <!-- :disabled="firmwareVerIdx === null" -->
              <dropMenu :max-height="135" :items="subVersionList" @sendSelectedIdx="handleSelectedSubVer" />
            </template>
          </div>
          <template v-if="isVersion2 && bindData.length > 0">
            <div>
              <span>固件更新:</span>
              <div class="update-btn" @click="startUpdate">
                <img src="@/assets/images/update_icon.svg" alt="" />
                <span>{{ loading ? '升级中...' : '升级固件' }}</span>
              </div>
            </div>
          </template>
          <template v-if="!isVersion2 && subVersionIdx !== null">
            <div>
              <span>固件更新:</span>
              <div
                class="update-btn"
                :class="{ 'is-active': updateBtnStatus }"
                @click="updateFirware"
                @mouseenter="onMouseEnter('firmware')"
                @mouseleave="onMouseLeave('firmware')"
              >
                <img src="@/assets/images/update_icon.svg" alt="" />
                <span>升级固件</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="update-log">
      <p>固件更新日志</p>
      <div class="outer-box">
        <div class="inter-box">
          <div>
            <span>版本号:</span>
            <span>{{ '--' }}</span>
          </div>
          <div>
            <span>发布日期:</span>
            <span>{{ '--' }}</span>
          </div>
          <div>
            <span>升级日志:</span>
            <span>{{ '--' }}</span>
          </div>
        </div>
        <div class="inter-box">
          <div>
            <span>版本号:</span>
            <span>{{ '--' }}</span>
          </div>
          <div>
            <span>发布日期:</span>
            <span>{{ '--' }}</span>
          </div>
          <div>
            <span>升级日志:</span>
            <span>{{ '--' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <mDialog
    v-model:isShow="isShow"
    :isUpdate="isUpdate"
    :dialogTitle="updateTitle"
    :textContent="textContent"
    :progress="progress.current"
    :updateRes="updateRes"
    @sure="onSure"
    @cancel="onCancel"
  />
</template>

<script setup>
import services from '@/services/index.js';
import emitter from '@/utils/app-emitter';
import { scaleValue } from '@/utils/responsive.js';
import { showMessage } from '@/utils/message';
import { genFileId } from 'element-plus';
import { useAppStore, useDeviceStore, usePerformanceStore, useKeyboardStore, useMacroStore } from '@/stores';
import { useAdvancedHook, useLightingHook } from '@/hooks';
import { httpService } from '@/http/api/index.js';

import mDialog from '@/components/dialog.vue';
import dropMenu from '@/components/drop-menu.vue';

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

// 按钮状态
const restBtnStatus = ref(false);
const updateBtnStatus = ref(false);
const updateRes = ref(null);

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
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const urlList = ['/bin-data/update_esports.bin', '/bin-data/update_highlight.bin', '/bin-data/update_beta.bin'];

const keyboardName = computed(() => {
  if (!isVersion2.value) {
    const device = deviceStore.devices.find(
      // (item) => item.usagePage === 65440 && item.vendorId === 7331 && item.productId === 257,
      (item) => item.usagePage === 65440,
    );
    return device?.productName || '--';
  } else {
    const device = deviceStore.devices.find(
      // (item) => item.usagePage === 65456 && item.vendorId === 7334 && item.productId === 5380,
      (item) => item.usagePage === 65456,
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

onMounted(async () => {
  const rate = await performanceStore.getRateOfReturn(isVersion2.value);
  selectedRateIdx.value = rate;
});

const subVersionList = computed(() => {
  return ['电竞版', '高亮版', '测试版'];
});

const firmwareVersionList = computed(() => {
  return ['V1.0.8(最新)', 'V1.0.7', 'V1.0.6', 'V1.0.5'];
});

const RateOfReturnList = computed(() => {
  return ['8KHz', '4KHz', '2KHz', '1KHz', '500Hz', '250Hz', '125Hz'];
});

const handleSelectedRate = (idx, ite) => {
  console.log('handleSelectedRate:', idx, ite);
  performanceStore.setRateOfReturn(idx, ite, isVersion2.value);
};

const handleSelectedSubVer = (idx) => {
  subVersionIdx.value = idx;
};

const handleRecover = () => {
  textContent.value = '是否恢复出厂设置？';
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
  textContent.value = `1.点击开始升级后键盘会进入BOOT模式，\n连接BOOT设备后开始升级。\n2.升级过程中请不要关闭窗口\n3.升级完成后点击确认会重新连接键盘`;
  updateTitle.value = '固件升级';
  updateRes.value = null;
  isUpdate.value = true;
  updateBtnStatus.value = false;
  isShow.value = true;
  eventType.value = 'update';
};

const onSure = async (keyCode) => {
  if (eventType.value === 'rest') {
    await deviceStore.factoryDataReset(isVersion2.value);
  } else {
    // console.log('asdasdasd', keyCode);
    // if (keyCode === 'enterBoot') {
    //   toBoot();
    // } else if (keyCode === 'reconnect') {
    //   reconnect();
    // } else if (keyCode === 'update' && keyboardRunMode.value !== 255) {
    getFirmWarePack(urlList[subVersionIdx.value]);
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
            console.log('current: ', current);
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
            showMessage('升级成功！');
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
          showMessage('设备未连接或升级中断，请重试', 'warning');
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
      console.log("file.name.toLowerCase().endsWith('.bin')", file.name.toLowerCase().endsWith('.bin'));
      const reader = new FileReader();
      selectedFile.value = file;
      fileList.value = files;
      reader.onload = (evt) => {
        const arrayBuffer = evt.target.result;
        bindData.value = new Uint8Array(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else {
      showMessage('请选择正确的固件文件（.bin）', 'warning');
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
    showMessage('请先选择固件文件', 'warning');
    return;
  }

  try {
    emitter.emit('isUpdate', true);
    uploadRef.value?.clearFiles();
    updating.value = true;
    loading.value = true;
    // updateProgress.value = 0;
    progress.value = 0;

    // await showMessage('loading', UPDATE_STEPS.ENTER_BOOT);
    // await deviceStore.appToBoot();
    // await delay(4000);

    // await showMessage('loading', UPDATE_STEPS.CONNECT);
    // const device = await deviceStore.connectDevice();
    // if (!device) {
    //   throw new Error('连接超时，请检查设备是否正确连接');
    // }

    // await showMessage('loading', UPDATE_STEPS.UPDATING);
    const res = await deviceStore.updateDevice(bindData.value, ({ percentage }) => {
      updateDisplayProgress(percentage);
    });

    if (!res) {
      showMessage('升级失败，请重试', 'warning');
      throw new Error('固件更新失败');
    }

    // 调整重启设备的消息顺序
    // await showMessage('loading', UPDATE_STEPS.RESTARTING);
    // await deviceStore.bootToApp();
    // await delay(1500);
    // await deviceStore.connectDevice();
    // await delay(1000); // 给一点时间显示重启消息

    // 成功提示
    // if (loadingId.value !== null) {
    //   MessagePlugin.close(loadingId.value);
    //   await delay(100);
    // }
    // await showMessage('success', '更新成功');
    showMessage('升级成功');
    await deviceStore.getDoubleLighting();
    await appStore.getConfigID(isVersion2.value);
    await appStore.getBaseInfo(isVersion2.value);
    emitter.emit('isUpdate', false);
    await delay(1000);

    resetStates();
    regainKeyboardData();
  } catch (error) {
    console.error('更新失败:', error);
    // if (loadingId.value !== null) {
    //   MessagePlugin.close(loadingId.value);
    //   await delay(100);
    // }
    // await showMessage('error', error.message || '更新失败，请重试');
    showMessage('升级失败，请重试', 'warning');
    resetStates();
    regainKeyboardData();
  } finally {
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
    console.log('remove macro data');
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
    console.log('handleOnlineUpdate', res, params);
    if (res && res.firmware.firmware_name.toLowerCase().endsWith('.bin')) {
      selectedFile.value = res;
      await getOnlineFirmWarePack(res.firmware.firmware_file);
    }
  } catch (error) {
    console.error('错误:', error.response || error);
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
        console.log('arrayBuffer: ', arrayBuffer);
        bindData.value = new Uint8Array(arrayBuffer);
        console.log('arrayBuffer: ', bindData.value);
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch((error) => {
      console.error('Error fetching the .bin file:', error);
    });
};
</script>

<style scoped lang="scss">
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-size: var(--font-size-15);
  font-family: 'CN Heavy';
  color: #cccccc;
  position: absolute;
  left: 0;
  top: var(--spacing-150);

  .settings-center {
    width: var(--size-1500);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: var(--spacing-25);
  }

  .device-info,
  .firmware-version,
  .device-set,
  .firmware-set {
    width: var(--size-700);
    height: var(--setting-item-height);
    margin-bottom: var(--spacing-30);
    background-image: url('@/assets/images/settings_bg1.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    box-sizing: border-box;
  }

  .update-log {
    width: var(--size-1500);
    height: var(--size-200);
    border-radius: var(--size-20);
    border: var(--spacing-3) solid rgb(37, 37, 37);
    box-sizing: border-box;
    background-color: #000000;
  }

  p {
    margin: var(--spacing-20) 0 var(--spacing-15) var(--spacing-30);
    font-size: var(--font-size-15);
    font-family: 'CN Heavy';
    color: #cccccc;
  }

  .reset-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--spacing-20);
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      font-size: var(--font-size-16);
    }
  }

  .content-box {
    display: flex;
    justify-content: center;
    font-size: var(--font-size-16);
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      margin-top: var(--spacing-20);
    }
    & span:first-child {
      margin-right: var(--spacing-10);
    }
  }

  .firmware-update {
    margin-top: var(--spacing-20);
    font-family: 'CN Heavy';
    color: #ffffff;

    &__choose-version {
      display: flex;
      align-items: center;
      justify-content: center;

      > span {
        font-size: var(--font-size-16);
      }

      & .online-upload {
        width: var(--size-200);
        height: var(--size-40);
        box-sizing: border-box;
        margin: 0 var(--spacing-10);
        text-align: center;
        // line-height: var(--size-40);
        border-radius: var(--spacing-10);
        border: var(--spacing-2) solid rgb(37, 37, 37);
        cursor: pointer;
        position: relative;

        > span {
          display: inline-block;
          margin-top: var(--spacing-6);
          transition: all 0.2s ease-in-out;
          &.hasFile {
            margin-top: 0;
          }
        }

        & .online-pack-name {
          color: #ccc;
          font-size: 10px;
          margin: 0;
        }

        ::v-deep(.el-progress__text) {
          text-align: left;
        }
      }
    }

    & div + div {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: var(--spacing-20);
    }
    .loading {
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
    }

    .uploader {
      width: var(--size-200);
      height: var(--size-40);
      margin: 0 var(--spacing-10);
      display: flex;
      align-items: center;
      flex-direction: column;
      box-sizing: border-box;
      border-radius: var(--spacing-10);
      border: var(--spacing-2) solid rgb(37, 37, 37);
      position: relative;

      &-text {
        margin-top: var(--spacing-6);
        transition: all 0.2s ease-in-out;
        &.hasFile {
          margin-top: 0;
        }
      }

      &-progress {
        width: 100%;
        margin-left: var(--spacing-18);
        position: absolute;
        bottom: 0;

        ::v-deep(.el-progress-bar) {
          width: var(--size-120);
        }
      }
    }
    ::v-deep(.el-upload:focus) {
      // display: none;
      color: rgb(255, 255, 255);
    }
    ::v-deep(.el-upload-list) {
      // display: none;
      width: var(--size-200);
      margin-top: calc(var(--spacing-8) * -1);
    }
    ::v-deep(.el-icon) {
      display: none;
    }
    ::v-deep(.el-upload-list__item:hover) {
      background: none;
    }
    ::v-deep(.el-upload-list__item-file-name) {
      font-size: var(--font-size-10);
    }
  }

  .rate-of-return {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      font-size: var(--font-size-16);
    }
  }
  .cover-list {
    width: var(--size-170);
    height: var(--size-40);
    margin-left: var(--spacing-10);
    display: flex;
    align-items: center;
    background-image: url('@/assets/images/select_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    cursor: pointer;

    .change-icon {
      width: var(--size-20);
      height: var(--size-20);
      object-fit: fill;
      margin-left: calc(var(--spacing-10) + var(--spacing-1));
    }
    .down-icon {
      width: var(--size-13);
      height: var(--size-8);
      object-fit: fill;
      transition: transform 0.3s ease-in-out;
    }

    span {
      border: none;
      color: #fff;
      display: inline-block;
      margin: var(--spacing-8) 0 0 var(--spacing-16);
      height: calc(var(--spacing-30) + var(--spacing-1));
      font-size: var(--font-size-18);
      font-family: 'CN Heavy';
      margin: var(--spacing-5) var(--spacing-10) 0 var(--spacing-40);
    }

    .drop-list {
      position: absolute;
      top: var(--spacing-45);
      left: var(--spacing-4);
      z-index: 2;
      box-sizing: border-box;
      padding-right: var(--spacing-5);
      overflow-y: scroll;
      transition: height 0.3s ease;
      background-color: #000;

      ul {
        list-style-type: none;
        li {
          width: var(--size-160);
          height: var(--size-40);
          padding: var(--spacing-10);
          text-align: center;
          margin-bottom: var(--spacing-5);
          color: #fff;
          font-family: 'CN Heavy';
          background-image: url('@/assets/images/item_bg.svg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .checked-item {
          background-image: url('@/assets/images/item_bg_checked.gif');
        }
      }
    }

    /* 滚动条整体样式 */
    .drop-list::-webkit-scrollbar {
      height: var(--spacing-10);
      width: var(--spacing-5);
    }

    /* 滚动条轨道 */
    .drop-list::-webkit-scrollbar-track {
      background: transparent;
    }

    /* 滚动条手柄 */
    .drop-list::-webkit-scrollbar-thumb {
      background: rgb(37, 37, 37);
    }

    /* 隐藏滚动条 */
    .drop-list::-webkit-scrollbar {
      display: none;
    }

    /* 当容器被悬停时显示滚动条 */
    .drop-list:hover::-webkit-scrollbar {
      display: block;
    }
  }
  .is-selected {
    background-image: url('@/assets/images/selected_bg.gif');

    span {
      color: #000 !important;
    }
  }

  .save-btn,
  .update-btn {
    width: var(--size-170);
    height: var(--size-40);
    margin-left: var(--spacing-10);
    background-image: url('/src/assets/images/save_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    cursor: pointer;

    img {
      width: var(--size-20);
      height: var(--size-20);
      object-fit: fill;
      position: absolute;
      top: var(--spacing-10);
      left: var(--spacing-10);
    }

    span {
      width: calc(var(--size-100) + var(--spacing-9));
      text-align: center;
      font-size: var(--font-size-18);
      color: #fff;
      position: absolute;
      top: var(--spacing-6);
      left: var(--spacing-50);
    }
  }
  .is-active {
    background-image: url('/src/assets/images/save_bgc.svg');
  }

  .outer-box {
    display: flex;

    .inter-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: var(--spacing-10);
      font-size: var(--font-size-16);
      font-family: 'CN Heavy';
      color: #ffffff;

      div {
        margin-bottom: var(--spacing-10);
      }
    }
  }
}
</style>
