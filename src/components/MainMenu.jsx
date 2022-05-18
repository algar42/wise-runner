import { useState, useEffect } from "react";
import IconButton from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import MainSettingsDialog from "./MainSettingsDilaog";
import { saveLocalSettings } from "../features/application/applicationSlice";
import { saveJob, loadJobAsync, setIsLoading, updateJobAsync, setTitle, setSaved } from "../features/job/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import SaveJobDialog from "./SaveJobDialog";

export default function MainMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mainSettingsOpen, setMainSettigsOpen] = useState(false);
  const metadataPath = useSelector((state) => state.application.value.metadataPath);
  const isLoading = useSelector((state) => state.job.value.isLoading);
  const title = useSelector((state) => state.job.value.title);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const handleSettingsOpen = () => {
    setAnchorEl(null);
    setMainSettigsOpen(true);
  };

  useEffect(() => {
    if (isLoading) {
      dispatch(updateJobAsync());
      dispatch(setIsLoading(false));
    }
  }, [isLoading]);

  const handleSettingsCancel = () => {
    setMainSettigsOpen(false);
  };

  const handleSaveJob = () => {
    dispatch(saveJob({ path: metadataPath }));
    setAnchorEl(null);
  };

  const handleLoadJob = () => {
    dispatch(loadJobAsync(metadataPath, "test-job"));
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
  const handleSaveDialogClose = (action, title) => {
    if (action === "OK") {
      dispatch(setTitle(title));
      dispatch(saveJob({ path: metadataPath }));
      dispatch(setSaved(true));
    }
  };

  return (
    <Box>
      <IconButton
        size="small"
        edge="start"
        color="inherit"
        aria-label="main_menu"
        id="main-button"
        aria-controls={open ? "main-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{ minWidth: "48px" }}>
        <MenuIcon />
      </IconButton>

      <Menu
        id="main-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "main-button",
        }}>
        <MenuItem dense onClick={handleClose}>
          Jobs
        </MenuItem>
        <MenuItem dense onClick={handleSettingsOpen}>
          Settings
        </MenuItem>
        <MenuItem dense onClick={handleSaveDialogOpen}>
          Save Job
        </MenuItem>
        <MenuItem dense onClick={handleLoadJob}>
          Load Job
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
    </Box>
  );
}
