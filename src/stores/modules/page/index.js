
import { defineStore } from 'pinia';

const state = {
  currentPage: 'performance',
  currentLightingMode: 'single',
};
const usePageStore = defineStore('page', {
  state: () => state,

  actions: {

    // 切换页面
    switchPage(page) {
      this.currentPage = page;
    },

    switchLightingMode(mode) {
      this.currentLightingMode = mode;
    },
  },
});

export default usePageStore;
