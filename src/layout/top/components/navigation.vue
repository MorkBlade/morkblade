<template>
    <div class="navbar-container">
        <el-menu mode="horizontal" :default-active="defaultActive" :ellipsis="false">
            <el-menu-item class="menu-item" v-for="(ite, idx) in routesInfo" :key="ite.path" :index="ite.path"
                background-color="#262626" @click="handleClick(ite, idx)"
                :class="[getNavItemClass(ite, idx), { recording: macroStore.recording }]">
                <template v-slot:title>
                    <span :class="{ 'active-text': defaultActive === ite.path }">{{ ite.name }}</span>
                </template>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script setup>
import emitter from '@/utils/app-emitter';
import { useMacroStore, useKeyboardStore } from '@/stores';



const routesInfo = [
    { path: '/performance', name: '性能设置', icon: 'performance' },
    //{ path: '/key-assignment', name: '按键分配', icon: 'key-assignment' },
    //{ path: '/macro', name: '宏键设置', icon: 'macro' },
    { path: '/lighting', name: '灯光设置', icon: 'lighting' },
];
const route = useRoute();
const router = useRouter();
const defaultActive = ref('/performance');
const macroStore = useMacroStore();
const keyboardStore = useKeyboardStore();

const getNavItemClass = computed(() => {
    return (ite, idx) => {
        const isActive = defaultActive.value === ite.path;
        let positionClass = '';
    
        if (idx === 0) {
            positionClass = isActive ? 'nav-active' : 'nav-first';
        } else if (idx === routesInfo.length - 1) {
            positionClass = isActive ? 'nav-active' : 'nav-last';
        } else {
            positionClass = isActive ? 'nav-active' : 'nav-middle';
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


const handleClick = async (ite) => {
    if (macroStore.recording) return;
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
    height: var(--size-60);
    position: relative;

    .el-menu {
        background-color: transparent;
        height: var(--size-60);
    }

    .el-menu--horizontal.el-menu {
        border: none;
    }

    .el-menu-item {
        margin-left: var(--spacing-12);
        width: var(--nav-item-width);
        height: var(--size-60);
        font-size: var(--font-size-22);
        // font-weight: 600;
        font-family: 'CN oblique';

        // 默认状态下的文本颜色
        span {
            transition: color 0.2s ease-in-out;
            color: #ffffff;
        }

        &.recording {
            cursor: not-allowed;

            span {
                color: rgba(255, 255, 255, 0.5);
            }

            .active-text {
                color: #ffffff;
            }
        }

        // 激活状态下的文本颜色
        .active-text {
            color: #ffffff;
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

    .el-menu--horizontal>.el-menu-item.is-active {
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

    .el-menu--horizontal>.el-menu-item {
        border: none;
    }

    // 添加不同位置的导航背景样式
    .nav-first {
        // background-image: url('@/assets/images/nav_bg1.svg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }

    .nav-active {
        background-image: url('@/assets/images/nav_bg.png');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
    }


}
</style>
