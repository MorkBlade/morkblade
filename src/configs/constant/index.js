import axisIcon1 from '@/assets/images/wanciwang.webp';
import axisIcon2 from '@/assets/images/ciyu.webp';
import axisIcon3 from '@/assets/images/wanciwang.webp';
import axisIcon4 from '@/assets/images/ciyu.webp';
import axisIcon5 from '@/assets/images/wanciwang.webp';
import axisIcon6 from '@/assets/images/ciyu.webp';
import axisIcon7 from '@/assets/images/wanciwang.webp';
import axisIcon8 from '@/assets/images/ciyu.webp';
import cs from '@/assets/images/cs.svg';
import office from '@/assets/images/key.svg';
import lol from '@/assets/images/lol.svg';
import osu from '@/assets/images/osu.svg';
import valorant from '@/assets/images/valorant.png';

export const APP_MENU = {
  keyboard: [
    {
      key: 'performance',
      text: '性能设置',
      icon: 'adjustment',
    },
    {
      key: 'advancedFeatures',
      text: '高级功能',
      icon: 'animation',
    },
    {
      key: 'lighting',
      text: '灯光RGB设置',
      icon: 'lightbulb',
    },
    {
      key: 'customKey',
      text: '键盘键值修改',
      icon: 'keyboard',
    },
    {
      key: 'highLevelKey',
      text: '高级键功能',
      icon: 'grid-view',
    },
    // {
    //   key: 'macro',
    //   text: '宏录制',
    //   icon: 'git-pull-request',
    // },
  ],
  settings: [
    {
      key: 'firmware',
      text: '更新',
      icon: 'refresh',
    },
    // {
    //   key: 'language',
    //   text: '语言切换',
    //   icon: 'translate',
    // },
  ],
  help: [
    {
      key: 'faq',
      text: 'FAQ',
      icon: 'help-circle',
    },
  ],
};

export const LIGHT_SLEEP_DELAY = [
  { label: '1 min', id: 1 },
  { label: '2 min', id: 2 },
  { label: '3 min', id: 3 },
  { label: '5 min', id: 4 },
  { label: '10 min', id: 5 },
  { label: '15 min', id: 6 },
  { label: '20 min', id: 7 },
  { label: '25 min', id: 8 },
  { label: '30 min', id: 9 },
  { label: '45 min', id: 10 },
  { label: '60 min', id: 11 },
  { label: '120 min', id: 12 },
  { label: '永不', id: 0 },
];
export const LIGHT_DYNAMIC_MODES = [
  { label: '波纹荡漾', id: 1 },
  { label: '潮起潮落', id: 2 },
  { label: '涟漪轻漾', id: 3 },
  { label: '旋转风暴', id: 4 },
  { label: '幸运彩虹', id: 5 },
  { label: '闪耀彩虹', id: 6 },
  { label: '熠熠生辉', id: 7 },
  { label: '移动窗格', id: 8 },
  { label: '波形变换', id: 9 },
  { label: '移形换影', id: 10 },
  { label: '正弦曲线', id: 11 },
  { label: '行云流水', id: 12 },
  { label: '百花争艳', id: 13 },
  { label: '斑斓镶嵌', id: 14 },
  { label: '雨落如注', id: 15 },
  { label: '跃动不息', id: 16 },
  { label: '踏雪无痕', id: 17 },
  { label: '踏雪寻梅', id: 18 },
  { label: '镭射穿云', id: 19 },
  { label: '水波荡漾', id: 20 },
];

