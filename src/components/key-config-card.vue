<template>
  <template v-for="(ite, idx) in advancedData" :key="idx">
    <div v-if="!shouldSkip(idx)" class="config-card">
      <template v-if="ite.type === 'dks'">
        <p>{{ keyboard[ite.keyId] }}</p>
        <p>{{ keyboard[ite.dks.dks1] }}</p>
        <p>{{ keyboard[ite.dks.dks2] }}</p>
        <p>{{ keyboard[ite.dks.dks3] }}</p>
        <p>{{ keyboard[ite.dks.dks4] }}</p>
      </template>
      <template v-else-if="ite.type === 'mt'">
        <p>{{ keyboard[ite.keyId] }}</p>
        <p>{{ keyboard[ite.mt.dksAll.dks1] }}</p>
        <p>{{ keyboard[ite.mt.dksAll.dks2] }}</p>
      </template>
      <template v-else-if="ite.type === 'socd'">
        <!-- type === 0 的情况 -->
        <template v-if="ite.socd.type === 0">
          <template v-if="ite.socd.direction === 1">
            <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyId] }}</p>
            <p v-if="isNextItemSocd(idx)">{{ keyboard[advancedData[idx + 1].keyId] }}</p>
          </template>
          <template v-else-if="ite.socd.direction === 2">
            <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyId] }}</p>
            <p v-if="isNextItemSocd(idx)">{{ keyboard[advancedData[idx + 1].keyId] }}</p>
          </template>
        </template>
        <!-- type === 1 的情况 -->
        <template v-else-if="ite.socd.type === 1">
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyId] }}</p>
          <p v-if="isNextItemSocd(idx)">{{ keyboard[advancedData[idx + 1].keyId] }}</p>
        </template>
        <template v-else>
          <template v-if="ite.socd.direction === 1">
            <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyId] }}</p>
            <p v-if="isNextItemSocd(idx)">{{ keyboard[advancedData[idx + 1].keyId] }}</p>
          </template>
        </template>
      </template>
      <template v-else-if="ite.type === 'rs'">
        <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyId] }}</p>
        <p v-if="isNextItemRs(idx)">{{ keyboard[advancedData[idx + 1].keyId] }}</p>
      </template>
      <img
        class="separation"
        src="@/assets/images/separation.svg"
        alt=""
        v-if="ite.type !== 'socd' && ite.type !== 'rs'"
      />
      <button class="del_btn" @click="delAdvanced(ite.keyId)">
        <img class="del_icon" src="@/assets/images/del_icon.svg" alt="" />
      </button>
      <div class="title">
        <span>{{ ite.type.toUpperCase() }}</span>
      </div>
    </div>
    <mDialog v-model:isShow="isShow" @sure="onSure" @cancel="onCancel" />
  </template>
</template>

<script setup>
import keyboard from '@/configs/byte-to-key/keyboard';

import mDialog from '@/components/dialog.vue';

const { title, advancedData } = defineProps({
  title: {
    type: String,
  },
  advancedData: {
    type: Array,
  },
});

const emits = defineEmits(['delConfig']);
const isShow = ref(false);
const id = ref(null);
// 判断是否应该跳过当前项（如果是第二个SOCD项）
const shouldSkip = (index) => {
  if (index === 0) return false;
  const currentType = advancedData[index].type;
  const previousType = advancedData[index - 1].type;
  return (currentType === 'socd' && previousType === 'socd') || (currentType === 'rs' && previousType === 'rs');
};

// 判断下一项是否也是SOCD
const isNextItemSocd = (index) => {
  return index + 1 < advancedData.length && advancedData[index + 1].type === 'socd';
};

const isNextItemRs = (index) => {
  return index + 1 < advancedData.length && advancedData[index + 1].type === 'rs';
};

const delAdvanced = (keyId) => {
  isShow.value = true;
  id.value = keyId;
};

const onSure = () => {
  isShow.value = false;
  emits('delConfig', id.value);
};
const onCancel = () => {
  isShow.value = false;
};
</script>

<style scoped lang="scss">
.config-card {
  width: 260px;
  height: 80px;
  display: flex;
  padding-left: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  position: relative;
  background-image: url('@/assets/images/card_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;

  p {
    width: 40px;
    height: 40px;
    font-size: 9px;
    color: #ffffff;
    font-family: 'CN Heavy';
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-image: url('@/assets/images/small_key.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-top: 26px;
    margin-right: 8px;
  }
  & p:first-child {
    margin-right: 16px;
  }

  .separation {
    height: 32px;
    width: 6px;
    object-fit: fill;
    position: absolute;
    left: 56px;
    top: 30px;
  }

  .del_btn {
    width: 28px;
    height: 15px;
    border: none;
    cursor: pointer;
    background-color: transparent;
    position: absolute;
    top: 6px;
    right: 10px;

    .del_icon {
      width: 12px;
      height: 12px;
      object-fit: fill;
      margin-left: 15px;
      position: absolute;
      top: -2px;
      left: 2px;
    }
  }

  .title {
    font-size: 10px;
    width: 60px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN Heavy';
    position: absolute;
    top: 1px;
    left: 0;
  }
}
</style>
