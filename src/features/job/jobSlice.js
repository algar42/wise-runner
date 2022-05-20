import { createSlice, nanoid } from "@reduxjs/toolkit";
import { status } from "../../app/constants";
import { arrayMoveImmutable } from "array-move";

const getPriorityGroup = (name) => {
  const nm = name.toUpperCase();
  //SDTM groups
  if (/_TDD$/.test(nm)) return 5;
  else if (/_DC$/.test(nm)) return 7;
  else if (/_DM$/.test(nm)) return 10;
  else if (/_SE$/.test(nm)) return 15;
  else if (/_SV$/.test(nm)) return 20;
  else if (/_CO$/.test(nm)) return 90;
  else if (/_RELREC$/.test(nm)) return 95;
  else if (/_FINAL$/.test(nm)) return 97;
  else if (/_TEMPLATE$/.test(nm)) return 99;
  //ADaM groups
  else if (/_ADDM$/.test(nm)) return 5;
  else if (/_ADSL$/.test(nm)) return 10;
  else return 50;
};

const fileSortByPriority = (ids, files) => {
  const sIds = [...ids];
  sIds.sort((p, c) => {
    const pf = files.find((e) => e.id === p);
    const cf = files.find((e) => e.id === c);
    // console.log(`${pf.file.name}, ${cf.file.name}, ${pf.priorityGroup - cf.priorityGroup}`);
    return pf.priorityGroup - cf.priorityGroup;
  });
  return sIds;
};

const fileSortByName = (ids, files) => {
  const sIds = [...ids];
  sIds.sort((p, c) => {
    const pf = files.find((e) => e.id === p);
    const cf = files.find((e) => e.id === c);
    if (pf.priorityGroup === cf.priorityGroup) return pf.file.name.localeCompare(cf.file.name);
    else return 0;
  });
  return sIds;
};

const fileStats = (path) => {
  const stat = window.fileAPI.fs.statSync(path, { throwIfNoEntry: false });
  //console.log(path);
  //console.log(stat);
  if (stat)
    return {
      fileExist: true,
      atime: stat.atime.getTime(),
      mtime: stat.mtime.getTime(),
      ctime: stat.ctime.getTime(),
      birthtime: stat.birthtime.getTime(),
      maxtime: Math.max(stat.atime, stat.mtime, stat.ctime),
    };
  else return { fileExist: false, atime: null, mtime: null, ctime: null, birthtime: null, maxtime: null };
};

const logFile = (path, name) => {
  return { logPath: path + "\\" + name + ".log" };
};

const handleSaveJob = (path, name, job) => {
  const jb = JSON.stringify(job);
  //console.log(jb);
  window.fileAPI.initDb(path, name, { value: {} }).then((res) => {
    if (res) {
      window.fileAPI.saveDb(name, { value: JSON.parse(jb) }).then((res) => {
        if (res) console.log("DB Saved");
      });
    }
  });
};

const prepareFiles = (grpId, files, isDir) => {
  const pl = {
    payload: {
      groupId: grpId,
      isDir: isDir,
      baseDir: null,
      files: [],
      ids: [],
    },
  };
  if (files.length > 0) {
    pl.payload.baseDir = window.fileAPI.path.parse(files[0]).dir;
  }
  for (let i = 0; i < files.length; i++) {
    const fl = {
      id: nanoid(),
      isEnabled: true,
      isHidden: false,
      groupId: grpId,
      isRunning: false,
      isLogChecking: false,
      exitCode: null,
      runError: null,
      priorityGroup: 50,
      status: status.UNKNOWN,
      messages: {
        numErrors: null,
        numWarnings: null,
        numNotice: null,
        numNoticeAll: null,
        e: null,
        em: null,
        eq: null,
        w: null,
        wm: null,
        wq: null,
        n: null,
        nm: null,
        nq: null,
        nr: null,
        np: null,
      },
      file: window.fileAPI.path.parse(files[i]),
      fileInfo: { runtime: null },
      log: {},
      logInfo: {},
    };

    //assign initial priority groups
    fl.priorityGroup = getPriorityGroup(fl.file.name);
    pl.payload.files.push(fl);
    pl.payload.ids.push(fl.id);
  }
  //pl.payload.ids = fileSortByName(fileSortByPriority(pl.payload.ids, pl.payload.files), pl.payload.files);
  return pl;
};

