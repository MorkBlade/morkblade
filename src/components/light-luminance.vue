<template>
  <div class="light-luminance">
    <div class="sleep-time-box">
      <span class="title">休眠时间:</span>
      <div class="cover-list" :class="selectedId === formData.sleepDelay ? 'is-selected' : ''" @click="toggleDropdown">
        <img
          class="change-icon"
          :src="selectedId === formData.sleepDelay ? changedSleepIcon : changeSleepIcon"
          alt=""
        />
        <span>{{ getSleepDelayLabel(formData?.sleepDelay) }}</span>
        <img class="down-icon" :src="selectedId === formData.sleepDelay ? downArrowed : downArrow" />
        <div class="drop-list" :style="{ height: `${defaultHeight}px` }">
          <ul>
            <li
              v-for="ite in LIGHT_SLEEP_DELAY"
              :key="ite.id"
              :class="{ 'checked-item': ite.id === formData.sleepDelay }"
              @click.stop="changeLightSleepDelay(ite.id)"
            >
              {{ ite.label }}
              <!-- {{ Number(ite.label.replace(' min', '')) === formData.sleepDelay }} -->
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="lumminance-box">
      <span class="title">亮度:</span>
      <horizontalSlider :sliderValue="formData.luminance" @sendSliderVal="getLuminance" />
      <span>{{ formData.luminance || 0 }}</span>
    </div>
    <div class="speed-box">
      <span class="title">速度:</span>
      <horizontalSlider :sliderValue="formData.speed" @sendSliderVal="getSpeed" />
      <span>{{ formData.speed || 0 }}</span>
    </div>
  </div>
</template>

<script setup>
import { LIGHT_SLEEP_DELAY } from '@/configs/constant/index.js';
import changedSleepIcon from '@/assets/images/changed.svg';
import changeSleepIcon from '@/assets/images/change.svg';
import downArrowed from '@/assets/images/down_icon.svg';
import downArrow from '@/assets/images/down_icon2.svg';

import horizontalSlider from './horizontal-slider.vue';

const formData = defineModel();
const emits = defineEmits(['changeSleepDelay', 'changeLuminance', 'changeSpeed']);
const defaultHeight = ref(0);
const selectedId = ref(formData.value.sleepDelay);
// const luminanceVal = ref(0);
// const speedVal = ref(0);

// const LightSleepDelaySelect = ref(formData.value.sleepDelay);

const toggleDropdown = () => {
  defaultHeight.value = defaultHeight.value ? 0 : 200;
};
// watch(
//   () => formData.value,
//   (newVal) => {},
//   { deep: true },
// );

const selectItem = (item) => {
  if (!item) {
    console.log('current is add');
  }
  defaultHeight.value = 0;
  console.log(defaultHeight.value);
};
const delays = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60, 120, 0];
const changeLightSleepDelay = async (id) => {
  selectedId.value = id;
  defaultHeight.value = 0;
  emits('changeSleepDelay', id);
};

const getSleepDelayLabel = (delay) => {
  if (!LIGHT_SLEEP_DELAY?.length) return '未设置';
  if (delay === 0 || !delay) return LIGHT_SLEEP_DELAY[LIGHT_SLEEP_DELAY.length - 1]?.label || '未设置';
  const index = delay - 1;
  if (index < 0 || index >= LIGHT_SLEEP_DELAY.length) return LIGHT_SLEEP_DELAY[0]?.label || '未设置';
  return LIGHT_SLEEP_DELAY[index]?.label || '未设置';
};

// TODO 灯光速度&亮度是否独立
const getLuminance = (val) => {
  if (formData.value.luminance === val) return;
  formData.value.luminance = val;
  emits('changeLuminance', val);
};
const getSpeed = (val) => {
  if (formData.value.speed === val) return;
  formData.value.speed = val;
  emits('changeSpeed', val);
};
</script>

<style scoped lang="scss">
.light-luminance {
  width: 390px;
  height: 290px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('@/assets/images/luminance_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;

  .sleep-time-box {
    margin-top: 30px;
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
        z-index: 20;
        box-sizing: border-box;
        padding-right: 5px;
        overflow-y: scroll;
        transition: height 0.3s ease;

        ul {
          list-style-type: none;
          background-color: #000;
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

      //li {
      //  color: #000 !important;
      //  background-image: url('@/assets/images/item_bg_checked.gif') !important;
      //}
    }
  }

  .lumminance-box,
  .speed-box {
    margin: 50px 20px 0 10px;
  }
  .sleep-time-box,
  .lumminance-box,
  .speed-box {
    display: flex;
    align-items: center;
  }

  .title {
    color: #fff;
  }
}
</style>
