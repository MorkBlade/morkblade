<template>
    <div class="m-dialog" v-if="isShow">
        <div class="shadow">
            <div class="dialog-content">
                <div class="header">
                    <h3>{{ dialogTitle }}</h3>
                    <span class="close-btn">
                        <img src="@/assets/images/cancel_icon.svg" alt="" />
                    </span>
                </div>
                <div class="content">
                    <div class="on-board-configuration">
                        <p class="title">板载配置(3/4)</p>
                        <p class="description">要加载配置到键盘上的话，请将拖放配置到此区域。要替换配置的话，请将配置拖放到要替换的配置上面。
                        </p>
                        <div class="box">
                            <div class="item-list" v-for="item in itemList" :key="item.id">
                                <div class="item" :class="{ 'is-active': activeItem.id === item.id }" @click="activeItem = item">
                                    <span class="item-title">{{ item.title }}</span>
                                    <img class="more-icon" src="@/assets/images/more.svg" alt="">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';

const { dialogTitle, isShow } = defineProps({
    dialogTitle: String,
    isShow: { type: Boolean, default: false },
});



const itemList = ref([
    {   
        id: 1,
        title: '默认配置1',
    },
    {
        id: 2,
        title: '默认配置2',
    },
    {
        id: 3,
        title: '默认配置3',
    },
    {
        id: 4,
        title: '默认配置4',
    }
]);

const activeItem = ref(itemList.value[0]);

const emits = defineEmits(['update:isShow']);

const preventBackgroundScroll = (event) => {
    event.preventDefault();
};
// 监听 isShow 变化来添加/移除事件监听
watch(
    () => isShow,
    (newVal) => {
        if (newVal) {
            // dialog 显示时添加滚动限制
            window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
        } else {
            // dialog 隐藏时移除滚动限制
            window.removeEventListener('wheel', preventBackgroundScroll);
        }
    },
);

// 组件卸载时确保移除事件监听
onBeforeUnmount(() => {
    window.removeEventListener('wheel', preventBackgroundScroll);
});
</script>

<style scoped lang="scss">
.shadow {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    background-color: rgba(0, 0, 0, 0.7);

    .dialog-content {
        width: 1000px;
        height: 700px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: calc(500px * -1);
        margin-top: calc(350px * -1);
        background-color: #000;
        border-radius: 20px;
        border: 1px solid #242424;

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            h3 {
                font-size: 16px;
                font-weight: 500;
                color: #ffffff;
                font-family: "Source Han Sans CN";
                margin-left:30px;
                margin-top: 13px;
            }

            .close-btn {
                width: 20px;
                height: 20px;
                margin-right: 30px;
                margin-top: 15px;
                cursor: pointer;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
        .content {
            margin: 20px 50px;
            .on-board-configuration {
                background-color: #0d0d0d;
                padding: 20px 40px;
                border-radius: 20px;
                .title {
                    font-size: 14px;
                    font-weight: 900;
                    color: #ffffff;
                    font-family: "Source Han Sans CN";
                }
                .description {
                    font-size: 12px;
                    font-weight: 400;
                    color: #ffffff;
                    font-family: "Source Han Sans CN";
                }
                .box {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                    .item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 160px;
                        height: 40px;
                        background-color: #1a1a1a;
                        padding: 10px;
                        border-radius: 10px;
                        cursor: pointer;
                        background-image: url('@/assets/images/setting_btn_bg.svg');
                        font-family: Source Han Sans CN;
                        font-weight: 900;
                        font-style: Heavy;
                        font-size: 18px;
                        line-height: 100%;
                        letter-spacing: 0%;
                        color: #ffffff;
                        &:hover {
                            background-image: url('@/assets/images/setting_btn_bg_hover.svg');

                        }
                        .item-title {
                            font-size: 18px;
                            font-weight: 900;
                            padding-left: 30px;
                            font-family: "CN Heavy";
                        }
                        .more-icon {
                            width: 14px;
                            height: 14px;
                            cursor: pointer;
                        }
                    }
                    .is-active {
                        color: #000000;
                        background-image: url('@/assets/images/connect.gif');
                        .more-icon {
                            background-image: url('@/assets/images/more_white.svg');
                        }
                    }
                }
            }
        }
    }
}
</style>
