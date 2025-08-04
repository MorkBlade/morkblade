//TODO 中文备份
import axisIcon1 from '@/assets/images/wanciwang.avif';
import axisIcon2 from '@/assets/images/ciyu.avif';
import axisIcon3 from '@/assets/images/wanciwang.avif';
import axisIcon4 from '@/assets/images/ciyu.avif';
import axisIcon5 from '@/assets/images/wanciwang.avif';
import axisIcon6 from '@/assets/images/ciyu.avif';
import axisIcon7 from '@/assets/images/wanciwang.avif';
import axisIcon8 from '@/assets/images/ciyu.avif';
import cs from '@/assets/images/cs.svg';
import office from '@/assets/images/key.svg';
import lol from '@/assets/images/lol.svg';
import osu from '@/assets/images/osu.svg';
import valorant from '@/assets/images/valorant.png';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

export const APP_MENU = {
    keyboard: [
        {
            key: 'performance',
            text: t('APP_MENU.performance'),
            icon: 'adjustment',
        },
        {
            key: 'advancedFeatures',
            text: t('APP_MENU.advancedFeatures'),
            icon: 'animation',
        },
        {
            key: 'lighting',
            text: t('APP_MENU.lighting'),
            icon: 'lightbulb',
        },
        {
            key: 'customKey',
            text: t('APP_MENU.customKey'),
            icon: 'keyboard',
        },
        {
            key: 'highLevelKey',
            text: t('APP_MENU.highLevelKey'),
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
            text: t('APP_MENU.update'),
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
    { label: '5 min', id: 5 },
    { label: '10 min', id: 10 },
    { label: '15 min', id: 15 },
    { label: '20 min', id: 20 },
    { label: '25 min', id: 25 },
    { label: '30 min', id: 30 },
    { label: '45 min', id: 45 },
    { label: '60 min', id: 60 },
    { label: '120 min', id: 120 },
    { label: t('constant.LIGHT_SLEEP_DELAY.never'), id: 0 },
];
export const LIGHT_DYNAMIC_MODES = [
    { label: t('constant.LIGHT_DYNAMIC_MODES.ripplesUndulating'), id: 1 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.theTidesRiseAndFall'), id: 2 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.ripplesGentlySpread'), id: 3 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.rotatingStorm'), id: 4 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.luckyRainbow'), id: 5 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.sparklingRainbow'), id: 6 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.glittering'), id: 7 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.movingGrid'), id: 8 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.waveTransformation'), id: 9 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.shapeChange'), id: 10 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.sineCurve'), id: 11 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.flowingClouds'), id: 12 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.blooming'), id: 13 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.colorfulEmbedding'), id: 14 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.rainDrops'), id: 15 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.moving'), id: 16 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.snowless'), id: 17 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.snowSearch'), id: 18 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.laserPenetration'), id: 19 },
    { label: t('constant.LIGHT_DYNAMIC_MODES.waterRipple'), id: 20 },
];

export const KEY_SHAFT = [
    {
        id: 1,
        name: t('constant.KEY_SHAFT.name1'),
        maxTravel: 3300,
        minTravel: 10,
        color: '#91bc00',
        src: axisIcon1,
    },
    { id: 2, name: t('constant.KEY_SHAFT.name2'), maxTravel: 3300, minTravel: 10, color: '#8400ff', src: axisIcon2 },
    { id: 3, name: t('constant.KEY_SHAFT.name3'), maxTravel: 3300, minTravel: 10, color: '#fff', src: axisIcon3 },
    { id: 4, name: t('constant.KEY_SHAFT.name4'), maxTravel: 3400, minTravel: 10, color: '#f0ff0f', src: axisIcon4 },
    {
        id: 5,
        name: t('constant.KEY_SHAFT.name5'),
        maxTravel: 3500,
        minTravel: 10,
        color: '#fbfbbb',
        src: axisIcon5,
    },
    {
        id: 6,
        name: t('constant.KEY_SHAFT.name6'),
        maxTravel: 3400,
        minTravel: 10,
        color: '#febbef',
        src: axisIcon6,
    },
    { id: 7, name: t('constant.KEY_SHAFT.name7'), maxTravel: 3400, minTravel: 10, color: '#fbcfbc', src: axisIcon7 },
    { id: 0, name: t('constant.KEY_SHAFT.name8'), maxTravel: 3300, minTravel: 10, color: '#fafa', src: axisIcon8 },
];
export const HIGH_LEVEL_KEYS = [
    {
        buttonText: 'SOCD',
        description: t('constant.HIGH_LEVEL_KEYS.socd'),
        type: 'SOCD',
    },
    {
        buttonText: 'DKS',
        description: t('constant.HIGH_LEVEL_KEYS.dks'),
        type: 'DKS',
    },
    {
        buttonText: 'MT',
        description: t('constant.HIGH_LEVEL_KEYS.mt'),
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
    t('constant.DKS_MODES.mode1'),
    t('constant.DKS_MODES.mode2'),
    t('constant.DKS_MODES.mode3'),
    t('constant.DKS_MODES.mode4'),
];

export const PRESET_SETTINGS = [
    {
        id: 1,
        name: t('constant.PRESET_SETTINGS.name1'),
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
        name: t('constant.PRESET_SETTINGS.name2'),
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
        name: t('constant.PRESET_SETTINGS.name3'),
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
    { value: CONFIG_MAP.Config1, name: 'Config1', label: t('constant.CONFIG_OPTIONS.config1') },
    { value: CONFIG_MAP.Config2, name: 'Config2', label: t('constant.CONFIG_OPTIONS.config2') },
    { value: CONFIG_MAP.Config3, name: 'Config3', label: t('constant.CONFIG_OPTIONS.config3') },
    { value: CONFIG_MAP.Config4, name: 'Config4', label: t('constant.CONFIG_OPTIONS.config4') },
];

export const ICON_MAP = {
    TTC: {
        69: new URL('@/assets/images/TTC_wcw.avif', import.meta.url).href,
        111: new URL('@/assets/images/RGB_wcw.avif', import.meta.url).href,
        112: new URL('@/assets/images/gs.avif', import.meta.url).href,
        113: new URL('@/assets/images/LOVE_wcw.avif', import.meta.url).href,
        115: new URL('@/assets/images/ws.avif', import.meta.url).href,
        116: new URL('@/assets/images/E_sport_wcw.avif', import.meta.url).href,
    },
    佳达隆: {
        58: new URL('@/assets/images/ciyupro.avif', import.meta.url).href,
        106: new URL('@/assets/images/gd.png', import.meta.url).href,
        // 4: new URL('@/assets/images/wcw.avif', import.meta.url).href,
        // 78: new URL('@/assets/images/wcw.avif', import.meta.url).href,
    },
    other: {
        26: new URL('@/assets/images/ts.avif', import.meta.url).href,
        64: new URL('@/assets/images/sl.png', import.meta.url).href,
        70: new URL('@/assets/images/ti.avif', import.meta.url).href,
        85: new URL('@/assets/images/ice.avif', import.meta.url).href,
        118: new URL('@/assets/images/ds.png', import.meta.url).href,
        121: new URL('@/assets/images/wk.avif', import.meta.url).href,
        123: new URL('@/assets/images/jicipro.png', import.meta.url).href,
    },
};
