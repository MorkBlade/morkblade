<template>
  <div class="key-light">
    <staticLightCard
      staticType="keyLight"
      :staticLightColorList="formData.colors"
      :lightType="formData.type"
      @checkStaticLight="checkStaticLight"
    />
    <dynamicLightCard
      dynamicType="keyLight"
      :dynamicLightMode="formData.mode"
      :lightType="formData.type"
      @checkDynamicLight="changeDynamicLight"
    />
  </div>
</template>

<script setup>
import staticLightCard from '@/components/static-light-card.vue';
import dynamicLightCard from '@/components/dynamic-light-card.vue';

import { useLightSettingStore } from '@/stores';

const formData = defineModel();
const emit = defineEmits(['changeKeyLight']);

const lightSettingStore = useLightSettingStore();
const { staticLightColorChecked, dynamicLightBtnChecked } = storeToRefs(lightSettingStore);
const curStaticIdx = ref(0);

const changeDynamicLight = (idx) => {
  // handleTypeChange('dynamic');
  formData.value.type = 'dynamic';
  formData.value.mode = idx;
  emit('changeKeyLight', { formData });
};

const checkStaticLight = (color, idx) => {
  // console.log(color, idx);
  formData.value.staticColor = Number(idx);
  formData.value.colors[idx].color = color;
  formData.value.type = 'static';
  emit('changeKeyLight', { formData });
};
</script>

<style scoped lang="scss">
.key-light {
  display: flex;
}
</style>
