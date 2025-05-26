import { useDeviceStore } from '@/stores';
import { setRouteEmitter } from '@/utils/router-listener.js';

function setupPageGuard(router) {
  router.beforeEach(async (to, from, next) => {
    next();
    setRouteEmitter(to);
  });
}

export default function createRouteGuard(router) {
  setupPageGuard(router);
  router.beforeEach(async (to, from, next) => {
    if (to.path === '/connect') {
      next();
      return;
    }
    const deviceStore = useDeviceStore();
    // console.log('router beforeEach------------------------>');
    // const version = deviceStore.devices[0]?.usagePage === 65440 ? 'v1' : 'v2';
    // localStorage.setItem('keyboardVersion', version);
    try {
      if (!deviceStore.connectDeviceStatus) {
        const result = await deviceStore.connectDevice();
        if (result) {
          next();
        } else {
          next({ path: '/connect', replace: true });
        }
      } else {
        next();
      }
    } catch (error) {
      console.error('设备连接失败:', error);
      // next('/connect');
      if (to.path !== '/connect') {
        next({ path: '/connect', replace: true });
      } else {
        next();
      }
    }
  });
}
