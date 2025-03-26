import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.json', // 指定生成的声明文件路径
      eslintrc: { enabled: true },
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    loaderOptions: {
      sass: {
        // 这里可以设置全局的Sass变量和混合
        additionalData: `@import "@/assets/main.scss";`,
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://morkblade.lewike.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 如果需要去掉 /api 前缀
      },
    },
  },
  assetsInclude: ['**/*.bin'],
});
