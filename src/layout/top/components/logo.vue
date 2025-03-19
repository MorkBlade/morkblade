<template>
  <div class="logo-box">
    <img class="logo-img" src="/src/assets/images/logo.png" alt="" />
    <img class="bar-img" src="/src/assets/images/green_bar.svg" alt="" />
    <span>BOLD TKL</span>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.logo-box {
  display: flex;
  justify-content: center;
  align-content: center;
  margin-left: -100px;
  flex: 2;

  .logo-img {
    width: 207px;
    height: 22px;
    margin-top: 26px;
  }

  .bar-img {
    width: 4px;
    height: 22px;
    margin: 26px 15px;
  }

  span {
    margin-top: 26px;
    font-size: 18px;
    color: #ffffff;
  }
}
</style>
