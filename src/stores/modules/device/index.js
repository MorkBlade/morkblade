import { UsbDetect } from '@sparklinkplayjoy/sdk-keyboard';
import { defineStore } from 'pinia';

import services from '@/services/index.js';

const state = {
  devices: [],
  device: {},
  report: [],
  isDeviceConnected: false,
  connectDeviceNum: 0,
  connectDeviceStatus: false,
  requestDeviceStatus: null,
  isConnecting: false, // 连接状态锁
};
const useDeviceStore = defineStore('device', {
  state: () => state,

  getters: {
    deviceId: (state) => state.device.id,
    deviceHid: (state) => state.device.data,
  },

  actions: {
    async connectDevice() {
      if (this.isConnecting) {
        return this.connectDeviceStatus;
      }
      console.log('connectDeviceconnectDeviceconnectDevice');
      try {
        if (this.device?.id) {
          try {
            await services.close(this.device.id);
          } catch (error) {
            console.log('关闭设备出错:', error);
          }
        }

        services.on('GETDEVICEINFO', (requestDeviceStatus) => {
          this.requestDeviceStatus = requestDeviceStatus;
        });
        services.on('INPUTREPORT', ({ value }) => {
          console.log('INPUTREPORT', value);
        });
        const devices = await services.getDevices();
        // 检测到设备拔插
        UsbDetect.startMonitoring();
        this.isDeviceConnected = true;
        UsbDetect.on('change', async ({ device, type }) => {
          if (type === 'disconnect') {
            this.connectDeviceStatus = false;
          } else {
            this.connectDeviceStatus = true;
          }
          if (type === 'connect') {
            this.connectDeviceNum++;
            if (this.connectDeviceNum === 2 && device) {
              setTimeout(async () => {
                await services.reconnection(device, this.device.id);
                this.connectDeviceNum = 0;
              }, 100);
            }
          }
        });
        // 监听设备拔插
        if (devices.length > 0) {
          this.isConnecting = true;
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
        console.log(error);
      }
    },
    // 恢复出厂设置
    async factoryDataReset() {
      try {
        await services.factoryDataReset();
      } catch (error) {
        console.log(error);
      }
    },
  },
});

export default useDeviceStore;
