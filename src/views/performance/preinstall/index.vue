<template>
  <div class="preinstall-box">
    <mCarousel :carouselData="carouselData" :btnText="'应用预设'" />
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';

import mCarousel from '@/components/carousel.vue';
import preInstallIcon1 from '@/assets/images/cs.svg';
import preInstallIcon2 from '@/assets/images/key.svg';
import preInstallIcon3 from '@/assets/images/lol.svg';
import preInstallIcon4 from '@/assets/images/osu.svg';
import preInstallIcon5 from '@/assets/images/woman.png';
import sureIcon from '@/assets/images/sure.svg';

const carouselData = [
  { src: preInstallIcon1 },
  { src: preInstallIcon2 },
  { src: preInstallIcon3 },
  { src: preInstallIcon4 },
  { src: preInstallIcon5 },
];
</script>

<style scoped lang="scss">
.preinstall-box {
  width: var(--size-1310);
  height: var(--size-290);
  background-image: url('@/assets/images/preinstall_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
}
</style>
