<template>
  <div class="macro-container">
    <macroList v-model:macros="localMacros" @checkedMacroIdx="checkedMacroIdx" />
    <editMacro :macroData="currentMacroData" :parentMacro="localMacros[curMacroIdx]" @updateMacro="updateMacroData" />
    <!-- <div>
      <macroEvents />
      <macroType />
    </div> -->
  </div>
</template>

<script setup>
import macroList from './components/macro-list.vue';
import editMacro from './components/edit-macro.vue';

const curMacroIdx = ref(0);
const localMacros = ref([]);

// 计算属性，获取当前选中的宏数据
const currentMacroData = computed(() => {
  if (localMacros.value.length === 0 || !localMacros.value[curMacroIdx.value]) {
    return [];
  }
  return localMacros.value[curMacroIdx.value].data || [];
});

// 初始化数据
onMounted(() => {
  const storedMacros = localStorage.getItem('localMacros');
  if (storedMacros && storedMacros !== '[]') {
    try {
      localMacros.value = JSON.parse(storedMacros);
    } catch (error) {
      console.error('Failed to parse localMacros from localStorage', error);
      localMacros.value = [];
    }
  }
});

// 监听 localMacros 变化并更新 localStorage
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
const updateMacroData = (data, settings) => {
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
    localMacros.value = [...localMacros.value];
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