export const jobSlice = createSlice({
  name: "job",
  initialState: {
    value: {
      title: "Untitled-job",
      isLoading: false,
      isRunable: false,
      isSaved: true,
      isRunning: false,
      isAppClosed: false,
      jobSaveRequest: false,
      runParams: {},
      status: status.UNKNOWN,
      groups: [],
      files: [],
      runningFiles: [],
      filesToRun: [],
      savedJobsList: [],
    },
  },
  reducers: {
    setTitle: (state, action) => {
      if (action.payload !== "") state.value.title = action.payload;
    },
    setSaved: (state, action) => {
      state.value.isSaved = action.payload;
    },
    setIsLoading: (state, action) => {
      state.value.isLoading = action.payload;
    },
    setJobRunning: (state, action) => {
      state.value.isRunning = action.payload;
    },
    setFileRunning: (state, action) => {
      const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileId);
      state.value.files[fileIndex].isRunning = action.payload.isRunning;
    },
    loadJob: (state, action) => {
      state.value = { ...action.payload };
      state.value.jobSaveRequest = false;
      state.value.isAppClosed = false;
      state.value.isLoading = true;
      state.value.isSaved = true;
    },
    saveJob: (state, action) => {
      handleSaveJob(action.payload.path, state.value.title, state.value);
    },
    getSavedJobsList: (state, action) => {
      if (action.payload.length > 0) state.value.savedJobsList = [...action.payload];
      else state.value.savedJobsList = [];
      //console.log(JSON.stringify(state.value.savedJobsList));
    },
    stopJobExecution: (state, value) => {
      state.value.filesToRun = [];
      //state.value.runningFiles = [];
      window.fileAPI.killApp();
    },
    deleteGroup: (state, action) => {
      //const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
      state.value.files = state.value.files.filter((e) => e.groupId !== action.payload.groupId);
      state.value.groups = state.value.groups.filter((e) => e.id !== action.payload.groupId);
    },
    sortGroup: (state, action) => {
      const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
      state.value.groups[groupIndex].files = fileSortByName(
        fileSortByPriority(state.value.groups[groupIndex].files, state.value.files),
        state.value.files
      );
    },
    setGroupShowHidden: (state, action) => {
      const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);

      state.value.groups[groupIndex].isShowHidden = !state.value.groups[groupIndex].isShowHidden;
    },
    fileHide: (state, action) => {
      const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileId);
      const inGroup = state.value.files[fileIndex].groupId;
      const groupIndex = state.value.groups.findIndex((group) => group.id === inGroup);
      //set hide flag...
      state.value.files[fileIndex].isHidden = action.payload.hide;
      //..and also disable file
      state.value.files[fileIndex].isEnabled = !action.payload.hide;
      //..and if file is hidden also set hasHidden flag to the group or if false then check if there are any other hidden files
      if (action.payload.hide) {
        state.value.groups[groupIndex].hasHiddenFiles = true;
      } else {
        const filter = state.value.files.filter((e) => e.groupId === inGroup && e.isHidden === true) || [];
        if (filter.length === 0) state.value.groups[groupIndex].hasHiddenFiles = false;
      }
    },
    onApplicationClose: (state, action) => {
      if (action.payload && action.payload === true) state.value.isAppClosed = true;
      else {
        if (state.value.isSaved === false) {
          const msg = window.fileAPI.showMessage({
            type: "question",
            title: "Close",
            message: "Do you want to save current Job?",
            buttons: ["Yes", "No"],
          });
          if (msg === 1) state.value.isAppClosed = true;
          else state.value.jobSaveRequest = true;
        } else state.value.isAppClosed = true;
      }
    },
    addFiles: {
      //on file add dialog process received file names to the store
      reducer(state, action) {
        const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
        if (
          state.value.groups[groupIndex].baseDir &&
          state.value.groups[groupIndex].baseDir !== action.payload.baseDir
        ) {
          const msg = window.fileAPI.showMessage({
            type: "error",
            title: "Error",
            message: `Files can only be added to the group from only one folder [${state.value.groups[groupIndex].baseDir}]`,
            buttons: ["Ok"],
          });
          return;
        }
        for (let fl = 0; fl < action.payload.files.length; fl++) {
          const fileref = state.value.files.find(
            (e) =>
              e.file.name.toUpperCase() === action.payload.files[fl].file.name.toUpperCase() &&
              e.groupId === action.payload.files[fl].groupId
          );
          if (fileref === undefined) {
            state.value.groups[groupIndex].files.push(action.payload.ids[fl]);
            state.value.files.push(action.payload.files[fl]);
          }
        }

        //action.payload && state.value.groups[groupIndex].files.push(...action.payload.ids);
        //action.payload && state.value.files.push(...action.payload.files);
        if (action.payload.ids.length > 0) {
          state.value.groups[groupIndex].isDir = action.payload.isDir;
          state.value.groups[groupIndex].baseDir = action.payload.baseDir;
          state.value.isRunable = true;
        }
        //assign log and lst paths
        if (state.value.groups[groupIndex].files && state.value.groups[groupIndex].files.length > 0) {
          const file = state.value.files.find((e) => e.id === state.value.groups[groupIndex].files[0]);
          try {
            const pb = window.fileAPI.path.normalize(window.fileAPI.path.join(file.file.dir, ".."));
            if (pb) {
              const log = window.fileAPI.path.join(pb, "log");
              const lst = window.fileAPI.path.join(pb, "output");
              if (!window.fileAPI.fs.existsSync(state.value.groups[groupIndex].settings.logOutputFolder)) {
                if (window.fileAPI.fs.existsSync(log)) {
                  state.value.groups[groupIndex].settings.logOutputFolder = log;
                } else state.value.groups[groupIndex].settings.logOutputFolder = file.file.dir;
              }
              if (!window.fileAPI.fs.existsSync(state.value.groups[groupIndex].settings.lstOutputFolder)) {
                if (window.fileAPI.fs.existsSync(lst)) {
                  state.value.groups[groupIndex].settings.lstOutputFolder = lst;
                } else state.value.groups[groupIndex].settings.lstOutputFolder = file.file.dir;
              }
            }
          } catch {
            state.value.groups[groupIndex].settings.logOutputFolder = file.file.dir;
            state.value.groups[groupIndex].settings.lstOutputFolder = file.file.dir;
          }

          for (let f = 0; f < state.value.groups[groupIndex].files.length; f++) {
            const file = state.value.files.find((e) => e.id === state.value.groups[groupIndex].files[f]);
            file.log = {
              ...logFile(state.value.groups[groupIndex].settings.logOutputFolder, file.file.name),
            };
            file.logInfo = { ...fileStats(file.log.logPath) };
            file.fileInfo = {
              ...file.fileInfo,
              ...fileStats(window.fileAPI.path.join(file.file.dir, file.file.base)),
            };
          }
        }
      },
      prepare(grpId, files, isDir) {
        const res = { ...prepareFiles(grpId, files, isDir) };
        return res;
      },
    },
    fileEnabled: (state, action) => {
      //console.log(action.payload);
      //handle enabling/disabling file
      const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileId);
      state.value.files[fileIndex].isEnabled = action.payload.enabled;
      //also unhide file if we are enabling it:
      if (action.payload.enabled) {
        state.value.files[fileIndex].isHidden = false;
      }
    },
    groupEnabled: (state, action) => {
      //handle Enabling/disabling Group
      const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
      state.value.groups[groupIndex].isEnabled = action.payload.enabled;
      let allDisabled = state.value.groups.filter((e) => e.isEnabled === true);
      if (allDisabled.length === 0) {
        state.value.isRunable = false;
      } else if (state.value.groups[groupIndex].files.length > 0 && action.payload.enabled) {
        state.value.isRunable = true;
      }
    },
    groupTitleEdited: (state, action) => {
      //handle Group title update
      const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
      state.value.groups[groupIndex].title = action.payload.groupTitle.toUpperCase();
    },
    dragGroupMove: (state, action) => {
      //hande group drag move.
      const { oldIndex, newIndex } = action.payload;
      state.value.groups = arrayMoveImmutable(state.value.groups, oldIndex, newIndex);
    },
    dragFileMove: (state, action) => {
      //Handle file move on drag event. Move file index in the file array
      const { groupId, oldIndex, newIndex } = action.payload;
      const groupIndex = state.value.groups.findIndex((group) => group.id === groupId);
      state.value.groups[groupIndex].files = arrayMoveImmutable(
        state.value.groups[groupIndex].files,
        oldIndex,
        newIndex
      );
    },
    groupInit: {
      //Handle adding of new empty Group
      reducer(state, action) {
        state.value.groups.push(action.payload);
        state.value.groups[state.value.groups.length - 1].title = `GROUP ${state.value.groups.length}`;
      },
      prepare() {
        return {
          payload: {
            id: nanoid(),
            title: `Untitled`,
            isEnabled: true,
            isShowHidden: false,
            hasHiddenFiles: false,
            isRunning: false,
            isDir: null, //true - added all Dir, false - added separate files, null - waiting for first add
            baseDir: null,
            status: status.UNKNOWN,
            messages: {
              numErrors: null,
              numWarnings: null,
              numNotice: null,
            },
            settings: {
              logOutputFolder: "",
              lstOutputFolder: "",
              sysParms: "",
            },
            files: [],
          },
        };
      },
    },
    saveGroupSettings: (state, action) => {
      const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
      state.value.groups[groupIndex].settings.logOutputFolder = action.payload.settings.logOutputFolder;
      state.value.groups[groupIndex].settings.lstOutputFolder = action.payload.settings.lstOutputFolder;
      state.value.groups[groupIndex].settings.sysParms = action.payload.settings.sysParms;
    },
    clearLogCheckResults: (state, action) => {
      if (action.payload.fileId) {
        const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileId);
        state.value.files[fileIndex].runError = null;
        state.value.files[fileIndex].exitCode = null;
        for (const [key] of Object.entries(state.value.files[fileIndex].messages)) {
          state.value.files[fileIndex].messages[key] = null;
        }
      } else if (action.payload.groupId) {
        for (const [key] of Object.entries(state.value.files)) {
          if (state.value.files[key].groupId === action.payload.groupId) {
            state.value.files[key].runError = null;
            state.value.files[key].exitCode = null;
            for (const [msg] of Object.entries(state.value.files[key].messages)) {
              state.value.files[key].messages[msg] = null;
            }
          }
        }
      } else {
        for (const [key] of Object.entries(state.value.files)) {
          state.value.files[key].runError = null;
          state.value.files[key].exitCode = null;
          for (const [msg] of Object.entries(state.value.files[key].messages)) {
            state.value.files[key].messages[msg] = null;
          }
        }
      }
    },
    logResults: (state, action) => {
      const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileId);
      state.value.files[fileIndex].messages.numErrors =
        action.payload.e + action.payload.em + action.payload.eq + action.payload.eo;
      state.value.files[fileIndex].messages.numWarnings = action.payload.w + action.payload.wm + action.payload.wq;
      state.value.files[fileIndex].messages.numNotice = action.payload.np + action.payload.nr;
      state.value.files[fileIndex].messages.numNoticeAll = action.payload.n + action.payload.nm + action.payload.nq;
      state.value.files[fileIndex].messages.e = action.payload.e;
      state.value.files[fileIndex].messages.em = action.payload.em;
      state.value.files[fileIndex].messages.eq = action.payload.eq;
      state.value.files[fileIndex].messages.eo = action.payload.eo;
      state.value.files[fileIndex].messages.w = action.payload.w;
      state.value.files[fileIndex].messages.wm = action.payload.wm;
      state.value.files[fileIndex].messages.wq = action.payload.wq;
      state.value.files[fileIndex].messages.n = action.payload.n;
      state.value.files[fileIndex].messages.nm = action.payload.nm;
      state.value.files[fileIndex].messages.nq = action.payload.nq;
      state.value.files[fileIndex].messages.nr = action.payload.nr;
      state.value.files[fileIndex].messages.np = action.payload.np;

      if (action.payload.end) state.value.files[fileIndex].isLogChecking = false;
    },
    runCheckLog: (state, action) => {
      if (action.payload && action.payload.hasOwnProperty("exitCode")) {
        const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileIds[0]);

        const path = state.value.files[fileIndex].log.logPath;
        //console.log(path);
        state.value.files[fileIndex].logInfo = { ...fileStats(path) };

        if (path && state.value.files[fileIndex].logInfo.fileExist) {
          state.value.files[fileIndex].isLogChecking = true;
          window.fileAPI.logCheck({ fileId: action.payload.fileIds[0], path: path });
        }
      }
    },

    runLogViewer: (state, action) => {
      window.fileAPI.logViewRun({
        fileId: action.payload.fileId,
        runHidden: false,
        app: [action.payload.logViewerPath, '"' + action.payload.logPath + '"'],
      });
    },

    runApp: (state, action) => {
      //means that it is actioned by App Exit event
      if (action.payload && action.payload.hasOwnProperty("exitCode")) {
        //console.log(`Payload: ${JSON.stringify(action.payload)}`);
        if (state.value.runningFiles.length > 0) {
          const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileIds[0]);
          //const groupIndex = state.value.groups.findIndex((group) => group.id === state.value.files[fileIndex].groupId);

          state.value.files[fileIndex].exitCode = action.payload.exitCode;
          state.value.files[fileIndex].runError = action.payload.error;
          state.value.runningFiles = state.value.runningFiles.filter((el) => el.id !== action.payload.fileIds[0]);

          state.value.files[fileIndex].isRunning = false;

          if (state.value.filesToRun.length > 0) {
            //run next program
            const fileIndex = state.value.files.findIndex((file) => file.id === state.value.filesToRun[0]);
            const groupIndex = state.value.groups.findIndex(
              (group) => group.id === state.value.files[fileIndex].groupId
            );
            state.value.runningFiles.push(state.value.files[fileIndex]);
            state.value.filesToRun.shift();

            //const run =
            window.fileAPI.runApp({
              fileId: state.value.files[fileIndex].id,
              runHidden: state.value.runParams.runSasHidden,
              app: [
                state.value.runParams.sasExecPath,
                "-sysin",
                '"' +
                  window.fileAPI.path.join(
                    state.value.files[fileIndex].file.dir,
                    state.value.files[fileIndex].file.base
                  ) +
                  '"',
                "-CONFIG",
                '"' + state.value.runParams.sasCfgPath + '"',
                "-Print",
                '"' + state.value.groups[groupIndex].settings.lstOutputFolder + '"',
                "-Log",
                '"' + state.value.groups[groupIndex].settings.logOutputFolder + '"',
                "-sysparm",
                '"' + state.value.groups[groupIndex].settings.sysParms + '"',
                state.value.runParams.sasParams,
                state.value.runParams.sasParams1,
              ],
            });

            //console.log(run);

            //if (!run.error) {
            state.value.files[fileIndex].isRunning = true;
            //} else {
            //   state.value.files[fileIndex].runError = run.error;
            //   state.value.runningFiles.shift();
            //  }
          }
        }
      } else if (action.payload && action.payload.fileIds && action.payload.fileIds.length >= 0) {
        //means we called this to initiate batch run
        const { fileIds, sasCfgPath, sasExecPath, sasParams, sasParams1, runSasHidden } = action.payload;
        if (fileIds.length === 0) {
          //empty array means we want to run the whole job
          for (let i = 0; i < state.value.groups.length; i++) {
            if (state.value.groups[i].isEnabled) {
              //let enabledFiles = state.value.files.filter((e) => e.isEnabled === true);
              let files = state.value.groups[i].files.filter((e) =>
                state.value.files.find((f) => f.id === e && f.isEnabled === true)
              );
              state.value.filesToRun = [...state.value.filesToRun, ...files];
            }
          }
        } else state.value.filesToRun = [...state.value.filesToRun, ...fileIds];
        if (state.value.filesToRun.length === 0) return;
        state.value.runParams = { sasCfgPath, sasExecPath, sasParams, sasParams1, runSasHidden };

        //console.log(`files to run: ${JSON.stringify(state.value.filesToRun)}`);
        const fileIndex = state.value.files.findIndex((file) => file.id === state.value.filesToRun[0]);
        const groupIndex = state.value.groups.findIndex((group) => group.id === state.value.files[fileIndex].groupId);
        state.value.runningFiles.push(state.value.files[fileIndex]);
        //console.log(`Running file: ${JSON.stringify(state.value.runningFiles)}`);
        state.value.filesToRun.shift();
        //console.log("Hidden: " + JSON.stringify(state.value.runParams.runSasHidden));
        //const run =
        window.fileAPI.runApp({
          fileId: state.value.files[fileIndex].id,
          runHidden: state.value.runParams.runSasHidden,
          app: [
            state.value.runParams.sasExecPath,
            "-sysin",
            '"' +
              window.fileAPI.path.join(state.value.files[fileIndex].file.dir, state.value.files[fileIndex].file.base) +
              '"',
            "-CONFIG",
            '"' + state.value.runParams.sasCfgPath + '"',
            "-Print",
            '"' + state.value.groups[groupIndex].settings.lstOutputFolder + '"',
            "-Log",
            '"' + state.value.groups[groupIndex].settings.logOutputFolder + '"',
            "-sysparm",
            '"' + state.value.groups[groupIndex].settings.sysParms + '"',
            state.value.runParams.sasParams,
            state.value.runParams.sasParams1,
          ],
        });

        //if (!run.error) {
        state.value.files[fileIndex].isRunning = true;
        // } else {
        //   state.value.files[fileIndex].runError = run.error;
        //  state.value.runningFiles.shift();
        // }
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  groupInit,
  dragGroupMove,
  groupTitleEdited,
  groupEnabled,
  addFiles,
  fileEnabled,
  dragFileMove,
  fileHide,
  setGroupShowHidden,
  runApp,
  logResults,
  sortGroup,
  saveJob,
  loadJob,
  setIsLoading,
  runCheckLog,
  setTitle,
  setSaved,
  saveGroupSettings,
  runLogViewer,
  clearLogCheckResults,
  setJobRunning,
  stopJobExecution,
  setFileRunning,
  onApplicationClose,
  getSavedJobsList,
  deleteGroup,
} = jobSlice.actions;

