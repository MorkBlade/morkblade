import { defineStore } from 'pinia';

import services from '@/services/index';

const state = {
  precision: 0.1, // 键盘行程精度
  decimalPlace: 2, // 行程显示的小数位
  minTouchTravel: 0.1, // 最小触发行程
  maxTouchTravel: 4.0, // 最大触发行程
  singleTouchTravel: 1.5, // 单键触发行程默认值
  globalTouchTravel: 0, // 全局触发行程
  rtTouchTravel: 0, // rt触发行程
  rtPressTravel: 0.3, // rt按下行程默认值
  rtReleaseTravel: 0.3, // rt释放行程默认值
  singleTouchRelease: '', // 单键释放行程
  quickTouchPress: 0.3, // 快速触发按下行程
  quickTouchRelease: 0.3, // 快速触发抬起行程
  pressDead: 0, // 按压死区
  releaseDead: 0, // 抬起死区
  advancedKeyMode: '', // 高级键的模式
  hasSelectedKey: false, // 添加新状态来跟踪是否有键被选中
  selectedKeyTravel: {}, // 添加此属性来存储每个键的触发行程值
  touchMode: '', // 性能模式
  value: [], // 键盘行程数据
  deadZoneValue: [], // 死区数据
  calibrations: [], // 当前键盘需要显示的性能值
  veifyKey: {}, // 校验按下的键
};

