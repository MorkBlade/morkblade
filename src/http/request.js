
import axios from 'axios';
import qs from 'qs';
import { showMessage } from '@/utils/message';

// 存储不同的 axios 实例
const instances = new Map();

// 默认配置
const defaultConfig = {
  timeout: 5000,
  // withCredentials: true,
  headers: {
    get: { 'Content-Type': 'application/json;charset=UTF-8' },
    post: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  },
};

// 创建实例的工厂函数
const createInstance = (config) => {
  // 合并默认配置和自定义配置
  const finalConfig = { ...defaultConfig, ...config, headers: { ...defaultConfig.headers, ...(config.headers || {}) } };
  const instance = axios.create(finalConfig);

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      config.headers['Xs-API-Key'] = '860DE3DB584158536BC89030D8640E29';
      // 根据请求方法设置对应的 Content-Type
      if (config.method === 'get') {
        config.headers = { ...config.headers, ...defaultConfig.headers.get };
      } else if (config.method === 'post') {
        config.headers = { ...config.headers, ...defaultConfig.headers.post };
      }

      // 处理 POST 请求参数序列化
      if (
        config.method === 'post' &&
        config.headers['Content-Type'] === 'application/x-www-form-urlencoded;charset=UTF-8' &&
        config.headers['Xs-API-Key'] === '860DE3DB584158536BC89030D8640E29'
      ) {
        config.data = qs.stringify(config.data);
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      const { data } = response;

      // 处理业务状态码
      if (data.code !== undefined) {
        if (data.code === 200) {
          return data.data;
        }
        // 处理业务错误
        showMessage(data.message || '请求失败', 'warning');
        return Promise.reject(new Error(data.message));
      }

      return data;
    },
    (error) => {
      let message = '';
      const status = error.response?.status;

      switch (status) {
        case 401:
          message = '未授权，请重新登录';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求错误，未找到该资源';
          break;
        case 500:
          message = '服务器错误';
          break;
        default:
          message = error.message;
      }

      showMessage(message, 'warning');
      return Promise.reject(error);
    },
  );

  return instance;
};

// 获取实例，如果不存在则创建
const getInstance = (baseURL, config) => {
  if (!instances.has(baseURL)) {
    instances.set(baseURL, createInstance({ baseURL, ...config }));
  }
  return instances.get(baseURL);
};

// 导出请求方法
export const request = {
  get: (baseURL, url, params, config) => {
    return getInstance(baseURL).get(url, { params, ...config });
  },

  post: (baseURL, url, data, config) => {
    return getInstance(baseURL).post(url, data, config);
  },

  upload: (baseURL, url, formData, config) => {
    return getInstance(baseURL).post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },

  getFile: (baseURL, url, params, config) => {
    return getInstance(baseURL, { responseType: 'arraybuffer' }).get(url, { params, ...config });
  },
};
