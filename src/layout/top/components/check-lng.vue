<template>
  <div class="language-selector">
    <button @click="toggleDropdown" class="language-btn" :class="{ 'is-checked': selectedLanguage }">
      <img class="cur-language-img" :src="languageIcon" alt="Down Arrow" />
    </button>
    <div class="language-list" :style="{ height: `${defaultHeight}px` }">
      <ul>
        <li v-for="(language, index) in languages" :key="index" @click="selectLanguage(language.name)">
          <p v-if="language.name === selectedLanguage"></p>
          <img :src="language.name === selectedLanguage ? language.selectedIcon : language.icon" alt="" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { scaleValue } from '@/utils/responsive.js';

import zhIcon1 from '@/assets/images/zhIcon1.svg';
import zhIcon2 from '@/assets/images/zhIcon2.svg';
import enIcon1 from '@/assets/images/enIcon1.svg';
import enIcon2 from '@/assets/images/enIcon2.svg';
import jpIcon1 from '@/assets/images/jpIcon1.svg';
import jpIcon2 from '@/assets/images/jpIcon2.svg';
import krIcon1 from '@/assets/images/krIcon1.svg';
import krIcon2 from '@/assets/images/krIcon2.svg';
import languageIcon from '@/assets/images/language.svg';

const defaultHeight = ref(0);

// 定义语言选项
const languages = [
  {
    name: 'zh-CN',
    icon: zhIcon1,
    selectedIcon: zhIcon2,
  },
  {
    name: 'en-US',
    icon: enIcon1,
    selectedIcon: enIcon2,
  },
  {
    name: 'ko-KR',
    icon: krIcon1,
    selectedIcon: krIcon2,
  },
  {
    name: 'ja-JP',
    icon: jpIcon1,
    selectedIcon: jpIcon2,
  },
];

// 当前选中的语言
const selectedLanguage = ref(null);

// 切换下拉菜单状态
const toggleDropdown = () => {
  defaultHeight.value = defaultHeight.value ? 0 : scaleValue(200);
};

// 选择语言
const selectLanguage = (language) => {
  // console.log('click language', language);
  selectedLanguage.value = language;
  defaultHeight.value = defaultHeight.value ? 0 : scaleValue(200);
};
</script>

<style scoped lang="scss">
.language-selector {
  position: relative;

  .language-btn {
    width: var(--spacing-38);
    height: var(--spacing-38);
    // margin-top: var(--spacing-20);
    margin-right: var(--spacing-30);
    display: flex;
    align-items: center;
    padding: var(--spacing-10);
    border: none;
    cursor: pointer;
    /* background: transparent; */
    border-radius: var(--spacing-5);
    background: transparent;
    // background-image: url('@/assets/images/bg-default.svg');
    background-size: cover;
    background-repeat: no-repeat;

    .cur-language-img {
      width: var(--spacing-24);
      height: var(--spacing-24);
      margin-top: var(--spacing-1);
      margin-left: calc(var(--spacing-3) * -1);
    }
  }

  .is-checked {
    // background-image: url('@/assets/images/bg-choose.gif');
  }

  .language-list {
    position: absolute;
    top: var(--spacing-60);
    left: 0;
    transition: height 0.3s ease;
    overflow: hidden;

    li {
      position: relative;
      list-style: none;
      padding: var(--spacing-10);
      cursor: pointer;
      width: var(--spacing-38);
      height: var(--spacing-38);
      background-image: url('@/assets/images/bg.svg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    li img {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 99;
      /* background-color: pink; */
    }

    li p {
      position: absolute;
      top: var(--spacing-7);
      left: var(--spacing-7);
      right: 0;
      bottom: 0;
      z-index: 98;
      width: var(--spacing-24);
      height: var(--spacing-24);
      background-image: url('@/assets/images/green_bg.gif');
      background-size: cover;
      background-repeat: no-repeat;
    }
  }
}
</style>
