
import { defineStore } from 'pinia';
import { useAppStore } from '@/stores';


import router from '@/router';
import services from '@/services/index.js';
import emitter from '@/utils/app-emitter';

const state = {
  devices: [],
  device: {},
  report: [],
  isDeviceConnected: false,
  connectDeviceNum: 0,
  connectDeviceStatus: false,
  requestDeviceStatus: null,
  updateSuc: false,
  isDeviceConnected: false, // 添加设备连接状态
  reseted: false,
  isDoubleLighting: false,
};
const useDeviceStore = defineStore('device', {
  state: () => state,

  getters: {
    deviceId: (state) => state.device.id,
    deviceHid: (state) => state.device.data,
  },

  actions: {

    async connectDevice() {
      try {
        const devices = await services.getDevices();
        services.on('GETDEVICEINFO', (requestDeviceStatus) => {
          this.requestDeviceStatus = requestDeviceStatus;
          console.log('requestDeviceStatus: ', requestDeviceStatus);
        });
        emitter.on('isUpdate', (data) => {
          // console.log('isupdate', data);
          this.isUpdate = data;
        });
        services.on('usbChange', async (data) => {
          // 设备拔插时 路由到连接页面
          router.replace({ path: '/' });
          const { device } = data;
          if (data.updateFail) {
            emitter.emit('toUpdate');
            this.isUpdate = false;
          }

          if (data.type === 'disconnect' || data.type === 'isUpgrading_disconnect') {
            // 如果不是在升级页面的话 路由回到连接页面
            if (!this.isUpdate) {
              if (this.reseted) return;
              emitter.emit('disconnect', this.isUpdate);
              return;
            }
          }

          if (data.type === 'connect' || (data.type === 'isUpgrading_connect' && data.reconnect)) {
            if (device?.collections?.length) {
              try {
                const targetCollection = device.collections.find(
                  (collection) => collection.usage === 1 && [65440, 65456, 65408].includes(collection.usagePage),
                );

                if (targetCollection) {
                  if (this.reseted) {
                    emitter.emit('resetData', this.reseted);
                    this.reseted = false;
                  }

                }
              } catch (error) {
                console.error('Reconnection failed:', error);
                // 可以在这里添加重试逻辑或错误处理
              }
            } else {
              console.warn('No collections available on the device');
            }
          }
        });

        // 监听设备拔插
        if (devices.length > 0) {
          let selectedDevice = null;

          if (devices.length === 1) {
            // 只有一个设备时直接使用
            selectedDevice = devices[0];
            if (selectedDevice.usagePage === 65408) {
              console.log('2.4G连接设备: ', selectedDevice);
            }
          } else {
            // 多个设备时，优先选择非2.4G设备
            console.log('检测到多个设备，开始设备优先级选择');

            // 分离2.4G设备和非2.4G设备
            const non24GDevices = devices.filter(item => item.usagePage !== 65408);
            const device24G = devices.filter(item => item.usagePage === 65408);

            console.log('非2.4G设备数量: ', non24GDevices.length);
            console.log('2.4G设备数量: ', device24G.length);

            if (non24GDevices.length > 0) {
              // 优先选择非2.4G设备
              selectedDevice = non24GDevices[0];
              console.log('选择非2.4G设备: ', selectedDevice);
            } else {
              // 如果只有2.4G设备，则选择第一个2.4G设备
              selectedDevice = device24G[0];
              console.log('只有2.4G设备可用，选择2.4G设备: ', selectedDevice);
            }
          }

          this.devices = devices;
          this.device = selectedDevice;
          if (selectedDevice) {
            const res = await services.init(selectedDevice.id);
            console.log('init res: ', res);
            // const appStore = useAppStore();
            // const res2 = await appStore.getBaseInfo(true);
            // console.log('getBaseInfo res2: ', res2);
            this.connectDeviceStatus = true;
            return true;
          }
          return false;
        } else {
          console.log('未检测到设备。');
        }
        return false;
      } catch (error) {
        console.log('error', error);
      }
    },

    // 恢复出厂设置
    async factoryDataReset(isVersion2) {
      if (isVersion2) {
        const res = await services.GFSRestoreV2('All');
        return res;
      } else {
        try {
          this.reseted = true;
          const res = await services.factoryDataReset();
          return res;
        } catch (error) {
          console.log(error);
        }
      }
    },

    // 设备升级
    async updateDevice(data, fn) {
      const update = await services.upgradeV2(data, fn);
      console.log('update: ', update);
      return update;
    },

    // boot模式
    async appToBoot() {
      const res = await services.appToBootV2();
      return res;
    },

    // app模式
    async bootToApp() {
      const res = await services.bootToAppV2();
      return res;
    },

    // 双灯位获取
    async getDoubleLighting() {
      const doubleLightingRes = await services.getDoubleLightingV2();
      const { doubleLighting } = doubleLightingRes;
      if (doubleLighting) this.isDoubleLighting = true;
      return doubleLightingRes;
    },

    // 获取设备列表
    async getDevices() {
      const devices = await services.getDevices();
      console.log('获取设备列表: ', devices);
      return devices;
    },
  },
});

export default useDeviceStore;
