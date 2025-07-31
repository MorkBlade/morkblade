
/**
 * RGB对象转HEX字符串
 * @param {Object} rgb - RGB对象 {R: number, G: number, B: number} 或 {r: number, g: number, b: number}
 * @returns {string} HEX颜色字符串 (例如: '#FF0000')
 */
export const rgbToHex = (rgb) => {
  // 统一大小写
  const r = rgb.R ?? rgb.r;
  const g = rgb.G ?? rgb.g;
  const b = rgb.B ?? rgb.b;

  // 确保值在0-255范围内
  const validR = Math.min(255, Math.max(0, r));
  const validG = Math.min(255, Math.max(0, g));
  const validB = Math.min(255, Math.max(0, b));

  // 转换为16进制并补0
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(validR)}${toHex(validG)}${toHex(validB)}`.toUpperCase();
};

/**
 * HEX字符串转RGB对象
 * @param {string} hex - HEX颜色字符串 (例如: '#FF0000' 或 'FF0000')
 * @param {boolean} [upperCase=true] - 是否返回大写的RGB键名
 * @returns {Object} RGB对象 {R: number, G: number, B: number} 或 {r: number, g: number, b: number}
 */
export const hexToRgb = (hex, upperCase = true) => {
  // 移除#号如果存在
  const cleanHex = hex.replace('#', '');

  // 解析16进制值
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // 根据upperCase参数返回大写或小写键名
  return upperCase ? { R: r, G: g, B: b } : { r: r, g: g, b: b };
};

/**
 * 将API返回的灯光调色板数据转换为HEX颜色数组
 * @param {Array} staticColors - API返回的灯光调色板数组
 * @returns {Array<string>} HEX颜色字符串数组
 */
export const paletteToHexArray = (staticColors) => {
  if (!Array.isArray(staticColors)) return [];
  return staticColors.map((color) => {
    return rgbToHex({ R: color.R, G: color.G, B: color.B });
  });
};

/**
 * 将HEX颜色数组转换为API所需的灯光调色板格式
 * @param {Array<string>} hexColors - HEX颜色字符串数组
 * @returns {Array<Object>} API格式的灯光调色板数组
 */
export const hexArrayToPalette = (hexColors) => {
  if (!Array.isArray(hexColors)) return [];
  return hexColors.map((hex) => {
    const rgb = hexToRgb(hex, true);
    return {
      R: rgb.R,
      G: rgb.G,
      B: rgb.B,
      H: 0, // 保持默认值
    };
  });
};
