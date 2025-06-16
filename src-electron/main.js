// src-electron/main.js
// const { app, ipcMain, BrowserWindow } = require('electron')
// const path = require('path')

import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 模拟 __dirname 变量（ES模块中不存在 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 屏蔽安全警告
// ectron Security Warning (Insecure Content-Security-Policy)
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win;

// 创建浏览器窗口时，调用这个函数。
const createWindow = () => {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    //frame: false,// 去掉窗口边框
    //transparent: true,// 允许窗口透明
    //title: '星闪悦动键盘量产工具',
    title: 'MORKBLADE',
    icon: path.join(__dirname, '../public/logo.svg'),
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      devTools: true, // 是否打开调试模式
      webSecurity: false, // 禁用安全策略
      allowDisplayingInsecureContent: true, // 允许一个使用 https的界面来展示由 http URLs 传过来的资源
      allowRunningInsecureContent: true, // 允许一个 https 页面运行 http url 里的资源
      nodeIntegration: true, // 5.x以上版本，默认无法在渲染进程引入node模块，需要这里设置为true  //是否集成node，默认false
      enableRemoteModule: true, // 打开remote模块
      contextIsolation: false,
    },
  });

  win.setMenu(null);

  // 打开开发者工具
  win.webContents.openDevTools();

  // 忽略DevTools错误
  win.webContents.on('console-message', (event, level, message) => {
    // 忽略特定的DevTools错误
    if (message.includes('Autofill.enable') || message.includes('Autofill.setAddresses')) {
      event.preventDefault();
      return;
    }
  });

  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    // Add events to handle devices being added or removed before the callback on
    // `select-hid-device` is called.
    console.log('select-hid-device');
    win.webContents.session.on('hid-device-added', (event, device) => {
      console.log('hid-device-added FIRED WITH', device);
      // Optionally update details.deviceList
    });

    win.webContents.session.on('hid-device-removed', (event, device) => {
      console.log('hid-device-removed FIRED WITH', device);
      // Optionally update details.deviceList
    });

    event.preventDefault();
    console.log(details);
    if (details.deviceList && details.deviceList.length > 0) {
      console.log(details);
      callback(details.deviceList[0].deviceId);
    }
  });

  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    console.log('setPermissionCheckHandler', details);
    return true;
    if (permission === 'hid' && details.securityOrigin === 'file:///') {
      return true;
    }
  });

  win.webContents.session.setDevicePermissionHandler((details) => {
    console.log('setDevicePermissionHandler', details);
    return true;
  });

  // win.loadURL('http://localhost:3000')
  // development模式
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 开启调试台
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// Electron 会在初始化后并准备
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
