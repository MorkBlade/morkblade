const state = {
  area: 'Keyboard',
  base: 'Base',
  palette: 'Palette',
  colorCorrection: 'ColorCorrection',
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
  inKeyLighting: true,
  inLogoLighting: false,
  logoLightingSite: 'side',
  logoLightingData: {
    side: {
      speed: 0,
      luminance: 0,
      style: 0,
      mode: 'static',
      color: '#727272',
    },
    top: {
      speed: 0,
      luminance: 0,
      style: 0,
      mode: 'static',
      color: '#727272',
    },
  },
};

export const useLightSettingStore = defineStore('lightSetting', {
  state: () => ({
    // 灯光设置页面参数
    currentColor: { r: 255, g: 255, b: 168 }, // 当前调色盘选中的颜色
    LightBigMode: 0, // 灯效模式（0：关闭，1：静态灯效，2：动态灯效，3：自定义灯效）
    LightSwitch: false, // 灯效开关
    LightMode: 0, // 灯光模式（0：关闭，1-14：动态灯效，15-20：静态灯效）
    LightLuminance: 3, // 灯光亮度（0-4）
    LightSpeed: 3, // 灯光速度（0-4）
    LightSleepDelay: -1, // 灯光睡眠时间
    LightDirection: true, // 灯光反向
    superResponseMode: false, // 超级响应模式
    StaticLightMode: 0, // 静态灯效模式
    staticLightColorChecked: [false, false, false, false, false, false, false, false],
    staticLightColorList: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    // 动态灯效选中
    dynamicLightBtnChecked: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    hasLogoLight: false, // 键盘是否有logo灯
    LogoRGBBigMode: 0, // logo灯模式（0：关闭，1：静态灯效，2：动态灯效）
    LogoRGBSwitch: false, // logo灯开关
    LogoRGBMode: 0,
    LogoRGBLuminance: 3, // logo灯亮度
    LogoRGBSpeed: 3, // logo灯速度
    LogoRGBDirection: true, // logo灯方向
    LogoRGBStaticLightMode: 0, // logo灯静态灯效模式
    LogoStaticLightColorChecked: [false, false, false, false, false, false, false, false],
    LogoRGBStaticLightColorList: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    LogoDynamicLightBtnChecked: [false, false, false, false],
    enterCustom: false, // 是否在自定义灯光页面
    keyColors: {},
    currentPreset: -1, // -1 表示没有使用预设方案，0-8 分别对应九种预设方案
    newState: state,
  }),

  actions: {
    // 当前选中颜色
    updateCurrentColor(color) {
      this.currentColor = color;
    },
    // 灯效模式
    updateLightBigMode(mode) {
      this.LightBigMode = mode;
    },
    // 灯效开关
    updateLightSwitch(val) {
      this.LightSwitch = val;
    },
    // 灯光模式
    updateLightMode(mode) {
      this.LightMode = mode;
    },
    // 灯光亮度
    updateLightLuminance(val) {
      this.LightLuminance = val;
    },
    // 灯光速度
    updateLightSpeed(val) {
      this.LightSpeed = val;
    },
    // 灯光睡眠时间
    updateLightSleepDelay(val) {
      this.LightSleepDelay = val;
    },
    // 灯光反向
    updateLightDirection(val) {
      this.LightDirection = val;
    },
    // 超级响应模式
    updateSuperResponseMode(val) {
      this.superResponseMode = val;
    },

    // 静态灯效相关
    updateStaticLightMode(id) {
      this.StaticLightMode = id;
    },
    // 静态灯光已选颜色列表
    updateStaticLightColorChecked(idx, val) {
      this.staticLightColorChecked.forEach((_, index) => {
        if (index === idx) {
          this.staticLightColorChecked[index] = val;
        } else {
          this.staticLightColorChecked[index] = false;
        }
      });
    },
    // 静态灯光颜色列表
    updateStaticLightColorList(id, color) {
      this.staticLightColorList[id] = color;
    },

    // 动态灯效选中
    updateDynamicLightBtnChecked(idx, val) {
      this.dynamicLightBtnChecked.forEach((_, index) => {
        if (index === idx) {
          this.dynamicLightBtnChecked[index] = val;
        } else {
          this.dynamicLightBtnChecked[index] = false;
        }
      });
    },

    // 是否有logo灯
    updateHasLogoLight(val) {
      this.hasLogoLight = val;
    },
    // logo灯模式
    updateLogoRGBBigMode(mode) {
      this.LogoRGBBigMode = mode;
    },
    // logo灯开关
    updateLogoRGBSwitch(val) {
      this.LogoRGBSwitch = val;
    },
    // logo灯模式
    updateLogoRGBMode(mode) {
      this.LogoRGBMode = mode;
    },
    // logo灯亮度
    updateLogoRGBLuminance(val) {
      this.LogoRGBLuminance = val;
    },
    // logo灯速度
    updateLogoRGBSpeed(val) {
      this.LogoRGBSpeed = val;
    },
    // logo灯方向
    updateLogoRGBDirection(val) {
      this.LogoRGBDirection = val;
    },
    // logo灯静态灯效模式
    updateLogoRGBStaticLightMode(mode) {
      this.LogoRGBStaticLightMode = mode;
    },
    // logo灯静态已选列表
    updateLogoStaticLightColorChecked(idx, val) {
      // this.LogoStaticLightColorChecked[idx] = val;
      this.LogoStaticLightColorChecked.forEach((_, index) => {
        if (index === idx) {
          this.LogoStaticLightColorChecked[index] = val;
        } else {
          this.LogoStaticLightColorChecked[index] = false;
        }
      });
    },
    // logo灯静态颜色列表
    updateLogoRGBStaticLightColorList(idx, val) {
      // this.LogoRGBStaticLightColorList[idx] = val;
      this.LogoRGBStaticLightColorList.forEach((_, index) => {
        if (index === idx) {
          this.LogoRGBStaticLightColorList[index] = val;
        } else {
          this.LogoRGBStaticLightColorList[index] = false;
        }
      });
    },
    // logo灯动态已选按钮列表
    updateLogoDynamicLightBtnChecked(idx, val) {
      // this.LogoDynamicLightBtnChecked[index] = val;
      this.LogoDynamicLightBtnChecked.forEach((_, index) => {
        if (index === idx) {
          this.LogoDynamicLightBtnChecked[index] = val;
        } else {
          this.LogoDynamicLightBtnChecked[index] = false;
        }
      });
    },

    updateEnterCustom(flag) {
      this.enterCustom = flag;
    },

    setKeyColor(key, color) {
      // const key = `${row}-${col}`;
      this.keyColors[key] = color;
    },

    getKeyColor(key) {
      // const key = `${row}-${col}`;
      return this.keyColors[key] || 'rgba(255, 255, 255,0)';
    },

    setCurrentPreset(idx) {
      this.currentPreset = idx;
    },
  },
});
