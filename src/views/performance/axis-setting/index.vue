<template>
  <div class="axis-container">
    <template v-if="isVersion2">
      <div
        class="axis-container__axis-brand"
        :style="{ marginTop: axisBrandList.length === 0 ? '0' : `${scaleValue(-360)}px` }"
      >
        <!-- :style="{ transform: axisBrandList.length === 0 ? 'scale(1)' : 'scale(0)' }" -->
        <h4>选择轴体品牌</h4>
        <div class="brand-list">
          <div class="brand" @click="handleMatchLZ">
            <img src="@/assets/images/aula.png" alt="" />
          </div>
          <div class="brand" @click="handleMatchJLD">
            <img src="@/assets/images/jld_logo.svg" alt="" />
          </div>
          <div class="brand" @click="handleMatchTTC">
            <img src="@/assets/images/ttc_logo.svg" alt="" />
          </div>
          <div class="brand" @click="handleMatchOther">
            <img src="@/assets/images/unknow.svg" alt="" />
          </div>
          <!-- <div class="brand more-brand">
            <p>更多品牌接入中...</p>
          </div> -->
        </div>
      </div>
      <div
        class="axis-container__axis-list"
        :style="{ marginTop: axisBrandList.length === 0 ? `${scaleValue(360)}px` : '0' }"
      >
        <!-- :style="{ transform: axisBrandList.length === 0 ? 'scale(0)' : 'scale(1)' }" -->
        <template v-if="axisBrandList.length > 0">
          <div class="axis-setting">
            <mCarousel
              showText
              :carouselData="axisBrandList"
              :btnText="'应用轴体'"
              :offset="scaleValue(25)"
              :width="scaleValue(920)"
              :selected-id="axisID"
              @handleChangeItem="changeAxisV2"
            />
          </div>
          <div class="axis-info">
            <div class="axis-name">
              <span>轴体名称:</span>
              <!-- <span>{{ axisBrandList[checkAixsId]?.axis_name || axisBrandList[0]?.axis_name }}</span> -->
              <span>{{ axisName }}</span>
            </div>
            <div class="axis-travel">
              <span>轴体行程:</span>
              <span>{{ travelRange }}</span>
              <!-- {{ axisID }} -->
            </div>
            <saveConfigBtn btnText="应用轴体" :verify="true" @saveConfig="handleSaveAxis" />
          </div>
        </template>
        <div class="clear-axis-btn" @click="handleClearAxis">
          <img src="@/assets/images/cancel_icon.svg" alt="" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="axis-container__axis-list">
        <div class="axis-setting">
          <mCarousel
            showText
            :carouselData="axisList"
            :btnText="'应用轴体'"
            :offset="scaleValue(25)"
            :width="scaleValue(920)"
            :selected-id="axisID"
            @handleChangeItem="changeAxis"
          />
        </div>
        <div class="axis-info">
          <div class="axis-name">
            <span>轴体名称:</span>
            <span>{{ axisList[checkAixsId]?.axis_name }}</span>
          </div>
          <div class="axis-travel">
            <span>轴体行程:</span>
            <span>{{ travelRange }}</span>
            <!-- {{ axisID }} -->
          </div>
          <saveConfigBtn btnText="应用轴体" :verify="true" @saveConfig="handleSaveAxis" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { KEY_SHAFT } from '@/configs/constant/index.js';
import { showMessage } from '@/utils/message';
import { usePerformanceHook } from '@/hooks';

import mCarousel from '@/components/carousel.vue';
import saveConfigBtn from '@/components/save-config-btn.vue';
import sureIcon from '@/assets/images/sure.svg';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboards } = storeToRefs(keyboardStore);
const checkAixsId = ref(3);
const axisBrandList = ref([]);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const axisList = computed(() => performanceStore.axisList);

const axisID = computed(() => {
  if (activeKeys.value.length > 0) {
    const lastcheckedKey = String(activeKeys.value[activeKeys.value.length - 1]);
    const [key1, key2] = lastcheckedKey.split('-');
    const rowIndex = Number(key1);
    const colIndex = Number(key2);
    // console.log(keyboards.value[rowIndex][colIndex].performance.axisID);
    return keyboards.value[rowIndex][colIndex].performance.axisID;
  }
  return 0;
});

const travelRange = computed(() => {
  if (checkAixsId.value === null) return '';
  return `${axisList.value[checkAixsId.value]?.doctrine_range_right}mm-${axisList.value[checkAixsId.value]?.doctrine_range_left}mm`;
});

const axisName = computed(() => {
  if (checkAixsId.value === null) return '';
  return axisList.value[checkAixsId.value]?.axis_name;
});

