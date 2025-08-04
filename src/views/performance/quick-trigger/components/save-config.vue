<template>
  <div class="save-config-box">
    <div class="config-box">
      <span>{{ $t('saveConfig.quickTrigger') }}：</span>
      <!-- <span>{{ quickTrigger }}</span> -->
      <span>{{ $t('saveConfig.yes') }}</span>
    </div>
    <div class="other-config-box">
      <span>{{ $t('saveConfig.triggerTravel') }}：</span>
      <span>{{ travelVal }}mm</span>
    </div>
    <div class="other-config-box">
      <span>{{ $t('saveConfig.rtPress') }}：</span>
      <span>{{ RTKeyDown }}mm</span>
    </div>
    <div class="other-config-box">
      <span>{{ $t('saveConfig.rtRelease') }}：</span>
      <span>{{ RTKeyUp }}mm</span>
    </div>
    <div class="tip-box">
      <img src="@/assets/images/warn_icon.svg" alt="" />
      <span>{{ $t('saveConfig.tip2') }}</span>
    </div>
    <saveConfigBtn :verify="travelVal > 0 && RTKeyDown > 0 && RTKeyUp > 0" @saveConfig="onSure" />
  </div>
</template>

<script setup>
import saveConfigBtn from '@/components/save-config-btn.vue';
const { travelVal, RTKeyDown, RTKeyUp } = defineProps({
  travelVal: {
    type: Number,
    default: 0,
  },
  RTKeyDown: {
    type: Number,
    default: 0,
  },
  RTKeyUp: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(['saveRtConfig']);
const quickTrigger = ref(false);
const triggerTravel = ref(0);

const onSure = () => {
  emit('saveRtConfig', true);
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

  .config-box {
    margin: var(--spacing-20) 0 var(--spacing-20) 0;
  }
  .other-config-box {
    margin-bottom: var(--spacing-20);
  }

  .tip-box {
    margin-bottom: var(--spacing-15);

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
}
</style>
