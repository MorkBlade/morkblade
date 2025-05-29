<template>
  <div class="dynamic-light">
    <p>动态灯光</p>
    <div class="dynamic-light-style">
      <!-- v2 -->
      <template v-if="isVersion2">
        <div
          class="style-box"
          v-for="(ite, idx) in dynamicLightModeList"
          :key="idx"
          :class="{ 'is-dychecked': currentChecked(idx) }"
          @click="changelightingMode(idx)"
        >
          <img :src="getImagePath(idx, 'keyLight')" alt="" v-if="dynamicType === 'keyLight'" />
          <span>{{ ite }}</span>
        </div>
      </template>
      <!-- v1 -->
      <template v-else>
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
      </template>
    </div>
  </div>
</template>

<script setup>
import { useLightSettingStore } from '@/stores';
import emitter from '@/utils/app-emitter';

// 预加载键盘灯光图片
const keyLightImages = import.meta.glob('@/assets/images/dynamic*.svg', { eager: true });
// 预加载 logo 灯光图片
const logoLightImages = import.meta.glob('@/assets/images/logo_dynamic_*.svg', { eager: true });

const { dynamicLightMode, dynamicType } = defineProps({
  dynamicLightMode: {
    type: Number,
  },
  dynamicType: {
    type: String,
  },
});

const emits = defineEmits(['checkDynamicLight', 'changelightingMode']);
const lightSettingStore = useLightSettingStore();
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const dynamicLightStyleV1 = [
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
const dynamicLightStyleV2 = [
  '宁静之光',
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

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

const dynamicLightModeList = computed(() => {
  if (dynamicType === 'keyLight') {
    if (isVersion2.value) {
      return dynamicLightStyleV2;
    }
    return dynamicLightStyleV1;
  } else {
    return ['样式一', '样式二', '样式三', '样式四'];
  }
});

const currentChecked = computed(() => {
  return (idx) => {
    if (isVersion2.value) {
      if (dynamicType === 'keyLight') {
        return lightSettingStore.light.mode === idx;
      } else {
        return lightSettingStore.logo.mode === idx;
      }
    } else {
      if (dynamicType === 'keyLight') {
        return lightSettingStore.light.mode === idx + 1;
      } else {
        return lightSettingStore.logo.mode === idx + 1;
      }
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
  emits('checkDynamicLight', idx + 1);
};

const changelightingMode = (idx) => {
  emits('changelightingMode', idx);
};
</script>

<style scoped lang="scss">
.dynamic-light {
  width: var(--lighting-dynamic-width);
  height: var(--size-290);
  margin: 0 var(--spacing-30);
  padding: 0px var(--spacing-10) 0 var(--spacing-20);
  box-sizing: border-box;
  background-image: url('@/assets/images/dynamic_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;

  p {
    font-size: var(--font-size-15);
    font-family: 'CN Heavy';
    color: #ccc;
    text-align: center;
    margin: var(--spacing-15) 0 var(--spacing-10) 0;
  }

  .dynamic-light-style {
    display: flex;
    flex-wrap: wrap;

    .style-box {
      width: var(--size-70);
      height: var(--size-70);
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 var(--lighting-item-right) var(--spacing-10) 0;
      cursor: pointer;
      background-image: url('@/assets/images/light_item.svg');
      background-size: cover;
      background-repeat: no-repeat;

      img {
        width: var(--size-30);
        height: var(--size-30);
        object-fit: fill;
        margin: var(--spacing-10) 0 var(--spacing-5) 0;
      }

      span {
        font-size: var(--font-size-10);
        color: #fff;
      }
    }

    .is-dychecked {
      background-image: url('@/assets/images/checked_light.svg');
    }
  }
}
</style>
