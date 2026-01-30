/**
 * HID设备连接帮助工具
 * 提供浏览器原生Web HID API的封装
 */

// 检查浏览器是否支持Web HID API
export function checkHIDSupport() {
  if ('hid' in navigator) {
    console.log('浏览器支持Web HID API');
    return true;
  } else {
    console.log('浏览器不支持Web HID API');
    alert('您的浏览器不支持Web HID API，请使用Chrome 89+或Edge 89+');
    return false;
  }
}

// 设备过滤器配置（基于你项目中的设备配置）
export const DEVICE_FILTERS = [
  { vendorId: 0x1ca6, productId: 0x1504 }, // v2
  { vendorId: 0x1ca6, productId: 0x0834 }, // v2索艾
  { vendorId: 0x1ca6, productId: 0x1506 }, // mk84
  { vendorId: 0x1c4f, productId: 0xee88 }, // v1 boot
  { vendorId: 7331, productId: 257 },      // v1
  { vendorId: 7334, productId: 5384 }, // mk66
  { vendorId: 0x1ca3, productId: 0x0101 }, // v1
  { vendorId: 0x1ca9, productId: 0xe501 }, // v2
];

/**
 * 请求HID设备连接 - 会弹出浏览器的设备选择弹窗
 * @param {Array} filters - 设备过滤器，默认使用项目配置的设备
 * @returns {Promise<HIDDevice|null>} 返回选中的设备或null
 */
export async function requestHIDDevice(filters = DEVICE_FILTERS) {
  if (!checkHIDSupport()) {
    return null;
  }

  try {
    console.log('正在请求HID设备连接...');

    // 这里会弹出浏览器的设备选择弹窗
    const devices = await navigator.hid.requestDevice({
      filters: filters
    });
    console.log('发现设备:', devices);

    if (devices && devices.length > 0) {
      const selectedDevice = devices[0];
      console.log('用户选择了设备:', {
        productName: selectedDevice.productName,
        vendorId: selectedDevice.vendorId,
        productId: selectedDevice.productId
      });
      return selectedDevice;
    } else {
      console.log('用户没有选择任何设备');
      return null;
    }
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.log('用户拒绝了设备访问权限');
    } else if (error.name === 'AbortError') {
      console.log('用户取消了设备选择');
    } else {
      console.error('请求HID设备时发生错误:', error);
    }
    return null;
  }
}

/**
 * 获取已经授权的HID设备列表
 * @returns {Promise<HIDDevice[]>} 已授权的设备列表
 */
export async function getAuthorizedDevices() {
  if (!checkHIDSupport()) {
    return [];
  }

  try {
    const devices = await navigator.hid.getDevices();
    console.log('已授权的HID设备:', devices);
    return devices;
  } catch (error) {
    console.error('获取已授权设备失败:', error);
    return [];
  }
}

/**
 * 连接到HID设备
 * @param {HIDDevice} device - 要连接的设备
 * @returns {Promise<boolean>} 连接是否成功
 */
export async function connectToDevice(device) {
  try {
    if (!device.opened) {
      await device.open();
      console.log('设备连接成功:', device.productName);

      // 监听设备数据
      device.addEventListener('inputreport', (event) => {
        console.log('收到设备数据:', event.data);
      });

      return true;
    }
    return true;
  } catch (error) {
    console.error('连接设备失败:', error);
    return false;
  }
}

/**
 * 断开HID设备连接
 * @param {HIDDevice} device - 要断开的设备
 */
export async function disconnectDevice(device) {
  try {
    if (device && device.opened) {
      await device.close();
      console.log('设备已断开连接');
    }
  } catch (error) {
    console.error('断开设备连接失败:', error);
  }
}

/**
 * 监听设备连接/断开事件
 */
export function setupDeviceListeners() {
  if (!checkHIDSupport()) {
    return;
  }

  navigator.hid.addEventListener('connect', (event) => {
    console.log('HID设备已连接:', event.device);
  });

  navigator.hid.addEventListener('disconnect', (event) => {
    console.log('HID设备已断开:', event.device);
  });
}

// 使用示例：
// import { requestHIDDevice, connectToDevice } from '@/utils/hid-helper.js';
//
// async function handleConnectClick() {
//   const device = await requestHIDDevice();
//   if (device) {
//     const success = await connectToDevice(device);
//     if (success) {
//       console.log('设备连接成功！');
//     }
//   }
// }
