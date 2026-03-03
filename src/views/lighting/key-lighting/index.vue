<template>
  <div class="key-light">
    <staticLightCard
      staticType="keyLight"
      :staticLightColorList="keyLighting.staticColors"
      @checkStaticLight="checkStaticLight"
      @changeColorPicker="changeColorPicker"
    />
    <dynamicLightCard
      dynamicType="keyLight"
      :dynamicLightMode="keyLighting.mode - 0"
      @checkDynamicLight="changeDynamicLight"
      @changelightingMode="changelightingMode"
    />
    <!-- :dynamicLightMode="typeof keyLighting.mode === 'string' ? 0 : keyLighting.mode" -->
  </div>
</template>

<script setup>
import staticLightCard from '../components/static-light-card.vue';
import dynamicLightCard from '../components/dynamic-light-card.vue';

const keyLighting = defineModel();
const emit = defineEmits(['changeKeyLight', 'changeColorPicker']);

// v1动态灯效
const changeDynamicLight = (idx) => {
  keyLighting.value.type = 'dynamic';
  keyLighting.value.mode = idx;

  emit('changeKeyLight');
};

// v2灯效模式
const changelightingMode = async (idx) => {
  keyLighting.value.mode = idx;

  emit('changeKeyLight');
};

// v1 v2静态灯效
const checkStaticLight = async (color, idx) => {
  console.log(' v1 v2静态灯效', color, idx);
  keyLighting.value.selectStaticColor = Number(idx);
  keyLighting.value.staticColors[idx].color = color;
  keyLighting.value.type = 'static';
  console.log('⛔⛔⛔--------', keyLighting.value);
  emit('changeKeyLight');
};

// v2调色板
const changeColorPicker = async (color, idx, isVersion2) => {
  // console.log('changeColorPicker: ', color, idx, isVersion2);
  keyLighting.value.staticColors[idx].color = color;
  keyLighting.value.selectStaticColor = Number(idx);
  keyLighting.value.type = 'static'; // v1特有属性

  emit('changeColorPicker', isVersion2);
};

</script>

<style scoped lang="scss">
.key-light {
  display: flex;
}
</style>
