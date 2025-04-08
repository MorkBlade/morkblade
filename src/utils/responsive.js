/**
 * 响应式工具函数 - 根据不同分辨率自动缩放数值
 */

// 基础分辨率的参考值（1080p）
const BASE_WIDTH = 1920;

/**
 * 获取当前屏幕分辨率下的缩放比例
 * @returns {number} 缩放比例
 */
export const getScaleFactor = () => {
  const width = window.innerWidth;

  // 2K分辨率 (1440p) - 使用约1.15的缩放比例
  if (width >= 2000 && width <= 3000) {
    return 1.15;
  }

  // 4K分辨率 (2160p) - 使用约2的缩放比例
  if (width > 3000) {
    return 2;
  }

  // 默认返回1
  return 1;
};

/**
 * 自动缩放数值
 * @param {number} value - 原始数值
 * @returns {number} 缩放后的数值
 */
export const scaleValue = (value) => {
  return Math.round(value * getScaleFactor());
};
