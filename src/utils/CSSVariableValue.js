export const getCSSVariableValue = (variableName, defaultValue = 0) => {
  try {
    // 确保变量名格式正确
    const properVariableName = variableName.startsWith('--') ? variableName : `--${variableName}`;

    // 获取变量值并清理空格
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue(properVariableName).trim();

    // 转换为数字
    const numValue = Number(rawValue);

    // 检查是否为有效数字
    if (isNaN(numValue)) {
      console.warn(`CSS变量 ${variableName} 的值 "${rawValue}" 无法转换为数字，使用默认值 ${defaultValue}`);
      return defaultValue;
    }

    return numValue;
  } catch (error) {
    console.error(`获取CSS变量 ${variableName} 时出错:`, error);
    return defaultValue;
  }
};
