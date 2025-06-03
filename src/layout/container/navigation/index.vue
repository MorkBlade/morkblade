<template>
  <div class="navbar-container">
    <el-menu mode="horizontal" :default-active="defaultActive" :ellipsis="false" router>
      <el-menu-item
        class="menu-item"
        v-for="(ite, idx) in routesInfo"
        :key="ite.path"
        :index="ite.path"
        background-color="#000000"
        @click="handleClick(ite, idx)"
        :class="getNavItemClass(ite, idx)"
      >
        <template v-slot:title>
          <span :class="{ 'active-text': defaultActive === ite.path }">{{ ite.name }}</span>
          <img :class="ite.icon" :src="getIconSrc(ite)" />
        </template>
      </el-menu-item>
    </el-menu>
    <div class="best-version" v-if="hasNewVersion"></div>
  </div>
</template>

<script setup>
import emitter from '@/utils/app-emitter';
import { useAppStore, useDeviceStore, useKeyboardStore } from '@/stores';
import { httpService } from '@/http/api/index.js';

import performanceW from '@/assets/images/performance-w.svg';
import performanceB from '@/assets/images/performance-b.svg';
import keyAssignmentW from '@/assets/images/key-assignment-w.svg';
import keyAssignmentB from '@/assets/images/key-assignment-b.svg';
import macroW from '@/assets/images/macro-w.svg';
import macroB from '@/assets/images/macro-b.svg';
import lightingW from '@/assets/images/lighting-w.svg';
import lightingB from '@/assets/images/lighting-b.svg';
import keyCalibrationW from '@/assets/images/key-calibration-w.svg';
import keyCalibrationB from '@/assets/images/key-calibration-b.svg';
import settingsW from '@/assets/images/settings-w.svg';
import settingsB from '@/assets/images/settings-b.svg';
import { onMounted } from 'vue';

// 创建图标映射对象
const iconMap = {
  performance: {
    w: performanceW,
    b: performanceB,
  },
  'key-assignment': {
    w: keyAssignmentW,
    b: keyAssignmentB,
  },
  macro: {
    w: macroW,
    b: macroB,
  },
  lighting: {
    w: lightingW,
    b: lightingB,
  },
  'key-calibration': {
    w: keyCalibrationW,
    b: keyCalibrationB,
  },
  settings: {
    w: settingsW,
    b: settingsB,
  },
};

const routesInfo = [
  { path: '/performance', name: '性能', icon: 'performance' },
  { path: '/key-assignment', name: '按键分配', icon: 'key-assignment' },
  { path: '/macro', name: '宏', icon: 'macro' },
  { path: '/lighting', name: '灯光', icon: 'lighting' },
  { path: '/key-calibration', name: '按键校准', icon: 'key-calibration' },
  { path: '/settings', name: '设置', icon: 'settings' },
];
const route = useRoute();
const router = useRouter();
const defaultActive = ref('/performance');
const appStore = useAppStore();
const deviceStore = useDeviceStore();
const keyboardStore = useKeyboardStore();
const hasNewVersion = ref(false);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

const getNavItemClass = computed(() => {
  return (ite, idx) => {
    const isActive = defaultActive.value === ite.path;
    let positionClass = '';

    if (idx === 0) {
      positionClass = isActive ? 'nav-first-active' : 'nav-first';
    } else if (idx === routesInfo.length - 1) {
      positionClass = isActive ? 'nav-last-active' : 'nav-last';
    } else {
      positionClass = isActive ? 'nav-middle-active' : 'nav-middle';
    }

    return [positionClass, { 'is-nav-active': isActive }];
  };
});

watch(
  () => route.path,
  (newPath) => {
    defaultActive.value = newPath;
  },
  { immediate: true },
);

onMounted(() => {
  if (isVersion2) {
    setTimeout(async () => {
      const boardId = appStore.baseInfo?.boardId.toString(16).padStart(8, '0');
      const vid = deviceStore.device?.vendorId.toString(16).padStart(4, '0');
      const pid = deviceStore.device?.productId.toString(16).padStart(4, '0');
      const params = { board_id: boardId, vid, pid };
      // const res = await httpService.getFirmwarePack({ board_id: '00150004', vid: '1CA6', pid: '1504' });
      const res = await httpService.getFirmwarePack(params);
      if (res && res.firmware.firmware_version) {
        const bestVersion = res.firmware.firmware_version.replace('v', '');
        hasNewVersion.value = bestVersion > appStore.baseInfo?.appVersion;
        // console.log('onMounted log res: ', bestVersion > appStore.baseInfo?.appVersion);
      }
    }, 200);
  }
});

const getIconSrc = (ite) => {
  const isActive = defaultActive.value === ite.path;
  const type = isActive ? 'b' : 'w';
  return iconMap[ite.icon][type];
};

const handleClick = async (ite) => {
  if (defaultActive.value !== ite.path) {
    // 确保只有当路径改变时才进行更新
    defaultActive.value = ite.path; // 更新默认激活的菜单项
    if (ite.path !== '/performance') {
      emitter.emit('in-the-where', { value: 'mechanicalMode' });
    }
    try {
      await nextTick();
      await router.push({
        path: ite.path,
        replace: false,
      });
      keyboardStore.cancelSelectKey();
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }
};
</script>

<style scoped lang="scss">
.navbar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--nav-container-width);
  height: var(--size-50);
  // margin-left: 270px;
  margin-top: var(--spacing-25);
  background-color: transparent;
  position: relative;

  .el-menu {
    background-color: transparent;
    height: var(--size-50);
  }

  .el-menu--horizontal.el-menu {
    border: none;
  }

  .el-menu-item {
    border-radius: var(--spacing-10);
    margin-left: var(--spacing-12);
    width: var(--nav-item-width);
    height: var(--size-50);
    font-size: var(--font-size-22);
    // font-weight: 600;
    font-family: 'CN oblique';
    background-color: transparent;

    // 默认状态下的文本颜色
    span {
      color: #ffffff;
    }

    // 激活状态下的文本颜色
    .active-text {
      color: #000000;
    }
  }

  img {
    width: var(--size-20);
    height: var(--size-15);
    margin-left: var(--spacing-10);
  }

  .lighting {
    height: var(--size-18);
  }

  .el-menu--horizontal > .el-menu-item.is-active {
    border: 0;
  }

  .el-menu--horizontal .el-menu-item:not(.is-disabled):hover,
  .el-menu el-menu--horizontal {
    background-color: transparent;
  }

  .el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
  .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
    background-color: transparent;
    border: none;
  }

  .el-menu--horizontal > .el-menu-item {
    border: none;
  }

  // 添加不同位置的导航背景样式
  .nav-first {
    background-image: url('@/assets/images/nav_bg1.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .nav-first-active {
    background-image: url('@/assets/images/nav_bg1_c.gif');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .nav-middle {
    background-image: url('@/assets/images/nav_bg2.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .nav-middle-active {
    background-image: url('@/assets/images/nav_bg2_c.gif');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .nav-last {
    background-image: url('@/assets/images/nav_bg3.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .nav-last-active {
    background-image: url('@/assets/images/nav_bg3_c.gif');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .best-version {
    width: var(--size-10);
    height: var(--size-10);
    border-radius: 50%;
    background-color: red;
    position: absolute;
    top: var(--spacing-8);
    right: var(--spacing-5);
  }
}
</style>
