<template>
  <div class="logo-box">
    <img class="logo-img" src="/src/assets/images/logo.png" alt="" />
    <img class="bar-img" src="/src/assets/images/green_bar.svg" alt="" />
    <template v-if="isVersion2">
      <span>M K 6 0</span>
    </template>
    <template v-else>
      <span>BOLD TKL</span>
    </template>
  </div>
</template>

<script setup>
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
</script>

<style scoped lang="scss">
.logo-box {
  display: flex;
  justify-content: center;
  align-content: center;
  margin-left: calc(var(--spacing-100) * -1);
  flex: 2;

  .logo-img {
    width: calc(var(--size-200) + var(--size-7));
    height: var(--size-22);
    margin-top: var(--spacing-26);
  }

  .bar-img {
    width: var(--size-4);
    height: var(--size-22);
    margin: var(--spacing-26) var(--spacing-15);
  }

  span {
    margin-top: var(--spacing-21);
    font-family: 'Ridenation';
    font-size: var(--font-size-18);
    color: #ffffff;
  }
}
</style>
