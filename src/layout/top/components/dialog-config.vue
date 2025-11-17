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
						<p class="title">{{ $t('dialogConfig.boardConfig') }}</p>
						<p class="description">{{ $t('dialogConfig.boardConfigTip1') }}</p>
						<div class="box" @dragover="dragState.handleDragOver"
							@drop="dragState.handleDrop('active', $event)" @dragenter="dragState.handleDragEnter"
							@dragleave="dragState.handleDragLeave">
							<div class="item-list" v-for="(item, index) in appStore.configList" :key="index">
								<div class="item" :class="{
									'is-active': appStore.activeConfigIndex === index,
									'dragging': dragState.draggedItem === item,
									'drag-over': dragState.dragOverItem === item
								}" :draggable="appStore.activeConfigIndex !== index"
									@dragstart="dragState.handleDragStart($event, item, 'active')"
									@dragend="dragState.handleDragEnd" @click="handleActiveItem(index)">
									<!-- //TODO 翻译 目前使用索引，后续使用title -->
									<!-- <span class="item-title">{{ item.title }}</span> -->
									<span class="item-title" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{ $t(`connect.keyboardConfig${index}`) }}</span>
									<span class="more-icon" @click.stop="editState.showEdit(item)"></span>
								</div>
								<div class="item-edit" v-if="editState.editingItemId === item">
									<span style="color: gray;" class="item-edit-text"
										@click.stop="editState.handleRename(item)">{{ $t('dialogConfig.rename')
										}}</span>
									<span style="color: gray;" class="item-edit-text"
										@click.stop="editState.handleCopy(item)">{{ $t('dialogConfig.copy') }}</span>
									<span style="color: gray;" class="item-edit-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }"
										@click.stop="editState.handleMove('active', item)" >{{
											$t('dialogConfig.moveToUnActiveConfig') }}</span>
									<span style="color: gray;" class="item-edit-text share-btn"
										@click.stop="editState.handleShare(item)">{{ $t('dialogConfig.share') }}</span>
									<span class="item-edit-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }" @click.stop="editState.handleExport(item)" >{{
										$t('dialogConfig.export') }}</span>
									<span class="item-edit-text delete-btn"
										@click.stop="editState.handleDelete('active', item)">{{ $t('dialogConfig.delete')
										}}</span>
								</div>
							</div>
							<div class="item-list-empty" v-if="appStore.configList && appStore.configList.length < 4"
								:class="{ 'drag-over': dragState.isDragOverEmptyActive }">
								<span class="item-title" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{
									$t('dialogConfig.dragConfig') }}</span>
							</div>
						</div>
					</div>

					<div class="un-active-configuration">
						<p class="title">{{ t('dialogConfig.unActiveConfig') }}</p>
						<p class="no-tips">{{ t('dialogConfig.noTips') }}<br>{{ t('dialogConfig.noTips2') }}</p>
						<div class="box" @dragover="dragState.handleDragOver"
							@drop="dragState.handleDrop('unActive', $event)" @dragenter="dragState.handleDragEnter"
							@dragleave="dragState.handleDragLeave">
							<div class="item-list" v-for="(item, index) in appStore.unActiveConfigList" :key="index">
								<div class="item" :class="{
									'dragging': dragState.draggedItem === item,
									'drag-over': dragState.dragOverItem === item
								}" draggable="true"
									@dragstart="dragState.handleDragStart($event, item, 'unActive')"
									@dragend="dragState.handleDragEnd">
									<span class="item-title">{{ item.title }}</span>
									<span class="more-icon" @click.stop="editState.showEdit(item)"></span>
								</div>
								<div class="un-active-item-edit" v-if="editState.editingItemId === item">
									<span class="item-edit-text" @click.stop="editState.handleRename(item)">{{
										$t('dialogConfig.rename') }}</span>
									<span class="item-edit-text" @click.stop="editState.handleCopy(item)">{{
										$t('dialogConfig.copy') }}</span>
									<span class="item-edit-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }" @click.stop="editState.handleMove('unActive', item)">{{
										$t('dialogConfig.moveToBoardConfig') }}</span>
									<span class="item-edit-text share-btn">{{ $t('dialogConfig.share') }}</span>
									<span class="item-edit-text"  v-ellipsis-marquee="{ duration: 5, gap: 24 }" @click.stop="editState.handleExport(item)">{{
										$t('dialogConfig.export') }}</span>
									<span class="item-edit-text delete-btn"
										@click.stop="editState.handleDelete('unActive', item)">{{
											$t('dialogConfig.delete') }}</span>
								</div>
							</div>
							<div class="item-list-empty" :class="{ 'drag-over': dragState.isDragOverEmptyUnActive }"
								v-if="appStore.unActiveConfigList && appStore.unActiveConfigList.length < 28">
								<span class="item-title" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{
									$t('dialogConfig.dragConfig') }}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="btn-group">
					<div class="update-btn" @click="handleNewConfig">
						<img class="update-img" src="@/assets/images/events_icon.svg" alt="" />
						<span class="update-text" v-ellipsis-marquee="{ duration: 5, gap: 24 }">{{
							$t('dialogConfig.newConfig') }}</span>
					</div>
					<div class="cancel-btn" @click="showImportDialog = true">
						<img src="@/assets/images/download.svg" alt="" />
						<span class="import-text" >{{ $t('dialogConfig.importConfig') }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<Dialog v-if="showRenameDialog" :isShow="showRenameDialog" :dialogTitle="$t('dialogConfig.rename')"
		:textContent="''" @cancel="editState.handleRenameCancel" @sure="editState.handleRenameConfirm"
		@update:isShow="val => showRenameDialog = val">
		<template #default>
			<div class="rename-input-container">
				<p>{{ $t('dialogConfig.renameTip') }}</p>
				<input class="rename-input" v-model="renameInput" :placeholder="$t('dialogConfig.renameTip2')"
					@keyup.enter="editState.handleRenameConfirm" />
			</div>
		</template>
	</Dialog>

	<Dialog v-if="showImportDialog" :isShow="showImportDialog" :textContent="''" :showConfirmBtn="false"
		:showCancelBtn="false" @cancel="handleImportCancel" @update:isShow="val => showImportDialog = val">
		<template #default>
			<div class="import-dialog">
				<div :class="isChniese ? 'local-import-cn' : 'local-import-en'" @click="handleLocalImport"></div>
				<div :class="isChniese ? 'code-import-cn' : 'code-import-en'" @click="handleCodeImport"></div>
			</div>
			<div class="import-btn-group">
				<div class="cancel-btn" @click="showImportDialog = false">
					<img src="@/assets/images/cancel_icon.svg" alt="" />
					<span>{{ $t('dialogConfig.cancel') }}</span>
				</div>
			</div>
		</template>
	</Dialog>

	<Dialog v-if="showShareDialog" :isShow="showShareDialog" :textContent="''" @cancel="editState.handleShareCancel"
		@sure="editState.handleShareConfirm" @update:isShow="val => showShareDialog = val">
		<template #default>
			<div class="share-input-container">
				<p>{{ $t('dialogConfig.shareTip') }}</p>
				<input class="share-input" v-model="shareInput" @keyup.enter="editState.handleShareConfirm" />
			</div>
		</template>
	</Dialog>

	<div class="loading-dialog" v-if="isLoading">
		<div class="loading-dialog-content">
			<div class="loading-dialog-content-icon"></div>
			<div class="loading-dialog-content-text">{{ $t('dialogConfig.loading') }}</div>
		</div>
	</div>

</template>

<script setup>
import { onMounted } from 'vue';
import { onBeforeUnmount, ref, watch, reactive } from 'vue';
import { useAppStore, useKeyboardStore } from '@/stores';
import { useAdvancedHook, useSettingHook, useConfigHook } from '@/hooks';
import { showMessage } from '@/utils/message';
import Dialog from '@/components/dialog.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

// 配置导入图片中英文判断
const isChniese = computed(() => {
	return locale.value === 'zh_CN';
});


let timer = null;

const emits = defineEmits(['cancel', 'sure', 'cancel']);
const { dialogTitle, isShow } = defineProps({
	dialogTitle: String,
	isShow: { type: Boolean, default: false },
});

const appStore = useAppStore();
const isVersion2 = ref(localStorage.getItem('keyboardVersion') === 'v2');
const keyboardStore = useKeyboardStore();
const { exportCurrentConfigToFile } = useConfigHook();
const { getHighLevelKeys } = useAdvancedHook();
const { importAllStoreDataFromFile } = useConfigHook();
// 重命名弹窗相关
const showRenameDialog = ref(false);
const renameItem = ref(null);
const renameInput = ref('');

// 分享弹窗相关
const showShareDialog = ref(false);
const shareInput = ref('');

// 导入配置
const showImportDialog = ref(false);
const isLoading = ref(false);



// 使用组合式函数处理拖拽相关逻辑
const useDragState = () => {
	const state = reactive({
		draggedItem: null,
		draggedItemType: null,
		dragOverItem: null,
		isDragOverEmptyActive: false,
		isDragOverEmptyUnActive: false,

		// 拖拽开始
		handleDragStart(event, item, type) {
			state.draggedItem = item;
			state.draggedItemType = type;
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', JSON.stringify({ item, type }));
			event.target.style.opacity = '0.5';
		},

		// 拖拽结束
		handleDragEnd(event) {
			// 重置所有拖拽状态
			state.draggedItem = null;
			state.draggedItemType = null;
			state.dragOverItem = null;
			state.isDragOverEmptyActive = false;
			state.isDragOverEmptyUnActive = false;
			event.target.style.opacity = '1';
		},

		// 拖拽悬停
		handleDragOver(event) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
		},

		// 拖拽进入
		handleDragEnter(event) {
			event.preventDefault();

			const target = event.target.closest('.item');
			const emptyTarget = event.target.closest('.item-list-empty');

			if (target) {
				// 进入 item 区域
				state.dragOverItem = state.draggedItem;
				state.isDragOverEmptyActive = false;
				state.isDragOverEmptyUnActive = false;
			} else if (emptyTarget) {
				// 进入空区域
				state.dragOverItem = null;
				const isActiveContainer = emptyTarget.closest('.on-board-configuration');

				state.isDragOverEmptyActive = isActiveContainer;
				state.isDragOverEmptyUnActive = !isActiveContainer;
			}
		},

		// 拖拽离开
		handleDragLeave(event) {
			const relatedTarget = event.relatedTarget;
			const currentContainer = event.target.closest('.box');
			const relatedContainer = relatedTarget?.closest('.box');

			// 只有真正离开容器时才清除状态
			if (currentContainer && currentContainer !== relatedContainer) {
				state.dragOverItem = null;
				state.isDragOverEmptyActive = false;
				state.isDragOverEmptyUnActive = false;
			}
		},

		// 拖拽放置
		handleDrop(targetType, event) {
			if (!state.draggedItem || state.draggedItemType === targetType) {
				return;
			}

			// 只有拖拽到空区域才有效
			const emptyTarget = event.target.closest('.item-list-empty');
			if (!emptyTarget) return;

			showMessage(t('dialogConfig.functionNotOpen'), 'warning');
			return;

			// 执行移动操作
			if (targetType === 'active') {
				if (appStore.configList.length >= 4) {
					showMessage(t('dialogConfig.boardConfigFull'), 'warning');
					return;
				}
				appStore.configList.push(state.draggedItem);
				appStore.unActiveConfigList = appStore.unActiveConfigList.filter(i => i.title !== state.draggedItem.title);
				showMessage(t('dialogConfig.moveBoardConfig'), 'success');
			} else {
				appStore.unActiveConfigList.push(state.draggedItem);
				appStore.configList = appStore.configList.filter(i => i.title !== state.draggedItem.title);
				showMessage(t('dialogConfig.moveUnActiveConfig'), 'success');
			}

			// 重置拖拽状态
			state.draggedItem = null;
			state.draggedItemType = null;
			state.dragOverItem = null;
			state.isDragOverEmptyActive = false;
			state.isDragOverEmptyUnActive = false;
		}
	});

	return state;
};

