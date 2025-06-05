<template>
  <div class="macro-container">
    <template v-if="isVersion2">
      <macro-list-v2 @checkedMacroIdx="checkedMacroIdx" />
      <macro-data-v2
        :macroData="currentMacroData"
        @updateMacro:data="updateMacroData"
        @updateMacro:mode="updateMacroMode"
        @updateMacro:clear="clearMacro"
      />
    </template>
    <template v-else>
      <macro-list v-model:macros="localMacros" @checkedMacroIdx="checkedMacroIdx" />
      <macro-data
        :macroData="currentMacroData"
        :disabled="localMacros.length === 0"
        @updateMacro:data="updateMacroData"
        @updateMacro:mode="updateMacroMode"
        @updateMacro:clear="clearMacro"
      />
    </template>
  </div>
</template>

<script setup>
import { useMacroStore } from '@/stores';
import { useMacroHook } from '@/hooks';

import macroData from './components/macro-data.vue';
import macroDataV2 from './components/macro-data-v2.vue';
import macroList from './components/macro-list.vue';
import macroListV2 from './components/macro-list-v2.vue';

const macroStore = useMacroStore();
const { setMacroV2, setMacroModeV2, getMacroAllDataV2 } = useMacroHook();

const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const curMacroIdx = ref(0);
// 本地宏数据
const localMacros = ref([]);

// 计算属性，获取当前选中的宏数据
const currentMacroData = computed(() => {
  if (isVersion2) {
    return macroStore.macroData[curMacroIdx.value];
  } else {
    if (curMacroIdx.value === -1 || localMacros.value.length === 0) {
      return { data: [] };
    }
    return localMacros.value[curMacroIdx.value] || { data: [] };
  }
});

// 初始化宏数据
onMounted(async () => {
  if (isVersion2) {
    if (macroStore.macroData.length === 0) {
      await getMacroAllDataV2();
    }
  } else {
    const storedMacros = localStorage.getItem('localMacros');
    if (storedMacros && storedMacros !== '[]') {
      try {
        localMacros.value = JSON.parse(storedMacros);
      } catch (error) {
        console.error('Failed to parse localMacros from localStorage', error);
        localMacros.value = [];
      }
    }
  }
});

// 监听 localMacros 的修改，并更新 localStorage
watch(
  localMacros,
  (newVal) => {
    localStorage.setItem('localMacros', JSON.stringify(newVal));
  },
  { deep: true },
);

// 更新当前选中的宏索引
const checkedMacroIdx = (idx) => {
  curMacroIdx.value = idx;
};

// 更新宏数据
const updateMacroData = async (data, settings) => {
  if (isVersion2) {
    if (data.length > 0) {
      macroStore.macroData[curMacroIdx.value].data = JSON.parse(JSON.stringify(data));
      macroStore.macroData[curMacroIdx.value].actNum = data.length;
      const { macroId, actNum, repNum, mode } = macroStore.macroData[curMacroIdx.value];
      await setMacroModeV2({ actNum, repNum, mode, macroId, valid: 1 });
      await setMacroV2({ macroId, data });
    }
  } else {
    // 确保当前宏索引有效
    if (curMacroIdx.value >= 0 && curMacroIdx.value < localMacros.value.length) {
      // 如果当前宏不存在，则初始化它
      if (!localMacros.value[curMacroIdx.value]) {
        localMacros.value[curMacroIdx.value] = {
          id: Date.now(),
          macroName: `宏${curMacroIdx.value + 1}`,
          createTime: Date.now(),
          macroLength: 0,
          data: [],
          mode: 0,
          repeatCount: 1,
          repeatInterval: 1,
        };
      }

      // 更新数据
      localMacros.value[curMacroIdx.value].data = data;
      localMacros.value[curMacroIdx.value].macroLength = data.length;

      // 如果提供了宏类型设置，则更新设置
      if (settings) {
        localMacros.value[curMacroIdx.value].mode = settings.mode;
        localMacros.value[curMacroIdx.value].repeatCount = settings.repeatCount;
        localMacros.value[curMacroIdx.value].repeatInterval = settings.repeatInterval;
      }

      // 触发响应式更新
      // localMacros.value = [...localMacros.value];
    }
  }
};

// 更新宏模式
const updateMacroMode = async ({ mode, repeatCount, repeatInterval }) => {
  if (isVersion2) {
    macroStore.macroData[curMacroIdx.value].mode = mode;
    if (mode === 4 || mode === 5) {
      macroStore.macroData[curMacroIdx.value].repNum = 0xffff;
    } else {
      macroStore.macroData[curMacroIdx.value].repNum = repeatCount;
    }
    const { macroId, actNum, repNum, mode: marcoMode } = macroStore.macroData[curMacroIdx.value];
    await setMacroModeV2({ actNum, repNum, mode: marcoMode, macroId, valid: 1 });
  } else {
    localMacros.value[curMacroIdx.value].mode = mode;
    localMacros.value[curMacroIdx.value].repeatCount = repeatCount;
    localMacros.value[curMacroIdx.value].repeatInterval = repeatInterval;
  }
};

// 清除宏列表
const clearMacro = async (macro) => {
  if (isVersion2) {
    const { macroId, actNum, repNum, mode } = macro;
    macroStore.macroData[curMacroIdx.value].repNum = 0;
    macroStore.macroData[curMacroIdx.value].actNum = 0;
    macroStore.macroData[curMacroIdx.value].mode = 0;
    macroStore.macroData[curMacroIdx.value].data = [];
    await setMacroModeV2({ actNum, repNum, mode, macroId, valid: 0 });
  } else {
    localMacros.value[curMacroIdx.value].data = [];
    localMacros.value[curMacroIdx.value].macroLength = 0;
  }
};
</script>

<style scoped lang="scss">
.macro-container {
  margin-top: var(--spacing-25);
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  top: var(--spacing-150);
}
</style>
