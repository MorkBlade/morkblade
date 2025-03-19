import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  {
    settings: {
      'import/resolver': {
        alias: {
          map: [
            // 定义 @ 别名指向 src 目录
            ['@', './src'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        },
      },
    },
  },
  {
    extends: [
      'eslint-config-airbnb-base',
      'plugin:vue/vue3-recommended',
      'plugin:vue-scoped-css/base',
      'plugin:prettier/recommended',
      './.eslintrc-auto-import.json',
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
];
