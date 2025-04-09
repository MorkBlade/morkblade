<template>
  <div class="static-light">
    <p>静态灯光</p>
    <div class="light-box">
      <div
        class="light"
        v-for="(ite, idx) in localStaticColorList"
        :key="ite"
        :class="{ 'is-checked': currentChecked(idx) }"
        @click="onClick(idx)"
      >
        <!-- <template v-if="idx === 7"> -->
        <!-- <img src="@/assets/images/colorful.png" alt="" /> -->
        <!-- </template> -->
        <!-- <template v-else> -->
        <el-color-picker v-model="ite.color" @change="onChange" />
        <!-- </template> -->
        <span class="color-text">{{ idx === 7 ? '彩色' : `灯光${idx + 1}` }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLightSettingStore } from '@/stores';

const { staticLightColorList, staticType, lightType } = defineProps({
  staticLightColorList: {
    type: Array,
  },
  staticType: {
    type: String,
  },
  lightType: { type: String, default: 'static' },
});

const lightSettingStore = useLightSettingStore();
const checkedLight = ref(0);
const checkedColor = ref(null);
const localStaticColorList = ref([]);
const emits = defineEmits(['checkStaticLight', 'checkLogoStaticLight']);

// watch(
//   () => lightType,
//   (newVal) => {
//     console.log('lightType', lightType);
//   },
// );

const currentChecked = computed(() => {
  return (idx) => {
    if (staticType === 'keyLight') {
      return lightType === 'static' && lightSettingStore.staticLightColorChecked[idx];
    } else {
      return lightType === 'static' && lightSettingStore.LogoStaticLightColorChecked[idx];
    }
  };
});

watch(
  () => staticLightColorList,
  (newVal) => {
    // localStaticColorList.value = [...staticLightColorList, { color: '#ffffff', id: 7 }];
    localStaticColorList.value = [...staticLightColorList];
  },
);
// TODO 灯光初始化
const onClick = (idx) => {
  if (staticType === 'keyLight') {
    lightSettingStore.updateStaticLightColorChecked(idx, true);
  } else {
    lightSettingStore.updateLogoStaticLightColorChecked(idx, true);
  }
  checkedLight.value = idx;
  checkedColor.value = staticLightColorList[idx].color;
  if (staticType === 'keyLight') {
    emits('checkStaticLight', checkedColor.value, idx);
  } else {
    emits('checkLogoStaticLight', checkedColor.value, idx);
  }
};

const onChange = (color) => {
  console.log('color picker change:>>>>>>', color, checkedLight.value);
  if (staticType === 'keyLight') {
    emits('checkStaticLight', color, checkedLight.value);
  } else {
    emits('checkLogoStaticLight', color, checkedLight.value);
  }
};
</script>

<style scoped lang="scss">
.static-light {
  width: var(--lighting-static-width);
  height: var(--size-290);
  box-sizing: border-box;
  padding: 0 var(--spacing-10) 0 var(--spacing-20);
  background-image: url('@/assets/images/static_light_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;

  p {
    font-size: var(--font-size-15);
    font-family: 'CN Heavy';
    color: #ccc;
    text-align: center;
    margin: var(--spacing-15) 0 var(--spacing-10) 0;
  }

  .light-box {
    display: flex;
    flex-wrap: wrap;

    .light {
      width: var(--size-70);
      height: var(--size-70);
      margin: 0 var(--lighting-item-right) var(--spacing-10) 0;
      font-size: var(--font-size-10);
      padding-top: var(--spacing-10);
      font-family: 'CN Heavy';
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      cursor: pointer;
      background-image: url('@/assets/images/light_item.svg');
      background-size: cover;
      background-repeat: no-repeat;

      img {
        width: var(--size-30);
        height: var(--size-30);
        object-fit: fill;
      }

      span {
        margin-top: var(--spacing-5);
      }
    }

    .is-checked {
      background-image: url('@/assets/images/checked_light.svg');
    }
  }
}
</style>
