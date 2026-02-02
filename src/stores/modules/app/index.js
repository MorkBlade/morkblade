
import { defineStore } from 'pinia';
import services from '@/services/index';

const useAppStore = defineStore('app', {
  state: () => ({
    //TODO 需要翻译
    configList: [
      { leftImage: '', title: '我的配置1' },
      { leftImage: '', title: '我的配置2' },
      { leftImage: '', title: '我的配置3' },
      { leftImage: '', title: '我的配置4' },
    ],
    unActiveConfigList: [
      // { leftImage: '', title: '未激活1' },
      // { leftImage: '', title: '未激活2' },
      // { leftImage: '', title: '未激活3' },
      // { leftImage: '', title: '未激活4' },
    ],
    activeConfigIndex: 0,
    activeMenu: 'keyboard',
    activeSubMenu: 'performance',
    isConfigPageOpen: false,
    baseInfo: {},
    keyboardName: '',
    changeConfig: false,
    protocolVersion: '',
    version: {
      mainVersion: 0,
      subVersion: 0,
      hardwareVersion: 0,
      softwareVersion: 0,
    },
    deviceStatus: {
      battery: 0,
      charge: 0,
      mode: 0,
    },
    sleepTime: {
      shallowSleepTime: 0,
      deepSleepTime: 0,
    },
    // 三模版本需要查询
    isThreeMode: false,
    // keyboardVersion: '', // 键盘版本v1 v2
  }),

  actions: {
    updateConfigName(index, newName) {
      if (index >= 0 && index < this.configList.length) {
        this.configList[index].title = newName;
      }
    },

    deleteConfig(index) {
      if (index >= 0 && index < this.configList.length) {
        this.configList.splice(index, 1);
        // Reset active index if needed
        if (this.activeConfigIndex >= this.configList.length) {
          this.activeConfigIndex = Math.max(0, this.configList.length - 1);
        }
      }
    },

    // setActiveConfigOnly(index) {
    //   if (index >= 0 && index < this.configList.length) {
    //     this.activeConfigIndex = index;
    //   }
    // },

    async setActiveConfig(index, isVersion2 = false) {
      this.activeConfigIndex = index;
      if (isVersion2) {
        const result = await services.setConfigV2(this.configList[index].value);
        return result;
      } else {
        const result = await services.switchConfig(index);
        return result;
      }
    },

    // 查询当前的配置文件id
    async getConfigID(isVersion2 = false) {
      if (isVersion2) {
        const result = await services.getConfigListV2();
        console.log('查询当前的配置文件id result: ', result);
        const result2 = await services.getConfigV2();
        const curConfig = result2.key;
        // this.activeConfigIndex = result[0]?.list.findIndex((item) => item === curConfig);
        this.activeConfigIndex = result2.value;
        const configList = result?.list
          .filter((item) => item !== undefined)
          .map((item, idx) => ({
            title: `我的配置${idx + 1}`,
            value: `Config${idx + 1}`,
          }));
        this.configList = configList;
        // this.activeConfigIndex = (result && result[0]?.value) || 0;
      } else {
        const res = await services.getApi({ type: 'ORDER_TYPE_CONFIG'});
        const { configID } = res || {};
        this.activeConfigIndex = configID || 0;
      }
    },
    // 模式查询
    async systemMode() {
      const result = await services.getApi({ type: 'ORDER_TYPE_QUERY_WIN_MODEL' });
      const result2 = await services.getApi({ type: 'ORDER_TYPE_QUERY_MAC_MODEL' });
      return { ...result, ...result2 };
    },

    async setSystemMode(type) {
      const result = await services.switchSystemMode(type);
      return result;
    },

    // 获取当前键盘名称
    async keyboardName() {
      const keyboardName = await services.getApi({ type: 'ORDER_TYPE_KEYBOARD_NAME' });
      return keyboardName;
    },

    // 获取基础信息
    async getBaseInfo(isVersion2 = false) {
      if (isVersion2) {
        const result = await services.getDevicesInfoV2();
        console.log('getBaseInfo result: ', result);
        this.baseInfo = (result && result[0]) || {};
        this.isThreeMode = result[0]?.subType === 1;
        return result;
      } else {
        const baseInfo = await services.getBaseInfo();
        this.baseInfo = baseInfo;
        return baseInfo;
      }
    },

    // 获取协议版本
    async getProtocolVersion(isVersion2) {
      if (isVersion2) {
        const version = await services.getProtocolVersionV2();
        // console.log('getProtocolVersion version: ', version);
        this.version = version[0];
        return version;
      } else {
        const protocolVersion = await services.getApi({ type: 'ORDER_TYPE_PROTOCOL_VERSION' });
        // console.log('getProtocolVersion: ', protocolVersion);
        this.protocolVersion = protocolVersion;
        return protocolVersion;
      }
    },

    // 查询键盘的当前模式、充电状态和电量百分比
    async getDeviceStatus() {
      try {
        const res = await services.getThreeModeBasicInfoV2();
        this.deviceStatus = res[0];
        return res;
      } catch (error) {
        console.error('获取设备状态失败:', error);
        return null;
      }
    },

    // 获取休眠时间
    async getSleepTime() {
      try {
        const res = await services.getThreeModeSleepTimeV2();
        return res;
      } catch (error) {
        console.error('获取休眠时间失败:', error);
        return null;
      }
    },
    // 设置休眠时间
    async setSleepTime(sleepTime, deepSleepTime) {
      try {
        const res = await services.setThreeModeSleepTimeV2(sleepTime, deepSleepTime);
        console.log('setSleepTime', res);
        return res;
      } catch (error) {
        console.error('设置休眠时间失败:', error);
        return null;
      }
    },
  },
});
export default useAppStore;
