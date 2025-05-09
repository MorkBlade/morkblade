<template>
  <div class="macro-events-container">
    <h3>宏事件设置</h3>
    <template v-if="itemData?.keyCode">
      <div class="outer-box">
        <p>更改事件按键</p>
        <div class="key" @click="changeKey">{{ keyboardWord[itemData?.keyCode] }}</div>
        <p>更改延迟数值</p>
        <input
          type="number"
          :value="itemData?.delay.toFixed(2)"
          :style="{ margin: `${scaleValue(10)}px 0 ${scaleValue(20)}px 0` }"
          @input="changeDelayVal"
        />
        <p>更改按键状态:</p>
        <div class="btn-group">
          <div
            class="change-status__btn"
            :class="{ 'is-active': isActive === 'down' }"
            @click="changeEventStatus('down')"
          >
            <img :src="isActive === 'down' ? downCheckedIcon : downIcon" alt="" />
            <span>按下</span>
          </div>
          <div class="change-status__btn" :class="{ 'is-active': isActive === 'up' }" @click="changeEventStatus">
            <img :src="isActive === 'up' ? upCheckedIcon : upIcon" alt="" />
            <span>抬起</span>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="outer-box">
        <p :style="{ marginTop: `${scaleValue(50)}px` }">更改延迟数值 单位(ms)</p>
        <input type="number" :value="itemData?.timeDifference.toFixed(2)" @input="changeDelayVal" />
      </div>
    </template>
  </div>
  <div class="character-container" v-if="showCharacter">
    <div class="content">
      <h3>更改事件按键:</h3>
      <div class="key" @mouseup="Keydrop">{{ currentKey }}</div>
      <div class="tabs">
        <div
          class="tab-item"
          v-for="(ite, idx) in characterArr"
          :key="ite.icon"
          :class="checkedIdx == idx ? 'selected' : ''"
          @click="onCheck(idx)"
        >
          <img
            :src="checkedIdx == idx ? `/src/assets/images/${ite.icon}_c.svg` : `/src/assets/images/${ite.icon}.svg`"
            alt=""
          />
          <span>{{ ite.name }}</span>
        </div>
      </div>
      <div class="keys-box">
        <template v-if="!checkedIdx">
          <key v-for="ite in basic" :key="ite" :key-value="ite" @select="selectItem" />
        </template>
        <template v-if="checkedIdx === 1">
          <key v-for="ite in extend" :key="ite" :key-value="ite" @select="selectItem" />
        </template>
        <template v-if="checkedIdx === 2">
          <key v-for="ite in special" :key="ite" :key-value="ite" @select="selectItem" />
        </template>
        <template v-if="checkedIdx === 3">
          <key v-for="ite in keyboard" :key="ite" :key-value="ite" @select="selectItem" />
        </template>
        <template v-if="checkedIdx === 4">
          <key v-for="ite in mouse" :key="ite" :key-value="ite" @select="selectItem" />
        </template>
      </div>
      <div class="operation-btn">
        <saveConfigBtn btnText="应用更改" :icon="icon1" @saveConfig="saveConfig" :needKeys="false" />
        <saveConfigBtn
          btnText="取消更改"
          type="warning"
          :icon="icon2"
          @saveConfig="saveConfig('cancel')"
          :needKeys="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { scaleValue } from '@/utils/responsive.js';
import { useKeyboardStore } from '@/stores';

import saveConfigBtn from '@/components/save-config-btn.vue';

import upIcon from '@/assets/images/up.svg';
import upCheckedIcon from '@/assets/images/up_checked.svg';
import downIcon from '@/assets/images/down.svg';
import downCheckedIcon from '@/assets/images/down_checked.svg';
import icon1 from '@/assets/images/sure.svg';
import icon2 from '@/assets/images/clear_icon.svg';
import keyboardWord from '@/configs/byte-to-key/keyboard';

const { data } = defineProps({
  data: { type: Object, default: {} },
});

