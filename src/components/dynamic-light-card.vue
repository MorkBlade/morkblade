<template>
  <div class="dynamic-light">
    <p>动态灯光</p>
    <div class="dynamic-light-style">
      <div
        class="style-box"
        v-for="(ite, idx) in dynamicLightModeList"
        :key="idx"
        :class="{ 'is-dychecked': currentChecked(idx) }"
        @click="checkDynamicLight(idx)"
      >
        <img :src="getImagePath(idx, 'keyLight')" alt="" v-if="dynamicType === 'keyLight'" />
        <img :src="getImagePath(idx, 'logoLight')" alt="" v-if="dynamicType !== 'keyLight'" />
        <span>{{ ite }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLightSettingStore } from '@/stores';

// 预加载键盘灯光图片
const keyLightImages = import.meta.glob('@/assets/images/dynamic*.svg', { eager: true });
// 预加载 logo 灯光图片
const logoLightImages = import.meta.glob('@/assets/images/logo_dynamic_*.svg', { eager: true });

const { dynamicLightMode, dynamicType, lightType } = defineProps({
  dynamicLightMode: {
    type: Number,
  },
  dynamicType: {
    type: String,
  },
  lightType: { type: String, default: 'static' },
});

const emits = defineEmits(['checkDynamicLight']);
const lightSettingStore = useLightSettingStore();

const dynamicLightModeList = computed(() => {
  // if (locale.value === 'zh') {
  if (dynamicType === 'keyLight') {
    return [
      '波纹荡漾',
      '潮起潮落',
      '涟漪轻漾',
      '旋转风暴',
      '幸运彩虹',
      '闪耀彩虹',
      '熠熠生辉',
      '移动窗格',
      '波形变换',
      '移形换影',
      '正弦曲线',
      '行云流水',
      '百花争艳',
      '斑斓镶嵌',
      '雨落如注',
      '跃动不息',
      '踏雪无痕',
      '踏雪寻梅',
      '镭射穿云',
      '水波荡漾',
    ];
  } else {
    return ['样式一', '样式二', '样式三', '样式四'];
  }
  // }
  // return [
  //   'M1',
  //   'M2',
  //   'M3',
  //   'M4',
  //   'M5',
  //   'M6',
  //   'M7',
  //   'M8',
  //   'M9',
  //   'M10',
  //   'M11',
  //   'M12',
  //   'M13',
  //   'M14',
  //   'M15',
  //   'M16',
  //   'M17',
  //   'M18',
  //   'M19',
  //   'M20',
  // ];
});

const currentChecked = computed(() => {
  return (idx) => {
    if (dynamicType === 'keyLight') {
      return lightType === 'dynamic' && lightSettingStore.dynamicLightBtnChecked[idx];
    } else {
      return lightType === 'dynamic' && lightSettingStore.LogoDynamicLightBtnChecked[idx];
    }
  };
});

const getImagePath = (idx, type) => {
  if (type === 'keyLight') {
    const key = Object.keys(keyLightImages).find((path) => path.includes(`dynamic${idx + 1}.svg`));
    return keyLightImages[key].default;
  } else {
    const key = Object.keys(logoLightImages).find((path) => path.includes(`logo_dynamic_${idx + 1}.svg`));
    return logoLightImages[key].default;
  }
};

const checkDynamicLight = (idx) => {
  if (dynamicType === 'keyLight') {
    lightSettingStore.updateDynamicLightBtnChecked(idx, true);
  } else {
    lightSettingStore.updateLogoDynamicLightBtnChecked(idx, true);
  }
  emits('checkDynamicLight', idx + 1);
};
</script>

<style scoped lang="scss">
.dynamic-light {
  width: 590px;
  height: 290px;
  margin: 0 30px;
  padding: 0px 10px 0 20px;
  box-sizing: border-box;
  background-image: url('@/assets/images/dynamic_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;

  p {
    font-size: 15px;
    font-family: 'CN Heavy';
    color: #ccc;
    text-align: center;
    margin: 15px 0 10px 0;
  }

  .dynamic-light-style {
    display: flex;
    flex-wrap: wrap;

    .style-box {
      width: 70px;
      height: 70px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 10px 10px 0;
      cursor: pointer;
      background-image: url('@/assets/images/light_item.svg');
      background-size: cover;
      background-repeat: no-repeat;

      img {
        width: 30px;
        height: 30px;
        object-fit: fill;
        margin: 10px 0 5px 0;
      }

      span {
        font-size: 10px;
        color: #fff;
      }
    }

    .is-dychecked {
      background-image: url('@/assets/images/checked_light.svg');
    }
  }
}
</style>
