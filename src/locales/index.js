import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import { createI18n } from 'vue-i18n';

// 导入语言文件
const langModules = import.meta.glob('./lang/*/index.js', { eager: true });

const langModuleMap = new Map();

export const langCode = [];

export const localeConfigKey = 'tdesign-starter-locale';



// 生成语言模块列表
const generateLangModuleMap = () => {
  const fullPaths = Object.keys(langModules);
  fullPaths.forEach((fullPath) => {
    const k = fullPath.replace('./lang', '');
    const startIndex = 1;
    const lastIndex = k.lastIndexOf('/');
    const code = k.substring(startIndex, lastIndex);
    langCode.push(code);
    langModuleMap.set(code, langModules[fullPath]);
  });
};

// 立即生成语言模块映射
generateLangModuleMap();

// 导出 Message
const importMessages = computed(() => {
  const message = {};
  langModuleMap.forEach((value, key) => {
    message[key] = value.default;
  });
  return message;
});

// 获取初始语言
const getInitialLocale = () => {
  // 1. 优先使用 localStorage 中保存的语言设置
  const storedLocale = useLocalStorage(localeConfigKey, null).value;
  if (storedLocale && langCode.includes(storedLocale)) {
    return storedLocale;
  }

  // 2. 使用浏览器语言
  const browserLang = navigator.language;
  
  // 简单映射逻辑
  if (browserLang.startsWith('zh')) return 'zh_CN';
  if (browserLang.startsWith('ja')) return 'ja_JP';
  if (browserLang.startsWith('en')) return 'en_US';

  // 3. 默认英文
  return 'en_US';
};

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en_US',
  messages: importMessages.value,
  globalInjection: true,
});

export const langList = computed(() => {
  const list = [];
  langModuleMap.forEach((value, key) => {
    list.push({ content: value.default.lang, value: key });
  });

  return list;
});

// @ts-ignore
export const { t } = i18n.global;

export default i18n;
