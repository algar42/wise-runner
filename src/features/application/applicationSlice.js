import { createSlice } from "@reduxjs/toolkit";

export const applicationSlice = createSlice({
  name: "application",
  initialState: {
    value: {
      workPath: "",
      isValidProject: false,
      projectName: "EPS_DS_DS7011-A-U101_80058219_UNBLINDED",
      settings: {},
    },
  },
  reducers: {
    appInit: (state, action) => {
      state.value.workPath = action.payload;
      //console.log(action.payload);
    },
    globalSettingsInit: (state, action) => {
      //console.log(action);
      state.value.settings = action.payload;
      console.log(state.value.settings);
    },
  },
});

// Action creators are generated for each case reducer function
export const { appInit, globalSettingsInit } = applicationSlice.actions;

export const appInitAsync = () => async (dispatch) => {
  const init = await window.fileAPI.getInit();
  //console.log(init);
  dispatch(appInit(init.workPath));
};
export const globalSettingsInitAsync = () => async (dispatch) => {
  const init = await window.fileAPI.getDb("globCfgDb", "global");
  //console.log(init);
  dispatch(globalSettingsInit(init));
};

export default applicationSlice.reducer;
