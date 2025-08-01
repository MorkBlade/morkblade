<template>
  <div class="slider-demo-block">
    <div class="el-slider-box">
      <el-slider v-model="value"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref(0)

/* const formatTooltip = (val: number) => {
  return val / 100
} */
</script>

<style scoped>
.slider-demo-block {
  max-width: 470px;
  display: flex;
  align-items: center;
}
.slider-demo-block .el-slider {
  top: 12px;
  left: 11px;
  position: absolute;
  width: 98%;
  height: 41px;
  --el-slider-runway-height: 15px;
  --el-slider-bar-height: 15px;
}
.slider-demo-block .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}
.slider-demo-block .demonstration + .el-slider {
  flex: 0 0 70%;
}
.slider-demo-block .el-slider .el-slider__bar {
  height: 15px !important;
  background-image: url('@/assets/images/progress_v2.svg') !important;
  background-color: transparent;
  background-repeat: no-repeat;
}
.el-slider .el-slider__runway {
  height: 15px !important;
}
.el-slider-box {
  width: 100%;
  height: 60px;
  background-image: url('@/assets/images/progress_bg.svg');
  background-repeat: no-repeat;
  position: relative;
}
.el-slider__button {
  background-image: url('@/assets/images/progress_touch.svg');
}
</style>
