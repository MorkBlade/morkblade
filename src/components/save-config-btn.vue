<template>
  <div
    class="save-btn"
    :class="{ 'is-active': isAct }"
    @click="saveConfig"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <img src="@/assets/images/save_icon.svg" alt="" />
    <span>{{ props.btnText }}</span>
  </div>
  <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
</template>

<script setup>
import mDialog from '@/components/dialog.vue';
const props = defineProps({
  btnText: {
    type: String,
    default: '保存更改',
  },
  tag: {
    // 标识要保存什么数据
    type: String,
  },
});
const emits = defineEmits(['saveConfig']);

const isShow = ref(false);
const isAct = ref(false);

const saveConfig = () => {
  isAct.value = false;
  isShow.value = true;
};

const onMouseEnter = () => {
  isAct.value = true;
};
const onMouseLeave = () => {
  isAct.value = false;
};

const onSure = () => {
  isShow.value = false;
  emits('saveConfig');
};
const onCancel = () => {
  isShow.value = false;
};
</script>

<style scoped lang="scss">
.save-btn {
  width: 170px;
  height: 40px;
  margin-left: 45px;
  font-family: 'CN Heavy';
  background-image: url('/src/assets/images/save_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
    object-fit: fill;
    position: absolute;
    top: 10px;
    left: 10px;
  }

  span {
    font-size: 18px;
    color: #fff;
    position: absolute;
    top: 6px;
    left: 65px;
  }
}
.is-active {
  background-image: url('/src/assets/images/save_bgc.svg');
}
</style>
