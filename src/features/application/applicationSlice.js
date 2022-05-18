import { createSlice } from "@reduxjs/toolkit";

export const applicationSlice = createSlice({
  name: "application",
  initialState: {
    value: {
      workPath: "",
      metadataPath: "",
      rootPath: "",
      isValidProject: false,
      projectName: "Unknown Project",
      settings: {},
    },
  },
  reducers: {
    appInit: (state, action) => {
      state.value.workPath = action.payload;
      //try to parse path and find if it is project path or not
      const root = action.payload.match(/.+?\\analysis/i);
      //console.log(root);
      if (root && root.length > 0) {
        state.value.rootPath = root[0];
        const pths = root[0].split(window.fileAPI.path.sep);
        if (pths && pths.length >= 2) state.value.projectName = pths[pths.length - 2].toUpperCase();
        if (window.fileAPI.fs.existsSync(window.fileAPI.path.join(root[0], "\\metadata\\Wiserunner"))) {
          state.value.metadataPath = window.fileAPI.path.join(root[0], "\\metadata\\Wiserunner");
        } else state.value.metadataPath = action.payload;
      } else {
        state.value.rootPath = action.payload;
        state.value.metadataPath = action.payload;
      }
    },
    globalSettingsInit: (state, action) => {
      state.value.settings = action.payload;
    },
    localSettingsInit: (state, action) => {
      if (action.payload && action.payload.settings) {
        state.value.settings = { ...state.value.settings, ...action.payload.settings };
      }
      //console.log(`local set: ${JSON.stringify(state.value.settings)}`);
    },
    saveLocalSettings: (state, action) => {
      if (action.payload && action.payload.settings) {
        state.value.settings = { ...state.value.settings, ...action.payload.settings };
      }
      //console.log(JSON.stringify(state.value.settings));
      //console.log(JSON.stringify(action.payload.settings));
      window.fileAPI.saveDb("wiselocalsettings", { settings: { ...state.value.settings } });
    },
  },
});

// Action creators are generated for each case reducer function
export const { appInit, globalSettingsInit, localSettingsInit, saveLocalSettings } = applicationSlice.actions;

export const appInitAsync = () => async (dispatch) => {
  const init = await window.fileAPI.getInit();
  //console.log(init);
  dispatch(appInit(init.workPath));
};
export const globalSettingsInitAsync = () => async (dispatch) => {
  const init = await window.fileAPI.getDb("globCfgDb", "db.settings");
  console.log(init);
  dispatch(globalSettingsInit(init));
};

export const locallSettingsInitAsync = (path) => async (dispatch) => {
  //console.log(path);
  const init = await window.fileAPI.initDb(path, "wiselocalsettings", { settings: {} });
  //console.log(init);
  dispatch(localSettingsInit(init));
};

export default applicationSlice.reducer;
