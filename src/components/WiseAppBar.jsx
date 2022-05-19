import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import MainMenu from "./MainMenu";
import { useSelector, useDispatch } from "react-redux";
import { groupInit } from "../features/job/jobSlice";
import { runApp, stopJobExecution, clearLogCheckResults } from "../features/job/jobSlice";

export default function WiseAppBar() {
  const { title, isSaved, isRunable, isRunning } = useSelector((state) => state.job.value);
  const { projectName } = useSelector((state) => state.application.value);
  const dispatch = useDispatch();
  const { sasExecPath, sasCfgPath, sasParams, sasParams1, runSasHidden } = useSelector(
    (state) => state.application.value.settings
  );

  const handleRunJob = () => {
    dispatch(clearLogCheckResults({}));
    dispatch(runApp({ fileIds: [], sasExecPath, sasCfgPath, sasParams, sasParams1, runSasHidden }));
  };

  const handleStopJob = () => {
    dispatch(stopJobExecution());
  };

  return (
    <AppBar position="sticky" sx={{ mr: 0, ml: 0 }}>
      <Toolbar variant="dense" disableGutters sx={{ paddingLeft: 0.5 }}>
        <Typography variant="body2" component="div" sx={{ flexGrow: 2 }}>
          <Box sx={{ paddingTop: 0 }}>PROJECT:</Box> {projectName}
        </Typography>
        <Typography variant="body2" component="div" sx={{ flexGrow: 1 }}>
          <Box sx={{ paddingTop: 0 }}>JOB:</Box>
          <Typography variant="inherit">{title}</Typography>
        </Typography>

        {!isRunning ? (
          <Button
            size="small"
            variant="contained"
            sx={{ padding: "0 10px", mr: 1 }}
            disabled={!isRunable || isRunning}
            onClick={() => handleRunJob()}>
            RUN JOB
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            color="error"
            sx={{ padding: "0 10px", mr: 1 }}
            disabled={!isRunable}
            onClick={() => handleStopJob()}>
            STOP JOB
          </Button>
        )}
        <Button size="small" variant="contained" sx={{ padding: "0 10px" }} onClick={() => dispatch(groupInit())}>
          ADD GROUP
        </Button>
        <MainMenu />
      </Toolbar>
    </AppBar>
  );
}

/*
<Typography variant="inherit" sx={isSaved ? {} : { fontStyle: "italic" }}>
            {title} {isSaved ? "" : "*"}
          </Typography>*/
