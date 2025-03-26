<template>
  <div class="save-config-box">
    <div class="config-box">
      <span>快速触发：</span>
      <span>{{ quickTrigger }}</span>
    </div>
    <div class="other-config-box">
      <span>触发行程：</span>
      <span>{{ travelVal.toFixed(2) }}mm</span>
    </div>
    <div class="other-config-box">
      <span>RT按下行程：</span>
      <span>{{ RTKeyDown.toFixed(2) }}mm</span>
    </div>
    <div class="other-config-box">
      <span>RT抬起行程：</span>
      <span>{{ RTKeyUp.toFixed(2) }}mm</span>
    </div>
    <div class="tip-box">
      <img src="@/assets/images/warn_icon.svg" alt="" />
      <span>提示：保存选择按钮为RT模式</span>
    </div>
    <saveConfigBtn @saveConfig="onSure" />
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

  .config-box {
    margin: 20px 0 20px 0;
  }
  .other-config-box {
    margin-bottom: 20px;
  }

  .tip-box {
    margin-bottom: 15px;

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
}
</style>
