<template>
  <div class="explain-container" @mouseenter="onMouseEnter" @mouseleave="showTip = false">
    <div class="explain" v-if="showTip" :style="explainStyle">
      <h4>{{ type }}</h4>
      <template v-if="type === 'DKS'">
        <p>单个按键根据四种不同的按压程度实现一到四种功能。</p>
      </template>
      <template v-if="type === 'SOCD'">
        <p>当两个反向的输入同时触发时的处理方式。</p>
        <br />
        <p>可选择三种不同的触发行为：</p>
        <p>后覆盖：后触发的键会覆盖上次触发的按键。</p>
        <p>第一/二个键优先：第一/二个键将始终覆盖另一个按键。</p>
        <p>中性：两个按键同时触发时，输出都不会被执行。</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { scaleValue } from '@/utils/responsive';

const { type } = defineProps({
  type: { type: String, default: 'DKS' },
});

const showTip = ref(false);
const explainStyle = ref();

const onMouseEnter = (e) => {
  showTip.value = !showTip.value;
  if (!showTip.value) return;

  nextTick(() => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const explainElement = document.querySelector('.explain');
    const explainHeight = explainElement ? explainElement.offsetHeight : 0;

    explainStyle.value = {
      top: `${mouseY - explainHeight / 2}px`,
      left: `${mouseX + scaleValue(20)}px`,
    };
  });
};
</script>

<style scoped lang="scss">
.explain-container {
  width: var(--size-16);
  height: var(--size-16);
  margin-top: var(--spacing-5);
  border-radius: 50%;
  background-image: url('@/assets/images/explain_icon.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;

  & .explain {
    width: var(--size-300);
    padding: var(--spacing-20) 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    color: #fff;
    font-size: var(--font-size-10);
    font-family: 'CN Heavy';
    border-radius: var(--spacing-15);
    border: var(--spacing-2) solid #242424;
    background-color: #000;
    position: fixed;
    z-index: 9999;
    > h4 {
      height: var(--size-14);
      line-height: var(--size-14);
      color: #000;
      font-weight: 500;
      background-color: #91bc00;
      padding: 0 var(--spacing-10);
      border-radius: var(--spacing-10);
      margin-bottom: var(--spacing-10);
    }

    > p {
      line-height: var(--spacing-20);
    }
  }
}
</style>
