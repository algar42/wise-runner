const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

contextBridge.exposeInMainWorld("fileAPI", {
  openFile: (baseDir) => ipcRenderer.invoke("openFile", baseDir),
  openDir: () => ipcRenderer.invoke("openDir"),
  getInit: () => ipcRenderer.invoke("getInit"),
  runApp: (args) => ipcRenderer.invoke("runApp", args),
  handleAppFinish: (callback) => ipcRenderer.on("runAppExit", callback),
  getDb: (dbname, key) => ipcRenderer.invoke("getDb", dbname, key),
  path: path,
  fs: fs,
});
