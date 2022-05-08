import { useState } from "react";
import IconButton from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import MainSettingsDialog from "./MainSettingsDilaog";
import { saveLocalSettings } from "../features/application/applicationSlice";
import { useDispatch } from "react-redux";

export default function MainMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mainSettingsOpen, setMainSettigsOpen] = useState(false);
  const dispatch = useDispatch();
  const handleSettingsOpen = () => {
    setAnchorEl(null);
    setMainSettigsOpen(true);
  };

  const handleSettingsCancel = () => {
    setMainSettigsOpen(false);
  };

  const handleSettingsSave = (props) => {
    console.log(props);
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
      </Menu>
      <MainSettingsDialog
        handleCancel={handleSettingsCancel}
        handleSave={handleSettingsSave}
        isOpen={mainSettingsOpen}
      />
    </Box>
  );
}
