<template>
  <div class="save-config-box">
    <div class="config-box1">
      <span>快速触发：</span>
      <span>{{ quickTrigger }}</span>
    </div>
    <div class="config-box2">
      <span>触发行程：</span>
      <span>{{ props.travelVal.toFixed(2) }}mm</span>
    </div>
    <div class="tip-box">
      <img src="@/assets/images/warn_icon.svg" alt="" />
      <span>提示：保存选择按钮为机械模式</span>
    </div>
    <saveConfigBtn @saveConfig="onclick" />
  </div>
</template>

<script setup>
import saveConfigBtn from '@/components/save-config-btn.vue';
const props = defineProps({
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
}
</style>
