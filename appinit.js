const path = require("path");
const fs = require("fs");
const database = require("./stormdb");

const globalDefaults = {
  db: {
    settings: {
      sasExecPath: "E:\\Program Files\\SASHome\\SASFoundation\\9.4\\sas.exe",
      sasCfgPath: "E:\\Program Files\\SASHome\\SASFoundation\\9.4\\nls\\en\\sasv9.cfg",
      sasParams: "-rsasuser -nosplash -nologo lrecl = 4000",
      sasParams1: "",
      multiThreading: false,
      numberOfThreads: 2,
      runSasHidden: true,
    },
  },
};

function initFolders(args, basePath) {
  //console.log(args);
  const init = {};
  if (args.home && fs.existsSync(args.home)) {
    init.workPath = args.home;
  } else init.workPath = basePath;

  if (args.gcfg && fs.existsSync(args.gcfg)) {
    init.globalConfigPath = args.gcfg;
  } else init.globalConfigPath = basePath;

  init.args = args;
  return init;
}

function initGlobalSettings(init, dbobj) {
  if (init.globalConfigPath && fs.existsSync(init.globalConfigPath)) {
    dbobj.globCfgDb = new database(init.globalConfigPath, "wiseglobalsettings.sdb", globalDefaults);
  }
}

function initDb(dbobj, path, name, defaults) {
  const def = { db: defaults };
  if (path && name && fs.existsSync(path)) {
    dbobj[name] = new database(path, name + ".sdb", def);
  }
}

exports.initFolders = initFolders;
exports.initGlobalSettings = initGlobalSettings;
exports.initDb = initDb;