const emit = defineEmits(['update:delay', 'update:key', 'update:status']);

const keyboardStore = useKeyboardStore();

const itemData = ref(null);
const isActive = ref('');
const showCharacter = ref(false);
const checkedIdx = ref(0);
const currentKey = ref(null);

let timer = null;
const characterArr = [
  { name: '基本字符', icon: 'basic' },
  { name: '扩展字符', icon: 'extend' },
  { name: '特殊字符', icon: 'special' },
  { name: '键盘控制', icon: 'keyboard' },
  { name: '鼠标键', icon: 'mouse' },
];
const extend = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
const number = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98];
const special = [45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 56, 57];
const basic = [40, 41, 42, 43, 44, 79, 80, 81, 82, 224, 225, 226, 227, 228, 229, 230, 231];
const keyboard = [
  61696, 61697, 61698, 61699, 61704, 61705, 61706, 61708, 61707, 62217, 62224, 62225, 62226, 62227, 62228, 62229, 62231,
  62245, 62246, 62247, 62248, 62249, 62250, 62251, 62252, 62255,
];
const mouse = [29441, 29442, 29443, 29444, 29445, 29446, 29447, 29448, 29449];

watch(
  () => data,
  (newValue) => {
    itemData.value = newValue;
    currentKey.value = keyboardWord[newValue?.keyCode];
  },
  { immediate: true, deep: true },
);

// 监听 itemData 变化，初始化 isActive 状态
watch(
  () => itemData.value,
  (newValue) => {
    if (newValue && newValue.keyCode) {
      // 根据传入的按键状态设置 isActive
      isActive.value = newValue.status ? 'down' : 'up';
      console.log('watch itemData.value', newValue);
    } else {
      // 非按键项重置 isActive
      isActive.value = '';
    }
  },
  { immediate: true, deep: true },
);

const changeEventStatus = (status) => {
  if (!itemData.value || !itemData.value.keyCode) return;

  if (status === 'down') {
    isActive.value = 'down';
    // 发送状态更新事件
    emit('update:status', 1);
  } else {
    isActive.value = 'up';
    // 发送状态更新事件
    emit('update:status', 0);
  }
};

const changeDelayVal = (e) => {
  const value = parseInt(e.target.value) || 0;
  timer && clearTimeout(timer);
  timer = setTimeout(() => {
    if (itemData.value) emit('update:delay', value);
    console.log('update macro key delay');
  }, 500);
};

const changeKey = () => {
  showCharacter.value = !showCharacter.value;
};

const Keydrop = () => {
  if (!keyboardStore.selectKey.keyCode) return;
  const keyVal = keyboardWord[keyboardStore.selectKey.keyCode];
  currentKey.value = keyVal;
  // if (keyVal && itemData.value && itemData.value.keyType === 'key') {
  //   // 发送按键更新事件
  //   emit('update:key', keyVal);

  //   showCharacter.value = false;
  // }
};

const onCheck = (ite) => {
  checkedIdx.value = ite;
};

const selectItem = async (keyVal) => {
  // 更新键盘存储中的选定键
  keyboardStore.selectKey.keyCode = keyVal;
};

const saveConfig = async (action) => {
  if (action === 'cancel') {
    // 取消操作，不发送更新
    showCharacter.value = false;
    return;
  }

  // 获取当前选择的按键值
  const keyVal = keyboardStore.selectKey.keyCode;

  if (keyVal && itemData.value && itemData.value.keyCode) {
    // 发送按键更新事件
    emit('update:key', keyVal);
  }

  // 关闭按键选择界面
  showCharacter.value = false;
};
</script>

