import services from '@/services/index';

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
    speed: 50,
    sleepTime: -1,
    direction: false,
    dynamic: 1, // 动态灯效index 用于匹配选中项
  },
  logo: {
    open: true,
    mode: 0, // 'static' | 'custom' | 'dynamic'
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
  decorative1: {
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

  // 装饰灯
  decorativeLighting: []
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

    // 设置灯光区域
    setArea(area) {
      this.area = area;
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

    // 获取装饰灯光数据
    async getDecorativeLightingData() {
      const res = await services.getDecorate1CustomV2({rows:1, cols:22, area:'Decorate1'});
      this.decorativeLighting = res[0];
    },


    // 设置装饰灯光
    async setDecorativeLighting() {
      try {
        const { open, mode, luminance, speed, direction, selectStaticColor } = this.decorative1;
        const res = await services.setLightingBaseV2({
          area: 'Decorate1',
          config: 'Base',
          data: {
            open: 'Open',
            mode,
            luminance,
            speed,
            direction: direction ? 'Forward' : 'Backward',
            selectStaticColor,
          },
          lamp: 'SingleLighting',
        });
        console.log('参数----',{
          open: 'Open',
          mode,
          luminance,
          speed,
          direction: direction ? 'Forward' : 'Backward',
          selectStaticColor,
        })
      } catch (error) {
        console.error('设置装饰灯光失败:', error);
      }
    },

    // 点击按键设置自定义颜色
    async setDecorateCustom(index) {
      // 更新 lightingDecorate 数据
      if (this.decorativeLighting && this.decorativeLighting[index]) {
        this.decorativeLighting[index] = { R: this.currentColor.r, G: this.currentColor.g, B: this.currentColor.b, isCustom: true };
      }
      // 构造数据并调用 SDK
      const customLightData = [this.decorativeLighting];
      const res = await services.setDecorate1CustomV2({
        area: 'Decorate1',
        protocol: 'Custom',
        data: customLightData,
      });
    },

    // 清除装饰灯自定义灯效
    async resetDecorateCustom() {
      // 重置所有装饰灯颜色的 isCustom 标记
      if (this.decorativeLighting) {
        this.decorativeLighting.forEach((color) => {
          color.isCustom = false;
        });
      }
      const customLightData = [this.decorativeLighting];
      await services.setDecorate1CustomV2({
        area: 'Decorate1',
        protocol: 'Custom',
        data: customLightData,
      });
    }
  }
});
