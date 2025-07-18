<template>
    <div class="setting">
        <button @click="toggleDropdown" class="setting-btn" :class="{ 'is-checked': selectedLanguage }">
            <img class="cur-language-img" :src="settingIcon" alt="Down Arrow" />
        </button>
        <div class="best-version" v-show="hasNewVersion"></div>
    </div>
</template>

<script setup>
import { httpService } from '@/http/api/index.js';
import { useAppStore, useDeviceStore } from '@/stores';
import settingIcon from '@/assets/images/setting.png';

const appStore = useAppStore();
const deviceStore = useDeviceStore();

const bestVersion = ref(null);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';
const hasNewVersion = computed(() => bestVersion.value > appStore.baseInfo?.appVersion);
onMounted(() => {
    if (isVersion2) {  // 仅在v2版本键盘上执行
        setTimeout(async () => {
            const boardId = appStore.baseInfo?.boardId.toString(16).padStart(8, '0');
            const vid = deviceStore.device?.vendorId.toString(16).padStart(4, '0');
            const pid = deviceStore.device?.productId.toString(16).padStart(4, '0');
            const params = { board_id: boardId, vid, pid };

            // 调用API获取固件包信息
            const res = await httpService.getFirmwarePack(params);
            if (res && res.firmware.firmware_version) {
                // 移除版本号前缀'v'并存储
                bestVersion.value = res.firmware.firmware_version.replace('v', '');
            }
        }, 200);
    }
});

</script>

<style scoped lang="scss">
.setting {
    position: relative;

    .setting-btn {
        width: var(--spacing-38);
        height: var(--spacing-38);
        // margin-top: calc(var(--spacing-16) + var(--spacing-1));
        margin-right: var(--spacing-20);
        display: flex;
        align-items: center;
        padding: var(--spacing-10);
        border: none;
        cursor: pointer;
        /* background: transparent; */
        border-radius: var(--spacing-5);
        background: transparent;
        // background-image: url('@/assets/images/bg-default.svg');
        background-size: cover;
        background-repeat: no-repeat;

        .cur-language-img {
            width: var(--spacing-24);
            height: var(--spacing-24);
            margin-top: var(--spacing-1);
            margin-left: calc(var(--spacing-3) * -1);
        }
    }

    .is-checked {
        // background-image: url('@/assets/images/bg-choose.gif');
    }

}

.best-version {
    position: absolute;
    top: var(--spacing-5);
    right: var(--spacing-15);
    width: var(--spacing-12);
    height: var(--spacing-12);
    border-radius: 50%;
    background: linear-gradient(135deg, #ff4757, #ff3742);
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.8);
    z-index: 10;
}

</style>
