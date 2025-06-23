import { useAppStore } from '@/stores/index';

export const useVersionHook = (versionStr) => {
  const appStore = useAppStore();
  // appStore.version 结构为 { mainVersion, subVersion, hardwareVersion, softwareVersion }
  // 组装成字符串
  const getCurrentVersion = () => {
    const v = appStore.version;
    return `${v.mainVersion}.${v.subVersion}.${v.hardwareVersion}.${v.softwareVersion}`;
  };

  // 检查当前设备版本号是否大于等于versionStr
  const isCheckVersion = computed(() => {
    const current = getCurrentVersion();
    const result = compareVersion(current, versionStr) >= 0;
    return result;
  });

  return { isCheckVersion, compareVersion };
};

// 比较两个版本号字符串，返回1表示v1>v2，0表示相等，-1表示v1<v2
function parseVersion(str) {
  const arr = str.split('.').map(Number);
  return [arr[0] || 0, arr[1] || 0, arr[2] || 0, arr[3] || 0];
}
function compareVersion(v1, v2) {
  const a = parseVersion(v1);
  const b = parseVersion(v2);
  for (let i = 0; i < 4; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}
