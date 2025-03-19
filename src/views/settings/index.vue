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
            <img
              class="change-icon"
              :src="selectedRateItem ? '/src/assets/images/changed.svg' : '/src/assets/images/change.svg'"
              alt=""
            />
            <span>{{ selectedRateItem || '请选择' }}</span>
            <img
              class="down-icon"
              :src="selectedRateItem ? '/src/assets/images/down_icon.svg' : '/src/assets/images/down_icon2.svg'"
            />
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
          <div class="cover-list" :class="selectedFirItem ? 'is-selected' : ''" @click="toggleDropdown('firmware')">
            <img
              class="change-icon"
              :src="selectedFirItem ? '/src/assets/images/changed.svg' : '/src/assets/images/change.svg'"
              alt=""
            />
            <span>{{ selectedFirItem || '请选择' }}</span>
            <img
              class="down-icon"
              :src="selectedFirItem ? '/src/assets/images/down_icon.svg' : '/src/assets/images/down_icon2.svg'"
            />
            <div class="drop-list" :style="{ height: `${firmwareDefHeight}px` }">
              <ul>
                <li
                  v-for="(ite, idx) in firmwareList"
                  :key="ite"
                  :class="{ 'checked-item': ite == selectedFirItem }"
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
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import { useAppStore, useDeviceStore, usePerformanceStore } from '@/stores';
import mDialog from '@/components/dialog.vue';

const appStore = useAppStore();
const deviceStore = useDeviceStore();
const performanceStore = usePerformanceStore();

const KeyboardSN = computed(() => appStore.baseInfo?.KeyboardSN);
const appVersion = computed(() => appStore.baseInfo?.appVersion);

const RateDefHeight = ref(0); //高度
const firmwareDefHeight = ref(0); //高度
const selectedRateItem = ref('');
const selectedFirItem = ref('');
const isShow = ref(false);
const curClickBtn = ref(null);

// 按钮状态
const restBtnStatus = ref(false);
const updateBtnStatus = ref(false);

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
      firmwareDefHeight.value = firmwareDefHeight.value ? 0 : 400;
      break;
    default:
      RateDefHeight.value = RateDefHeight.value ? 0 : 400;
      break;
  }
};

const selectItem = (idx, keyCode) => {
  console.log(idx, keyCode);

  switch (keyCode) {
    case 'firmware':
      selectedFirItem.value = firmwareList.value[idx];
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
  updateBtnStatus.value = false;
  isShow.value = true;
  curClickBtn.value = 'update';
};

const onSure = async () => {
  isShow.value = false;
  // selectedRateItem.value = RateOfReturnList.value[0];
  // performanceStore.setRateOfReturn(0);
  if (curClickBtn.value === 'rest') {
    await deviceStore.factoryDataReset();
  } else {
  }
  curClickBtn.value = null;
};
const onCancel = () => {
  isShow.value = false;
};
</script>

<style scoped lang="scss">
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-size: 15px;
  font-family: 'CN Heavy';
  color: #cccccc;
  position: absolute;
  left: 0;
  top: 150px;

  .settings-center {
    width: 1500px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 25px;
  }

  .device-info,
  .firmware-version,
  .device-set,
  .firmware-set {
    width: 700px;
    height: 200px;
    margin-bottom: 30px;
    background-image: url('@/assets/images/settings_bg1.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    box-sizing: border-box;
  }

  .update-log {
    width: 1500px;
    height: 200px;
    border-radius: 20px;
    border: 3px solid rgb(37, 37, 37);
    box-sizing: border-box;
    background-color: #000000;
  }

  p {
    margin: 20px 0 15px 30px;
    font-size: 15px;
    font-family: 'CN Heavy';
    color: #cccccc;
  }

  .reset-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      font-size: 16px;
    }
  }

  .content-box {
    display: flex;
    justify-content: center;
    font-size: 16px;
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      margin-top: 20px;
    }
    & span:first-child {
      margin-right: 10px;
    }
  }

  .firmware-update {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      font-size: 16px;
    }
  }

  .rate-of-return {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN Heavy';
    color: #ffffff;

    & span {
      font-size: 16px;
    }
  }
  .cover-list {
    width: 170px;
    height: 40px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    background-image: url('@/assets/images/select_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    cursor: pointer;

    .change-icon {
      width: 20px;
      height: 20px;
      object-fit: fill;
      margin-left: 11px;
    }
    .down-icon {
      width: 13px;
      height: 8px;
      object-fit: fill;
    }

    span {
      border: none;
      color: #fff;
      display: inline-block;
      margin: 8px 0 0 16px;
      height: 31px;
      font-size: 18px;
      font-family: 'CN Heavy';
      margin: 5px 10px 0 40px;
    }

    .drop-list {
      position: absolute;
      top: 45px;
      left: 4px;
      z-index: 2;
      box-sizing: border-box;
      padding-right: 5px;
      overflow-y: scroll;
      transition: height 0.3s ease;

      ul {
        list-style-type: none;
        li {
          width: 160px;
          height: 40px;
          padding: 10px;
          text-align: center;
          margin-bottom: 5px;
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
      height: 10px;
      width: 5px;
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
    width: 170px;
    height: 40px;
    margin-left: 10px;
    background-image: url('/src/assets/images/save_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    cursor: pointer;

    img {
      width: 20px;
      height: 20px;
      object-fit: fill;
      position: absolute;
      top: 10px;
      left: 10px;
    }

    span {
      width: 109px;
      text-align: center;
      font-size: 18px;
      color: #fff;
      position: absolute;
      top: 6px;
      left: 50px;
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
      margin-top: 10px;
      font-size: 16px;
      font-family: 'CN Heavy';
      color: #ffffff;

      div {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
