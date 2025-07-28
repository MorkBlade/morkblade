<template>
    <div class="m-dialog" v-if="isShow">
        <div class="shadow">
            <div class="dialog-content">
                <div class="header">
                    <h3>{{ dialogTitle }}</h3>
                    <span class="close-btn" @click="handleCancel()">
                        <img src="@/assets/images/cancel_icon.svg" alt="" />
                    </span>
                </div>

                <div class="content">
                    <div class="on-board-configuration">
                        <p class="title">板载配置(3/4)</p>
                        <p class="description">要加载配置到键盘上的话，请将拖放配置到此区域。要替换配置的话，请将配置拖放到要替换的配置上面。
                        </p>
                        <div class="box" @dragover="handleDragOver" @drop="handleDrop('active', $event)"
                            @dragenter="handleDragEnter" @dragleave="handleDragLeave">
                            <div class="item-list" v-for="(item, index) in appStore.configList" :key="index">
                                <div class="item" :class="{ 
                                         'is-active': appStore.activeConfigIndex === index,
                                         'dragging': draggedItem === item,
                                         'drag-over': dragOverItem === item
                                     }" :draggable="appStore.activeConfigIndex !== index"
                                    @dragstart="handleDragStart($event, item, 'active')" @dragend="handleDragEnd"
                                    @click="handleActiveItem(index)">
                                    <span class="item-title">{{ item.title }}</span>
                                    <span class="more-icon" @click.stop="showEdit(item)"></span>
                                </div>
                                <div class="item-edit" v-if="editingItemId === item">
                                    <span class="item-edit-text" @click.stop="handleRename(item)">重命名</span>
                                    <span class="item-edit-text" @click.stop="handleCopy(item)">复制</span>
                                    <span class="item-edit-text" @click.stop="handleMove('active',item)">移至未激活的配置</span>
                                    <span class="item-edit-text share-btn">分享配置</span>
                                    <span class="item-edit-text">导出配置至本地</span>
                                    <span class="item-edit-text delete-btn"
                                        @click.stop="handleDelete('active',item)">删除</span>
                                </div>
                            </div>
                            <div class="item-list-empty" v-if="appStore.configList && appStore.configList.length < 4"
                                :class="{ 'drag-over': isDragOverEmptyActive }">
                                <span class="item-title">拖放配置至此处</span>
                            </div>
                        </div>
                    </div>

                    <div class="un-active-configuration">
                        <p class="title">未激活的配置</p>
                        <div class="box" @dragover="handleDragOver" @drop="handleDrop('unActive', $event)"
                            @dragenter="handleDragEnter" @dragleave="handleDragLeave">
                            <div class="item-list" v-for="(item, index) in appStore.unActiveConfigList" :key="index">
                                <div class="item" :class="{ 
                                         'dragging': draggedItem === item,
                                         'drag-over': dragOverItem === item
                                     }" draggable="true" @dragstart="handleDragStart($event, item, 'unActive')"
                                    @dragend="handleDragEnd">
                                    <span class="item-title">{{ item.title }}</span>
                                    <span class="more-icon" @click.stop="showEdit(item)"></span>
                                </div>
                                <div class="un-active-item-edit" v-if="editingItemId === item">
                                    <span class="item-edit-text" @click.stop="handleRename(item)">重命名</span>
                                    <span class="item-edit-text" @click.stop="handleCopy(item)">复制</span>
                                    <span class="item-edit-text" @click.stop="handleMove('unActive',item)">移至板载配置</span>
                                    <span class="item-edit-text share-btn">分享配置</span>
                                    <span class="item-edit-text">导出配置至本地</span>
                                    <span class="item-edit-text delete-btn"
                                        @click.stop="handleDelete('unActive',item)">删除</span>
                                </div>
                            </div>
                            <div class="item-list-empty" :class="{ 'drag-over': isDragOverEmptyUnActive }"
                                v-if="appStore.unActiveConfigList && appStore.unActiveConfigList.length < 28">
                                <span class="item-title">拖放配置至此处</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="btn-group">
                    <div class="update-btn">
                        <img class="update-img" src="@/assets/images/events_icon.svg" alt="" />
                        <span class="update-text">新建配置</span>
                    </div>
                    <div class="cancel-btn" @click="showImportDialog = true">
                        <img src="@/assets/images/download.svg" alt="" />
                        <span>导入配置</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-if="showRenameDialog" :isShow="showRenameDialog" dialogTitle="重命名配置" :textContent="''"
        @cancel="handleRenameCancel" @sure="handleRenameConfirm" @update:isShow="val => showRenameDialog = val">
        <template #default>
            <div class="rename-input-container">
                <p>请修改配置名称</p>
                <input class="rename-input" v-model="renameInput" placeholder="请输入配置名称"
                    @keyup.enter="handleRenameConfirm" />
            </div>
        </template>
    </Dialog>

    <Dialog v-if="showImportDialog" :isShow="showImportDialog" :textContent="''" :showConfirmBtn="false"
        :showCancelBtn="false" @cancel="handleImportCancel" @update:isShow="val => showImportDialog = val">
        <template #default>
            <div class="import-dialog">
                <div class="local-import" @click="handleLocalImport">
                </div>
                <div class="code-import" @click="handleCodeImport">
                </div>
            </div>
            <div class="import-btn-group">
                <div class="cancel-btn" @click="showImportDialog = false">
                    <img src="@/assets/images/cancel_icon.svg" alt="" />
                    <span>取消</span>
                </div>
            </div>
        </template>
    </Dialog>

    <Dialog v-if="showShareDialog" :isShow="showShareDialog"  :textContent="''"
        @cancel="handleShareCancel" @sure="handleShareConfirm" @update:isShow="val => showShareDialog = val">
        <template #default>
            <div class="share-input-container">
                <p>请在下方输入分享码以加载配置</p>
                <input class="share-input" v-model="shareInput" 
                    @keyup.enter="handleShareConfirm" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { onMounted } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useAppStore, useKeyboardStore } from '@/stores';
