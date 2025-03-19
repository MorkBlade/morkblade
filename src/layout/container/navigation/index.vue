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
        :style="getBackgroundStyle(ite, idx)"
      >
        <template v-slot:title>
          <span :style="{ color: getBackgroundStyle(ite, idx).color }">{{ ite.name }}</span>
          <img :class="ite.icon" :src="getBackgroundStyle(ite, idx).iconUrl" />
        </template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import navcheckedBg1 from '@/assets/images/nav_bg1_c.gif';
import navcheckedBg2 from '@/assets/images/nav_bg2_c.gif';
import navcheckedBg3 from '@/assets/images/nav_bg3_c.gif';

const navBg1 = '/public/images/nav_bg1.svg';
const navBg2 = '/public/images/nav_bg2.svg';
const navBg3 = '/public/images/nav_bg3.svg';

const routesInfo = [
  { path: '/performance', name: '性能', icon: 'performance' },
  { path: '/key-assignment', name: '按键分配', icon: 'key-assignment' },
  { path: '/macro', name: '宏', icon: 'macro' },
  { path: '/lighting', name: '灯光', icon: 'lighting' },
  { path: '/key-calibration', name: '按键校准', icon: 'key-calibration' },
  { path: '/settings', name: '设置', icon: 'settings' },
];
const router = useRouter();
const defaultActive = ref('/performance');
const handleClick = async (ite) => {
  if (defaultActive.value !== ite.path) {
    // 确保只有当路径改变时才进行更新
    defaultActive.value = ite.path; // 更新默认激活的菜单项
    try {
      await nextTick();
      await router.push({
        path: ite.path,
        replace: false,
      });
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }
};
const route = useRoute();
watch(
  () => route.path,
  (newPath) => {
    defaultActive.value = newPath;
  },
  { immediate: true },
);

const getBackgroundStyle = computed(() => {
  return (ite, idx) => {
    const isActive = defaultActive.value === ite.path;
    const url = !idx
      ? isActive
        ? navcheckedBg1
        : navBg1
      : idx === routesInfo.length - 1
        ? isActive
          ? navcheckedBg3
          : navBg3
        : isActive
          ? navcheckedBg2
          : navBg2;

    return {
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: isActive ? '#000000' : '#ffffff',
      iconUrl: `/src/assets/images/${ite.icon}-${isActive ? 'b' : 'w'}.svg`,
    };
  };
});
</script>

<style scoped lang="scss">
.navbar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1380px;
  height: 50px;
  // margin-left: 270px;
  margin-top: 25px;
  background-color: transparent;

  .el-menu {
    background-color: transparent;
    height: 50px;
  }

  .el-menu--horizontal.el-menu {
    border: none;
  }

  .el-menu-item {
    border-radius: 10px;
    margin: 0 0 0 12px;
    width: 220px;
    height: 50px;
    font-size: 22px;
    // font-weight: 600;
    font-family: 'CN oblique';
    background-color: transparent;
  }

  img {
    width: 20px;
    height: 15px;
    margin-left: 10px;
  }

  .lighting {
    height: 18px;
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
}
</style>
