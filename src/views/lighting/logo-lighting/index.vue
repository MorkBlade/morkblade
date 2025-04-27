<template>
  <div class="logo-light">
    <staticLightCard :staticLightColorList="logoLighting.staticColors" @checkLogoStaticLight="checkLogoStaticLight" />
    <dynamicLightCard :dynamicLightMode="logoLighting.mode - 0" @checkDynamicLight="checkLogoDynamicLight" />
    <!-- :dynamicLightMode="typeof logoLighting.mode === 'string' ? 0 : logoLighting.mode" -->
  </div>
</template>

<script setup>
import staticLightCard from '@/components/static-light-card.vue';
import dynamicLightCard from '@/components/dynamic-light-card.vue';
import { useLightSettingStore } from '@/stores';

const logoLighting = defineModel();
const emit = defineEmits(['changeLogoLight']);

const lightSettingStore = useLightSettingStore();

const checkLogoDynamicLight = (idx) => {
  logoLighting.value.type = 'dynamic';
  logoLighting.value.mode = idx;

  emit('changeLogoLight');
};

const checkLogoStaticLight = (color, idx) => {
  logoLighting.value.selectStaticColor = Number(idx);
  logoLighting.value.staticColors[idx].color = color;
  logoLighting.value.type = 'static';

  emit('changeLogoLight');
};
</script>

<style scoped lang="scss">
.logo-light {
  display: flex;
}
</style>
