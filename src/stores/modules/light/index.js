
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
  currentColor: { r: 189, g: 214, b: 0 },
  enterCustom: false, // 是否在自定义灯光页面
  currentPreset: -1, // -1 表示没有使用预设方案，0-8 分别对应九种预设方案
  lamp: 'SingleLighting', // 单双灯位 SingleLighting/DoubleLighting
  upOpen: false, // 上灯位状态
  downOpen: false, // 下灯位状态
  allLamp: false, // 双灯位
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
      // this.light.staticColors = res[0].staticColors;
      // this.staticColors = res[0].staticColors;
      return res;
    },

    // v2 更新灯光睡眠时间
    async updateSleepTime(delay) {
      this.light.sleepTime = delay;
    },

    // 当前选中自定义颜色
    updateCurrentColor(color) {
      this.currentColor = color;
    },

    updateSwitch(open) {
      this.light.open = open;
    },

    updateEnterCustom(flag) {
      this.enterCustom = flag;
    },

    setCurrentPreset(idx) {
      this.currentPreset = idx;
    },

    // 设置灯效库的数据
    updateLightingBaseData(data) {
      // 单灯位使用的open的变量 双灯位使用的是upOpen、downOpen 全开是用open
      const { open, mode, luminance, speed, direction, selectStaticColor } = data;
      this.light.open = open === 'Open';
      this.light.mode = mode;
      this.light.luminance = luminance;
      this.light.speed = speed;
      this.light.direction = direction === 'Forward';
      this.light.selectStaticColor = selectStaticColor;
      if (open === 'Open') {
        this.upOpen = true;
        this.downOpen = true;
        this.allLamp = true;
      } else if (open === 'OpenUp') {
        this.upOpen = true;
        this.downOpen = false;
        this.allLamp = false;
      } else if (open === 'OpenDown') {
        this.downOpen = true;
        this.upOpen = false;
        this.allLamp = false;
      } else {
        this.allLamp = false;
        this.upOpen = false;
        this.downOpen = false;
      }
    },
  },
});