const usePerformanceStore = defineStore('performance', {
  state: () => state,

  getters: {},

  actions: {
    // 获取所有键值的模式行程等
    async getKeyPerformance(keyboards) {
      const performance = [];
      for (let row = 0; row < keyboards.length; row++) {
        for (let col = 0; col < keyboards[row].length; col++) {
          const keyboardItem = keyboards[row][col];
          performance.push(this.getPerformanceValue(keyboardItem));
        }
      }
      const result = await Promise.all(performance);
      return result;
    },

    // update key performance
    async getPerformanceValue(keyboardItem) {
      const { keyValue } = keyboardItem;
      const performanceMode = await this.getPerformanceMode(keyValue);
      if (performanceMode) {
        const { touchMode, advancedKeyMode } = performanceMode;
        if (touchMode === 'global') {
          keyboardItem.performance.isGlobalTriggering = true;
          keyboardItem.performance.isSingle = false;
          keyboardItem.performance.isRt = false;
        } else if (touchMode === 'single') {
          keyboardItem.performance.isSingle = true;
          keyboardItem.performance.isGlobalTriggering = false;
          keyboardItem.performance.isRt = false;
        } else if (touchMode === 'rt') {
          keyboardItem.performance.isRt = true;
          keyboardItem.performance.isGlobalTriggering = false;
          keyboardItem.performance.isSingle = false;
        }
        // 根据当前模式获取对应数据
        if (touchMode === 'single' || touchMode === 'rt') {
          const singleTravel = await this.getSingleTravel(keyValue, 2);
          keyboardItem.performance.singleTriggeringValue =
            typeof parseFloat('1.23' - 0) === 'number' ? parseFloat(singleTravel) : 0;
        }

        if (touchMode === 'rt') {
          const { releaseTravel, pressTravel } = await this.getRtTravel(keyValue);
          keyboardItem.performance.rtPressValue = pressTravel;
          keyboardItem.performance.rtReleaseValue = releaseTravel;
        }
        // if (performanceMode) {
        //   const { touchMode, advancedKeyMode } = performanceMode;
        //   // 设置当前键盘的性能模式
        //   performance.touchMode = touchMode;
        //   performance.advancedKeyMode = advancedKeyMode;
        //   // 根据当前模式获取对应数据
        //   if (touchMode === 'single' || touchMode === 'rt') {
        //     const singleTravel = await this.getSingleTravel(keyValue, 2);
        //     performance.single = { singleTravel };
        //   }

        //   if (touchMode === 'rt') {
        //     const { releaseTravel, pressTravel } = await this.getRtTravel(keyValue);
        //     performance.rt = { releaseTravel, pressTravel };
        //   }
        // }
        // return performance;

        // 设置当前键盘的性能模式
        let advancedType = 0;
        if (advancedKeyMode === 1) {
          advancedType = 'DKS';
        } else if (advancedKeyMode === 2) {
          advancedType = 'MPT';
        } else if (advancedKeyMode === 3) {
          advancedType = 'MT';
        } else if (advancedKeyMode === 4) {
          advancedType = 'TGL';
        } else if (advancedKeyMode === 5) {
          advancedType = 'END';
        } else if (advancedKeyMode === 6) {
          advancedType = 'MCR';
        } else if (advancedKeyMode === 8) {
          advancedType = 'SOCD';
        } else if (advancedKeyMode === 9) {
          advancedType = 'RS';
        }
        keyboardItem.performance.advancedKeyMode = advancedKeyMode;
        keyboardItem.advancedKeys.advancedType = advancedType;
      }
      // 获取死区和轴相关
      await this.getDpDrValue(keyboardItem);
      return performance;
    },

    // 获取全局触发行程和死区
    async getGlobalTouchTravel() {
      const result = await services.getGlobalTouchTravel();
      if (result) {
        const { globalTouchTravel, pressDead, releaseDead } = result;
        this.globalTouchTravel = globalTouchTravel;
        this.pressDead = pressDead;
        this.releaseDead = releaseDead;
      }
      return result;
    },

    // TODO 初始化设置全局行程和死区
    // 设置键盘全局行程和死区
    async setDB(globalTouchTravel, pressDead, releaseDead) {
      const result = await services.setDB({ globalTouchTravel, pressDead, releaseDead });
      return result;
    },

    // 获取性能模式 高级键模式
    async getPerformanceMode(key) {
      const result = await services.getPerformanceMode(key);
      return result;
    },

    // 设置性能模式 / 高级键模式
    async setPerformanceMode(key, mode, advancedKeyMode) {
      const result = await services.setPerformanceMode(key, mode, advancedKeyMode);
      return result;
    },

    // 获取单键触发行程
    async getSingleTravel(key, decimalPlace) {
      const result = await services.getSingleTravel(key, decimalPlace);

      return result;
    },

    // 设置单键触发行程
    async setSingleTravel(key, value, decimalPlace) {
      const result = await services.setSingleTravel(key, value, decimalPlace);
      return result;
    },

    // 获取T模式行程值
    async getRtTravel(key) {
      const result = await services.getRtTravel(key);
      return result;
    },

    // 设置RT按下行程
    async setRtPressTravel(key, value) {
      const result = await services.setRtPressTravel(key, value);
      return result;
    },

    // 设置RT释放行程
    async setRtReleaseTravel(key, value) {
      const result = await services.setRtReleaseTravel(key, value);
      return result;
    },

    // 获取所有死区数据
    async getAllDpDr(keyboard) {
      for (let y = 0; y < keyboard.length; y++) {
        if (!this.deadZoneValue[y]) this.deadZoneValue[y] = [];
        for (let x = 0; x < keyboard[y].length; x++) {
          const { keyValue } = keyboard[y][x];
          if (!this.deadZoneValue[y][x]) {
            this.deadZoneValue[y][x] = { pressDead: 0, releaseDead: 0 };
          }
          this.getDpDrValue(keyValue, this.deadZoneValue[y][x]);
        }
      }
    },

    async getDpDrValue(keyboardItem) {
      const { keyValue } = keyboardItem;
      const getDpDr = await this.getDpDr(keyValue);
      if (getDpDr) {
        keyboardItem.performance.deadBandPressValue = getDpDr.pressDead;
        keyboardItem.performance.deadBandReleaseValue = getDpDr.releaseDead;
      }
      return getDpDr;
    },

    // 获取死区
    async getDpDr(key) {
      const result = await services.getDpDr(key);
      return result;
    },

    // 设置按下的死区
    async setDp(key, value) {
      const result = await services.setDp(key, value);
      return result;
    },

    // 设置释放死区
    async setDr(key, value) {
      const result = await services.setDr(key, value);
      return result;
    },

    async getRm6X21Travel() {
      const result = await services.getRm6X21Travel();
      const { max, press } = this.getMaxPressTravel(result.status, result.travels);
      return { max, press };
    },

    // 获取行程校准的数据
    async getRm6X21Calibration(keyboard) {
      const result = await services.getRm6X21Calibration();
      // console.log('getRm6X21Calibration log res', result);
      for (let y = 0; y < keyboard.length; y++) {
        if (!this.calibrations[y]) this.calibrations[y] = [];
        for (let x = 0; x < keyboard[y].length; x++) {
          const { row, col } = keyboard[y][x];
          if (!this.calibrations[y][x]) this.calibrations[y][x] = 0;
          this.calibrations[y][x] = result.calibrations[row][col];
        }
      }
      const { max } = this.getMaxPressTravel([], result.travels);
      this.updateVerifyKeys(result.travels, keyboard);
      return { max };
    },

    // 查询回报率
    async getRateOfReturn() {
      const result = await services.getApi({ type: 'ORDER_TYPE_ROES' });
      // const res2 = await services.getApi({ type: 'ORDER_TYPE_AXOSOME' });
      return result;
    },

    // 设置回报率
    async setRateOfReturn(value) {
      const result = await services.setRateOfReturn(value);
      return result;
    },

    // 更新校验按键状态
    updateVerifyKeys(travels, keyboard) {
      for (let i = 0; i < travels.length; i++) {
        for (let j = 0; j < travels[i].length; j++) {
          if (travels[i][j] > 0) {
            // 在 keyboard 中找到对应位置的按键
            const curRowKeys = keyboard[i];
            let keyItem = null;
            for (let k = 0; k < curRowKeys.length; k++) {
              if (curRowKeys[k].col === j) {
                keyItem = curRowKeys[k];
              }
            }
            if (keyItem) {
              // 使用 keyValue 作为属性名，设置为 true
              this.veifyKey[keyItem.keyValue] = true;
            }
          }
          // else {
          //   // 找到对应位置的按键，如果存在则设置为 false
          //   const keyItem = keyboard[i]?.[j];
          //   if (keyItem && this.veifyKey[keyItem.keyValue]) {
          //     this.veifyKey[keyItem.keyValue] = false;
          //   }
          // }
        }
      }
    },

    // 清除校验状态
    clearVerifyKeys() {
      this.veifyKey = {};
    },

    // 单键解最大值
    getMaxPressTravel(status, travels) {
      let max = 0;
      let press = 0;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 21; j++) {
          if (max < travels[i][j]) {
            max = travels[i][j];
            if (status.length > 0) press = status[i][j];
          }
        }
      }
      return { max, press };
    },

    // 设置校准
    async calibrationStart() {
      this.clearVerifyKeys();
      const result = await services.calibrationStart();
      return result;
    },

    // 校准保存
    async calibrationEnd() {
      this.clearVerifyKeys();
      const result = await services.calibrationEnd();
      return result;
    },
    // 获取键盘的最大行程和最小行程
    async getMaxMinTravel() {
      const result = await services.getApi({ type: 'ORDER_TYPE_PRECISION_STROKE' });
      return result;
    },

    // 查询顶部死区
    async getTopDeadZone() {
      const result = await services.getApi({ type: 'ORDER_TYPE_TOP_DEAD_SWITCH' });
      return result;
    },
    // 设置顶部死区
    async setTopDeadSwitch(value) {
      const result = await services.setTopDeadSwitch(value);
      return result;
    },

    // 设置Db数据
    async setDbTravel(keyValue, value) {
      const result = await services.setDksTravel(keyValue, value);
      return result;
    },

    // 重置
    async resetTravel(keyValue, advancedKey, globalTouchTravel, location) {
      const mode = await this.setPerformanceMode(keyValue, 'global', advancedKey);
      const dbTravel = await this.setDbTravel(keyValue, globalTouchTravel);
      const { x, y } = location;
      const performance = await this.getPerformanceMode(keyValue);
      const { touchMode, advancedKeyMode } = performance;
      this.value[y][x] = {
        touchMode,
        advancedKeyMode,
        single: { singleTravel: 0 },
        rt: { releaseTravel: 0, pressTravel: 0 },
        keyValue,
      };

      return { mode, dbTravel, touchMode, advancedKeyMode };
    },
  },
});

export default usePerformanceStore;