// 使用组合式函数处理编辑操作
const useEditState = () => {
	const editingItemId = ref(null);

	return {
		get editingItemId() {
			return editingItemId.value;
		},
		set editingItemId(value) {
			editingItemId.value = value;
		},

		// 显示编辑选项
		showEdit(item) {
			editingItemId.value = item;
		},

		// 分享配置
		handleShare(item) {

			showMessage(t('dialogConfig.functionNotOpen'), 'warning');
			return;

			// 复制 item 的 title 到剪贴板
			if (item && item.title) {
				// 兼容性处理
				if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(item.title).then(() => {
						// 可选：提示用户复制成功
						showMessage(t('dialogConfig.copySuccess'), 'success');
						editingItemId.value = null;
					}).catch(err => {
						// 可选：提示用户复制失败
						showMessage(t('dialogConfig.copyFail'), 'warning');
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
						showMessage(t('dialogConfig.copySuccess'), 'success');
						editingItemId.value = null;
					} catch (err) {
						showMessage(t('dialogConfig.copyFail'), 'warning');
					}
					document.body.removeChild(textarea);
				}
			}

			// TODO 请求后端接口
		},

		// 复制配置
		handleCopy(item) {

			showMessage(t('dialogConfig.functionNotOpen'), 'warning');
			return;

			// 复制配置，将其添加到未激活配置列表
			if (item && appStore && Array.isArray(appStore.unActiveConfigList)) {
				// 深拷贝 item，避免引用同一个对象
				const newItem = JSON.parse(JSON.stringify(item));
				// 配置名称加上"副本"后缀
				newItem.title = t('dialogConfig.duplicate') + item.title;
				// 设为未激活
				newItem.active = false;
				// 计算插入位置
				appStore.unActiveConfigList.push(newItem);
				editingItemId.value = null;
				showMessage(t('dialogConfig.copySuccess'), 'success');
			} else {
				showMessage(t('dialogConfig.copyFailTip'), 'warning');
			}
		},

		// 重命名配置
		handleRename(item) {
			// TODO 请求后端接口

			showMessage(t('dialogConfig.functionNotOpen'), 'warning');
			return;

			renameItem.value = item;
			renameInput.value = item.title;
			showRenameDialog.value = true;
			editingItemId.value = null;
		},

		// 确认重命名
		handleRenameConfirm() {
			if (renameItem.value && renameInput.value.trim()) {
				renameItem.value.title = renameInput.value.trim();
				// 这里可以加上同步到store或后端的逻辑
			}
			showRenameDialog.value = false;
		},

		// 取消重命名
		handleRenameCancel() {
			showRenameDialog.value = false;
		},

		// 移动配置
		handleMove(type, item) {

			showMessage(t('dialogConfig.functionNotOpen'), 'warning');
			return;

			// TODO 请求后端接口
			if (type === 'active') {
				if (appStore.unActiveConfigList.length >= 28) {
					showMessage(t('dialogConfig.moveUnActiveConfigFull'), 'warning');
					return;
				}
				appStore.unActiveConfigList.push(item);
				appStore.configList = appStore.configList.filter(i => i.title !== item.title);
			} else {
				appStore.configList.push(item);
				appStore.unActiveConfigList = appStore.unActiveConfigList.filter(i => i.title !== item.title);
			}
			editingItemId.value = null;
		},

		// 删除配置
		handleDelete(type, item) {

			showMessage(t('dialogConfig.functionNotOpen'), 'warning');
			return;

			// TODO 请求后端接口
			// 删除逻辑
			// 判断 item 在哪个列表，进行删除
			if (type === 'active') {
				// 判断是否是当前使用配置，若是则提示不能删除
				if (type === 'active' && appStore.activeConfigIndex !== undefined) {
					const activeItem = appStore.configList[appStore.activeConfigIndex];
					if (activeItem && activeItem.title === item.title) {
						showMessage(t('dialogConfig.deleteTip'), 'warning');
						return;
					}
				}
				appStore.configList = appStore.configList.filter(i => i.title !== item.title);
			} else {
				appStore.unActiveConfigList = appStore.unActiveConfigList.filter(i => i.title !== item.title);
			}
			// 关闭编辑框
			editingItemId.value = null;
		},

		// 导出配置
		async handleExport(item) {
			// 判断是否是激活状态，只有在激活状态才能导出
			if (appStore.activeConfigIndex !== undefined) {
				const activeItem = appStore.configList[appStore.activeConfigIndex];
				if (activeItem && activeItem.title !== item.title) {
					showMessage(t('dialogConfig.exportTip'), 'warning');
					return;
				}
			}
			await exportCurrentConfigToFile(item);
			showMessage(t('dialogConfig.exportSuccess'), 'success');
		},

		// 分享取消
		handleShareCancel() {
			shareInput.value = '';
			showShareDialog.value = false;
		},

		// 分享确认
		handleShareConfirm() {
			if (shareInput.value.trim()) {
				// isLoading.value = true;
				// TODO 请求后端接口
				// 清空输入框
				shareInput.value = '';
				showMessage(t('dialogConfig.functionNotOpen'), 'warning');
				return;

				// 模拟请求延迟
				setTimeout(() => {
					isLoading.value = false;
					showShareDialog.value = false;
					showImportDialog.value = false;
					showMessage(t('dialogConfig.importSuccess'), 'success');
				}, 1500);
			} else {
				showMessage(t('dialogConfig.shareTip'), 'warning');
				return;
			}
		}
	};
};

