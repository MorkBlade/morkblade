<template>
  <div class="save-config-box">
    <div class="config-box1">
      <span>按下死区：</span>
      <span>{{ keyDownUp.toFixed(2) }}mm</span>
    </div>
    <div class="config-box2">
      <span>抬起死区：</span>
      <span>{{ keyUpVal.toFixed(2) }}mm</span>
    </div>
    <div :style="{ marginTop: '130px' }">
      <saveConfigBtn @saveConfig="saveConfig" />
    </div>
  </div>
</template>

<script setup>
import saveConfigBtn from '@/components/save-config-btn.vue';
const { keyDownUp, keyUpVal } = defineProps({
  keyDownUp: {
    type: Number,
    default: 0,
  },
  keyUpVal: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(['saveDeadZoneTravel']);
const quickTrigger = ref(false);
const triggerTravel = ref(0);

const saveConfig = () => {
  emit('saveDeadZoneTravel');
};
</script>

<style scoped lang="scss">
.save-config-box {
  width: 260px;
  height: 290px;
  display: flex;
  text-align: center;
  flex-direction: column;
  align-content: center;
  background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  font-size: 15px;
  color: #cccccc;
  font-family: 'CN Heavy';

  .config-box1 {
    margin: 20px 0 30px 0;
  }

  .tip-box {
    margin: 90px 0 20px 0;

    img {
      width: 13px;
      height: 13px;
      object-fit: fill;
    }

    span {
      font-size: 13px;
      margin-left: 5px;
    }
  }

  .save_btn {
    margin-top: 130px;
  }
}
</style>
