import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import MainMenu from "./MainMenu";
import { useSelector, useDispatch } from "react-redux";
import { groupInit } from "../features/job/jobSlice";

export default function WiseAppBar() {
  const { title, isSaved, isRunable } = useSelector((state) => state.job.value);
  const { projectName } = useSelector((state) => state.application.value);
  const dispatch = useDispatch();

  return (
    <AppBar position="sticky" sx={{ mr: 0, ml: 0 }}>
      <Toolbar variant="dense" disableGutters sx={{ paddingLeft: 0.5 }}>
        <Typography variant="body2" component="div" sx={{ flexGrow: 2 }}>
          <Box sx={{ paddingTop: 0 }}>PROJECT:</Box> {projectName}
        </Typography>
        <Typography variant="body2" component="div" sx={{ flexGrow: 1 }}>
          <Box sx={{ paddingTop: 0 }}>JOB:</Box>
          <Typography
            variant="inherit"
            sx={isSaved ? {} : { fontStyle: "italic" }}
          >
            {title} {isSaved ? "" : "*"}
          </Typography>
        </Typography>
        <Button
          size="small"
          variant="contained"
          sx={{ padding: "0 10px", mr: 1 }}
          disabled={!isRunable}
        >
          RUN JOB
        </Button>
        <Button
          size="small"
          variant="contained"
          sx={{ padding: "0 10px" }}
          onClick={() => dispatch(groupInit())}
        >
          ADD GROUP
        </Button>
        <MainMenu />
      </Toolbar>
    </AppBar>
  );
}
