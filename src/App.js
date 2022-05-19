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
} from "./features/job/jobSlice";
import { Grid, Container } from "@mui/material";
import WiseAppBar from "./components/WiseAppBar";
import JobGroup from "./components/JobGroup";
import { Scrollbars } from "react-custom-scrollbars-2";

function App() {
  //const workdir = useSelector((state) => state.application.value.workPath);
  //const job = useSelector((state) => state.job.value);
  const dispatch = useDispatch();
  const metadataPath = useSelector((state) => state.application.value.metadataPath);
  const isClosed = useSelector((state) => state.job.value.isAppClosed);
  const isLoading = useSelector((state) => state.job.value.isLoading);
  const anyFileRunning = useSelector((state) =>
    state.job.value.files.map(({ isRunning }) => isRunning).every((e) => e === false)
  );

  //to watch changes to decide if we need saving
  const wFiles = useSelector((state) => state.job.value.groups.map(({ files }) => files), shallowEqual);
  const wGroupsTitle = useSelector((state) => state.job.value.groups.map(({ title }) => title), shallowEqual);
  const wGroupsIds = useSelector((state) => state.job.value.groups.map(({ id }) => id), shallowEqual);

  useEffect(() => {
    if (isLoading === false) {
      dispatch(setSaved(false));
      console.log("here");
    }
  }, [wFiles, wGroupsTitle, wGroupsIds]);

  useEffect(() => {
    dispatch(setJobRunning(!anyFileRunning));
  }, [anyFileRunning]);

  useEffect(() => {
    if (isClosed) {
      window.fileAPI.applicationClosed();
    }
  }, [isClosed]);

  useEffect(() => {
    dispatch(appInitAsync());
    dispatch(globalSettingsInitAsync());
    dispatch(groupInit());
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
    //console.log(workdir);
  }, []);

  useEffect(() => {
    //console.log(metadataPath);
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
    </Grid>
  );
}

export default App;
