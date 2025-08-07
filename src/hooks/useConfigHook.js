//TODO V2 配置导出导入
import services from '@/services/index';
import { useLightingHook } from '@/hooks/useLightingHook';
import { useKeyboardHook } from '@/hooks/useKeyboardHook';
import { usePerformanceHook } from '@/hooks/usePerformanceHook';
import { useAdvancedHook } from '@/hooks/useAdvancedHook';
import { useCryptoHook } from './useCryptoHook';
import { 
  useLightSettingStore, 
  useKeyboardStore, 
  useAppStore, 
  useMacroStore, 
  usePerformanceStore,
} from '@/stores/index';

export const useConfigHook = () => {
    const { getLightingDataV2 } = useLightingHook();
    const { getKeyboardDataV2 } = useKeyboardHook();
    const { encryptData, decryptData, validateEncryptedConfig } = useCryptoHook();
    // 导出当前配置相关数据（精简版）
    const exportCurrentConfig = async () => {
        try {
            // 获取所有store实例
            const macroStore = useMacroStore();
            const appStore = useAppStore();

            // 只收集当前配置相关的数据
            const currentConfigData = {
                // V2 灯光配置 
                lighting: await getLightingDataV2(),
                
                // 键盘配置
                keyboard: {
                    keyboards: await getKeyboardDataV2(),
                },
                
                // 宏配置
                macro: {
                    macroData: await macroStore.getMacroAllData(),
                },

                // 系统配置
                system: {
                    version: appStore.version,
                },

            };

            return currentConfigData;
        } catch (error) {
            
            throw error;
        }
    };

    // 导出当前配置到文件
    const exportCurrentConfigToFile = async (item) => {
        try {
            const Data = await exportCurrentConfig();
            
            const currentConfigData = encryptData(Data, 'password'); // 使用密码加密数据

            // 导出为json文件，内容为data
            const jsonStr = JSON.stringify(currentConfigData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.title + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            
            throw error;
        }
    };

    // 从文件导入当前配置
    const importCurrentConfigFromFile = async (file) => {
        try {
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onload = async (e) => {
                    try {
                        const content = e.target.result;
                        const encryptedConfig = JSON.parse(content);

                        // if (!encryptedConfig.encrypted || !encryptedConfig.data) {
                        //     reject(new Error('文件格式不正确'));
                        //     return;
                        // }

                        const configData = decryptData(encryptedConfig, 'password');

                        // 获取所有store实例
                        const lightSettingStore = useLightSettingStore();
                        const keyboardStore = useKeyboardStore();
                        const appStore = useAppStore();
                        const macroStore = useMacroStore();

                        

                        // 恢复V2灯光配置
                        if (configData.lighting) {
                            
                            // 配置到设备
                            await applyLightingConfigToDevice(configData.lighting);
                        }
                        
                        // 恢复键盘配置
                        if (configData.keyboard) {
                            
                            if (configData.keyboard.keyboards) {
                                // 配置到store
                                keyboardStore.$patch((state) => {
                                    state.keyboards = configData.keyboard.keyboards;
                                });
                                // 配置到设备
                                await applyKeyboardConfigToDevice(configData.keyboard.keyboards);
                            }
                        }
                        
                        // 恢复宏配置
                        if (configData.macro) {
                            
                            
                            if (configData.macro.macroData) {
                                macroStore.$patch((state) => {
                                    state.macroData = configData.macro.macroData;
                                });
                            }
                            // 配置到设备
                            await macroStore.importMacroData(configData.macro.macroData);
                        }

                        // 强制触发UI更新
                        // await new Promise(resolve => setTimeout(resolve, 100));
                        
                        resolve(true);
                    } catch (error) {
                        
                        reject(error);
                    }
                };

                reader.onerror = (error) => {
                    reject(error);
                };

                reader.readAsText(file);
            });
        } catch (error) {
            throw error;
        }
    };

    // keyboard 配置到设备
    const applyKeyboardConfigToDevice = async (importedKeyboards) => {
        const keyboardStore = useKeyboardStore();
        const { setMT, setSocd, setDKS, setMPT, setTGL, setEND, setMacro } = useAdvancedHook();
        const { setCustomLighting } = useLightingHook();
        const { setPreset } = usePerformanceHook();

        const performanceStore = usePerformanceStore();
        const isAxisStatus = performanceStore.isAxisStatus;

        try {

            // 1. 批量设置所有层的键位
            const keysToUpdate = [];
            for (let layer = 0; layer < 4; layer++) {
                for (let row = 0; row < importedKeyboards.length; row++) {
                    for (let col = 0; col < importedKeyboards[row].length; col++) {
                        const keyItem = importedKeyboards[row][col];
                        if (!keyItem) continue;
                        const keyCode = keyItem.customKeys?.[`fn${layer}`]?.bindKeyValue;
                        if (keyCode !== undefined && keyCode !== -1) {
                            keysToUpdate.push({ layer, row, col, keycode: keyCode });
                        }
                    }
                }
            }

            // 逐个设置键位
            for (const keyData of keysToUpdate) {
                await services.setKeyCodeV2(keyData);
                
            }

            // 2. 批量设置性能参数
            for (let row = 0; row < importedKeyboards.length; row++) {
                for (let col = 0; col < importedKeyboards[row].length; col++) {
                    const keyItem = importedKeyboards[row][col];
                    if (!keyItem || !keyItem.performance) continue;

                    const { performance } = keyItem;
                    const params = {
                        mode: performance.mode || 0,
                        normalPress: performance.singleTriggeringValue || 0,
                        rtFirstTouch: performance.rtFirstTouch || 0,
                        rtPress: performance.rtPressValue || 0,
                        rtRelease: performance.rtReleaseValue || 0,
                        pressDeadStroke: performance.deadBandPressValue || 0,
                        releaseDeadStroke: performance.deadBandReleaseValue || 0,
                        axis: performance.axisID || 0,
                        row,
                        col,
                        calibrate: 0,
                        ...(isAxisStatus === 'v2' ? {
                            axisV2Id: 0,
                            axisRangeMax: 4000,
                            axisCoefficient: 1000,
                        } : {}),
                    };

                    await services.setPerformanceV2(params);
                    
                }
            }

            // 3. 批量设置高级键
            for (let row = 0; row < importedKeyboards.length; row++) {
                for (let col = 0; col < importedKeyboards[row].length; col++) {
                    const keyItem = importedKeyboards[row][col];
                    if (!keyItem || !keyItem.advancedKeys) continue;

                    const { advancedKeys } = keyItem;
                    if (!advancedKeys.advancedType || advancedKeys.advancedType === 0) continue;

                    try {
                        switch (advancedKeys.advancedType) {
                            case 3: // MT
                                if (advancedKeys.mt) {
                                    // 修复数据结构访问路径
                                    const mtData = advancedKeys.mt.mt || advancedKeys.mt;
                                    const dksValue = mtData.dksAll || [0, 0, 0, 0];
                                    const delayValue = mtData.delay || 200;
                                    
                                    await setMT({
                                        key: keyItem.keyValue,
                                        row,
                                        col,
                                        delay: delayValue,
                                        dks: dksValue,
                                    });
                                    
                                }
                                break;

                            case 6: // SOCD
                                if (advancedKeys.socd) {
                                    const socdKeys = advancedKeys.socd.socd || [];
                                    if (socdKeys.length >= 2) {
                                        await setSocd({
                                            key: socdKeys,
                                            mode: advancedKeys.socd.mode || 0,
                                            delay: advancedKeys.socd.delay || 100,
                                        });
                                        
                                    }
                                }
                                break;

                            case 1: // DKS
                                if (advancedKeys.dks) {
                                    
                                    await setDKS({
                                        key: keyItem.keyValue,  // 修正：keyValue -> key
                                        row,
                                        col,
                                        dks: advancedKeys.dks.dks || [0, 0, 0, 0],  // 从 dks 对象中获取 dks 数组
                                        trps: advancedKeys.dks.trps || [0, 0, 0, 0], // 从 dks 对象中获取 trps 数组
                                        db: advancedKeys.dks.db || 1.4,              // 从 dks 对象中获取 db
                                        db2: advancedKeys.dks.db2 || 3.0,            // 从 dks 对象中获取 db2
                                    });
                                    
                                }
                                break;

                            case 2: // MPT
                                if (advancedKeys.mpt) {
                                    // 修复数据结构访问路径
                                    const mptData = advancedKeys.mpt;
                                    const dksValue = mptData.dks || [0, 0, 0, 0];
                                    const dbsValue = mptData.dbs || [0, 0, 0, 0];
                                    
                                    await setMPT({
                                        key: keyItem.keyValue,
                                        row,
                                        col,
                                        dks: dksValue,
                                        dbs: dbsValue,
                                    });
                                    
                                }
                                break;

                            case 4: // TGL
                                if (advancedKeys.tgl) {
                                    // 修复数据结构访问路径
                                    const tglData = advancedKeys.tgl.tgl || advancedKeys.tgl;
                                    const dksValue = tglData.dksAll ? tglData.dksAll[0] : 0;
                                    const delayValue = tglData.delay || 200;
                                    
                                    await setTGL({
                                        key: keyItem.keyValue,
                                        row,
                                        col,
                                        dks: dksValue,
                                        delay: delayValue,
                                    });
                                    
                                }
                                break;

                            case 5: // END
                                if (advancedKeys.end) {
                                    // 修复数据结构访问路径
                                    const endData = advancedKeys.end.end || advancedKeys.end;
                                    const dksValue = endData.dks && endData.dks.length > 1 ? endData.dks[1] : 0;
                                    const delayValue = endData.delay || 200;

                                    await setEND({
                                        key: keyItem.keyValue,
                                        row,
                                        col,
                                        dks: dksValue,
                                        delay: delayValue,
                                    });
                                    
                                }
                                break;
                       
                            default:
                                
                                break;
                        }
                    } catch (error) {
                        
                    }
                }
            }

            // 4. 批量设置自定义灯光
            const customLighting = [];
            for (let row = 0; row < importedKeyboards.length; row++) {
                customLighting[row] = [];
                for (let col = 0; col < importedKeyboards[row].length; col++) {
                    const keyItem = importedKeyboards[row][col];
                    if (!keyItem) continue;
                    customLighting[row][col] = keyItem.customLight || { B: 0, G: 0, R: 0, isCustom: false };
                }
            }
            


            // TODO 灯光导入
            // 使用 V2 的批量设置灯光
            await setCustomLighting(customLighting);
            return true;

        } catch (error) {
            
            throw error;
        }
    };

    // V2 灯光导入到设备
    const applyLightingConfigToDevice = async (importedLighting) => {
        const lightSettingStore = useLightSettingStore();
        
        try {
            
            
            // 设置灯光基础数据
            if (importedLighting.base) {
                const baseData = {
                    open: importedLighting.base.open,
                    mode: importedLighting.base.mode,
                    luminance: importedLighting.base.luminance,
                    speed: importedLighting.base.speed,
                    direction: importedLighting.base.direction,
                    selectStaticColor: importedLighting.base.selectStaticColor
                };
                
                await services.setLightingBaseV2({
                    area: importedLighting.base.area || lightSettingStore.area,
                    config: lightSettingStore.base,
                    data: baseData,
                    lamp: lightSettingStore.lamp,
                });
                
            }
            
            // 设置灯光调色板
            if (importedLighting.palette && importedLighting.palette.staticColors) {
                await services.setLightingPaletteV2({
                    area: lightSettingStore.area,
                    config: lightSettingStore.palette,
                    data: {
                        staticColors: importedLighting.palette.staticColors
                    },
                });
                
            }
            
            // 设置灯光睡眠时间
            if (importedLighting.sleepTime !== undefined) {
                await services.setLightingSleepTimeV2(importedLighting.sleepTime);
                
            }
            
            
            return true;
        } catch (error) {
            
            throw error;
        }
    }

    return {
        exportCurrentConfig,
        exportCurrentConfigToFile,
        importCurrentConfigFromFile
    }
}