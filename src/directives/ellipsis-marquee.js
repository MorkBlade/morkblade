// 纯 CSS 循环滚动 + 单行省略 指令（默认自动滚动，可选 hover 触发）
// 用法：
// <span v-ellipsis-marquee>很长的文本（默认自动滚动）</span>
// <span v-ellipsis-marquee="{ duration: 5, gap: 24 }">文本</span>
// <span v-ellipsis-marquee="{ trigger: 'hover' }">仅悬停时滚动</span>

const DEFAULTS = {
  duration: 5, // 秒
  gap: 24, // px
  trigger: 'auto                                     ', // 'auto' | 'hover' | 'global'
};

const GLOBAL_KEY = '__EM_TRIGGER__';
const GLOBAL_EVENT = 'em-trigger-change';

function getGlobalTrigger() {
  try {
    const winVal = typeof window !== 'undefined' ? window[GLOBAL_KEY] : null;
    const lsVal = typeof window !== 'undefined' ? window.localStorage.getItem('EM_TRIGGER') : null;
    return (winVal || lsVal) || null;
  } catch (_) {
    return null;
  }
}

function applyMode(el, mode) {
  if (mode === 'hover') {
    el.classList.add('v-em--hover');
    el.classList.remove('v-em--auto');
  } else {
    el.classList.add('v-em--auto');
    el.classList.remove('v-em--hover');
  }
}

let injected = false;
function injectOnce() {
  if (injected) return;
  injected = true;
  const style = document.createElement('style');
  style.setAttribute('data-v-ellipsis-marquee', '');
  style.textContent = `
  .v-em { display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; }
  .v-em .v-em-inner { display: inline-block; white-space: nowrap; will-change: transform; }
  /* 仅在确认溢出后，才追加复制文本用于无缝滚动 */
  .v-em.v-em--overflow .v-em-inner::after { content: attr(data-text); display: inline-block; padding-left: var(--em-gap, 24px); }
  /* 仅当溢出时才允许动画 */
  .v-em.v-em--overflow.v-em--hover:hover .v-em-inner { animation: v-em-marquee var(--em-duration, 5s) linear infinite; }
  .v-em.v-em--overflow.v-em--auto .v-em-inner { animation: v-em-marquee var(--em-duration, 5s) linear infinite; }
  @keyframes v-em-marquee { from { transform: translateX(0); } to { transform: translateX(calc(-50% - var(--em-gap, 24px)/2)); } }
  `;
  document.head.appendChild(style);
}

function normalize(binding) {
  if (!binding || !binding.value) return { ...DEFAULTS };
  if (typeof binding.value === 'number') return { ...DEFAULTS, duration: binding.value };
  return { ...DEFAULTS, ...binding.value };
}

function ensureInner(el) {
  const inner = document.createElement('span');
  inner.className = 'v-em-inner';
  // 将原有子节点移入 inner
  while (el.firstChild) inner.appendChild(el.firstChild);
  // 设置 data-text 为纯文本（复制文本用于无缝滚动）
  inner.setAttribute('data-text', inner.textContent || '');
  el.appendChild(inner);
  return inner;
}

