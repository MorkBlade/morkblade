<template>
  <div class="preinstall-box">
    <mCarousel :carouselData="carouselData" :btnText="'应用预设'" />
  </div>
</template>

<script setup>
import mCarousel from '@/components/carousel.vue';

const carouselData = [
  { src: '/src/assets/images/cs.svg' },
  { src: '/src/assets/images/key.svg' },
  { src: '/src/assets/images/lol.svg' },
  { src: '/src/assets/images/osu.svg' },
  { src: '/src/assets/images/woman.png' },
];
</script>

<style scoped lang="scss">
.preinstall-box {
  width: 1310px;
  height: 290px;
  background-image: url('@/assets/images/preinstall_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
}
</style>
