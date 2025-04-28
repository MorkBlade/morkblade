import { defineStore } from 'pinia';

// import image1 from '@/assets/images/configured-content-item-img-1.png';
// import image2 from '@/assets/images/configured-content-item-img-2.png';
// import image3 from '@/assets/images/configured-content-item-img-3.png';
// import image4 from '@/assets/images/configured-content-item-img-4.png';
import services from '@/services/index';

const useAppStore = defineStore('app', {
  state: () => ({
    configItems: [
      { leftImage: '', title: '我的配置1' },
      { leftImage: '', title: '我的配置2' },
      { leftImage: '', title: '我的配置3' },
      { leftImage: '', title: '我的配置4' },
    ],
    activeConfigIndex: 0,
    activeMenu: 'keyboard',
    activeSubMenu: 'performance',
    isConfigPageOpen: false,
    baseInfo: {},
    keyboardName: '',
    changeConfig: false,
    api: null,
  }),

  actions: {
    updateConfigName(index, newName) {
      if (index >= 0 && index < this.configItems.length) {
        this.configItems[index].title = newName;
      }
    },

    deleteConfig(index) {
      if (index >= 0 && index < this.configItems.length) {
        this.configItems.splice(index, 1);
        // Reset active index if needed
        if (this.activeConfigIndex >= this.configItems.length) {
          this.activeConfigIndex = Math.max(0, this.configItems.length - 1);
        }
      }
    },

    // setActiveConfigOnly(index) {
    //   if (index >= 0 && index < this.configItems.length) {
    //     this.activeConfigIndex = index;
    //   }
    // },

    async setActiveConfig(index, isVersion2 = false) {
      this.activeConfigIndex = index;
      if (isVersion2) {
        const result = await services.setConfigV2(`Config${index + 1}`);
        // console.log('v2 set config', result, await services.getConfigV2());
        return result;
      } else {
        const result = await services.switchConfig(index);
        return result;
      }
    },
    // 查询当前的配置文件id
    async configID(isVersion2 = false) {
      if (isVersion2) {
        const result = await services.getConfigV2();
        this.activeConfigIndex = (result && result[0]?.value) || 0;
      } else {
        const { configID } = await services.getApi({ type: 'ORDER_TYPE_CONFIG' });
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
    async getProtocolVersion() {
      const protocolVersion = await services.getApi({ type: 'ORDER_TYPE_PROTOCOL_VERSION' });
      this.protocolVersion = protocolVersion;
      return protocolVersion;
    },
  },
});
export default useAppStore;
