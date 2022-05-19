const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

contextBridge.exposeInMainWorld("fileAPI", {
  showMessage: (options) => ipcRenderer.sendSync("showMessage", options),
  openFile: (baseDir) => ipcRenderer.invoke("openFile", baseDir),
  openDir: () => ipcRenderer.invoke("openDir"),
  getInit: () => ipcRenderer.invoke("getInit"),
  runApp: (args) => ipcRenderer.send("runApp", args),
  killApp: (args) => ipcRenderer.send("killApp", args),
  logViewRun: (args) => ipcRenderer.send("logViewRun", args),
  logCheck: (args) => ipcRenderer.send("logCheck", args),
  handleAppFinish: (callback) => ipcRenderer.on("runAppExit", callback),
  logCheckResult: (callback) => ipcRenderer.on("logCheckResult", callback),
  getDb: (dbname, key) => ipcRenderer.invoke("getDb", dbname, key),
  saveDb: (dbname, data) => ipcRenderer.invoke("saveDb", dbname, data),
  initDb: (path, name, defaults) => ipcRenderer.invoke("initDb", path, name, defaults),
  handleApplicationClose: (callback) => ipcRenderer.on("app-close", callback),
  applicationClosed: (args) => ipcRenderer.send("app-closed", args),
  path: path,
  fs: fs,
});
