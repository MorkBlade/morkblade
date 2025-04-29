const state = {
  area: 'Keyboard',
  base: 'Base',
  palette: 'Palette',
  colorCorrection: 'ColorCorrection',
  saturation: { R: 0, G: 0, B: 0 },
  light: {
    open: true,
    mode: 0, // 0-19动态 20静态
    staticColors: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    selectStaticColor: 0,
    luminance: 50,
    speed: 1,
    sleepTime: -1,
    direction: false,
    dynamic: 1, // 动态灯效index 用于匹配选中项
  },
  logo: {
    open: true,
    mode: 'static', // 'static' | 'custom' | 'dynamic'
    staticColors: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    selectStaticColor: 0,
    luminance: 1,
    speed: 1,
    sleepTime: -1,
    direction: false,
    dynamic: 0,
  },
  other: {
    open: true,
    mode: 'static', // 'static' | 'custom' | 'dynamic'
    staticColors: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    selectStaticColor: 0,
    luminance: 1,
    speed: 1,
    sleepTime: -1,
    direction: false,
    dynamic: 0,
  },

  // 项目特定state
  currentColor: { r: 255, g: 255, b: 168 },
  enterCustom: false, // 是否在自定义灯光页面
  currentPreset: -1, // -1 表示没有使用预设方案，0-8 分别对应九种预设方案
};

export const useLightSettingStore = defineStore('lightSetting', {
  state: () => state,

  actions: {
    // v2 获取灯光数据
    async getLightingBaseV2() {
      const res = await services.getLightingBase({
        area: this.area,
        config: this.base,
      });
      console.log('getLightingBaseV2', res[0]);

      const { mode, luminance, speed, direction, selectStaticColor } = res[0];
      // 注意: open变量未使用但保留在响应中，因为服务端可能会在将来修改此字段
      // this.light.open = open === 'OpenUp';
      // this.light.open = true;
      // this.light.mode = mode;
      // this.light.dynamic = mode;
      // this.light.luminance = luminance;
      // this.light.speed = speed;
      // this.light.direction = direction === 'Forward';
      // this.light.selectStaticColor = selectStaticColor;
      return res[0];
    },

    // 获取灯光调色板数据
    async getLightingPaletteV2() {
      const res = await services.getLightingPaletteV2({
        area: this.area,
        config: this.palette,
      });
      console.log('getLightingPaletteV2', res[0]);
      // this.light.staticColors = res[0].staticColors;
      // this.staticColors = res[0].staticColors;
      return res;
    },

    // 当前选中自定义颜色
    updateCurrentColor(color) {
      this.currentColor = color;
    },

    updateEnterCustom(flag) {
      this.enterCustom = flag;
    },

    setCurrentPreset(idx) {
      this.currentPreset = idx;
    },
  },
});