import { useAdvancedHook } from '@/hooks';
import { showMessage } from '@/utils/message';
import Dialog from './dialog.vue';

let timer = null;

const emits = defineEmits(['cancel', 'sure', 'cancel']);
const { dialogTitle, isShow } = defineProps({
    dialogTitle: String,
    isShow: { type: Boolean, default: false },

});

const appStore = useAppStore();
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const keyboardStore = useKeyboardStore();

const editingItemId = ref(null);
const { getHighLevelKeys } = useAdvancedHook();

// 重命名弹窗相关
const showRenameDialog = ref(false);
const renameItem = ref(null);
const renameInput = ref('');

// 分享弹窗相关
const showShareDialog = ref(false);
const shareInput = ref('');

const handleShareCancel = () => {
    shareInput.value = '';
    showShareDialog.value = false;
};

const handleShareConfirm = () => {
    if (shareInput.value.trim()) {
        // TODO 请求后端接口
        console.log(shareInput.value);
        showShareDialog.value = false;
        showImportDialog.value = false;
        showMessage('导入成功', 'success');
    }else{
        showMessage('请输入分享码', 'warning');
        return;
    }
};

// 拖拽相关状态
const draggedItem = ref(null);
const draggedItemType = ref(null);
const dragOverItem = ref(null);
const isDragOverEmptyActive = ref(false);
const isDragOverEmptyUnActive = ref(false);

const showEdit = (item) => {
    editingItemId.value = item;
};

