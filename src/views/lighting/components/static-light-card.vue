<template>
  <div class="static-light">
    <p>静态灯光</p>
    <div class="light-box">
      <div
        class="light"
        v-for="(ite, idx) in staticLightColorList"
        :key="idx"
        :class="{ 'is-checked': currentChecked(idx) }"
        @click="onClick(idx)"
      >
        <template v-if="isVersion2">
          <template v-if="!idx">
            <img src="@/assets/images/colorful.png" alt="" />
          </template>
          <template v-else>
            <el-color-picker v-model="ite.color" @change="onChange" />
          </template>
          <span class="color-text">{{ !idx ? '彩色' : `灯光${idx}` }}</span>
        </template>
        <template v-else>
          <el-color-picker v-model="ite.color" @change="onChange" />
          <span class="color-text">{{ idx === 7 ? '彩色' : `灯光${idx + 1}` }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLightSettingStore } from '@/stores';
import emitter from '@/utils/app-emitter';

const { staticLightColorList, staticType } = defineProps({
  staticLightColorList: {
    type: Array,
  },
  staticType: {
    type: String,
  },
});

const lightSettingStore = useLightSettingStore();
const checkedLight = ref(0);
const checkedColor = ref(null);
const emits = defineEmits(['checkStaticLight', 'checkLogoStaticLight', 'changeColorPicker', 'changeLogoColorPicker']);
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');

emitter.on('versionChange', (flag) => {
  if (flag) {
    setTimeout(() => {
      isVersion2.value = localStorage.getItem('keyboardVersion') === 'v2';
    }, 240);
  }
});

const currentChecked = computed(() => {
  return (idx) => {
    if (staticType === 'keyLight') {
      return !lightSettingStore.light.mode && lightSettingStore.light.selectStaticColor === idx;
    } else {
      return !lightSettingStore.logo.mode && lightSettingStore.logo.selectStaticColor === idx;
    }
  };
});

// TODO 灯光初始化
const onClick = (idx) => {
  checkedLight.value = idx;
  checkedColor.value = staticLightColorList[idx].color;
  // console.log('checkedColor.value', checkedColor.value);
  if (staticType === 'keyLight') {
    emits('checkStaticLight', checkedColor.value, idx);
  } else {
    emits('checkLogoStaticLight', checkedColor.value, idx);
  }
};

const onChange = (color) => {
  // console.log('color picker change:>>>>>>', color, checkedLight.value);
  if (staticType === 'keyLight') {
    emits('changeColorPicker', color, checkedLight.value, isVersion2.value);
  } else {
    // TODO v2暂无logo灯
    emits('changeLogoColorPicker', color, checkedLight.value, isVersion2.value);
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
