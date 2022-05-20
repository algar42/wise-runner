import { useState, useEffect } from "react";
import IconButton from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import MainSettingsDialog from "./MainSettingsDilaog";
import { Divider } from "@mui/material";
import { saveLocalSettings } from "../features/application/applicationSlice";
import {
  saveJob,
  loadJobAsync,
  setIsLoading,
  updateJobAsync,
  setTitle,
  setSaved,
  clearLogCheckResults,
  onApplicationClose,
  getSavedJobsListAsync,
} from "../features/job/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import SaveJobDialog from "./SaveJobDialog";
import LoadJobDialog from "./LoadJobDialog";

export default function MainMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mainSettingsOpen, setMainSettigsOpen] = useState(false);
  const metadataPath = useSelector((state) => state.application.value.metadataPath);
  const isLoading = useSelector((state) => state.job.value.isLoading);
  const isRunning = useSelector((state) => state.job.value.isRunning);
  const jobSaveRequest = useSelector((state) => state.job.value.jobSaveRequest);
  const title = useSelector((state) => state.job.value.title);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  const dispatch = useDispatch();
  const handleSettingsOpen = () => {
    setAnchorEl(null);
    setMainSettigsOpen(true);
  };

  useEffect(() => {
    if (jobSaveRequest) {
      setSaveDialogOpen(true);
    }
  }, [jobSaveRequest]);

  useEffect(() => {
    if (isLoading) {
      dispatch(updateJobAsync());
      dispatch(clearLogCheckResults({ fileId: null, groupId: null }));
      dispatch(setSaved(true));
      setTimeout(() => {
        dispatch(setIsLoading(false));
      }, 500);
    }
  }, [isLoading]);

  const handleSettingsCancel = () => {
    setMainSettigsOpen(false);
  };

  const handleLoadJob = (name) => {
    //dispatch(getSavedJobsListAsync(metadataPath));
    dispatch(loadJobAsync(metadataPath, name));
    setLoadDialogOpen(false);
    setAnchorEl(null);
  };

  const handleSettingsSave = (props) => {
    //console.log(props);
    setMainSettigsOpen(false);
    dispatch(
      saveLocalSettings({
        settings: {
          sasExecPath: props.execPath,
          sasCfgPath: props.cfgPath,
          sasParams: props.params,
          sasParams1: props.params1,
          runSasHidden: props.runHidden,
          logViewerPath: props.logViewerPath,
        },
      })
    );
  };

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSaveDialogOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setSaveDialogOpen(true);
  };

  const handleLoadDialogOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setLoadDialogOpen(true);
  };

  const handleSaveDialogClose = (action, title) => {
    if (action === "OK") {
      dispatch(setTitle(title));
      dispatch(saveJob({ path: metadataPath }));
      dispatch(setSaved(true));
      if (jobSaveRequest) dispatch(onApplicationClose(true));
    }
  };

  const handleLoadDialogClose = () => {
    setLoadDialogOpen(false);
  };

  return (
    <Box>
      <IconButton
        size="small"
        edge="start"
        color="inherit"
        aria-label="main_menu"
        id="main-button"
        disabled={isRunning}
        aria-controls={open ? "main-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{ minWidth: "48px" }}>
        <MenuIcon />
      </IconButton>

      <Menu
        sx={{
          "div.MuiPaper-root": {
            transition: "none !important",
          },
        }}
        id="main-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "main-button",
        }}>
        <MenuItem dense onClick={handleLoadDialogOpen}>
          Load Job
        </MenuItem>
        <MenuItem dense onClick={handleSaveDialogOpen}>
          Save Job
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={handleSettingsOpen}>
          Settings
        </MenuItem>
      </Menu>
      <MainSettingsDialog
        handleCancel={handleSettingsCancel}
        handleSave={handleSettingsSave}
        isOpen={mainSettingsOpen}
      />
      <SaveJobDialog
        isOpen={saveDialogOpen}
        title={title}
        handleClose={handleSaveDialogClose}
        handleOpen={setSaveDialogOpen}
      />
      <LoadJobDialog
        isOpen={loadDialogOpen}
        handleCancel={handleLoadDialogClose}
        handleLoad={handleLoadJob}
        metadataPath={metadataPath}
      />
    </Box>
  );
}