const handleCopy = (item) => {
    // 复制 item 的 title 到剪贴板
    if (item && item.title) {
        // 兼容性处理
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(item.title).then(() => {
                // 可选：提示用户复制成功
                showMessage('已复制配置名称', 'success');
                editingItemId.value = null;
            }).catch(err => {
                // 可选：提示用户复制失败
                showMessage('复制失败', 'warning');
            });
        } else {
            // 旧版浏览器兼容
            const textarea = document.createElement('textarea');
            textarea.value = item.title;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showMessage('已复制配置名称', 'success');
                editingItemId.value = null;
            } catch (err) {
                showMessage('复制失败', 'warning');
            }
            document.body.removeChild(textarea);
        }
    }

    // TODO 请求后端接口
    console.log(item);
};

const handleActiveItem = async (index) => {
    if (index === appStore.activeConfigIndex) {
        return;
    }
    const res = await appStore.setActiveConfig(index, isVersion2.value);


    if (res) {
        if (!isVersion2.value) {
            clearTimeout(timer); 
            timer = setTimeout(async () => {
                // TODO v2 配置切换之后获取的数据是一样的
                // await keyboardStore.getLayoutKeyInfo(keyboardStore.layout, keyboardStore.keyboards);
                // await performanceStore.getKeyPerformanceV1(keyboardStore.keyboards);
                if (res) {
                    await keyboardStore.initKeyboard();
                    await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
                    appStore.changeConfig = true;
                    appStore.activeConfigIndex = index;
                }
            }, 1000);
        } else {
            await keyboardStore.initKeyboard();
            await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
        }
    }
};

const handleRename = (item) => {
    // TODO 请求后端接口

    renameItem.value = item;
    renameInput.value = item.title;
    showRenameDialog.value = true;
    editingItemId.value = null;
};

const handleRenameConfirm = () => {
    if (renameItem.value && renameInput.value.trim()) {
        renameItem.value.title = renameInput.value.trim();
        // 这里可以加上同步到store或后端的逻辑
    }
    showRenameDialog.value = false;
};

const handleRenameCancel = () => {
    showRenameDialog.value = false;
};

const handleMove = (type,item) => {
    // TODO 请求后端接口
    if (type === 'active') {
        if(appStore.unActiveConfigList.length >= 28){
            showMessage('未激活配置已满，无法添加更多配置', 'warning');
            return;
        }
        appStore.unActiveConfigList.push(item);
        appStore.configList = appStore.configList.filter(i => i.title !== item.title);
    }else{
        appStore.configList.push(item);
        appStore.unActiveConfigList = appStore.unActiveConfigList.filter(i => i.title !== item.title);
    }
    editingItemId.value = null;
};

// 拖拽开始
const handleDragStart = (event, item, type) => {
    draggedItem.value = item;
    draggedItemType.value = type;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({ item, type }));
    event.target.style.opacity = '0.5';
};

// 拖拽结束
const handleDragEnd = (event) => {
    // 重置所有拖拽状态
    draggedItem.value = null;
    draggedItemType.value = null;
    dragOverItem.value = null;
    isDragOverEmptyActive.value = false;
    isDragOverEmptyUnActive.value = false;
    event.target.style.opacity = '1';
};

// 拖拽悬停
const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};

// 拖拽进入
const handleDragEnter = (event) => {
    event.preventDefault();
    
    const target = event.target.closest('.item');
    const emptyTarget = event.target.closest('.item-list-empty');
    
    if (target) {
        // 进入 item 区域
        dragOverItem.value = draggedItem.value;
        isDragOverEmptyActive.value = false;
        isDragOverEmptyUnActive.value = false;
    } else if (emptyTarget) {
        // 进入空区域
        dragOverItem.value = null;
        const isActiveContainer = emptyTarget.closest('.on-board-configuration');
        
        isDragOverEmptyActive.value = isActiveContainer;
        isDragOverEmptyUnActive.value = !isActiveContainer;
    }
};

// 拖拽离开
const handleDragLeave = (event) => {
    const relatedTarget = event.relatedTarget;
    const currentContainer = event.target.closest('.box');
    const relatedContainer = relatedTarget?.closest('.box');
    
    // 只有真正离开容器时才清除状态
    if (currentContainer && currentContainer !== relatedContainer) {
        dragOverItem.value = null;
        isDragOverEmptyActive.value = false;
        isDragOverEmptyUnActive.value = false;
    }
};

