<template>
  <div class="language-selector">
    <button @click="toggleDropdown" class="language-btn" :class="{ 'is-checked': selectedLanguage }">
      <img class="cur-language-img" :src="languageIcon" alt="Down Arrow" />
    </button>
    <div class="language-list" :style="{ height: `${defaultHeight}px` }">
      <ul>
        <li v-for="(language, index) in languages" :key="index" @click="selectLanguage(language.name)">
          <p></p>
          <img :src="language.icon" alt="" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import languageIcon from '@/assets/images/language.svg';
import zhIcon from '@/assets/images/zh-black.svg';
const defaultHeight = ref(0);

// 定义语言选项
const languages = [
  {
    name: 'zh-CN',
    icon: zhIcon,
    selectedIcon: '@/assets/images/zh-selected-icon.gif',
  },
  {
    name: 'en-US',
    icon: '',
    selectedIcon: '@/assets/images/zh-selected-icon.gif',
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
