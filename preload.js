const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

contextBridge.exposeInMainWorld("fileAPI", {
  openFile: (baseDir) => ipcRenderer.invoke("openFile", baseDir),
  openDir: () => ipcRenderer.invoke("openDir"),
  getInit: () => ipcRenderer.invoke("getInit"),
  runApp: (args) => ipcRenderer.invoke("runApp", args),
  logCheck: (args) => ipcRenderer.invoke("logCheck", args),
  handleAppFinish: (callback) => ipcRenderer.on("runAppExit", callback),
  logCheckResult: (callback) => ipcRenderer.on("logCheckResult", callback),
  getDb: (dbname, key) => ipcRenderer.invoke("getDb", dbname, key),
  saveDb: (dbname, data) => ipcRenderer.invoke("saveDb", dbname, data),
  initDb: (path, name, defaults) => ipcRenderer.invoke("initDb", path, name, defaults),
  path: path,
  fs: fs,
});
