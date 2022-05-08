import { createSlice, nanoid } from "@reduxjs/toolkit";
import { status } from "../../app/constants";
import { arrayMoveImmutable } from "array-move";

export const jobSlice = createSlice({
  name: "job",
  initialState: {
    value: {
      title: "Untitled-job",
      isRunable: false,
      isSaved: false,
      isRunning: false,
      runParams: {},
      status: status.UNKNOWN,
      groups: [],
      files: [],
      runningFiles: [],
      filesToRun: [],
    },
  },
  reducers: {
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
    addFiles: {
      //on file add dialog process received file names to the store
      reducer(state, action) {
        const groupIndex = state.value.groups.findIndex((group) => group.id === action.payload.groupId);
        action.payload && state.value.groups[groupIndex].files.push(...action.payload.ids);
        action.payload && state.value.files.push(...action.payload.files);
        if (action.payload.ids.length > 0) {
          state.value.groups[groupIndex].isDir = action.payload.isDir;
          state.value.groups[groupIndex].baseDir = action.payload.baseDir;
          state.value.isRunable = true;
        }
        //assign log and lst paths
        if (action.payload.files && action.payload.files.length > 0) {
          try {
            const pb = window.fileAPI.path.normalize(window.fileAPI.path.join(action.payload.files[0].file.dir, ".."));
            if (pb) {
              const log = window.fileAPI.path.join(pb, "log");
              const lst = window.fileAPI.path.join(pb, "output");
              if (window.fileAPI.fs.existsSync(log)) {
                state.value.groups[groupIndex].settings.logOutputFolder = log;
              } else state.value.groups[groupIndex].settings.logOutputFolder = action.payload.files[0].file.dir;
              if (window.fileAPI.fs.existsSync(lst)) {
                state.value.groups[groupIndex].settings.lstOutputFolder = lst;
              } else state.value.groups[groupIndex].settings.lstOutputFolder = action.payload.files[0].file.dir;
            }
          } catch {
            state.value.groups[groupIndex].settings.logOutputFolder = action.payload.files[0].file.dir;
            state.value.groups[groupIndex].settings.lstOutputFolder = action.payload.files[0].file.dir;
          }
        }
      },
      prepare(grpId, files, isDir) {
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
            exitCode: null,
            runError: null,
            status: status.UNKNOWN,
            messages: {
              numErrors: null,
              numWarnings: null,
              numNotice: null,
            },
            file: window.fileAPI.path.parse(files[i]),
          };
          pl.payload.files.push(fl);
          pl.payload.ids.push(fl.id);
        }
        return pl;
      },
    },
    fileEnabled: (state, action) => {
      console.log(action.payload);
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
            isShowHidden: true,
            hasHiddenFiles: false,
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
            },
            files: [],
          },
        };
      },
    },
    logResults: (state, action) => {
      const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileId);
      state.value.files[fileIndex].messages.numErrors = action.payload.e + action.payload.em + action.payload.eq;
      state.value.files[fileIndex].messages.numWarnings = action.payload.w + action.payload.wm + action.payload.wq;
      state.value.files[fileIndex].messages.numNotice = action.payload.n + action.payload.nm + action.payload.nq;
    },

    runApp: (state, action) => {
      //means that it is actioned by App Exit event
      if (action.payload && action.payload.hasOwnProperty("exitCode")) {
        //console.log(`Payload: ${JSON.stringify(action.payload)}`);
        if (state.value.runningFiles.length > 0) {
          const fileIndex = state.value.files.findIndex((file) => file.id === action.payload.fileIds[0]);
          const groupIndex = state.value.groups.findIndex((group) => group.id === state.value.files[fileIndex].groupId);
          state.value.files[fileIndex].isRunning = false;
          state.value.files[fileIndex].exitCode = action.payload.exitCode;
          state.value.files[fileIndex].runError = action.payload.error;
          state.value.runningFiles = state.value.runningFiles.filter((el) => el.id !== action.payload.fileIds[0]);

          //run logChecker
          const path =
            state.value.groups[groupIndex].settings.logOutputFolder +
            "\\" +
            state.value.files[fileIndex].file.name +
            ".log";
          //console.log(path);
          window.fileAPI.logCheck({ fileId: action.payload.fileIds[0], path: path }).then((res) => console.log(res));

          if (state.value.filesToRun.length > 0) {
            //run next program
            const fileIndex = state.value.files.findIndex((file) => file.id === state.value.filesToRun[0]);
            const groupIndex = state.value.groups.findIndex(
              (group) => group.id === state.value.files[fileIndex].groupId
            );
            state.value.runningFiles.push(state.value.files[fileIndex]);
            state.value.filesToRun.shift();

            const run = window.fileAPI.runApp({
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
                state.value.runParams.sasParams,
                state.value.runParams.sasParams1,
              ],
            });

            //console.log(run);

            if (!run.error) {
              state.value.files[fileIndex].isRunning = true;
            } else {
              state.value.files[fileIndex].runError = run.error;
              state.value.runningFiles.shift();
            }
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
        } else state.value.filesToRun = [...fileIds];
        if (state.value.filesToRun.length === 0) return;
        state.value.runParams = { sasCfgPath, sasExecPath, sasParams, sasParams1, runSasHidden };

        //console.log(`files to run: ${JSON.stringify(state.value.filesToRun)}`);
        const fileIndex = state.value.files.findIndex((file) => file.id === state.value.filesToRun[0]);
        const groupIndex = state.value.groups.findIndex((group) => group.id === state.value.files[fileIndex].groupId);
        state.value.runningFiles.push(state.value.files[fileIndex]);
        //console.log(`Running file: ${JSON.stringify(state.value.runningFiles)}`);
        state.value.filesToRun.shift();
        //console.log("Hidden: " + JSON.stringify(state.value.runParams.runSasHidden));
        const run = window.fileAPI.runApp({
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
            state.value.runParams.sasParams,
            state.value.runParams.sasParams1,
          ],
        });

        if (!run.error) {
          state.value.files[fileIndex].isRunning = true;
        } else {
          state.value.files[fileIndex].runError = run.error;
          state.value.runningFiles.shift();
        }
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
} = jobSlice.actions;

export const addFilesAsync = (groupId, baseDir) => async (dispatch) => {
  const files = await window.fileAPI.openFile(baseDir);
  dispatch(addFiles(groupId, files, false));
};
export const addDirAsync = (groupId) => async (dispatch) => {
  const files = await window.fileAPI.openDir();
  dispatch(addFiles(groupId, files, true));
};
//export const runAppAsync = (fileId) => async (dispatch) => {
//  const run = await window.fileAPI.runApp({ fileId });
//  console.log(run);
//  dispatch(runApp(fileId));
//};
//export const loadJobAsync = () => async (dispatch) => {};

export default jobSlice.reducer;