const dragState = useDragState();
const editState = useEditState();

const handleActiveItem = async (index) => {
	if (index === appStore.activeConfigIndex) {
		return;
	}
	const res = await appStore.setActiveConfig(index, isVersion2.value);


	if (res) {
		if (!isVersion2.value) {
			clearTimeout(timer);
			timer = setTimeout(async () => {
				// 对于非v2版本，延迟执行以确保配置切换完成
				await keyboardStore.initKeyboard();
				await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
				appStore.changeConfig = true;
				appStore.activeConfigIndex = index;
			}, 1000);
		} else {
			// v2版本可以立即执行
			await keyboardStore.initKeyboard();
			await getHighLevelKeys(keyboardStore.keyboards, isVersion2.value);
			// 确保v2版本也更新activeConfigIndex
			appStore.activeConfigIndex = index;
		}
	}
};

const handleCancel = () => {
	emits('cancel');
};

const handleImportCancel = () => {
	showImportDialog.value = false;
};

const handleImportConfirm = () => {
	showImportDialog.value = false;
};

const handleLocalImport = () => {
	// 创建一个隐藏的文件输入框用于选择json文件
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json,application/json';
	input.style.display = 'none';
	document.body.appendChild(input);

	input.onchange = async (event) => {
		const file = event.target.files[0];
		if (!file) {
			document.body.removeChild(input);
			return;
		}

		try {
			isLoading.value = true;
			const { importCurrentConfigFromFile } = useConfigHook();
			const result = await importCurrentConfigFromFile(file);

			if (result) {
				showMessage(t('dialogConfig.importSuccess'), 'success');
				showImportDialog.value = false;
			} else {
				showMessage(t('dialogConfig.importFail'), 'warning');
			}
		} catch (error) {
			console.error('Import error:', error);
			showMessage(t('dialogConfig.importFail') + error.message, 'warning');
		} finally {
			isLoading.value = false;
			document.body.removeChild(input);
		}
	};

	input.click();
};

