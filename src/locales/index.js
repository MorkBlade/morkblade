import { useLocalStorage, usePreferredLanguages } from '@vueuse/core';
import { computed } from 'vue';
import { createI18n } from 'vue-i18n';

// 导入语言文件
const langModules = import.meta.glob('./lang/*/index.js', { eager: true });

const langModuleMap = new Map();

export const langCode = [];

export const localeConfigKey = 'tdesign-starter-locale';

// 获取浏览器默认语言环境
const languages = usePreferredLanguages();

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

// 导出 Message
const importMessages = computed(() => {
  generateLangModuleMap();

  const message = {};
  langModuleMap.forEach((value, key) => {
    message[key] = value.default;
  });
  return message;
});

export const i18n = createI18n({
  legacy: false,
  locale: useLocalStorage(localeConfigKey, 'zh_CN').value || languages.value[0] || 'zh_CN',
  fallbackLocale: 'zh_CN',
  messages: importMessages.value,
  globalInjection: true,
});

export const langList = computed(() => {
  if (langModuleMap.size === 0) generateLangModuleMap();

  const list = [];
  langModuleMap.forEach((value, key) => {
    list.push({ content: value.default.lang, value: key });
  });

  return list;
});

// @ts-ignore
export const { t } = i18n.global;

export default i18n;
