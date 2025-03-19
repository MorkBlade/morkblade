<template>
  <div class="footer">
    <div class="footer-content">
      <img src="@/assets/images/logo2.png" alt="" />
      <p>Copyright 2024, All Rights Reserved by Morkblade</p>
    </div>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.footer {
  margin-top: 51px;
  height: 100px;
  background-color: #000000;
  font-family: 'CN Regular';
  font-size: 15px;
  // position: fixed;
  // bottom: 0;
  // left: 0;

  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      width: 188px;
      height: 20px;
      margin: 30px 0 15px 0;
    }
    p::before {
      content: '© ';
    }
  }
}
</style>