const handleCodeImport = () => {
	showShareDialog.value = true;
};

// 新建配置
const handleNewConfig = () => {
	showMessage(t('dialogConfig.functionNotOpen'), 'warning');
	return;
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
		editState.editingItemId = null;
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
	timer && clearTimeout(timer);
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
		width: var(--size-1040);
		height: var(--size-700);
		position: absolute;
		top: 50%;
		left: 50%;
		margin-left: calc(var(--size-510) * -1);
		margin-top: calc(var(--size-350) * -1);
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
				font-size: var(--size-16);
				font-weight: 500;
				color: #ffffff;
				font-family: "CN Heavy";
				margin-left: var(--spacing-30);
				margin-top: var(--spacing-13);
			}

			.close-btn {
				width: var(--size-20);
				height: var(--size-20);
				margin-right: var(--spacing-30);
				margin-top: var(--spacing-15);
				cursor: pointer;

				img {
					width: 100%;
					height: 100%;
				}
			}
		}

		.content {
			margin: var(--spacing-20) var(--spacing-50);

			.on-board-configuration,
			.un-active-configuration {
				background-color: #0d0d0d;
				padding: var(--spacing-20) var(--spacing-40);
				border-radius: 20px;

				.title {
					font-size: var(--size-12);
					font-weight: 900;
					color: #ffffff;
					margin: var(--spacing-5) 0;
					font-family: "CN Heavy";
				}

				.description {
					font-size: var(--size-12);
					font-weight: 400;
					color: #ffffff;
					font-family: "CN Regular";
				}

				.box {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(var(--size-160), 1fr));
					gap: var(--spacing-10);
					margin-top: var(--spacing-10);
					max-height: var(--size-300);

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
						// width: var(--size-170);
						height: var(--size-40);
						align-items: center;
						background-color: #1a1a1a;
						padding: var(--spacing-10);
						border-radius: 10px;
						background-image: url('@/assets/images/setting_btn_bg.svg');
						background-size: 100% 100%;
						font-family: "Source Han Sans CN";
						font-weight: 900;
						font-style: Heavy;
						font-size: var(--size-18);
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
							background-size: 100% 100%;
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
							font-size: var(--size-18);
							font-weight: 900;
							padding-left: var(--spacing-30);
							margin-right: var(--spacing-16);
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							font-family: "CN Heavy";
						}

						.more-icon {
							width: var(--size-14);
							height: var(--size-14);
							cursor: pointer;
							background-image: url('@/assets/images/more_white.svg');
							background-size: 100% 100%;
						}
					}

					.item-list {
						position: relative;
					}

					.item-edit,
					.un-active-item-edit {
						width: var(--size-130);
						height: auto;
						cursor: pointer;
						background-color: #000;
						position: absolute;
						left: var(--size-170);
						top: 0px;
						border: 3px solid #242424;
						border-radius: 10px;
						color: #ffffff;
						display: flex;
						flex-direction: column;
						z-index: 100;
						overflow: hidden;

						.item-edit-text {
							width: 100%;
							height: var(--size-30);
							padding: 0 var(--spacing-20);
							line-height: var(--size-30);
							font-family: "CN Regular";
							font-size: var(--size-10);
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;

							&:hover {
								background-color: #91bc00;
								color: #000;
							}
						}

						.delete-btn {
							color: #ff0000 ;

							&:hover {
								background-color: #ff0000;
								color: #000 ;
							}
						}

						// .share-btn {
						// &:hover {
						// cursor: not-allowed;
						// }
						// }
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
						width: var(--size-160);
						height: var(--size-40);
						border: 3px dashed #242424;
						color: #242424;
						border-radius: 10px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-family: "CN Heavy";
						font-size: var(--size-12);
						transition: all 0.2s ease;

						&.drag-over {
							border-color: #91bc00;
							background-color: rgba(145, 188, 0, 0.1);
							color: #91bc00;
						}

						.item-title {
							width: 100%;
							text-align: center;
							font-size: var(--size-18);
						}
					}
				}
			}

			.un-active-configuration {
				margin-top: var(--spacing-20);
			}
		}

		.btn-group {
			display: flex;
			justify-content: center;
			gap: 60px;
			margin-top: auto;
			padding-bottom: var(--spacing-20);
			position: static;

			.sure-btn,
			.update-btn,
			.cancel-btn {
				width: 150px;
				height: 45px;
				font-size: 18px;
				font-family: 'CN Heavy';
				color: #ffffff;
				cursor: pointer;
				display: flex;
				align-items: center;
				background-image: url('@/assets/images/save_bg.svg');
				background-size: 100% 100%;
				background-repeat: no-repeat;

				img {
					width: 20px;
					height: 20px;
					object-fit: fill;
					margin: 0 10px 0 10px;
				}

				span {
					display: inline-block;
					width: calc(120px - 10px);
					text-align: center;
				}

				.update-img {
					margin-right: 0;
				}

				.update-text {
					width: 110px;
					text-align: center;
					font-size: 18px;
					margin-left: 13px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					max-width: 100%;
				}

				&:hover {
					background-image: url('@/assets/images/setting_btn_bg_hover.svg');
					background-size: 100% 100%;
				}
			}

			.sure-btn,
			.update-btn {
				left: 60px;
			}

			.cancel-btn {
				left: calc(400px - 30px);

				.import-text {
					text-align: center;
					font-size: 18px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					max-width: 100%;
				}
			}
		}
	}

	.rename-input-container,
	.share-input-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		p {
			font-size: var(--font-size-22);
			font-weight: 500;
			color: #ffffff;
			font-family: "CN Heavy";
		}
	}

	.rename-input,
	.share-input {
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

	.import-dialog {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 50%;
		left: 50%;
		gap: 130px;
		transform: translate(-50%, -50%);

		.local-import-cn {
			width: var(--size-130);
			height: var(--size-130);
			background-color: #242424;
			border-radius: 10px;
			background-image: url('@/assets/images/local_import.svg');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
			cursor: pointer;

			&:hover {
				background-image: url('@/assets/images/local_import_hover.svg');
			}
		}

		.code-import-cn {
			width: var(--size-130);
			height: var(--size-130);
			background-color: #242424;
			border-radius: 10px;
			background-image: url('@/assets/images/code_import.svg');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
			cursor: pointer;

			&:hover {
				background-image: url('@/assets/images/code_import_hover.svg');
			}
		}
		.local-import-en {
			width: var(--size-130);
			height: var(--size-130);
			background-color: #242424;
			border-radius: 10px;
			background-image: url('@/assets/images/local_import_en.svg');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
			cursor: pointer;

			&:hover {
				background-image: url('@/assets/images/local_import_hover_en.svg');
			}
		}

		.code-import-en {
			width: var(--size-130);
			height: var(--size-130);
			background-color: #242424;
			border-radius: 10px;
			background-image: url('@/assets/images/code_import_en.svg');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
			cursor: pointer;

			&:hover {
				background-image: url('@/assets/images/code_import_hover_en.svg');
			}
		}

	}

	.import-btn-group {
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

			&:hover {
				background-image: url('@/assets/images/pending_bg.svg');
			}

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

.loading-dialog {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.8);
	z-index: 1000;
	display: flex;
	justify-content: center;
	align-items: center;

	&-content {
		width: var(--size-300);
		height: var(--size-150);
		background-color: #0d0d0d;
		border-radius: 20px;
		border: 1px solid #242424;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 20px;

		&-icon {
			width: var(--size-50);
			height: var(--size-50);
			border: 4px solid rgba(145, 188, 0, 0.3);
			border-top: 4px solid #91bc00;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-bottom: 20px;
		}

		&-text {
			font-family: "CN Heavy";
			font-size: var(--font-size-18);
			color: #ffffff;
			text-align: center;
		}
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.un-active-configuration {
	width: 100%;
	height: 100%;
	position: relative;

	// background-color: pink !important;
	.no-tips {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 22px;
		color: #ffffff;
		font-family: "CN Heavy";
		z-index: 10;
		text-align: center;
	}
}
</style>
