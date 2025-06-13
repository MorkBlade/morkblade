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
  build: {
    rollupOptions: {
      output: {
        // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
        chunkFileNames: 'js/[name]-[hash].js',
        // 用于命名代码拆分时创建的共享块的输出命名
        entryFileNames: 'js/[name]-[hash].js',
        // 用于输出静态资源的命名，[ext]表示文件扩展名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media';
          } else if (/\.(png|jpe?g|gif|svg|bmp|webp)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },
  },
  server: {
    proxy: {
      '/bin-data': {
        target: 'https://www.morkblade.hk/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bin-data/, '/bin-data/'),
      },
      '/fw': {
        target: 'https://hub.sparklinkplayjoy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fw/, '/fw/'),
      },
      '/api/v1': {
        target: 'https://api.sparklinkplayjoy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
        secure: false,
      },
      '/storage': {
        target: 'https://api.sparklinkplayjoy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storage/, '/storage'),
      },
    },
  },
  assetsInclude: ['**/*.bin'],
});
