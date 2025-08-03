
import { defineStore } from 'pinia';

// import image1 from '@/assets/images/configured-content-item-img-1.png';
// import image2 from '@/assets/images/configured-content-item-img-2.png';
// import image3 from '@/assets/images/configured-content-item-img-3.png';
// import image4 from '@/assets/images/configured-content-item-img-4.png';
import services from '@/services/index';

const useAppStore = defineStore('app', {
  state: () => ({
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
        const result2 = await services.getConfigV2();
     
        const curConfig = result2[0].key;
        // this.activeConfigIndex = result[0]?.list.findIndex((item) => item === curConfig);
        this.activeConfigIndex = result2[0].value;
        const configList = result[0]?.list
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
        console.log('configID: ', configID);
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
        this.baseInfo = (result && result[0]) || {};
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

  },
});
export default useAppStore;
