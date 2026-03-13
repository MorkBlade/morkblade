
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
  isUpdate: false,
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

    // 设备优先级选择：非2.4G > 2.4G，支持用户指定设备
    _selectDevice(devices, clickSelectedDevice) {
      if (devices.length === 1) return { selected: devices[0], sorted: devices };

      const non24G = devices.filter(d => d.usagePage !== 65408);
      const g24    = devices.filter(d => d.usagePage === 65408);

      if (non24G.length > 0) {
        if (clickSelectedDevice) {
          const idx = non24G.findIndex(
            d => d.vendorId === clickSelectedDevice.vendorId && d.productId === clickSelectedDevice.productId,
          );
          if (idx > 0) non24G.unshift(non24G.splice(idx, 1)[0]);
        }
        return { selected: non24G[0], sorted: [...non24G, ...g24] };
      }
      return { selected: g24[0], sorted: devices };
    },

    // 注册设备事件监听，先 off 防止重复绑定
    _registerListeners() {
      services.off('GETDEVICEINFO');
      services.off('usbChange');
      emitter.off('isUpdate');

      services.on('GETDEVICEINFO', (status) => {
        this.requestDeviceStatus = status;
      });

      emitter.on('isUpdate', (data) => {
        this.isUpdate = data;
      });

      services.on('usbChange', async (data) => {
        const { device } = data;

        if (data.updateFail) {
          emitter.emit('toUpdate');
          this.isUpdate = false;
          return;
        }

        if (data.type === 'disconnect' || data.type === 'isUpgrading_disconnect') {
          if (!this.isUpdate) {
            if (this.reseted) return;
            router.replace({ path: '/' });
            emitter.emit('disconnect', this.isUpdate);
          }
          return;
        }

        if (data.type === 'connect' || (data.type === 'isUpgrading_connect' && data.reconnect)) {
          if (!device?.collections?.length) {
            console.warn('No collections available on the device');
            return;
          }
          const targetCollection = device.collections.find(
            c => c.usage === 1 && [65440, 65456, 65408].includes(c.usagePage),
          );
          if (targetCollection && this.reseted) {
            emitter.emit('resetData', this.reseted);
            this.reseted = false;
          }
        }
      });
    },

    async connectDevice(clickSelectedDevice) {
      try {
        this._registerListeners();

        const rawDevices = await services.getDevices();
        if (!rawDevices.length) {
          console.log('未检测到设备。');
          return false;
        }

        const { selected, sorted } = this._selectDevice(rawDevices, clickSelectedDevice);
        this.devices = sorted;
        this.device  = selected;

        if (!selected) return false;

        const res = await services.init(selected.id);
        console.log('init res:', res);
        this.connectDeviceStatus = true;
        return true;
      } catch (error) {
        console.error('connectDevice error:', error);
        return false;
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
