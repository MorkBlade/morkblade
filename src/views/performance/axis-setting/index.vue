<template>
  <div class="axis-container">
    <div
      class="axis-container__axis-brand"
      :style="{ marginTop: axisBrandList.length === 0 ? '0' : `${scaleValue(-360)}px` }"
    >
      <h4>{{ $t('axisSetting.axisBrand') }}</h4>
      <div class="brand-list">
        <div class="brand" @click="handleMatchJLD">
          <img src="@/assets/images/jld_logo.svg" alt="" />
        </div>
        <div class="brand" @click="handleMatchTTC">
          <img src="@/assets/images/ttc_logo.svg" alt="" />
        </div>
        <div class="brand" @click="handleMatchOther">
          <img src="@/assets/images/unknow.svg" alt="" />
        </div>
      </div>
    </div>
    <div
      class="axis-container__axis-list"
      :style="{ marginTop: axisBrandList.length === 0 ? `${scaleValue(360)}px` : '0' }"
    >
      <template v-if="axisBrandList.length > 0">
        <div class="axis-setting">
          <div class="axis_card_container" v-for="(item, index) in axisBrandList" :key="item.axis_id">
            <div class="axis_card">
              <div class="icon" :style="{ backgroundColor: item.axis_color }">
                {{ getAxisIcon( isVersion2 ? item.type_name_en : item.factory_name) + index }}
              </div>
              <div class="name">
                {{ item.axis_name }}
              </div>
              <div class="btn" @click="handleApplyAxis(item)">应用轴体</div>
            </div>
          </div>
        </div>
      </template>
      <div class="clear-axis-btn" @click="handleClearAxis">
        <img src="@/assets/images/back.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore, usePerformanceStore } from '@/stores';
import { showMessage } from '@/utils/message';
import { usePerformanceHook } from '@/hooks';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboards } = storeToRefs(keyboardStore);
const axisBrandList = ref([]);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

const axisList = computed(() => performanceStore.axisList);

const handleApplyAxis = (item) => {
  if (activeKeys.value.length !== 0) {
    const { setAxis } = usePerformanceHook();
    let res = null;
    if (isVersion2) {
      res = setAxis(keyboards.value, activeKeys.value, item.aixsDetail[0].axis_id);

    } else {
      res = setAxis(keyboards.value, activeKeys.value, item.axis_id);

    }
    if (res) {
      showMessage(t('axisSetting.modifySuccess'));
    }
    return res;
  }
};

const handleMatchJLD = () => {
  const jldAxis = axisList.value.filter((ite) => {
    if (isVersion2) {
      return ite.type_name_en === 'GATERON';
    } else {
      return ite.factory_name === '佳达隆';
    }
  });
  axisBrandList.value = isVersion2 ?  jldAxis[0].list : jldAxis;
};

const handleMatchTTC = () => {
  const ttcAxis = axisList.value.filter((ite) => {
    if (isVersion2) {
      return ite.type_name_en === 'TTC';
    } else {
      return ite.factory_name === 'TTC';
    }
  });
  if (ttcAxis.length === 0) showMessage(t('axisSetting.noAxis'), 'warning');
  axisBrandList.value = isVersion2 ? ttcAxis[0].list : ttcAxis;
  console.log('⛔--------axisBrandList', axisBrandList.value);
};

const handleMatchOther = () => {
  const otherAxis = axisList.value.filter((ite) => {
    if (isVersion2) {
      return ite.type_name_en === 'other';
    } else {
      return ite.factory_name === 'other';
    }
  });
  if (otherAxis.length === 0) showMessage(t('axisSetting.noMoreAxis'), 'warning');
  axisBrandList.value = isVersion2 ? otherAxis[0].list : otherAxis;
};

const handleClearAxis = () => {
  axisBrandList.value = [];
};

// 获取轴体图标（品牌首字母）
const getAxisIcon = (brand) => {
  return brand.charAt(0).toUpperCase();
};
</script>

<style scoped lang="scss">
.axis-container {
  position: relative;
  &__axis-list {
    // display: flex;
    transition: all 0.2s ease-in-out;
    position: absolute;

    & .axis-setting {
      display: flex;
      justify-content: start;
      flex-wrap: wrap;
      width: calc(var(--axis-width) + var(--size-306));
      padding-left: var(--size-100);
      padding-top: var(--size-20);
      height: var(--size-290);
      background-image: url('@/assets/images/axis_bg.svg');
      background-size: cover;
      background-repeat: no-repeat;
      gap: var(--spacing-20);
      overflow-y: auto;
      // 靠左对其

      &::-webkit-scrollbar {
        width: 0;
      }
      & .axis_card_container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--size-270);
        height: var(--size-60);
        border: 1px solid #333333;
        border-radius: var(--spacing-8);
        &:hover {
          border: 1px solid #91bc00;
          .axis_card {
            border: 1px solid #91bc00;
          }
        }
      }
      & .axis_card {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 var(--spacing-10);
        width: 96%;
        height: 86%;
        border: 1px solid #333333;
        border-radius: var(--spacing-6);

        & .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--size-36);
          height: var(--size-36);
          border-radius: var(--spacing-4);
          font-size: var(--font-size-18);
          font-family: 'CN Heavy';
          color: #fff;
          margin-right: var(--spacing-10);
          text-shadow:
            -1px -1px 0 #808080,
            1px -1px 0 #808080,
            -1px 1px 0 #808080,
            1px 1px 0 #808080;
        }
        & .name {
          font-size: var(--font-size-15);
          font-family: 'CN Heavy';
          color: #fff;
          flex: 1;
        }
        & .btn {
          width: var(--size-70);
          height: var(--size-30);
          border: 1px solid #fff;
          border-radius: var(--spacing-4);
          font-size: var(--font-size-12);
          font-family: 'CN Heavy';
          color: #fff;
          line-height: var(--size-30);
          text-align: center;
          cursor: pointer;
          &:hover {
            background-color: #91bc00;
            border: transparent;
          }
        }
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
      }
    }
  }
}
</style>