const handleSaveAxis = async () => {
  if (activeKeys.value.length !== 0) {
    const { setAxis } = usePerformanceHook();
    // console.log('set axis:', keyboards.value, activeKeys.value, checkAixsId.value);
    const res = setAxis(keyboards.value, activeKeys.value, checkAixsId.value);
    if (res) {
      showMessage('修改成功');
    }
  }
};

const changeAxis = (axisID) => {
  checkAixsId.value = axisList.value.findIndex((ite) => ite.axis_id === axisID);
  // console.log('changeAxis log axisID: ', axisID, checkAixsId.value);
};

const changeAxisV2 = (axisID) => {
  checkAixsId.value = axisList.value.findIndex((ite) => ite.axis_id === axisID);
  // console.log('changeAxisV2 log axisID: ', axisID, checkAixsId.value);
};

const handleMatchJLD = (e) => {
  const jldAxis = axisList.value.filter((ite) => {
    return ite.factory_name === '佳达隆';
  });
  axisBrandList.value = jldAxis;
};

const handleMatchLZ = (e) => {
  const lzAxis = axisList.value.filter((ite) => {
    return ite.factory_name === '索爱';
  });
  axisBrandList.value = lzAxis;
};

const handleMatchTTC = (e) => {
  const ttcAxis = axisList.value.filter((ite) => {
    return ite.factory_name === 'TTC';
  });
  axisBrandList.value = ttcAxis;
  if (ttcAxis.length === 0) showMessage('该品牌暂无轴', 'warning');
};

const handleMatchOther = (e) => {
  const otherAxis = axisList.value.filter((ite) => {
    return ite.factory_name === '';
  });
  axisBrandList.value = otherAxis;
};

const handleClearAxis = () => {
  axisBrandList.value = [];
};
</script>

<style scoped lang="scss">
.axis-container {
  position: relative;
  &__axis-list {
    display: flex;
    transition: all 0.2s ease-in-out;
    position: absolute;

    & .axis-setting {
      width: var(--axis-width);
      height: var(--size-290);
      background-image: url('@/assets/images/axis_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      overflow: hidden;
    }
    & .axis-info {
      width: var(--size-300);
      height: var(--size-290);
      margin-left: var(--spacing-30);
      padding-left: var(--spacing-20);
      box-sizing: border-box;
      background-image: url('@/assets/images/axis_info_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      overflow: hidden;

      .axis-name,
      .axis-travel {
        margin-top: var(--spacing-50);
        color: #fff;
        font-size: var(--font-size-15);
        font-family: 'CN Heavy';
        display: flex;
        justify-content: center;
      }

      .axis-travel {
        margin-bottom: var(--spacing-60);
      }
    }

    & .clear-axis-btn {
      position: absolute;
      top: calc(var(--spacing-20));
      left: calc(var(--spacing-20));
      transition: transform 0.2s ease-in-out;
      cursor: pointer;
      &:hover {
        transform: scale(0.96);
      }

      > img {
        width: var(--spacing-55);
        height: var(--spacing-30);
      }
    }
  }

  &__axis-brand {
    width: var(--size-1310);
    height: var(--size-290);
    background-image: url('@/assets/images/preinstall_bg.svg');
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.2s ease-in-out;
    position: absolute;
    z-index: 10;

    > h4 {
      margin: var(--spacing-15) 0 var(--spacing-45) 0;
      line-height: 1;
      font-weight: 500;
      font-size: var(--font-size-15);
      font-family: 'CN Heavy';
      color: #ccc;
    }

    & .brand-list {
      display: flex;
      gap: 50px;

      & .brand {
        width: var(--size-140);
        height: var(--size-140);
        box-sizing: border-box;
        border: var(--spacing-2) solid #252525;
        border-radius: var(--spacing-15);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        &::after {
          content: '';
          width: var(--size-130);
          height: var(--size-130);
          border: var(--spacing-2) solid #252525;
          border-radius: var(--spacing-10);
          position: absolute;
          top: var(--spacing-3);
          left: var(--spacing-3);
        }
        &:hover {
          border-color: #8db700;
          &::after {
            border-color: #8db700;
          }
        }

        > img {
          width: var(--spacing-90);
          height: var(--spacing-90);
          object-fit: fill;
        }

        &.more-brand {
          padding: 0 var(--spacing-25);
          cursor: auto;
          > p {
            font-size: var(--font-size-18);
            font-family: 'CN Heavy';
            text-align: center;
          }
          &:hover {
            border-color: #252525;
            &::after {
              border-color: #252525;
            }
          }
        }
      }
    }
  }
}
</style>
