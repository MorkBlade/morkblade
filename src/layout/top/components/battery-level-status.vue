<template>
    <div class="battery-level-status">
        <div class="battery-left-status">
            <div class="battery-level-status__icon">
                <div 
                    class="batteryPower" 
                    :style="batteryFillStyle"
                    :class="batteryColorClass"
                ></div>
            </div>
            <div class="battery-level-status__text">
                {{ deviceStatus.battery }}%
            </div>
        </div>
        <div class="battery-level-status__charge" v-if="deviceStatus.charge === 1">
            
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores';
import { onMounted, onUnmounted, computed, ref } from 'vue';

const appStore = useAppStore();
const { getDeviceStatus } = appStore;

const deviceStatus = ref({
    battery: 0,
    charge: 0,
    mode: 0,
});

// 定时器引用
let statusTimer: NodeJS.Timeout | null = null;

// 更新设备状态的函数
const updateDeviceStatus = async () => {
    try {
        deviceStatus.value = await getDeviceStatus();
        console.log('电池状态更新', deviceStatus.value);
    } catch (error) {
        console.error('获取设备状态失败:', error);
    }
};

// 启动定时器
const startStatusTimer = () => {
    // 清除可能存在的旧定时器
    if (statusTimer) {
        clearInterval(statusTimer);
    }
    
    // 每60秒更新一次电池状态
    statusTimer = setInterval(updateDeviceStatus, 60000);
};

// 停止定时器
const stopStatusTimer = () => {
    if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
    }
};

// 计算电池填充样式
const batteryFillStyle = computed(() => {
    const batteryLevel = deviceStatus.value.battery || 0;
    const fillWidth = Math.max(0, Math.min(100, batteryLevel));
    return {
        width: `${fillWidth}%`,
    };
});

// 计算电池颜色类
const batteryColorClass = computed(() => {
    const batteryLevel = deviceStatus.value.battery || 0;
    if (batteryLevel <= 20) {
        return 'battery-low';
    } else {
        return 'battery-high';
    }
});

onMounted(async () => {
    // 初始化时获取一次状态
    await updateDeviceStatus();
    // 启动定时器
    startStatusTimer();
});

onUnmounted(() => {
    // 组件卸载时清理定时器
    stopStatusTimer();
});

</script>

<style scoped lang="scss">
.battery-level-status { 
    max-height: var(--spacing-40);
    margin-top: calc(var(--spacing-16) + var(--spacing-1));
    margin-right: var(--spacing-16);
    padding: var(--spacing-2) var(--spacing-7);
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--spacing-3) solid #242424;
    border-radius: var(--spacing-10);
}

.battery-left-status {
    position: relative;
}

.battery-level-status__icon {
    width: var(--spacing-45);
    height: var(--spacing-22);
    background-image: url('@/assets/images/Battery.svg');
    background-size: cover;
    position: relative;
    overflow: hidden;

    .batteryPower {
        position: absolute;
        left: var(--spacing-4);
        top: var(--spacing-4);
        height: calc(var(--spacing-20) - var(--spacing-6));
        max-width: calc(var(--spacing-38) - var(--spacing-4));
        border-radius: var(--spacing-1);
        transition: width 0.3s ease, background-color 0.3s ease;
        
        // 电池电量颜色状态
        &.battery-low {
            background-color: #ff4757; // 红色 - 低电量
        }
        
        &.battery-high {
            background-color: #91BC00; // 绿色 - 高电量
        }
    }
}
.battery-level-status__text {
    position: absolute;
    top: var(--spacing-5);
    left: var(--spacing-10);
    font-size: var(--font-size-8);
    font-weight: 500;
    line-height: var(--line-height-20);
    color: #fff;
    font-family: 'CN Heavy';
}
.battery-level-status__charge {
    width: var(--spacing-8);
    height: var(--spacing-10);
    background-image: url('@/assets/images/charge.svg');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    margin-left: var(--spacing-7);
    transform: scale(1.5);
    // 闪烁动画
    animation: blink 2s linear infinite;
}

@keyframes blink {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}
</style>