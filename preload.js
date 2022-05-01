const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

contextBridge.exposeInMainWorld("fileAPI", {
  openFile: () => ipcRenderer.invoke("openFile"),
  getInit: () => ipcRenderer.invoke("getInit"),
  getDb: (dbname, key) => ipcRenderer.invoke("getDb", dbname, key),
  path: path,
  fs: fs,
});
