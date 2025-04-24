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
  updateSuc: false,
  isDeviceConnected: false, // 添加设备连接状态
  curVersion: 'v1', // 当前键盘版本
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
            // 使用浏览器默认跳转方式
            window.location.href = '/';
          } else {
            this.connectDeviceStatus = true;
          }
          if (type === 'connect') {
            this.connectDeviceNum++;
            if (this.connectDeviceNum === 2 && device) {
              setTimeout(async () => {
                await services.reconnection(device, this.device.id);
                console.log('重连成功');
                this.connectDeviceNum = 0;
              }, 100);
            }
          }
        });
        // 监听设备拔插
        if (devices.length > 0) {
          const [device] = devices;
          this.devices = devices;
          if (device) {
            console.log('初始化设备');
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