export const KEY_SHAFT = [
  {
    id: 1,
    name: '磁玉pro',
    maxTravel: 3300,
    minTravel: 10,
    color: '#91bc00',
    src: axisIcon1,
  },
  { id: 2, name: '万磁王RGB', maxTravel: 3300, minTravel: 10, color: '#8400ff', src: axisIcon2 },
  { id: 3, name: '万磁王', maxTravel: 3300, minTravel: 10, color: '#fff', src: axisIcon3 },
  { id: 4, name: '磁玉gaming', maxTravel: 3400, minTravel: 10, color: '#f0ff0f', src: axisIcon4 },
  {
    id: 5,
    name: '天王磁轴标准版',
    maxTravel: 3500,
    minTravel: 10,
    color: '#fbfbbb',
    src: axisIcon5,
  },
  {
    id: 6,
    name: '天王磁轴电竞版',
    maxTravel: 3400,
    minTravel: 10,
    color: '#febbef',
    src: axisIcon6,
  },
  { id: 7, name: '万磁王pom', maxTravel: 3400, minTravel: 10, color: '#fbcfbc', src: axisIcon7 },
  { id: 0, name: '磁轴8', maxTravel: 3300, minTravel: 10, color: '#fafa', src: axisIcon8 },
];
export const HIGH_LEVEL_KEYS = [
  {
    buttonText: 'SOCD',
    description: '单击按键开启持续触发，按住按键为正常触发。',
    type: 'SOCD',
  },
  {
    buttonText: 'DKS',
    description: '单个按键实现四种功能:您可以根据4种不同的。',
    type: 'DKS',
  },
  {
    buttonText: 'MT',
    description: '按住和单击按键实现不同功能。',
    type: 'MT',
  },
  // {
  //   buttonText: 'MPT',
  //   description: '单个按键可在三个不同的深度触发三个不同的按键.',
  // },
  // {
  //   buttonText: 'TGL',
  //   description: '单击按键开启持续触发，按住按键为正常触发。',
  // },
  // {
  //   buttonText: 'END',
  //   description: '单击按键开启持续触发，按住按键为正常触发。',
  // },

  // {
  //   buttonText: 'RS',
  //   description: '单击按键开启持续触发，按住按键为正常触发。',
  // },
  // {
  //   buttonText: 'MACRO',
  //   description: '单击按键开启持续触发，按住按键为正常触发。',
  // },
];

export const DKS_MODES = [
  '后覆盖（后按下的按键会覆盖前一个）',
  '红框中的按键优先',
  '橘框中的按键优先',
  '中性（两个按键都按下都不生效）',
];

export const PRESET_SETTINGS = [
  {
    id: 1,
    name: '瓦洛兰特',
    color: 'rgb(255,0,0)',
    src: valorant,
    keys: [
      { key: 26, trigger: 0.2, rt: 0.4 },
      { key: 4, trigger: 0.2, rt: 0.4 },
      { key: 22, trigger: 0.2, rt: 0.4 },
      { key: 7, trigger: 0.2, rt: 0.4 },
      { key: 225, trigger: 1, rt: 0.2 },
      { key: 44, trigger: 1, rt: 0.2 },
      { key: 33, trigger: 1, rt: 0.3 },
    ],
    other: { trigger: 1, rt: 0 },
  },
  {
    id: 2,
    name: '英雄联盟',
    color: 'rgb(165,214,63)',
    src: lol,
    keys: [],
    other: { trigger: 0.3, rt: 0 },
  },
  {
    id: 3,
    name: 'CS:GO',
    color: 'rgb(42,130,228)',
    src: cs,
    keys: [],
    other: { trigger: 1, rt: 0 },
  },
  {
    id: 4,
    name: 'osu',
    color: 'rgb(172,51,193)',
    src: osu,
    keys: [
      { key: 29, trigger: 0.4, rt: 0.1 },
      { key: 27, trigger: 0.4, rt: 0.1 },
    ],
    other: { trigger: 1, rt: 0 },
  },
  {
    id: 5,
    name: '办公',
    color: 'rgb(172,51,193)',
    src: office,
    keys: [],
    other: { trigger: 2, rt: 0 },
  },
];

export const KEYBOARD_MACRO = [
  0xf500, 0xf501, 0xf502, 0xf503, 0xf504, 0xf505, 0xf506, 0xf507, 0xf508, 0xf509, 0xf50a, 0xf50b, 0xf50c, 0xf50d,
  0xf50e, 0xf50f,
];

export const CONFIG_MAP = {
  Config1: 'Config1',
  Config2: 'Config2',
  Config3: 'Config3',
  Config4: 'Config4',
};

export const CONFIG_OPTIONS = [
  { value: CONFIG_MAP.Config1, name: 'Config1', label: '我的配置1' },
  { value: CONFIG_MAP.Config2, name: 'Config2', label: '我的配置2' },
  { value: CONFIG_MAP.Config3, name: 'Config3', label: '我的配置3' },
  { value: CONFIG_MAP.Config4, name: 'Config4', label: '我的配置4' },
];

export const ICON_MAP = {
  TTC: {
    69: new URL('@/assets/images/wcw.png', import.meta.url).href,
  },
};
