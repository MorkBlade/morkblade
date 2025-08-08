<template>
  <div class="save-config-box">
    <div class="config-box1">
      <span>{{ t('saveConfig.quickTrigger') }}：</span>
      <!-- <span>{{ quickTrigger }}</span> -->
      <span>{{ t('saveConfig.no') }}</span>
    </div>
    <div class="config-box2">
      <span>{{ t('saveConfig.triggerTravel') }}：</span>
      <span>{{ travelVal }}mm</span>
    </div>
    <div class="tip-box">
      <img src="@/assets/images/warn_icon.svg" alt="" />
      <span>{{ t('saveConfig.tip') }}</span>
    </div>
    <saveConfigBtn :verify="travelVal > 0" @saveConfig="onclick" />
  </div>
</template>

<script setup>
import saveConfigBtn from '@/components/save-config-btn.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { travelVal } = defineProps({
  travelVal: {
    type: Number,
    default: 0,
  },
});
const emits = defineEmits(['saveSingleTravel']);
const quickTrigger = ref(false);
const triggerTravel = ref(0);

const onclick = () => {
  emits('saveSingleTravel');
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
    width: 100%;
    
    margin: var(--spacing-60) 0 var(--spacing-40) 0;

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
