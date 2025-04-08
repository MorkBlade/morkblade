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
import languageIcon from '@/assets/images/language.svg';

import zhIcon1 from '@/assets/images/zhIcon1.svg';
import zhIcon2 from '@/assets/images/zhIcon2.svg';
import enIcon1 from '@/assets/images/enIcon1.svg';
import enIcon2 from '@/assets/images/enIcon2.svg';
import jpIcon1 from '@/assets/images/jpIcon1.svg';
import jpIcon2 from '@/assets/images/jpIcon2.svg';
import krIcon1 from '@/assets/images/krIcon1.svg';
import krIcon2 from '@/assets/images/krIcon2.svg';

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
  defaultHeight.value = defaultHeight.value ? 0 : 200;
};

// 选择语言
const selectLanguage = (language) => {
  console.log('click language', language);
  selectedLanguage.value = language;
  defaultHeight.value = defaultHeight.value ? 0 : 200;
};
</script>

<style scoped lang="scss">
.language-selector {
  position: relative;

  .language-btn {
    width: 38px;
    height: 38px;
    margin-top: 17px;
    margin-right: 50px;
    display: flex;
    align-items: center;
    padding: 10px;
    border: none;
    cursor: pointer;
    /* background: transparent; */
    border-radius: 5px;
    background: transparent;
    background-image: url('@/assets/images/bg-default.svg');
    background-size: cover;
    background-repeat: no-repeat;

    .cur-language-img {
      width: 24px;
      height: 24px;
      margin-top: 0.5px;
      margin-left: -3px;
    }
  }

  .is-checked {
    background-image: url('@/assets/images/bg-choose.gif');
  }

  .language-list {
    position: absolute;
    top: 60px;
    left: 0px;
    transition: height 0.3s ease;
    overflow: hidden;

    li {
      position: relative;
      list-style: none;
      padding: 10px;
      cursor: pointer;
      width: 38px;
      height: 38px;
      background-image: url('@/assets/images/bg.svg');
      background-size: 'cover';
      background-position: 'center';
      background-repeat: 'no-repeat';
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
      top: 7px;
      left: 7px;
      right: 0;
      bottom: 0;
      z-index: 98;
      width: 24px;
      height: 24px;
      background-image: url('@/assets/images/green_bg.gif');
      background-size: cover;
      background-repeat: no-repeat;
    }
  }
}
</style>
