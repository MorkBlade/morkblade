
import XDKeyboard from '@sparklinkplayjoy/morkblade-sdk-keyboard';

const service = new XDKeyboard({
  configs: [
    { vendorId: 0x1ca3, productId: 0x0101, usagePage: 0xffa0, usage: 0x01 }, // v1
    { vendorId: 0x1c4f, productId: 0xee88, usagePage: 0xffa0, usage: 0x01 }, // v1 boot
    { vendorId: 0x1ca6, productId: 0x1504, usagePage: 0xffb0, usage: 0x01 }, // v2
    { vendorId: 0x1ca6, productId: 0x0834, usagePage: 0xffb0, usage: 0x01 }, // v2索艾
    { vendorId: 0x1ca6, productId: 0x1506, usagePage: 0xffb0, usage: 0x01 }, // mk84
    { vendorId: 0x1ca6, productId: 0x1506, usagePage: 0xff80, usage: 0x01 }, // mk84 2.4G
    { vendorId: 0x1ca6, productId: 0x1508, usagePage: 0xffb0, usage: 0x01 }, // mk66
    { vendorId: 0x1ca3, productId: 0x0101, usagePage: 0xffa0, usage: 0x01 },
    { vendorId: 0x1ca9, productId: 0xe501, usagePage: 0xffa0, usage: 0x01 },
  ],
  // configs: [],
  usage: [0x01],
  usagePage: [0xffa0, 0xffb0, 0xff80],
  usagePageV2: [0xff80, 0xffb0]
});
export default service;
