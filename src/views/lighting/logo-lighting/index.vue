<template>
  <div class="logo-light">
    <staticLightCard
      :staticColor="formLogoData.staticColor"
      :staticLightColorList="formLogoData.colors"
      :lightType="formLogoData.type"
      @checkLogoStaticLight="checkLogoStaticLight"
    />
    <dynamicLightCard
      :dynamicLightMode="formLogoData.mode"
      :lightType="formLogoData.type"
      @checkDynamicLight="checkLogoDynamicLight"
    />
  </div>
</template>

<script setup>
import staticLightCard from '@/components/static-light-card.vue';
import dynamicLightCard from '@/components/dynamic-light-card.vue';
import { useLightSettingStore } from '@/stores';

const formLogoData = defineModel();
const emit = defineEmits(['changeLogoLight']);

const lightSettingStore = useLightSettingStore();
const { LogoDynamicLightBtnChecked } = storeToRefs(lightSettingStore);

const checkLogoDynamicLight = (idx) => {
  formLogoData.value.type = 'dynamic';
  formLogoData.value.mode = idx;
  emit('changeLogoLight', { formLogoData });
};

const checkLogoStaticLight = (color, idx) => {
  formLogoData.value.staticColor = Number(idx);
  formLogoData.value.colors[idx].color = color;
  formLogoData.value.type = 'static';
  emit('changeLogoLight', { formLogoData });
};
</script>

<style scoped lang="scss">
.logo-light {
  display: flex;
}
</style>
