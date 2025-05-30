import XDKeyboard from '@sparklinkplayjoy/sdk-keyboard';

const service = new XDKeyboard({
  configs: [
    { vendorId: 7331, productId: 257, usagePage: 0xffa0, usage: 0x01 }, // v1
    { vendorId: 0x1c4f, productId: 0xee88, usagePage: 0xffa0, usage: 0x01 }, // v1 boot
    { vendorId: 0x1ca6, productId: 0x1504, usagePage: 65456, usage: 0x01 }, // v2
    { vendorId: 0x1ca6, productId: 0x0834, usagePage: 65456, usage: 0x01 }, // v2索艾
    // { vendorId: 0x1ca3, productId: 0x0101, usagePage: 0xffa0, usage: 0x01 },
    // { vendorId: 0x1ca9, productId: 0xe501, usagePage: 0xffa0, usage: 0x01 },
  ],
  // configs: [],
  usage: [0x01],
  usagePage: [65440, 65456],
});

export default service;
