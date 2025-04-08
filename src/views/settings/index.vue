<template>
  <div class="settings-container">
    <div class="settings-center">
      <div class="device-info">
        <p>设备信息</p>
        <div class="content-box">
          <span>设备名称:</span>
          <span>{{ '--' }}</span>
        </div>
        <div class="content-box">
          <span>序列号:</span>
          <span>{{ KeyboardSN || '--' }}</span>
        </div>
      </div>
      <div class="firmware-version">
        <p>固件信息</p>
        <div class="content-box">
          <span>固件版本:</span>
          <span>{{ appVersion || '--' }}</span>
        </div>
        <div class="content-box">
          <span>固件日期:</span>
          <span>{{ '--' }}</span>
        </div>
      </div>
      <div class="device-set">
        <p>设备设置</p>
        <div class="rate-of-return">
          <span>回报率切换:</span>
          <div
            class="cover-list"
            :class="selectedRateItem ? 'is-selected' : ''"
            @click="toggleDropdown('rateofreturn')"
          >
            <img class="change-icon" :src="selectedRateItem ? changedIcon : changeIcon" alt="" />
            <span>{{ selectedRateItem || '请选择' }}</span>
            <img class="down-icon" :src="selectedRateItem ? downIcon : downIcon2" />
            <div class="drop-list" :style="{ height: `${RateDefHeight}px` }">
              <ul>
                <li
                  v-for="(ite, idx) in RateOfReturnList"
                  :key="ite"
                  :class="{ 'checked-item': ite == selectedRateItem }"
                  @click.stop="selectItem(idx, 'rateofreturn')"
                >
                  {{ ite }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="reset-box">
          <span>恢复出厂设置:</span>
          <div
            class="save-btn"
            :class="{ 'is-active': restBtnStatus }"
            @click="recoverRate"
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
        <div class="content-box">
          <span>最新固件版本:</span>
          <span>xxxxxx</span>
        </div>
        <div class="firmware-update">
          <span>固件更新:</span>
          <div
            class="cover-list"
            :class="selectedFirItem !== null ? 'is-selected' : ''"
            @click="toggleDropdown('firmware')"
          >
            <img class="change-icon" :src="selectedFirItem !== null ? changedIcon : changeIcon" alt="" />
            <span>{{ firmwareList[selectedFirItem] || '请选择' }}</span>
            <img class="down-icon" :src="selectedFirItem !== null ? downIcon : downIcon2" />
            <div class="drop-list" :style="{ height: `${firmwareDefHeight}px` }">
              <ul>
                <li
                  v-for="(ite, idx) in firmwareList"
                  :key="ite"
                  :class="{ 'checked-item': idx == selectedFirItem }"
                  @click.stop="selectItem(idx, 'firmware')"
                >
                  {{ ite }}
                </li>
              </ul>
            </div>
          </div>
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
    :progress="progress"
    :updateRes="updateRes"
    @sure="onSure"
    @cancel="onCancel"
  />
</template>

<script setup>
import { useAppStore, useDeviceStore, usePerformanceStore } from '@/stores';
import mDialog from '@/components/dialog.vue';
import { scaleValue } from '@/utils/responsive.js';
import changeIcon from '@/assets/images/change.svg';
import changedIcon from '@/assets/images/changed.svg';
import downIcon from '@/assets/images/down_icon.svg';
import downIcon2 from '@/assets/images/down_icon2.svg';

import services from '@/services/index.js';

const router = useRouter();
const appStore = useAppStore();
const deviceStore = useDeviceStore();
const performanceStore = usePerformanceStore();

const RateDefHeight = ref(0); //高度
const firmwareDefHeight = ref(0); //高度
const selectedRateItem = ref('');
const selectedFirItem = ref(null);
const isShow = ref(false);
const isUpdate = ref(false);
const curClickBtn = ref(null);
const textContent = ref(''); // 弹窗提示内容
const updateTitle = ref('');

// 按钮状态
const restBtnStatus = ref(false);
const updateBtnStatus = ref(false);
const progress = ref(0);
const updateRes = ref(null);

const urlList = ['/api/update_esports.bin', '/api/update_highlight.bin', '/api/update_beta.bin'];

const KeyboardSN = computed(() => appStore.baseInfo?.KeyboardSN);
const appVersion = computed(() => appStore.baseInfo?.appVersion);
const keyboardRunMode = computed(() => appStore.baseInfo?.KeyboardRunMode);

onMounted(async () => {
  const rate = await performanceStore.getRateOfReturn();
  selectedRateItem.value = RateOfReturnList.value[rate];
});

const RateOfReturnList = computed(() => {
  // if (KeyType.value === 4) {
  //   return ['1KHz', '500Hz', '250Hz', '125Hz'];
  // }
  return ['8KHz', '4KHz', '2KHz', '1KHz', '500Hz', '250Hz', '125Hz'];
});

const firmwareList = computed(() => {
  // if (KeyType.value === 4) {
  //   return ['1KHz', '500Hz', '250Hz', '125Hz'];
  // }
  return ['电竞版', '旗舰版', '豪华版'];
});

const toggleDropdown = (keyCode) => {
  switch (keyCode) {
    case 'firmware':
      firmwareDefHeight.value = firmwareDefHeight.value ? 0 : scaleValue(135);
      break;
    default:
      RateDefHeight.value = RateDefHeight.value ? 0 : scaleValue(320);
      break;
  }
};

const selectItem = (idx, keyCode) => {
  console.log(idx, keyCode);

  switch (keyCode) {
    case 'firmware':
      selectedFirItem.value = idx;
      firmwareDefHeight.value = 0;
      break;
    default:
      selectedRateItem.value = RateOfReturnList.value[idx];
      performanceStore.setRateOfReturn(idx);
      RateDefHeight.value = 0;
      break;
  }
};

const recoverRate = () => {
  textContent.value = '是否恢复出厂设置？';
  updateTitle.value = '';
  isUpdate.value = false;
  restBtnStatus.value = false;
  isShow.value = true;
  curClickBtn.value = 'rest';
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
  curClickBtn.value = 'update';
};

const onSure = async (keyCode) => {
  if (curClickBtn.value === 'rest') {
    await deviceStore.factoryDataReset();
  } else {
    console.log('asdasdasd', keyCode);
    if (keyCode === 'enterBoot') {
      toBoot();
    } else if (keyCode === 'reconnect') {
      reconnect();
    } else if (keyCode === 'update' && keyboardRunMode.value !== 255) {
      getFirmWarePack(urlList[selectedFirItem.value]);
    }
  }
  curClickBtn.value = null;
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
          const result = await services.updateBin(resultArrayBuffer, (data) => {
            const { current, total } = data;
            progress.value = parseFloat(((current / total) * 100).toFixed(2));
            console.log('current and total:>>>', current / total);
          });
          console.log('update suc-------------> ', result);
          updateRes.value = true;
          deviceStore.updateSuc = true;
          // setTimeout(() => {
          //   router.push({
          //     path: '/key-calibration',
          //     replace: true,
          //   });
          // }, 2000);

          setTimeout(() => {
            // 10s后检查是否在进行
            if (!progress.value) {
              isShow.value = false;
              router.push({
                path: '/',
                replace: true,
              });
            }
          }, 10000);
        } catch (error) {
          console.log('update failed----------->', error);
          updateRes.value = false;
          setTimeout(() => {
            router.push({
              path: '/',
              replace: true,
            });
          }, 2000);
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
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      font-size: var(--font-size-16);
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
