import { createApp, ref } from 'vue';
import LoadingComponent from '@/components/loading.vue';

class LoadingService {
  constructor() {
    this.instances = [];
    this.instanceId = 0;
  }

  service(options = {}) {
    const {
      text = '加载中...',
      backgroundColor = 'rgba(0, 0, 0, 0.8)',
      zIndex = 9999,
      lock = true,
      target = null
    } = options;

    // 创建响应式数据
    const visible = ref(true);
    const loadingText = ref(text);
    const bgColor = ref(backgroundColor);

    // 创建Vue应用实例
    const app = createApp(LoadingComponent, {
      visible: visible.value,
      text: loadingText.value,
      backgroundColor: bgColor.value,
      zIndex,
      lock
    });

    // 创建挂载容器
    const container = document.createElement('div');
    container.className = `loading-service-${++this.instanceId}`;
    
    // 挂载到指定目标或body
    const mountTarget = target || document.body;
    mountTarget.appendChild(container);

    // 挂载组件
    const vm = app.mount(container);

    // 创建实例对象
    const instance = {
      id: this.instanceId,
      app,
      vm,
      container,
      visible,
      text: loadingText,
      backgroundColor: bgColor,
      
      // 关闭方法
      close() {
        visible.value = false;
        setTimeout(() => {
          try {
            app.unmount();
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
            // 从实例列表中移除
            const index = LoadingService.getInstance().instances.findIndex(item => item.id === this.id);
            if (index > -1) {
              LoadingService.getInstance().instances.splice(index, 1);
            }
          } catch (error) {
            console.warn('Loading instance cleanup error:', error);
          }
        }, 300);
      },

      // 更新文本
      setText(newText) {
        loadingText.value = newText;
        vm.$forceUpdate();
      },

      // 更新背景色
      setBackgroundColor(newColor) {
        bgColor.value = newColor;
        vm.$forceUpdate();
      }
    };

    // 添加到实例列表
    this.instances.push(instance);

    return instance;
  }

  // 关闭所有loading实例
  closeAll() {
    this.instances.forEach(instance => {
      instance.close();
    });
    this.instances = [];
  }

  // 获取单例实例
  static getInstance() {
    if (!LoadingService.instance) {
      LoadingService.instance = new LoadingService();
    }
    return LoadingService.instance;
  }
}

// 导出服务实例
const loadingService = LoadingService.getInstance();

// 导出便捷方法
export const Loading = {
  service: (options) => loadingService.service(options),
  closeAll: () => loadingService.closeAll()
};

export default Loading;