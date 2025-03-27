import XDKeyboard from '@sparklinkplayjoy/sdk-keyboard';

const service = new XDKeyboard({
  configs: [{ vendorId: 7331, productId: 257, usagePage: 0xffa0, usage: 0x01 }],
  // configs: [],
  usage: 1,
  usagePage: 65440,
});

export default service;
