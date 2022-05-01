const electron = require("electron");
const { dialog, ipcMain } = require("electron");
const { initFolders, initGlobalSettings, initDb } = require("./appinit");
const path = require("path");
const args = require("yargs").argv;
//const database = require("./stormdb");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const basepath = app.getPath("documents");

const initfolders = initFolders(args, basepath);

const databases = {};

//console.log(initfolders);

async function getInit() {
  return initfolders;
}

async function initDatabase(path, name, defaults) {
  initDb(databases, path, name, defaults);
  return databases[name].db.get("db").value();
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: initfolders.workPath,
    filters: [{ name: "SAS Program", extensions: ["sas"] }],
    properties: ["openFile", "multiSelections"],
  });
  if (canceled) {
    return [];
  } else {
    return filePaths;
  }
}

app.whenReady().then(() => {
  initGlobalSettings(initfolders, databases);
  if (databases.globCfgDb) {
    //console.log(databases.globCfgDb.db.get("global").value());
  }
  ipcMain.handle("openFile", handleFileOpen);
  ipcMain.handle("getInit", getInit);
  ipcMain.handle("getDb", async (event, dbname, key) => {
    return databases[dbname].db.get(key).value();
  });
  ipcMain.handle("initDb", async (event, path, name, defaults) => {
    initDb(databases, path, name, defaults);
    return databases[name].db.get("db").value();
  });
  ipcMain.handle("saveDb", async (event, dbname, data) => {
    databases[dbname].db.get("db").set(data).save();
    return databases[dbname].db.get("db").value();
  });
});

const isDev = require("electron-is-dev");

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    minWidth: 768,
    height: 920,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile("build/index.html");
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => (mainWindow = null));
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", function () {
  // This is a good place to add tests insuring the app is still
  // responsive and all windows are closed.
  console.log("will-quit");
  mainWindow = null;
});

app.on("before-quit", function (e) {
  console.log("Closing app....");
});
