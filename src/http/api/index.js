
// import { BASE_URLS } from '../config.js';
import { request } from '../request.js';

export const httpService = {
  // 获取轴体文件
  getAxisList: (params) => request.get('https://api.sparklinkplayjoy.com/api/v1', '/getAxisList', params),
  getFirmwarePack: (params) => request.get('https://api.sparklinkplayjoy.com/api/v1', '/getKeyboardFirmware', params),
  getAxisListV2: (params) => request.get('https://api.sparklinkplayjoy.com/api/v1/', '/getAxisListV2', params),
};
