<template>
  <template v-for="(ite, idx) in advancedData" :key="idx">
    <div v-if="!shouldSkip(idx)" class="config-card">
      <template v-if="TYPE_MAPPING[ite.advancedType] === 'dks' && ite.dks">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ keyboard[ite.dks.dks[0]] }}</p>
        <p>{{ keyboard[ite.dks.dks[1]] }}</p>
        <p>{{ keyboard[ite.dks.dks[2]] }}</p>
        <p>{{ keyboard[ite.dks.dks[3]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'mt' && ite.mt">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ keyboard[ite.mt.mt?.dksAll?.[0]] }}</p>
        <p>{{ keyboard[ite.mt.mt?.dksAll?.[1]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'socd' && ite.socd">
        <!-- type === 0 的情况 -->
        <template v-if="ite.socd.socdMode === 0">
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyValue] }}</p>
          <p>{{ keyboard[getNextSocdKeyId(idx)] }}</p>
        </template>
        <!-- type === 1 的情况 -->
        <template v-else-if="ite.socd.socdMode === 1">
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyValue] }}</p>
          <p>{{ keyboard[getNextSocdKeyId(idx)] }}</p>
        </template>
        <template v-else>
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyValue] }}</p>
          <p>{{ keyboard[getNextSocdKeyId(idx)] }}</p>
        </template>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'rs' && ite.rs">
        <p :style="{ marginRight: '8px' }">{{ keyboard[ite.rs.rs[0]] }}</p>
        <p>{{ keyboard[ite.rs.rs[1]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'end' && ite.end">
        <p>{{ keyboard[ite.end.end.dks[0]] }}</p>
        <p>{{ keyboard[ite.end.end.dks[1]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'tgl' && ite.tgl">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ keyboard[ite.tgl.tgl?.dksAll?.[0]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'mpt' && ite.mpt">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ keyboard[ite.mpt.dks[0]] }}</p>
        <p>{{ keyboard[ite.mpt.dks[1]] }}</p>
        <p>{{ keyboard[ite.mpt.dks[2]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'macro' && ite.macro">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ `Mcr${ite.macro.macro.macro.id + 1}` }}</p>
      </template>
      <img
        class="separation"
        src="@/assets/images/separation.svg"
        alt=""
        v-if="TYPE_MAPPING[ite.advancedType] !== 'socd' && TYPE_MAPPING[ite.advancedType] !== 'rs'"
      />
      <button class="del_btn" @click="delAdvanced(ite, TYPE_MAPPING[ite.advancedType])">
        <img class="del_icon" src="@/assets/images/del_icon.svg" alt="" />
      </button>
      <div class="title">
        <span>{{ TYPE_MAPPING[ite.advancedType]?.toUpperCase() }}</span>
      </div>
    </div>
  </template>
</template>

<script setup>
/*

    <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'socd'">
        <!-- type === 0 的情况 -->
        <template v-if="ite.socd.socdMode === 0">
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyValue] }}</p>
          <p>{{ keyboard[getNextSocdKeyId(idx)] }}</p>
          <!-- v-if="isNextItemSocd(idx)" -->
        </template>
        <!-- type === 1 的情况 -->
        <template v-else-if="ite.socd.socdMode === 1">
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyValue] }}</p>
          <p>{{ keyboard[getNextSocdKeyId(idx)] }}</p>
        </template>
        <template v-else>
          <!-- <template v-if="ite.socd.direction === 1"> -->
          <p :style="{ marginRight: '8px' }">{{ keyboard[ite.keyValue] }}</p>
          <p>{{ keyboard[getNextSocdKeyId(idx)] }}</p>
          <!-- </template> -->
        </template>
      </template>


      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'end'">
        <p>{{ keyboard[ite.end.end.dks[0]] }}</p>
        <p>{{ keyboard[ite.end.end.dks[1]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'tgl'">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ keyboard[ite.tgl.tgl.dksAll[0]] }}</p>
      </template>
      <template v-else-if="TYPE_MAPPING[ite.advancedType] === 'mpt'">
        <p>{{ keyboard[ite.keyValue] }}</p>
        <p>{{ keyboard[ite.mpt.dks[0]] }}</p>
        <p>{{ keyboard[ite.mpt.dks[1]] }}</p>
        <p>{{ keyboard[ite.mpt.dks[2]] }}</p>
      </template>




*/
import keyboard from '@/configs/byte-to-key/keyboard';

const { title, advancedData } = defineProps({
  title: {
    type: String,
  },
  advancedData: {
    type: Array,
  },
});

const emit = defineEmits(['delConfig']);

const advancedVal = ref(null);
const delAdvancedType = ref('');
const delAdvancedItem = ref(null);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const TYPE_MAPPING = {
  1: 'dks',
  2: 'mpt',
  3: 'mt',
  4: 'tgl',
  5: 'end',
  6: isVersion2 ? 'socd' : 'macro',
  7: 'rs',
  8: 'socd',
  9: 'rs',
};

// 判断是否应该跳过当前项（如果是第二个SOCD项）
const shouldSkip = (index) => {
  if (index === 0) return false;
  const current = advancedData[index];

  // Skip if type is macro
  // if (TYPE_MAPPING[current.advancedType] === 'macro') return true;

  if (TYPE_MAPPING[current.advancedType] !== 'socd' && TYPE_MAPPING[current.advancedType] !== 'rs') return false;

  for (let i = 0; i < index; i++) {
    const prev = advancedData[i];
    // socd 跳过逻辑
    if (TYPE_MAPPING[prev.advancedType] === 'socd' && Array.isArray(prev.socd?.socd)) {
      if (prev.socd.socd.includes(current.keyValue)) {
        return true;
      }
    }
    // rs 跳过逻辑
    if (TYPE_MAPPING[prev.advancedType] === 'rs' && Array.isArray(prev.rs?.rs) && Array.isArray(current.rs?.rs)) {
      // 判断两组 rs 是否完全一样（顺序无关）
      const prevSet = new Set(prev.rs.rs);
      const currSet = new Set(current.rs.rs);
      if (prevSet.size === currSet.size && [...prevSet].every((v) => currSet.has(v))) {
        return true;
      }
    }
  }
  return false;
};

// 获取下一个SOCD项的keyId
const getNextSocdKeyId = (index) => {
  const currentKey = advancedData[index].keyValue;
  for (let i = index + 1; i < advancedData.length; i++) {
    const item = advancedData[i];
    if (TYPE_MAPPING[item.advancedType] === 'socd' && Array.isArray(item.socd.socd)) {
      const socdArr = item.socd.socd;
      if (socdArr.includes(currentKey)) {
        // 返回另一个 key
        return socdArr.find((key) => key !== currentKey);
      }
    }
    if (TYPE_MAPPING[item.advancedType] === 'rs' && Array.isArray(item.rs.rs)) {
      const rsdArr = item.rs.rs;
      if (rsdArr.includes(currentKey)) {
        // 返回另一个 key
        return rsdArr.find((key) => key !== currentKey);
      }
    }
  }
  return null;
};

// 判断下一项是否也是SOCD
const isNextItemSocd = (index) => {
  // 从当前索引开始遍历，查找下一个SOCD项
  for (let i = index + 1; i < advancedData.length; i++) {
    if (advancedData[i].type === 'socd') {
      return true;
    }
  }
  return false;
};
const isNextItemRs = (index) => {
  return index + 1 < advancedData.length && advancedData[index + 1].type === 'rs';
};

const delAdvanced = (item, type) => {
  emit('delConfig', item, type);
};
</script>

<style scoped lang="scss">
.config-card {
  width: var(--assignment-config-card-width);
  height: var(--size-80);
  display: flex;
  padding-left: var(--spacing-10);
  margin-bottom: var(--spacing-10);
  box-sizing: border-box;
  position: relative;
  background-image: url('@/assets/images/card_bg.svg');
  background-size: cover;
  background-repeat: no-repeat;

  p {
    width: var(--size-40);
    height: var(--size-40);
    font-size: var(--font-size-9);
    color: #ffffff;
    font-family: 'CN Heavy';
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-image: url('@/assets/images/small_key.svg');
    background-size: cover;
    background-repeat: no-repeat;
    margin-top: calc(var(--spacing-30) - var(--spacing-4));
    margin-right: calc(var(--spacing-10) - var(--spacing-2));
  }
  & p:first-child {
    margin-right: var(--spacing-16);
  }

  .separation {
    height: var(--size-32);
    width: var(--spacing-6);
    object-fit: fill;
    position: absolute;
    left: calc(var(--size-40) + var(--size-16));
    top: var(--size-30);
  }

  .del_btn {
    width: var(--size-28);
    height: var(--size-15);
    border: none;
    cursor: pointer;
    background-color: transparent;
    position: absolute;
    top: var(--spacing-6);
    right: var(--spacing-10);

    .del_icon {
      width: var(--size-12);
      height: var(--size-12);
      object-fit: fill;
      margin-left: var(--spacing-15);
      position: absolute;
      top: calc(var(--scale-1) + var(--scale-1));
      left: var(--spacing-2);
    }
  }

  .title {
    font-size: var(--font-size-10);
    width: var(--size-60);
    height: var(--size-20);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'CN Heavy';
    position: absolute;
    top: var(--spacing-1);
    left: 0;
  }
}
</style>