// 拖拽放置
const handleDrop = (targetType, event) => {
    if (!draggedItem.value || draggedItemType.value === targetType) {
        return;
    }

    // 只有拖拽到空区域才有效
    const emptyTarget = event.target.closest('.item-list-empty');
    if (!emptyTarget) return;

    // 执行移动操作
    if (targetType === 'active') {
        if (appStore.configList.length >= 4) {
            showMessage('板载配置已满，无法添加更多配置', 'warning');
            return;
        }
        appStore.configList.push(draggedItem.value);
        appStore.unActiveConfigList = appStore.unActiveConfigList.filter(i => i.title !== draggedItem.value.title);
        showMessage('配置已移至板载配置', 'success');
    } else {
        appStore.unActiveConfigList.push(draggedItem.value);
        appStore.configList = appStore.configList.filter(i => i.title !== draggedItem.value.title);
        showMessage('配置已移至未激活配置', 'success');
    }

    // 重置拖拽状态
    draggedItem.value = null;
    draggedItemType.value = null;
    dragOverItem.value = null;
    isDragOverEmptyActive.value = false;
    isDragOverEmptyUnActive.value = false;
};

const handleDelete = (type,item) => {
    // TODO 请求后端接口
    console.log(item);
    // 删除逻辑
    // 判断 item 在哪个列表，进行删除
    if (type === 'active') {
        // 判断是否是当前使用配置，若是则提示不能删除
        if (type === 'active' && appStore.activeConfigIndex !== undefined) {
            const activeItem = appStore.configList[appStore.activeConfigIndex];
            if (activeItem && activeItem.title === item.title) {
                showMessage('当前使用的配置无法删除', 'warning');
                return;
            }
        }
        appStore.configList = appStore.configList.filter(i => i.title !== item.title);
    }else{
        appStore.unActiveConfigList = appStore.unActiveConfigList.filter(i => i.title !== item.title);
    }
    // 关闭编辑框
    editingItemId.value = null;
};

const handleCancel = () => {
    emits('cancel');
};

// 导入配置
const showImportDialog = ref(false);
const handleImportCancel = () => {
    showImportDialog.value = false;
};

const handleImportConfirm = () => {
    showImportDialog.value = false;
};

const handleLocalImport = () => {
    // showShareDialog.value = true;
};

const handleCodeImport = () => {
    showShareDialog.value = true;
};

