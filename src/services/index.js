import XDKeyboard from '@sparklinkplayjoy/sdk-keyboard';

const service = new XDKeyboard({
  // configs: [
  //   { vendorId: 7331, productId: 257, usagePage: 0xffa0, usage: 0x01 },
  //   { vendorId: 0x1c4f, productId: 0xee88, usagePage: 0xffa0, usage: 0x01 },
  // ],
  configs: [],
  usage: [0x01],
  usagePage: [65440, 65456],
});

export default service;
