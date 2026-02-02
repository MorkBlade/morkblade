<template>
    <div class="special-light">
        <div class="special-light__container">
            <!-- 上排按键 - 8个 index 0-7 -->
            <div class="special-light__row special-light__row--top">
                <div v-for="i in 8" :key="`top-${i}`" class="special-light__key" :style="getKeyStyle(i - 1)"
                    @click="handleKeyClick(i - 1)"></div>
            </div>

            <!-- 中间区域：左侧按键 + 中心内容 + 右侧按键 -->
            <div class="special-light__middle">
                <!-- 左侧按键 - 3个 index 19-21 -->
                <div class="special-light__col special-light__col--left">
                    <div v-for="i in 3" :key="`left-${i}`" class="special-light__key" :style="getKeyStyle(18 + i)"
                        @click="handleKeyClick(18 + i)"></div>
                </div>

                <!-- 中心内容 -->
                <div class="special-light__content">
                    <div class="special-light__logo">
                       <img class="logo-img" src="/src/assets/images/logo.png" alt="" />
                    </div>
                </div>

                <!-- 右侧按键 - 3个 index 8-10 -->
                <div class="special-light__col special-light__col--right">
                    <div v-for="i in 3" :key="`right-${i}`" class="special-light__key" :style="getKeyStyle(7 + i)"
                        @click="handleKeyClick(7 + i)"></div>
                </div>
            </div>

            <!-- 下排按键 - 8个 index 11-18 -->
            <div class="special-light__row special-light__row--bottom">
                <div v-for="i in 8" :key="`bottom-${i}`" class="special-light__key" :style="getKeyStyle(10 + i)"
                    @click="handleKeyClick(10 + i)"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLightSettingStore } from '@/stores';

const lightStore = useLightSettingStore();
const { decorativeLighting, enterCustom } = storeToRefs(lightStore);

// 获取指定索引的灯光颜色样式
const getKeyStyle = computed(() => (index) => {
    const color = decorativeLighting.value[index];
    if (color) {
        return { backgroundColor: `rgb(${color.R}, ${color.G}, ${color.B})` };
    }
    return {};
});

// 点击按键设置自定义颜色
const handleKeyClick = async (index) => {
    await lightStore.setDecorateCustom(index);
};

</script>

<style lang="scss" scoped>
.special-light {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80%;

    &__container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        height: 100%;
    }

    &__row {
        display: flex;
        justify-content: space-between;
        gap: 4px;

        &--top,
        &--bottom {
            flex-shrink: 0;
        }
    }

    &__middle {
        display: flex;
        flex: 1;
        gap: 4px;
    }

    &__col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 4px;

        &--left,
        &--right {
            flex-shrink: 0;
        }
    }

    &__key {
        width: var(--size-100);
        height: var(--size-50);
        border-radius: 8px;
        cursor: pointer;
    }

    &__content {
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 8px;
        border-radius: 8px;
    }

    &__logo img {
        width: var(--size-400);
        height: auto;
        opacity: 0.3;
    }


}
</style>