const preventBackgroundScroll = (event) => {
    // 检查事件目标是否在对话框内部
    const dialogContent = event.target.closest('.dialog-content');
    if (!dialogContent) {
        event.preventDefault();
    }
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

// 关闭编辑框
const handleClickOutside = (e) => {
    // 如果点击的不是编辑框和more-icon，关闭编辑框
    if (
        !e.target.closest('.item-edit') &&
        !e.target.closest('.more-icon')
    ) {
        editingItemId.value = null;
    }
};


onMounted(async () => {
    document.addEventListener('click', handleClickOutside);
    await appStore.getConfigID(isVersion2.value);
    await appStore.getBaseInfo(isVersion2.value);
});

// 组件卸载时确保移除事件监听
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
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
        background-color: #050505;
        border-radius: 20px;
        border: 1px solid #242424;
        display: flex;
        flex-direction: column;

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h3 {
                font-size: 16px;
                font-weight: 500;
                color: #ffffff;
                font-family: "CN Heavy";
                margin-left: 30px;
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

            .on-board-configuration,
            .un-active-configuration {
                background-color: #0d0d0d;
                padding: 20px 40px;
                border-radius: 20px;

                .title {
                    font-size: 12px;
                    font-weight: 900;
                    color: #ffffff;
                    margin: 5px 0;
                    font-family: "CN Heavy";
                }

                .description {
                    font-size: 12px;
                    font-weight: 400;
                    color: #ffffff;
                    font-family: "CN Regular";
                }

                .box {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                    max-height: 300px;
                    /* 滑动条美化 */
                    &::-webkit-scrollbar {
                        width: 8px;
                        background: #232323;
                        border-radius: 8px;
                    }
                    &::-webkit-scrollbar-thumb {
                        background: #444;
                        border-radius: 8px;
                        transition: background 0.2s;
                    }
                    &::-webkit-scrollbar-thumb:hover {
                        background: #91bc00;
                    }
                    &::-webkit-scrollbar-corner {
                        background: transparent;
                    }
                    /* Firefox */
                    scrollbar-width: thin;
                    scrollbar-color: #444 #232323;

                    .item {
                        display: flex;
                        align-items: center;
                        flex-wrap: nowrap;
                        width: 160px;
                        height: 40px;
                        align-items: center;
                        background-color: #1a1a1a;
                        padding: 10px;
                        border-radius: 10px;
                        background-image: url('@/assets/images/setting_btn_bg.svg');
                        font-family: "Source Han Sans CN";
                        font-weight: 900;
                        font-style: Heavy;
                        font-size: 18px;
                        line-height: 100%;
                        letter-spacing: 0%;
                        color: #ffffff;
                        white-space: nowrap;
                        overflow: hidden;
                        cursor: grab;
                        transition: all 0.2s ease;

                        &:active {
                            cursor: grabbing;
                        }

                        &:hover {
                            background-image: url('@/assets/images/setting_btn_bg_hover.svg');
                            color: #ffffff;
                        }

                        &.dragging {
                            opacity: 0.5;
                            transform: scale(0.95);
                        }

                        &.drag-over {
                            border: 2px solid #91bc00;
                            box-shadow: 0 0 10px rgba(145, 188, 0, 0.5);
                        }

                        .item-title {
                            width: 100%;
                            text-align: center;
                            font-size: 18px;
                            font-weight: 900;
                            padding-left: 30px;
                            margin-right: 16px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-family: "CN Heavy";
                        }

                        .more-icon {
                            width: 14px;
                            height: 14px;
                            cursor: pointer;
                            background-image: url('@/assets/images/more_white.svg');
                        }
                    }

                    .item-list {
                        position: relative;
                    }

                    .item-edit,
                    .un-active-item-edit {
                        width: 133px;
                        height: auto;
                        cursor: pointer;
                        background-color: #000;
                        position: absolute;
                        left: 165px;
                        top: 0px;
                        border: 3px solid #242424;
                        border-radius: 10px;
                        color: #ffffff;
                        display: flex;
                        flex-direction: column;
                        z-index: 100;
                        overflow: hidden;

                        .item-edit-text {
                            height: 30px;
                            padding: 0px 20px;
                            line-height: 30px;
                            font-family: "CN Regular";
                            font-size: 10px;

                            &:hover {
                                background-color: #91bc00;
                                color: #000;
                            }
                        }

                        .delete-btn {
                            color: #ff0000;

                            &:hover {
                                background-color: #ff0000;
                                color: #000;
                            }
                        }

                        .share-btn {
                            &:hover {
                            cursor: not-allowed;
                            }
                        }
                    }

                    .un-active-item-edit {
                        position: absolute;
                    }

                    .is-active {
                        color: #000000;
                        background-image: url('@/assets/images/connect.gif');
                        background-size: contain;
                        background-position: center;
                        background-repeat: no-repeat;

                        .more-icon {
                            background-image: url('@/assets/images/more.svg');
                        }

                        &:hover {
                            cursor: no-drop;
                            .more-icon {
                                background-image: url('@/assets/images/more_white.svg');
                            }
                        }
                    }

                    .item-list-empty {
                        width: 160px;
                        height: 40px;
                        border: 3px dashed #242424;
                        color: #242424;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: "CN Heavy";
                        font-size: 12px;
                        transition: all 0.2s ease;

                        &.drag-over {
                            border-color: #91bc00;
                            background-color: rgba(145, 188, 0, 0.1);
                            color: #91bc00;
                        }

                        .item-title {
                            font-size: 18px;
                        }
                    }
                }
            }

            .un-active-configuration {
                margin-top: 20px;
            }
        }

        .btn-group {
            display: flex;
            justify-content: center;
            gap: 60px;
            margin-top: auto;
            padding-bottom: 20px;
            position: static;

            .sure-btn,
            .update-btn,
            .cancel-btn {
                width: 170px;
                height: 42px;
                font-size: 18px;
                font-family: 'CN Heavy';
                color: #ffffff;
                cursor: pointer;
                display: flex;
                align-items: center;
                background-image: url('@/assets/images/save_bg.svg');
                background-size: contain;
                background-repeat: no-repeat;


                img {
                    width: var(--size-20);
                    height: var(--size-20);
                    object-fit: fill;
                    margin: 0 var(--spacing-10) 0 var(--spacing-10);
                }

                span {
                    display: inline-block;
                    width: calc(var(--size-120) - var(--spacing-5));
                    text-align: center;
                }

                .update-img {
                    margin-right: 0;
                }

                .update-text {
                    display: inline-block;
                    width: var(--size-120);
                    height: var(--size-30);
                    text-align: center;
                    font-size: var(--font-size-20);
                    margin-left: var(--spacing-13);
                }

                &:hover {
                    background-image: url('@/assets/images/setting_btn_bg_hover.svg');
                }
            }
    
            .sure-btn,
            .update-btn {
                left: var(--spacing-60);
            }

            .cancel-btn {
                left: calc(var(--size-400) - var(--size-30));
            }
        }
    }

    .rename-input-container, .share-input-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        p {
            font-size: 22px;
            font-weight: 500;
            color: #ffffff;
            font-family: "CN Heavy";
        }
    }

    .rename-input, .share-input {
        width: 400px;
        height: 50px;
        font-size: 16px;
        padding: 4px 8px;
        background-color: #242424;
        border-radius: 10px;
        border: 1px solid #ccc;
        margin-top: 30px;
        color: #ffffff;
        font-family: "CN Regular";
        font-size: 22px;
        border: none;
        outline: none;

        &::placeholder {
            color: #494848;
            font-family: "CN Regular";
        }

        &:focus {
            border: 1px solid #91bc00;
        }
    }
    .import-dialog{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        left: 50%;
        gap: 130px;
        transform: translate(-50%, -50%);
        .local-import{
            width: 135px;
            height: 135px;
            background-color: #242424;
            border-radius: 10px;
            background-image: url('@/assets/images/local_import.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
            &:hover{
                background-image: url('@/assets/images/local_import_hover.svg');
            }
        }
        .code-import{
            width: 135px;
            height: 135px;
            background-color: #242424;
            border-radius: 10px;
            background-image: url('@/assets/images/code_import.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
            &:hover{
                background-image: url('@/assets/images/code_import_hover.svg');
            }
        }
        
    }
    .import-btn-group{
        display: flex;
        justify-content: center;
        align-items: center;

    .cancel-btn {
            width: var(--size-170);
            height: var(--size-40);
            font-size: var(--font-size-22);
            font-family: 'CN Heavy';
            color: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            background-image: url('@/assets/images/save_bg.svg');
            background-size: cover;
            background-repeat: no-repeat;
            position: absolute;
            bottom: var(--spacing-20);
    
            img {
                width: var(--size-20);
                height: var(--size-20);
                object-fit: fill;
                margin: 0 var(--spacing-10) 0 var(--spacing-10);
            }
    
            span {
                display: inline-block;
                width: calc(var(--size-120) - var(--spacing-5));
                text-align: center;
            }
        }
    }
}
</style>
