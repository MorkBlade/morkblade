import './style/index.scss';
import 'element-plus/dist/index.css';
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';

import ElementPlus from 'element-plus';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { ColorPickerPanel as TColorPickerPanel } from 'tdesign-vue-next';

import i18n from './locales';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.use(i18n);
app.use(TColorPickerPanel);
app.mount('#app');
