<template>
    <div class="battery-level-status">
        <div class="battery-left-status">
            <div class="battery-level-status__icon">
                <div class="batteryPower"></div>
            </div>
            <div class="battery-level-status__text">
                {{ appStore.deviceStatus.battery }}%
            </div>
        </div>
        <div class="battery-level-status__charge" v-if="appStore.deviceStatus.charge === 1">
            ⚡
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores';
import { onMounted } from 'vue';

const appStore = useAppStore();
const { getDeviceStatus } = appStore;

onMounted(async () => {
  const res = await getDeviceStatus();
  console.log('deviceStatus', appStore.deviceStatus);
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
    border: var(--spacing-2) solid #242424;
    border-radius: var(--spacing-6);
}

.battery-left-status {
    position: relative;
}



.battery-level-status__icon {
    width: var(--spacing-45);
    height: var(--spacing-22);
    background-image: url('@/assets/images/Battery.svg');
    // background-position: center;
    background-size: cover;

    .batteryPower {
        width: var(--spacing-38);
        height: var(--spacing-20);
        height: var(--spacing-10);
        // background-color: #91BC00;
    }
}
.battery-level-status__text {
    position: absolute;
    top: var(--spacing-4);
    left: var(--spacing-10);
    font-size: var(--font-size-8);
    font-weight: 500;
    line-height: var(--line-height-20);
    color: #fff;
}
.battery-level-status__charge {

}
</style>