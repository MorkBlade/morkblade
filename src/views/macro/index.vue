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
      <macro-list v-model:macros="macros" @checkedMacroIdx="checkedMacroIdx" />
      <macro-data
        :macroData="currentMacroData"
        :disabled="macros.length === 0"
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

// 使用ref来管理宏数据，这样可以用于v-model
const macros = ref([]);

// 监听store中宏数据的变化
watch(
  () => macroStore.macros,
  (newMacros) => {
    macros.value = newMacros;
  },
  { immediate: true, deep: true }
);

// 监听macros的变化，同步到store
watch(
  macros,
  (newMacros) => {
    if (!isVersion2) {
      macroStore.setMacroData_V1(newMacros);
    }
  },
  { deep: true }
);

// 计算属性，获取当前选中的宏数据
const currentMacroData = computed(() => {
  if (isVersion2) {
    return macroStore.macroData[curMacroIdx.value];
  } else {
    if (curMacroIdx.value === -1 || macros.value.length === 0) {
      return { data: [] };
    }
    return macros.value[curMacroIdx.value] || { data: [] };
  }
});

// 初始化宏数据
onMounted(async () => {
  if (isVersion2) {
    if (macroStore.macroData.length === 0) {
      await getMacroAllDataV2();
    }
  } else {
    // v1版本初始化本地宏数据
    if (macroStore.localMacros.length === 0) {
      macroStore.initLocalMacros();
    }
  }
});

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
    // v1版本直接更新macros
    // 确保当前宏索引有效
    if (curMacroIdx.value >= 0 && curMacroIdx.value < macros.value.length) {
      // 如果当前宏不存在，则初始化它
      if (!macros.value[curMacroIdx.value]) {
        macros.value[curMacroIdx.value] = {
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
      macros.value[curMacroIdx.value].data = data;
      macros.value[curMacroIdx.value].macroLength = data.length;

      // 如果提供了宏类型设置，则更新设置
      if (settings) {
        macros.value[curMacroIdx.value].mode = settings.mode;
        macros.value[curMacroIdx.value].repeatCount = settings.repeatCount;
        macros.value[curMacroIdx.value].repeatInterval = settings.repeatInterval;
      }
    }
  }
};

// 更新宏模式
const updateMacroMode = async ({ mode, repeatCount, repeatInterval }) => {
  if (isVersion2) {
    macroStore.macroData[curMacroIdx.value].mode = mode;
    if (mode < 4) macroStore.macroData[curMacroIdx.value].repNum = 1;
    if (mode === 4 || mode === 5) {
      macroStore.macroData[curMacroIdx.value].repNum = 0xffff;
    } else {
      macroStore.macroData[curMacroIdx.value].repNum = repeatCount;
    }
    const { macroId, actNum, repNum, mode: marcoMode } = macroStore.macroData[curMacroIdx.value];
    const res = await setMacroModeV2({ actNum, repNum, mode: marcoMode, macroId, valid: 1 });
  } else {
    // v1版本直接更新macros
    if (curMacroIdx.value >= 0 && curMacroIdx.value < macros.value.length) {
      macros.value[curMacroIdx.value].mode = mode;
      macros.value[curMacroIdx.value].repeatCount = repeatCount;
      macros.value[curMacroIdx.value].repeatInterval = repeatInterval;
    }
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
    // v1版本直接更新macros
    if (curMacroIdx.value >= 0 && curMacroIdx.value < macros.value.length) {
      macros.value[curMacroIdx.value].data = [];
      macros.value[curMacroIdx.value].macroLength = 0;
    }
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
