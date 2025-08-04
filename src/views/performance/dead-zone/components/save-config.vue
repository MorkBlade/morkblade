<template>
  <div class="save-config-box">
    <div class="config-box1">
      <span>{{ $t('deadZone.pressDead') }}：</span>
      <span>{{ keyDownUp }}mm</span>
    </div>
    <div class="config-box2">
      <span>{{ $t('deadZone.releaseDead') }}：</span>
      <span>{{ keyUpVal }}mm</span>
    </div>
    <div :style="{ marginTop: '130px' }">
      <saveConfigBtn :verify="keyDownUp !== null && keyUpVal !== null" @saveConfig="saveConfig" />
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
  width: var(--size-260);
  height: var(--size-290);
  display: flex;
  text-align: center;
  flex-direction: column;
  align-content: center;
  background-image: url('@/assets/images/formation_test_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  font-size: var(--font-size-15);
  color: #cccccc;
  font-family: 'CN Heavy';

  .config-box1 {
    margin: var(--spacing-20) 0 var(--spacing-30) 0;
  }

  .tip-box {
    margin: var(--spacing-90) 0 var(--spacing-20) 0;

    img {
      width: var(--size-13);
      height: var(--size-13);
      object-fit: fill;
    }

    span {
      font-size: var(--font-size-13);
      margin-left: var(--spacing-5);
    }
  }

  .save_btn {
    margin-top: var(--spacing-130);
  }
}
</style>
