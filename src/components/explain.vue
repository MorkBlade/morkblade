<template>
  <div class="explain-container" @mouseenter="onMouseEnter" @mouseleave="showTip = false">
    <div class="explain" v-if="showTip" :style="explainStyle">
      <h4>{{ type }}</h4>
      <template v-if="type === 'DKS'">
        <p>{{ $t('explain.dks') }}</p>
      </template>
      <template v-if="type === 'SOCD'">
        <p>{{ $t('explain.socd') }}</p>
        <br />
        <p>{{ $t('explain.socdTip1') }}</p>
        <p>{{ $t('explain.socdMode0') }}</p>
        <p>{{ $t('explain.socdMode1') }}</p>
        <p>{{ $t('explain.socdMode2') }}</p>
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
    text-align: center;
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
