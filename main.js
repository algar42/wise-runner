const electron = require("electron");
const { dialog, ipcMain } = require("electron");
const { initFolders, initGlobalSettings, initDb } = require("./appinit");
const path = require("path");
const args = require("yargs").argv;
//const database = require("./stormdb");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const basepath = app.getPath("documents");
const appRunner = require("./runApp");
const { readdir } = require("fs/promises");
//const fOpened = require("@ronomon/opened");
const logChecker = require("./logCheck");

let sasProces = [];
let sasLog = [];
let logViewers = [];
let closeStatus = 0;

const initfolders = initFolders(args, basepath);

const databases = {};

//console.log(initfolders);

async function getInit() {
  return initfolders;
}

function showMessage(options) {
  const response = dialog.showMessageBoxSync(null, options);

  return response;
}

async function handleFileOpen(baseDir) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: baseDir || initfolders.workPath,
    filters: [{ name: "SAS Program", extensions: ["sas"] }],
    properties: ["openFile", "multiSelections", "dontAddToRecent"],
  });
  //console.log(filePaths);
  if (canceled) {
    return [];
  } else {
    return filePaths;
  }
}

async function handleDirOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    defaultPath: initfolders.workPath,
    filters: [{ name: "SAS Program", extensions: ["sas"] }],
    properties: ["openDirectory", "dontAddToRecent"],
  });
  if (canceled) {
    return [];
  } else {
    try {
      const dir = await readdir(filePaths[0]);
      const files = dir.filter((e) => path.extname(e) === ".sas").map((e) => path.join(filePaths[0], e));
      return files;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

const checkLog = (args) => {
  let log = new logChecker(args.fileId, args.path, (args) => {
    mainWindow.webContents.send("logCheckResult", args);
    sasLog = sasLog.filter((el) => el.fileId !== args.fileId);
  });
  /*
  let res = log.getState();
  if (res.error) {
    log = null;
    return res;
  } else {
    sasLog.push({ fileId: args.fileId, proc: log });
    return res;
  }*/
  sasLog.push({ fileId: args.fileId, proc: log });
  log.checkLog();
  //console.log(sasLog);
};

const appRun = (args) => {
  let appr = new appRunner(args.fileId, args.runHidden, args.app, (args) => {
    mainWindow.webContents.send("runAppExit", args);
    sasProces = sasProces.filter((el) => el.fileId !== args.fileIds[0]);
  });
  sasProces.push({ fileId: args.fileId, proc: appr });
};

const logViewRun = (args) => {
  let appr = new appRunner(args.fileId, args.runHidden, args.app, (args) => {
    mainWindow.webContents.send("logViewExit", args);
    logViewers = logViewers.filter((el) => el.fileId !== args.fileIds[0]);
  });
  logViewers.push({ fileId: args.fileId, proc: appr });
};

app.whenReady().then(() => {
  initGlobalSettings(initfolders, databases);

  //databases.globCfgDb.db.save();
  if (databases.globCfgDb) {
    //console.log(databases.globCfgDb.db.get("global").value());
  }
  ipcMain.handle("openFile", (event, dir) => handleFileOpen(dir));
  ipcMain.on("showMessage", (event, options) => {
    const res = showMessage(options);
    console.log(res);
    event.returnValue = res;
  });
  ipcMain.handle("openDir", handleDirOpen);
  ipcMain.handle("getInit", getInit);
  ipcMain.handle("getDb", async (event, dbname, key) => {
    return databases[dbname].db.get(key).value();
  });
  ipcMain.handle("initDb", async (event, path, name, defaults) => {
    console.log(path);
    //console.log(name);
    initDb(databases, path, name, defaults);
    //return null;
    return databases[name].db.get("db").value();
  });
  ipcMain.handle("saveDb", async (event, dbname, data) => {
    databases[dbname].db.get("db").set(data).save();
    return databases[dbname].db.get("db").value();
  });
  ipcMain.on("runApp", (event, args) => {
    appRun(args);
  });
  ipcMain.on("killApp", (event, args) => {
    if (sasProces.length > 0) {
      for (let i = 0; i < sasProces.length; i++) {
        sasProces[i].proc.kill();
      }
      sasProces = [];
    }
  });
  ipcMain.on("logViewRun", (event, args) => {
    logViewRun(args);
  });
  ipcMain.on("logCheck", (event, args) => {
    checkLog(args);
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

  //if (isDev) {
  mainWindow.webContents.openDevTools();
  //}

  mainWindow.on("close", (e) => {
    if (closeStatus === 0) {
      if (mainWindow) {
        e.preventDefault();
        mainWindow.webContents.send("app-close");
      }
    }
  });
  mainWindow.on("closed", () => (mainWindow = null));
};

app.on("ready", createWindow);

ipcMain.on("app-closed", () => {
  closeStatus = 1;
  mainWindow = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/*
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
*/

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