export default {
  mounted(el, binding) {
    injectOnce();
    const options = normalize(binding);
    el.classList.add('v-em');
    // 触发模式（支持全局）
    const useGlobal = options.trigger === 'global' || options.trigger == null;
    const currentTrigger = useGlobal ? (getGlobalTrigger() || 'auto') : options.trigger;
    applyMode(el, currentTrigger);

    // 兜底：保留用户原有的内联样式以便卸载时恢复
    const prev = {
      whiteSpace: el.style.whiteSpace,
      overflow: el.style.overflow,
      textOverflow: el.style.textOverflow,
      display: el.style.display,
    };

    // 如果用户未设置单行省略相关样式，保证其生效
    const computed = window.getComputedStyle(el);
    if (computed.whiteSpace !== 'nowrap') el.style.whiteSpace = 'nowrap';
    if (computed.overflow !== 'hidden') el.style.overflow = 'hidden';
    if (computed.textOverflow !== 'ellipsis') el.style.textOverflow = 'ellipsis';
    if (computed.display === 'inline') el.style.display = 'inline-block';

    // 创建或替换内部结构
    const inner = ensureInner(el);

    const onGlobalChange = () => {
      if (!el.__em || !el.__em.useGlobal) return;
      const mode = getGlobalTrigger() || 'auto';
      applyMode(el, mode);
    };

    const updateOverflow = () => {
      // 判断是否溢出：内容宽度 > 容器宽度
      // 注意：需要基于原始文本宽度进行判断，避免 ::after 复制文本影响 scrollWidth
      const innerEl = el.querySelector(':scope > .v-em-inner');
      // 暂时移除 overflow 标记避免重复内容影响测量
      const prevOverflowClass = el.classList.contains('v-em--overflow');
      if (prevOverflowClass) el.classList.remove('v-em--overflow');
      const isOverflow = innerEl ? innerEl.scrollWidth > el.clientWidth : el.scrollWidth > el.clientWidth;
      // 恢复或设置
      el.classList.toggle('v-em--overflow', isOverflow);
    };

    el.__em = { prev, inner, useGlobal, updateOverflow };
    if (useGlobal) window.addEventListener(GLOBAL_EVENT, onGlobalChange);
    el.__em.onGlobalChange = onGlobalChange;

    // 应用配置变量
    el.style.setProperty('--em-gap', `${options.gap}px`);
    el.style.setProperty('--em-duration', `${options.duration}s`);

    // 初次测量溢出并监听窗口尺寸变化
    updateOverflow();
    const onResize = () => updateOverflow();
    window.addEventListener('resize', onResize);
    el.__em.onResize = onResize;
  },

  updated(el, binding) {
    const options = normalize(binding);
    const prevUseGlobal = el.__em ? el.__em.useGlobal : false;
    const useGlobal = options.trigger === 'global' || options.trigger == null;
    if (el.__em) el.__em.useGlobal = useGlobal;
    // 更新触发模式类
    if (useGlobal) {
      const mode = getGlobalTrigger() || 'auto';
      applyMode(el, mode);
      if (!prevUseGlobal && el.__em && el.__em.onGlobalChange) {
        window.addEventListener(GLOBAL_EVENT, el.__em.onGlobalChange);
      }
    } else {
      applyMode(el, options.trigger);
      if (prevUseGlobal && el.__em && el.__em.onGlobalChange) {
        window.removeEventListener(GLOBAL_EVENT, el.__em.onGlobalChange);
      }
    }
    // 可能内容变更，刷新 data-text
    if (el.__em && el.__em.inner) {
      // 当外部模板更新时，inner 内部会被 VDOM 覆盖，因此这里尝试重置 data-text
      const text = el.__em.inner.textContent || '';
      el.__em.inner.setAttribute('data-text', text);
    }
    el.style.setProperty('--em-gap', `${options.gap}px`);
    el.style.setProperty('--em-duration', `${options.duration}s`);

    // 内容或样式变化后，重新判断溢出
    if (el.__em && el.__em.updateOverflow) el.__em.updateOverflow();
  },

  unmounted(el) {
    if (el.__em) {
      const { prev } = el.__em;
      if (el.__em.onGlobalChange) {
        window.removeEventListener(GLOBAL_EVENT, el.__em.onGlobalChange);
      }
      if (el.__em.onResize) {
        window.removeEventListener('resize', el.__em.onResize);
      }
      // 还原内联样式
      el.style.whiteSpace = prev.whiteSpace || '';
      el.style.overflow = prev.overflow || '';
      el.style.textOverflow = prev.textOverflow || '';
      el.style.display = prev.display || '';
      delete el.__em;
    }

    // 移除我们添加的 class（不强制恢复原始 DOM 结构，避免破坏子节点）
    el.classList.remove('v-em');
    el.style.removeProperty('--em-gap');
    el.style.removeProperty('--em-duration');
  },
};


