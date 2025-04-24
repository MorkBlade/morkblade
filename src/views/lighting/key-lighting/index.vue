<template>
  <div class="key-light">
    <staticLightCard
      staticType="keyLight"
      :staticLightColorList="keyLighting.staticColors"
      :lightType="keyLighting.type"
      @checkStaticLight="checkStaticLight"
    />
    <dynamicLightCard
      dynamicType="keyLight"
      :dynamicLightMode="keyLighting.mode - 0"
      :lightType="keyLighting.type"
      @checkDynamicLight="changeDynamicLight"
    />
    <!-- :dynamicLightMode="typeof keyLighting.mode === 'string' ? 0 : keyLighting.mode" -->
  </div>
</template>

<script setup>
import staticLightCard from '@/components/static-light-card.vue';
import dynamicLightCard from '@/components/dynamic-light-card.vue';

const keyLighting = defineModel();
console.log('keylighting info: ', keyLighting.value);
const emit = defineEmits(['changeKeyLight']);

const changeDynamicLight = (idx) => {
  keyLighting.value.type = 'dynamic';
  keyLighting.value.mode = idx;

  emit('changeKeyLight');
};

const checkStaticLight = async (color, idx) => {
  console.log(color, idx);
  keyLighting.value.selectStaticColor = Number(idx);
  keyLighting.value.staticColors[idx].color = color;
  keyLighting.value.type = 'static';

  emit('changeKeyLight');
};
</script>

<style scoped lang="scss">
.key-light {
  display: flex;
}
</style>
