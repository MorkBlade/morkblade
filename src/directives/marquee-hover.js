// 全局自定义指令：v-marquee-hover
// 功能：当文本溢出且鼠标悬停时，触发缓慢的无限循环滚动；离开后恢复原状
// 适用：纯文本或简单内联内容的展示容器。复杂交互子元素请谨慎使用。

const DEFAULT_OPTIONS = {
  speed: 40, // 像素/秒，越小越慢
  gap: 24, // 两段文本间隙
  minDuration: 6, // 单次循环最短时长（秒）
};

let hasInjectedStyle = false;
function injectStyleOnce() {
  if (hasInjectedStyle) return;
  hasInjectedStyle = true;
  const style = document.createElement('style');
  style.setAttribute('data-v-marquee-hover', '');
  style.textContent = `
  .v-marquee { position: relative; overflow: hidden; }
  .v-marquee .v-marquee-original { display: inline; white-space: nowrap; }
  .v-marquee .v-marquee-track { display: inline-block; white-space: nowrap; will-change: transform; transform: translate3d(0,0,0); pointer-events: none; }
  .v-marquee.v-marquee--hover { cursor: default; }
  .v-marquee .v-marquee-item { display: inline-block; }
  .v-marquee .v-marquee-gap { display: inline-block; width: var(--marquee-gap, 24px); }
  .v-marquee.v-marquee--hover:hover .v-marquee-track { animation: v-marquee-anim var(--marquee-duration, 8s) linear infinite; }
  @keyframes v-marquee-anim { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-1 * var(--marquee-distance, 200%))); } }
  `;
  document.head.appendChild(style);
}

function normalizeOptions(value) {
  if (!value) return { ...DEFAULT_OPTIONS };
  if (typeof value === 'number') return { ...DEFAULT_OPTIONS, speed: value };
  return { ...DEFAULT_OPTIONS, ...value };
}

function measureOverflow(el) {
  if (!el) return { isOverflow: false, contentWidth: 0, wrapperWidth: 0 };
  // 优先用原始内容的真实宽度
  const original = el.querySelector(':scope > .v-marquee-original');
  const contentWidth = original ? original.scrollWidth : el.scrollWidth;
  const wrapperWidth = el.clientWidth;
  return { isOverflow: contentWidth > wrapperWidth, contentWidth, wrapperWidth };
}

function activateMarquee(el) {
  const state = el.__marquee;
  if (!state || state.active) return;

  // 创建滚动轨道与双份内容
  const track = document.createElement('span');
  track.className = 'v-marquee-track';

  const item1 = document.createElement('span');
  item1.className = 'v-marquee-item';
  const item2 = document.createElement('span');
  item2.className = 'v-marquee-item';
  const gap = document.createElement('span');
  gap.className = 'v-marquee-gap';

  // 复制原始内容（不移动原节点，避免破坏事件/响应式）
  item1.appendChild(state.originalSpan.cloneNode(true));
  item2.appendChild(state.originalSpan.cloneNode(true));

  track.appendChild(item1);
  track.appendChild(gap);
  track.appendChild(item2);

  // 插入并测量宽度
  el.appendChild(track);
  // 复制后的第一份文本的真实宽度
  const singleWidth = item1.scrollWidth;

  const distancePx = singleWidth + state.options.gap;
  const durationSec = Math.max(state.options.minDuration, distancePx / state.options.speed);

  el.style.setProperty('--marquee-gap', `${state.options.gap}px`);
  el.style.setProperty('--marquee-distance', `${distancePx}px`);
  el.style.setProperty('--marquee-duration', `${durationSec}s`);

  // 内联触发动画，避免依赖 :hover 选择器匹配不到的情况
  track.style.animation = `v-marquee-anim ${durationSec}s linear infinite`;

  // 隐藏静态原内容（移出文档流，确保跑马灯从容器左侧开始可见）
  state.originalSpan.style.display = 'none';

  state.track = track;
  state.active = true;
}

function deactivateMarquee(el) {
  const state = el.__marquee;
  if (!state || !state.active) return;
  if (state.track && state.track.parentNode === el) {
    el.removeChild(state.track);
  }
  state.track = null;
  state.active = false;

  // 恢复静态原内容
  if (state.originalSpan) state.originalSpan.style.display = '';

  el.style.removeProperty('--marquee-gap');
  el.style.removeProperty('--marquee-distance');
  el.style.removeProperty('--marquee-duration');
}

export default {
  mounted(el, binding) {
    injectStyleOnce();

    const options = normalizeOptions(binding.value);
    el.classList.add('v-marquee', 'v-marquee--hover');

    // 兜底：为宿主元素提供单行省略的基础样式（若用户未配置）
    const computed = window.getComputedStyle(el);
    const prevStyles = {
      whiteSpace: el.style.whiteSpace,
      overflow: el.style.overflow,
      textOverflow: el.style.textOverflow,
      display: el.style.display,
    };
    if (computed.whiteSpace !== 'nowrap') el.style.whiteSpace = 'nowrap';
    if (computed.overflow !== 'hidden') el.style.overflow = 'hidden';
    if (computed.textOverflow !== 'ellipsis') el.style.textOverflow = 'ellipsis';
    if (computed.display === 'inline') el.style.display = 'inline-block';

    // 包裹原始内容，保留静态显示（支持省略号）
    const originalSpan = document.createElement('span');
    originalSpan.className = 'v-marquee-original';
    while (el.firstChild) originalSpan.appendChild(el.firstChild);
    el.appendChild(originalSpan);

    const state = {
      options,
      originalSpan,
      track: null,
      active: false,
      onEnter: null,
      onLeave: null,
      onResize: null,
      prevStyles,
    };

    const handleEnter = () => {
      const { isOverflow } = measureOverflow(el);
      if (!isOverflow) return;
      activateMarquee(el);
    };

    const handleLeave = () => {
      deactivateMarquee(el);
    };

    const handleResize = () => {
      // 尺寸变化时，如果正在滚动则重建，保证速度/距离准确
      const wasActive = state.active;
      if (wasActive) deactivateMarquee(el);
      // 仅在 hover 状态下会再次被触发激活
    };

    state.onEnter = handleEnter;
    state.onLeave = handleLeave;
    state.onResize = handleResize;

    el.__marquee = state;

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);
    window.addEventListener('resize', handleResize);
  },

  updated(el, binding) {
    // 更新配置
    const state = el.__marquee;
    if (!state) return;
    state.options = normalizeOptions(binding.value);
    // 内容发生变化时，若在滚动则重建
    if (state.active) {
      deactivateMarquee(el);
      // 不强制重新激活，等待下一次 hover
    }
  },

  unmounted(el) {
    const state = el.__marquee;
    if (!state) return;
    deactivateMarquee(el);
    el.removeEventListener('mouseenter', state.onEnter);
    el.removeEventListener('mouseleave', state.onLeave);
    window.removeEventListener('resize', state.onResize);
    // 恢复宿主元素原有的内联样式
    if (state.prevStyles) {
      el.style.whiteSpace = state.prevStyles.whiteSpace || '';
      el.style.overflow = state.prevStyles.overflow || '';
      el.style.textOverflow = state.prevStyles.textOverflow || '';
      el.style.display = state.prevStyles.display || '';
    }
    delete el.__marquee;
  },
};


