import React from "react";
import { useEffect } from "react";
import "./App.css";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  appInitAsync,
  globalSettingsInitAsync,
  locallSettingsInitAsync,
} from "./features/application/applicationSlice";
import {
  groupInit,
  runApp,
  logResults,
  runCheckLog,
  setJobRunning,
  setFileRunning,
  onApplicationClose,
  setSaved,
  setIsLoading,
} from "./features/job/jobSlice";
import { Grid, Container, Backdrop, CircularProgress } from "@mui/material";
import WiseAppBar from "./components/WiseAppBar";
import JobGroup from "./components/JobGroup";
import { Scrollbars } from "react-custom-scrollbars-2";

function App() {
  //const workdir = useSelector((state) => state.application.value.workPath);
  //const job = useSelector((state) => state.job.value);
  const dispatch = useDispatch();
  const metadataPath = useSelector((state) => state.application.value.metadataPath);
  //const isAppClosing = useSelector((state) => state.job.value.isAppClosing);
  const isLoading = useSelector((state) => state.job.value.isLoading);
  const isSaved = useSelector((state) => state.job.value.isSaved);
  /*
  const anyFileRunning = useSelector(
    (state) => state.job.value.files.map(({ isRunning }) => isRunning).every((e) => e === false),
    shallowEqual
  );
*/
  const anyFileRunning = useSelector((state) =>
    state.job.value.files
      .map(({ isRunning, groupId }) => (isRunning ? groupId : null))
      .filter((e) => e !== null)
      .toString()
  );

  //to watch changes to decide if we need saving
  const wFilesId = useSelector((state) => state.job.value.groups.map(({ files }) => files), shallowEqual);
  const wGroupsTitle = useSelector((state) => state.job.value.groups.map(({ title }) => title), shallowEqual);
  const wGroupsIds = useSelector((state) => state.job.value.groups.map(({ id }) => id), shallowEqual);
  const wGroups = useSelector(
    (state) =>
      state.job.value.groups.map(({ isEnabled, isShowHidden, baseDir }) => [isEnabled, isShowHidden, baseDir]).flat(),
    shallowEqual
  );
  const wGroupsSetting = useSelector(
    (state) => state.job.value.groups.map(({ settings }) => settings).flat(),
    shallowEqual
  );
  const wFiles = useSelector(
    (state) =>
      state.job.value.files
        .map(({ isEnabled, isHidden, priorityGroup }) => [isEnabled, isHidden, priorityGroup])
        .flat(),
    shallowEqual
  );

  useEffect(() => {
    if (isLoading === "No" && isSaved === true) {
      dispatch(setSaved(false));
    }
    if (wGroupsIds.length === 0) {
      console.log("group init");
      dispatch(groupInit());
    }
  }, [wFilesId, wGroupsTitle, wGroupsIds, wGroups, wGroupsSetting, wFiles]);

  useEffect(() => {
    console.log(anyFileRunning);
    dispatch(setJobRunning(anyFileRunning));
  }, [anyFileRunning]);

  /*
  useEffect(() => {
    if (isClosed) {
      window.fileAPI.applicationClosed();
    }
  }, [isClosed]);
*/
  useEffect(() => {
    dispatch(appInitAsync());
    dispatch(globalSettingsInitAsync());

    setTimeout(() => {
      dispatch(setSaved(true));
    }, 300);

    window.fileAPI.handleAppFinish((event, args) => {
      dispatch(setFileRunning({ fileId: args.fileIds[0], isRunning: false }));
      dispatch(runCheckLog(args));
      dispatch(runApp(args));
    });
    window.fileAPI.logCheckResult((event, args) => dispatch(logResults(args)));
    window.fileAPI.handleApplicationClose((event) => {
      console.log("Rendered closing");
      dispatch(onApplicationClose());
    });
  }, []);

  useEffect(() => {
    metadataPath && dispatch(locallSettingsInitAsync(metadataPath));
  }, [metadataPath]);

  return (
    <Grid container spacing={1} sx={{ backgroundColor: "#fafafa" }}>
      <Grid item xs={12}>
        <WiseAppBar />
      </Grid>
      <Grid item xs={12} sx={{ height: "90vh" }}>
        <Container
          maxWidth="md"
          sx={{
            padding: 0,
            height: "90vh",
            //backgroundColor: "#fafafa",
            overflow: "hidden",
          }}>
          <Scrollbars
            autoHide
            // Hide delay in ms
            autoHideTimeout={500}
            // Duration for hide animation in ms.
            autoHideDuration={200}>
            <JobGroup />
          </Scrollbars>
        </Container>
      </Grid>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading === "Loading"}>
        <CircularProgress />
      </Backdrop>
    </Grid>
  );
}

export default App;
