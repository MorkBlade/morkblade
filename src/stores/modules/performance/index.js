import { defineStore } from 'pinia';

import services from '@/services/index';
import { useKeyboardStore } from '@/stores';
import { ICON_MAP } from '@/configs/constant';

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
  isTravelTest: false,
  axisList: [], // 轴列表
};

const usePerformanceStore = defineStore('performance', {
  state: () => state,

  getters: {},

  actions: {
    /* 初始化所有key的性能 */
    async getKeyPerformanceV1(keyboards) {
      const performance = [];
      for (let row = 0; row < keyboards.length; row++) {
        for (let col = 0; col < keyboards[row].length; col++) {
          const keyboardItem = keyboards[row][col];
          performance.push(this.getPerformanceValueV1(keyboardItem));
        }
      }
      const result = await Promise.all(performance);
      return result;
    },

    async getPerformanceValueV1(keyboardItem) {
      const { keyValue } = keyboardItem;
      const performanceMode = await services.getPerformanceMode(keyValue);
      if (performanceMode) {
        const { touchMode, advancedKeyMode } = performanceMode;
        // console.log('getPerformanceValueV1 log performanceMode: ', performanceMode);
        if (touchMode === 'global') {
          keyboardItem.performance.isGlobalTriggering = true;
          keyboardItem.performance.isSingle = false;
          keyboardItem.performance.isRt = false;
          keyboardItem.performance.singleTriggeringValue = this.globalTouchTravel;
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
        // keyboardItem.advancedKeys.advancedType = advancedType;
        keyboardItem.advancedKeys.advancedType = advancedKeyMode;
      }
      // 获取死区和轴相关
      await this.getDeadZoneVal(keyboardItem);
      return performance;
    },

    // v2
    async getKeyPerformanceV2(keyboard) {
      const performance = [];
      // const keyboardStore = useKeyboardStore();
      // console.log(keyboard);
      for (let colIdx = 0; colIdx < keyboard.length; colIdx++) {
        // if (!this.performanceData[row]) this.performanceData[row] = [];
        // console.log('xxxxxxxxxx',row, col, keyValue);
        const { row, col, keyValue } = keyboard[colIdx];
        // for (let col = 0; col < keyboard[row].length; col++) {
        const KeyPerformance = {
          row,
          col,
          mode: 0,
          keyValue,
          singleTriggeringValue: 0,
          // normalRelease: 0,
          rtFirstTouch: 0,
          rtPressValue: 0,
          rtReleaseValue: 0,
          deadBandPressValue: 0,
          deadBandReleaseValue: 0,
          axisID: 0,
          calibrations: 0,
          travels: 0,
        };
        // console.log(keyValue,keyValue===0,keyboard[row][col]);
        if (keyValue === 0) continue;
        performance.push(this.getPerformanceValueV2({ row, col }, KeyPerformance));
        // keyboardStore.keyboard.keyboardLayout[row][col].performance = performance;
        // }
      }
      const result = await Promise.all(performance);
      // console.log('getPerformance result',result);
      this.initGetPerformance = true;
      return result;
    },

    async getPerformanceValueV2(params, performance) {
      // console.log('getPerformanceValueV2');
      const [performanceResult] = await services.getPerformanceV2(params);
      // console.log('getPerformanceValueV2', performanceResult);
      // const performanceResult = Array.isArray(result) && result.length > 0 ? result[0] : null;
      if (performanceResult) {
        const {
          mode,
          normalPress,
          // normalRelease,
          rtFirstTouch,
          rtPress,
          rtRelease,
          pressDeadStroke,
          releaseDeadStroke,
          axis,
          calibrate,
        } = performanceResult;
        // 设置当前键盘的性能模式
        performance.mode = mode;
        performance.isRt = mode === 1;
        performance.isSingle = mode === 0;
        performance.singleTriggeringValue = normalPress;
        // performance.normalRelease = normalRelease;
        performance.rtFirstTouch = rtFirstTouch;
        performance.rtPressValue = rtPress;
        performance.rtReleaseValue = rtRelease;
        performance.deadBandPressValue = pressDeadStroke;
        performance.deadBandReleaseValue = releaseDeadStroke;
        performance.axisID = axis;
        performance.calibrate = calibrate;
      }
      // console.log("xxxxxxx",performance);
      return performance;
    },

    // 获取单键触发行程
    async getSingleTravel(key, decimalPlace) {
      const result = await services.getSingleTravel(key, decimalPlace);

      return result;
    },

    // 获取RT模式行程值
    async getRtTravel(key) {
      const result = await services.getRtTravel(key);
      return result;
    },

    // 获取按键死区值
    async getDeadZoneVal(keyboardItem) {
      const { keyValue } = keyboardItem;
      const getDpDr = await this.getKeyDeadZone(keyValue);
      if (getDpDr) {
        keyboardItem.performance.deadBandPressValue = getDpDr.pressDead;
        keyboardItem.performance.deadBandReleaseValue = getDpDr.releaseDead;
      }
      return getDpDr;
    },

    // 获取死区
    async getKeyDeadZone(key) {
      const result = await services.getDpDr(key);
      return result;
    },

    // 获取全局触发行程和死区(没有调用)
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

    // 设置单键触发行程
    async setSingleTravel(key, value, decimalPlace) {
      const result = await services.setSingleTravel(key, value, decimalPlace);
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

    async getRm6X21Travel(keyboards, isVersion2) {
      if (isVersion2) {
        let max = 0;
        for (let i = 0; i < keyboards.length; i++) {
          const route = await services.getRouteV2({ row: i });
          const curMax = Math.max(...route[0].data);
          if (curMax > max) max = curMax;
        }
        return { max: max / 1000 };
      } else {
        const result = await services.getRm6X21Travel();
        const { max, press } = this.getMaxPressTravel(result.status, result.travels);
        return { max, press };
      }
    },

    // 获取行程校准的数据
    async getRm6X21Calibration(keyboard) {
      const result = await services.getRm6X21Calibration();
      // console.log('getRm6X21Calibration log', result || '没有数据');
      if (result.calibrations && result.travels) {
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
      } else {
        return { max: 0 };
      }
    },

    // v2校准行程测试
    async calibrationStartV2() {
      this.isCalibrating = true;
      const result = await services.calibrationStartV2();
      // console.log('calibrationStart ', result);
    },

    async calibrationEndV2() {
      // console.log('calibrationEnd');
      const keyboardStore = useKeyboardStore();
      this.isCalibrating = false;
      this.clearVerifyKeys();
      const result = await services.calibrationEndV2();
      for (let row = 0; row < keyboardStore.keyboards.length; row++) {
        for (let col = 0; col < keyboardStore.keyboards[row].length; col++) {
          if (keyboardStore.keyboards[row][col].performance.calibrate === 2) {
            keyboardStore.keyboards[row][col].performance.calibrate = 1;
          }
        }
      }
      return result;
    },

    async getRm6X21CalibrationV2(keyboard) {
      if (!this.isCalibrating) return { max: 0 }; // 如果不在校准状态，直接返回
      // console.log('getRm6X21CalibrationV2');
      const sample = [];
      const travels = [];
      const calibrationStatus = [];
      // const keyboardStore = useKeyboardStore();
      for (let i = 0; i < keyboard.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const result = await services.getADCSampleV2({ row: i });
        // eslint-disable-next-line no-await-in-loop
        const route = await services.getRouteV2({ row: i });
        // eslint-disable-next-line no-await-in-loop
        const status = await services.getCalibrationStatusV2({ row: i });
        sample.push(result[0].data);
        travels.push(route[0].data);
        calibrationStatus.push(status[0].data);
      }
      // console.log('getRm6X21Calibration log', sample, travels, calibrationStatus);
      for (let row = 0; row < keyboard.length; row++) {
        if (!this.calibrations[row]) this.calibrations[row] = [];
        for (let col = 0; col < keyboard[row].length; col++) {
          if (!this.calibrations[row][col]) this.calibrations[row][col] = 0;
          this.calibrations[row][col] = sample[row][col];
          keyboard[row][col].performance.calibrate = calibrationStatus[row][col];
          keyboard[row][col].performance.travels = travels[row][col];
        }
      }

      const { max } = this.getMaxPressTravel([], travels);
      // console.log('getRm6X21CalibrationV2', max);
      if (this.isTravelTest) this.updateVerifyKeysV2(travels, keyboard);
      return { max: max / 1000 };
    },

    updateVerifyKeysV2(travels, keyboard) {
      const newVerifyKey = {};
      for (let i = 0; i < travels.length; i++) {
        for (let j = 0; j < travels[i].length; j++) {
          if (travels[i][j] > 0) {
            // 在 keyboard 中找到对应位置的按键
            const curRowKeys = keyboard.length === 5 ? keyboard[i - 1] : keyboard[i];
            let keyItem = null;
            for (let k = 0; k < curRowKeys.length; k++) {
              if (!curRowKeys[k] || typeof curRowKeys[k] !== 'object') {
                continue;
              }
              if (curRowKeys[k].col === j) {
                keyItem = curRowKeys[k];
                break;
              }
            }
            if (keyItem) {
              // console.log('keyItem: ', keyItem, travels[i][j]);
              const shaft = this.axisList.find((shaft, index) => index === keyItem.performance.axisID) || {
                doctrine_range_left: 3.3,
                doctrine_range_right: 0.3,
              };
              // console.log('shaft is: ', shaft, keyItem.performance.axisID);
              const { doctrine_range_left, doctrine_range_right } = shaft;
              // { doctrine_range_left, doctrine_range_right }
              // 使用 keyValue 作为属性名，设置为 true
              newVerifyKey[keyItem.keyValue] = {
                res: true,
                travel: travels[i][j] / 1000,
                axisID: keyItem.performance.axisID,
                maxTravel: doctrine_range_left,
                minTravel: doctrine_range_right,
              };
            }
          }
          for (const key in this.veifyKey) {
            if (!newVerifyKey[key]) {
              const shaft = this.axisList.find((shaft, index) => index === this.veifyKey[key].axisID) || {
                doctrine_range_left: 3.3,
                doctrine_range_right: 0.3,
              };
              const { doctrine_range_left, doctrine_range_right } = shaft;
              // 如果新对象中没有这个键，则保留键但重置travel为0
              newVerifyKey[key] = {
                res: this.veifyKey[key].res,
                travel: 0,
                axisID: this.veifyKey[key].axisID,
                maxTravel: doctrine_range_left,
                minTravel: doctrine_range_right,
              };
            }
          }
          // console.log('veifyKey: ', this.veifyKey);
          // 更新veifyKey对象
          this.veifyKey = newVerifyKey;
        }
      }
    },

    // 查询回报率
    async getRateOfReturn(isVersion2) {
      if (isVersion2) {
        const result = await services.getRateOfReturnV2();
        return result[0]?.value;
      } else {
        const result = await services.getApi({ type: 'ORDER_TYPE_ROES' });
        return result;
      }
      // const res2 = await services.getApi({ type: 'ORDER_TYPE_AXOSOME' });
    },

    // 设置回报率
    async setRateOfReturn(rateIdx, rateText, isVersion2) {
      if (isVersion2) {
        const result = await services.setRateOfReturnV2(`R${rateText}`);
        return result;
      } else {
        const result = await services.setRateOfReturn(rateIdx);
        return result;
      }
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
      // console.log('calibrationStart v1 v1', result);
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
      const result = (await services.getApi({ type: 'ORDER_TYPE_PRECISION_STROKE' })) || null;
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

    // 重置(没有调用)
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

    async getAixsList(isVersion2, allAxisList) {
      if (isVersion2) {
        const result = await services.getAxisListV2();
        const { list } = result[0];
        list.forEach((item) => {
          const index = allAxisList.findIndex((axis) => axis.axis_id === item);
          if (index !== -1) {
            const item = allAxisList[index];
            // const icon_obj = ICON_MAP[item.factory_name];
            // if (icon_obj && icon_obj[item.axis_id]) {
            //   console.log('change axis pic----------------->');
            //   item.image_url = icon_obj[item.axis_id];
            // }
            this.axisList.push(item);
          }
        });
        console.log('getAxisListV2: ', this.axisList);
        return list;
      } else {
        const res = await services.getAxisList();
        const axisList = res && res.axisList;
        axisList.forEach((item) => {
          const index = allAxisList.findIndex((axis) => axis.axis_id === item);
          if (index !== -1) {
            const item = allAxisList[index];
            this.axisList.push(item);
          }
        });
        return res;
      }
    },
  },
});

export default usePerformanceStore;
