import IconButton from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import {
  addFilesAsync,
  addDirAsync,
  setGroupShowHidden,
  sortGroup,
  updateDirAsync,
  saveGroupSettings,
  updateJobAsync,
  clearLogCheckResults,
  deleteGroup,
  setAllFilesChecked,
} from "../features/job/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import GroupSettingsDialog from "./GroupSettingsDilaog";
import { useState } from "react";
import { Divider } from "@mui/material";

export default function GroupMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { groupId, handleExpanded, handleRunGroup } = props;
  const { hasHiddenFiles, isDir, baseDir, isShowHidden } = useSelector((state) =>
    state.job.value.groups.find((e) => e.id === groupId)
  );
  const isRunning = useSelector((state) => state.job.value.isRunning);

  const [groupSettingsOpen, setgroupSettigsOpen] = useState(false);

  const handleSettingsOpen = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    setgroupSettigsOpen(true);
  };
  const handleSettingsCancel = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setgroupSettigsOpen(false);
  };
  const handleSettingsSave = (event, props) => {
    event.stopPropagation();
    //console.log(props);
    setgroupSettigsOpen(false);
    dispatch(
      saveGroupSettings({
        groupId: props.groupId,
        settings: {
          logOutputFolder: props.logOutputFolder,
          lstOutputFolder: props.lstOutputFolder,
          sysParms: props.sysParms,
        },
      })
    );
    dispatch(updateJobAsync());
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAddFiles = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    dispatch(addFilesAsync({ groupId, baseDir }))
      .unwrap()
      .then(() => handleExpanded(event, true))
      .catch(() => {});
  };

  const handleUpdateDir = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    dispatch(clearLogCheckResults({ groupId }));
    dispatch(updateDirAsync(groupId, baseDir));
    //handleExpanded(event, true);
  };

  const handleAddDir = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    dispatch(addDirAsync({ groupId }))
      .unwrap()
      .then(() => handleExpanded(event, true))
      .catch(() => {});
  };

  const handleShowHidden = (event) => {
    event.stopPropagation();
    dispatch(setGroupShowHidden({ groupId }));
    setAnchorEl(null);
  };

  const handleSortGroup = (event) => {
    event.stopPropagation();
    dispatch(sortGroup({ groupId }));
    setAnchorEl(null);
  };

  const handleRunGroupItem = (event) => {
    event.stopPropagation();
    handleRunGroup();
    setAnchorEl(null);
  };

  const handleDeleteGroup = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
    dispatch(deleteGroup({ groupId }));
  };

  const handleSetAllChecked = (event, isEnabled) => {
    setAnchorEl(null);
    event.stopPropagation();
    dispatch(setAllFilesChecked({ groupId, isEnabled }));
  };

  return (
    <Box>
      <IconButton
        size="small"
        edge="start"
        color="primary"
        aria-label="group_menu"
        id="group-button"
        disabled={isRunning}
        aria-controls={open ? "group-menu" : undefined}
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
          "aria-labelledby": "group-button",
        }}>
        <MenuItem dense disabled={isDir === true} onClick={handleAddFiles}>
          Add Files
        </MenuItem>
        <MenuItem dense disabled={isDir !== null} onClick={handleAddDir}>
          Add Folder
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={handleRunGroupItem}>
          Run Group
        </MenuItem>
        <MenuItem dense onClick={handleSortGroup}>
          Sort Group
        </MenuItem>
        <MenuItem dense disabled={isDir == null || isDir === false} onClick={handleUpdateDir}>
          Update Group
        </MenuItem>
        <MenuItem dense disabled={!hasHiddenFiles} onClick={handleShowHidden}>
          {isShowHidden ? "Hide Removed" : "Show Removed"}
        </MenuItem>

        <MenuItem dense onClick={handleDeleteGroup}>
          Delete Group
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={(event) => handleSetAllChecked(event, true)}>
          Check All
        </MenuItem>
        <MenuItem dense onClick={(event) => handleSetAllChecked(event, false)}>
          UnCheck All
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={handleSettingsOpen}>
          Settings
        </MenuItem>
      </Menu>
      <GroupSettingsDialog
        handleCancel={handleSettingsCancel}
        handleSave={handleSettingsSave}
        isOpen={groupSettingsOpen}
        groupId={groupId}
      />
    </Box>
  );
}
