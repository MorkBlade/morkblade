import { UsbDetect } from '@sparklinkplayjoy/sdk-keyboard';
import { defineStore } from 'pinia';

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
    // async connectDevice() {
    //   try {
    //     services.on('GETDEVICEINFO', (requestDeviceStatus) => {
    //       this.requestDeviceStatus = requestDeviceStatus;
    //     });
    //     services.on('INPUTREPORT', ({ value }) => {
    //       console.log('INPUTREPORT', value);
    //     });
    //     const devices = await services.getDevices();
    //     // 检测到设备拔插
    //     UsbDetect.startMonitoring();
    //     this.isDeviceConnected = true;
    //     UsbDetect.on('change', async ({ device, type }) => {
    //       if (type === 'disconnect') {
    //         this.connectDeviceStatus = false;
    //         // 使用浏览器默认跳转方式
    //         // window.location.href = '/';
    //       } else {
    //         this.connectDeviceStatus = true;
    //       }
    //       if (type === 'connect') {
    //         this.connectDeviceNum++;
    //         if (this.connectDeviceNum === 2 && device) {
    //           setTimeout(async () => {
    //             await services.reconnection(device, this.device.id);
    //             console.log('重连成功');
    //             this.connectDeviceNum = 0;
    //           }, 100);
    //         }
    //       }
    //     });
    //     // 监听设备拔插
    //     if (devices.length > 0) {
    //       const [device] = devices;
    //       this.devices = devices;
    //       if (device) {
    //         console.log('初始化设备');
    //         await services.init(device.id);
    //         this.connectDeviceStatus = true;
    //         return true;
    //       }
    //       return false;
    //     }
    //     return false;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    // 恢复出厂设置
    async connectDevice() {
      try {
        const devices = await services.getDevices();
        services.on('GETDEVICEINFO', (requestDeviceStatus) => {
          this.requestDeviceStatus = requestDeviceStatus;
        });
        emitter.on('isUpdate', (data) => {
          console.log('isupdate', data);
          this.isUpdate = data;
        });
        services.on('usbChange', async (data) => {
          console.log('USB设备变化2222222:', data);
          const { device } = data;
          if (data.updateFail) {
            emitter.emit('toUpdate');
            this.isUpdate = false;
          }

          if (data.type === 'disconnect' || data.type === 'isUpgrading_disconnect') {
            // 如果不是在升级页面的话 路由回到连接页面
            console.log('this.isUpdate', this.isUpdate);
            if (!this.isUpdate) {
              // if (router) router.replace({ path: '/' });
              console.log('out connectDevice', this.reseted);
              if (this.reseted) return;
              emitter.emit('disconnect', this.isUpdate);
              return;
            }
          }

          if (data.type === 'connect' || (data.type === 'isUpgrading_connect' && data.reconnect)) {
            if (device?.collections?.length) {
              try {
                const targetCollection = device.collections.find(
                  (collection) => collection.usage === 1 && [65440, 65456].includes(collection.usagePage),
                );

                console.log('targetCollection: ', targetCollection);

                if (targetCollection) {
                  emitter.emit('reconnect-device');
                  if (this.reseted) {
                    emitter.emit('resetData', this.reseted);
                    this.reseted = false;
                  }
                  // emitter.emit('setDeviceName', device.productName);
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
          const [device] = devices;
          this.devices = devices;
          this.device = device;
          if (device) {
            await services.init(device.id);
            this.connectDeviceStatus = true;
            return true;
          }
          return false;
        }
        return false;
      } catch (error) {
        console.log('error', error);
      }
    },

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
      // console.log('getLightingAreagetLightingArea');
      const doubleLightingRes = await services.getDoubleLightingV2();
      console.log('doubleLightingRes: ', doubleLightingRes);
      // const { doubleLighting } = doubleLightingRes;
      // if (doubleLighting) this.isDoubleLighting = true;
      return doubleLightingRes;
    },
  },
});

export default useDeviceStore;
