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
      isRunnig: false,
      isDone: false,
      status: status.UNKNOWN,
      groups: [],
      files: [],
    },
  },
  reducers: {
    setGroupShowHidden: (state, action) => {
      const groupIndex = state.value.groups.findIndex(
        (group) => group.id === action.payload.groupId
      );
      console.log(action.payload.groupId);
      state.value.groups[groupIndex].isShowHidden =
        !state.value.groups[groupIndex].isShowHidden;
    },
    fileHide: (state, action) => {
      console.log(action.payload);
      const fileIndex = state.value.files.findIndex(
        (file) => file.id === action.payload.fileId
      );
      const inGroup = state.value.files[fileIndex].groupId;
      const groupIndex = state.value.groups.findIndex(
        (group) => group.id === inGroup
      );
      //set hide flag...
      state.value.files[fileIndex].isHidden = action.payload.hide;
      //..and also disable file
      state.value.files[fileIndex].isEnabled = !action.payload.hide;
      //..and if file is hidden also set hasHidden flag to the group or if false then check if there are any other hidden files
      if (action.payload.hide) {
        state.value.groups[groupIndex].hasHiddenFiles = true;
      } else {
        const filter =
          state.value.files.filter(
            (e) => e.groupId === inGroup && e.isHidden === true
          ) || [];
        if (filter.length === 0)
          state.value.groups[groupIndex].hasHiddenFiles = false;
      }
    },
    addFiles: {
      //on file add dialog process received file names to the store
      reducer(state, action) {
        const groupIndex = state.value.groups.findIndex(
          (group) => group.id === action.payload.groupId
        );
        action.payload &&
          state.value.groups[groupIndex].files.push(...action.payload.ids);
        action.payload && state.value.files.push(...action.payload.files);
      },
      prepare(grpId, files) {
        //console.log(files);
        const pl = {
          payload: {
            groupId: grpId,
            files: [],
            ids: [],
          },
        };
        for (let i = 0; i < files.length; i++) {
          const fl = {
            id: nanoid(),
            isEnabled: true,
            isHidden: false,
            groupId: grpId,
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
      //handle enabling/disabling file
      const fileIndex = state.value.files.findIndex(
        (file) => file.id === action.payload.fileId
      );
      state.value.files[fileIndex].isEnabled = action.payload.enabled;
      //also unhide file if we are enabling it:
      if (action.payload.enabled) {
        state.value.files[fileIndex].isHidden = false;
      }
    },
    groupEnabled: (state, action) => {
      //handle Enabling/disabling Group
      const groupIndex = state.value.groups.findIndex(
        (group) => group.id === action.payload.groupId
      );
      state.value.groups[groupIndex].isEnabled = action.payload.enabled;
    },
    groupTitleEdited: (state, action) => {
      //handle Group title update
      const groupIndex = state.value.groups.findIndex(
        (group) => group.id === action.payload.groupId
      );
      state.value.groups[groupIndex].title =
        action.payload.groupTitle.toUpperCase();
    },
    dragGroupMove: (state, action) => {
      //hande group drag move.
      const { oldIndex, newIndex } = action.payload;
      state.value.groups = arrayMoveImmutable(
        state.value.groups,
        oldIndex,
        newIndex
      );
    },
    dragFileMove: (state, action) => {
      //Handle file move on drag event. Move file index in the file array
      const { groupId, oldIndex, newIndex } = action.payload;
      const groupIndex = state.value.groups.findIndex(
        (group) => group.id === groupId
      );
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
        state.value.groups[
          state.value.groups.length - 1
        ].title = `GROUP ${state.value.groups.length}`;
      },
      prepare() {
        return {
          payload: {
            id: nanoid(),
            title: `Untitled`,
            isEnabled: true,
            isShowHidden: true,
            hasHiddenFiles: false,
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
} = jobSlice.actions;

export const addFilesAsync = (groupId) => async (dispatch) => {
  const files = await window.fileAPI.openFile();
  dispatch(addFiles(groupId, files));
};
//export const loadJobAsync = () => async (dispatch) => {};

export default jobSlice.reducer;