export const updateDirAsync = (groupId, baseDir) => async (dispatch) => {
  window.fileAPI.fs.readdir(baseDir, { withFileTypes: true }, (err, dir) => {
    const files = dir.map((e) => window.fileAPI.path.join(baseDir, e.name));
    dispatch(addFiles(groupId, files, true));
    //console.log(files);
  });
};

export const getSavedJobsListAsync = (dir) => async (dispatch) => {
  window.fileAPI.fs.readdir(dir, { withFileTypes: true }, (err, fls) => {
    const files = fls
      .map((e) => window.fileAPI.path.parse(window.fileAPI.path.join(dir, e.name)))
      .filter(
        (e) =>
          e.ext === ".sdb" &&
          e.name.toUpperCase().indexOf("WISELOCALSETTINGS") < 0 &&
          e.name.toUpperCase().indexOf("WISEGLOBALSETTINGS") < 0
      );
    dispatch(getSavedJobsList(files));
    //console.log(files);
  });
};

export const updateJobAsync = () => async (dispatch, getState) => {
  const state = getState().job.value;
  for (let i = 0; i < state.groups.length; i++) {
    if (state.groups[i].isDir === true) {
      const base = state.groups[i].baseDir;
      const id = state.groups[i].id;
      window.fileAPI.fs.readdir(base, { withFileTypes: true }, async (err, dir) => {
        const files = dir.map((e) => window.fileAPI.path.join(base, e.name));
        dispatch(addFiles(id, files, true));
      });
    } else if (state.groups[i].isDir === false) {
      const fls = [];
      const id = state.groups[i].id;
      const files = state.files.filter((e) => e.groupId === id);
      for (let j = 0; j < files.length; j++) {
        fls.push(window.fileAPI.path.join(files[j].file.dir, files[j].file.base));
        //console.log(JSON.stringify(state.files));
      }
      dispatch(addFiles(state.groups[i].id, fls, false));
    }
  }
};

export const loadJobAsync = (path, name) => async (dispatch) => {
  //console.log(path + "/" + name);
  const db = await window.fileAPI.initDb(path, name, { value: {} });
  const job = await window.fileAPI.getDb(name, "db.value");
  dispatch(loadJob(job));
};

export const addFilesAsync = (groupId, baseDir) => async (dispatch) => {
  const files = await window.fileAPI.openFile(baseDir);
  dispatch(addFiles(groupId, files, false));
};

export const addDirAsync = (groupId) => async (dispatch) => {
  const files = await window.fileAPI.openDir();
  dispatch(addFiles(groupId, files, true));
};

export default jobSlice.reducer;