<style scoped lang="scss">
.macro-events-container {
  width: var(--size-300);
  height: var(--macro-card-height);
  box-sizing: border-box;
  background-color: #000;
  border: var(--spacing-3) solid #202020;
  border-radius: var(--spacing-15);
  margin-bottom: var(--spacing-25);

  h3 {
    margin: var(--spacing-25) 0 var(--spacing-34) var(--spacing-30);
    line-height: 1;
    color: #fff;
    font-size: var(--font-size-16);
    font-family: 'CN Heavy';
  }

  p {
    font-size: var(--font-size-14);
    font-family: 'CN Heavy';
    color: #fff;
  }

  .outer-box {
    display: flex;
    flex-direction: column;
    align-items: center;

    .change-info {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    .key {
      width: var(--size-50);
      height: var(--size-50);
      // margin: 22px 0 50px 20px;
      margin: var(--spacing-10) 0;
      line-height: 1;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-14);
      color: #fff;
      font-family: 'CN Heavy';
      box-sizing: border-box;
      border: var(--spacing-2) solid #232323;
      border-radius: var(--spacing-10);
      background-color: #181818;
      cursor: pointer;

      &:hover {
        border-color: #91bc00;
      }
    }

    .btn-group {
      width: var(--size-240);
      height: var(--size-40);
      margin-top: var(--spacing-30);
      display: flex;
      justify-content: space-between;

      .change-status__btn {
        width: var(--size-100);
        height: 100%;
        font-size: var(--font-size-16);
        font-family: 'CN Heavy';
        color: #505050;
        border-radius: var(--spacing-5);
        background: #181818;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &.is-active {
          background: #91bc00;
          color: #000;
        }

        span {
          margin-left: var(--spacing-5);
        }
      }
    }

    input {
      width: var(--size-100);
      height: var(--size-40);
      margin: var(--spacing-40) 0 0 var(--spacing-12);
      text-align: center;
      color: #fff;
      font-size: var(--font-size-14);
      font-family: 'CN Heavy';
      background-color: #181818;
      border-radius: var(--spacing-5);
      border: none;
      outline: none;
    }
    /* For Webkit browsers (Chrome, Safari) */
    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* For Firefox */
    input[type='number'] {
      -moz-appearance: textfield; /* Firefox */
    }
  }
}

.character-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);

  .content {
    width: var(--size-1300);
    height: var(--size-600);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    border: var(--spacing-3) solid #202020;
    border-radius: var(--spacing-15);
    background: #000;
    position: relative;

    h3 {
      margin: var(--spacing-54) 0 var(--spacing-20) 0;
      color: #fff;
      font-size: var(--font-size-16);
      font-family: 'CN Heavy';
    }

    .key {
      width: var(--size-50);
      height: var(--size-50);
      margin-bottom: var(--spacing-90);
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-14);
      color: #fff;
      font-family: 'CN Heavy';
      box-sizing: border-box;
      border: var(--spacing-2) solid #232323;
      border-radius: var(--spacing-10);
      background-color: #181818;
      cursor: pointer;

      &:hover {
        border-color: #91bc00;
      }
    }

    .tabs {
      display: flex;
      margin: var(--spacing-30) 0 var(--spacing-20) var(--spacing-30);

      .tab-item {
        width: var(--size-150);
        height: var(--size-30);
        font-size: var(--font-size-15);
        margin-left: var(--spacing-50);
        box-sizing: border-box;
        font-family: 'CN Heavy';
        color: #242424;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url('@/assets/images/normal_bg.svg');
        background-size: cover;
        background-repeat: no-repeat;
        cursor: pointer;

        img {
          width: var(--size-20);
          height: var(--size-20);
          object-fit: fill;
          vertical-align: middle;
          margin-right: var(--spacing-5);
        }
      }

      .selected {
        background-image: url('@/assets/images/normal_bgC.gif');
        color: #000000;
      }
    }

    .keys-box {
      width: var(--macro-change-key-width);
      margin-left: var(--spacing-60);
      display: flex;
      flex-wrap: wrap;

      .active {
        background-image: url('@/assets/images/key_bgC.svg');
      }
    }

    .operation-btn {
      display: flex;
      position: absolute;
      bottom: var(--spacing-50);
    }
  }
}
</style>
