import { app as s, BrowserWindow as a } from "electron";
import r from "node:path";
import { fileURLToPath as u } from "node:url";
const v = u(import.meta.url), d = r.dirname(v);
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
let e;
const c = () => {
  e = new a({
    width: 1920,
    height: 1080,
    //frame: false,// 去掉窗口边框
    //transparent: true,// 允许窗口透明
    //title: '星闪悦动键盘量产工具',
    title: "MORKBLADE",
    icon: r.join(d, "../public/logo.ico"),
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      devTools: !0,
      // 是否打开调试模式
      webSecurity: !1,
      // 禁用安全策略
      allowDisplayingInsecureContent: !0,
      // 允许一个使用 https的界面来展示由 http URLs 传过来的资源
      allowRunningInsecureContent: !0,
      // 允许一个 https 页面运行 http url 里的资源
      nodeIntegration: !0,
      // 5.x以上版本，默认无法在渲染进程引入node模块，需要这里设置为true  //是否集成node，默认false
      enableRemoteModule: !0,
      // 打开remote模块
      contextIsolation: !1
    }
  }), e.setMenu(null), e.webContents.on("console-message", (o, n, t) => {
    if (t.includes("Autofill.enable") || t.includes("Autofill.setAddresses")) {
      o.preventDefault();
      return;
    }
  }), e.webContents.session.on("select-hid-device", (o, n, t) => {
    console.log("select-hid-device"), e.webContents.session.on("hid-device-added", (i, l) => {
      console.log("hid-device-added FIRED WITH", l);
    }), e.webContents.session.on("hid-device-removed", (i, l) => {
      console.log("hid-device-removed FIRED WITH", l);
    }), o.preventDefault(), console.log(n), n.deviceList && n.deviceList.length > 0 && (console.log(n), t(n.deviceList[0].deviceId));
  }), e.webContents.session.setPermissionCheckHandler((o, n, t, i) => (console.log("setPermissionCheckHandler", i), !0)), e.webContents.session.setDevicePermissionHandler((o) => (console.log("setDevicePermissionHandler", o), !0)), process.env.VITE_DEV_SERVER_URL ? (e.loadURL(process.env.VITE_DEV_SERVER_URL), e.webContents.openDevTools()) : e.loadFile(r.join(d, "../dist/index.html"));
};
s.whenReady().then(() => {
  c(), s.on("activate", () => {
    a.getAllWindows().length === 0 && c();
  });
});
s.on("window-all-closed", () => {
  process.platform !== "darwin" && s.quit();
});
