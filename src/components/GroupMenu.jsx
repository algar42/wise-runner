import React from "react";
import IconButton from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { addFilesAsync, addDirAsync, setGroupShowHidden } from "../features/job/jobSlice";
import { useDispatch, useSelector } from "react-redux";

export default function GroupMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { groupId, handleExpanded, handleRunGroup } = props;
  const { hasHiddenFiles, isDir, baseDir } = useSelector((state) =>
    state.job.value.groups.find((e) => e.id === groupId)
  );

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
    dispatch(addFilesAsync(groupId, baseDir));
    setAnchorEl(null);
    handleExpanded(event, true);
  };

  const handleAddDir = (event) => {
    event.stopPropagation();
    dispatch(addDirAsync(groupId));
    setAnchorEl(null);
    handleExpanded(event, true);
  };

  const handleShowHidden = (event) => {
    event.stopPropagation();
    dispatch(setGroupShowHidden({ groupId }));
    setAnchorEl(null);
  };

  const handleRunGroupItem = (event) => {
    event.stopPropagation();
    handleRunGroup();
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        size="small"
        edge="start"
        color="primary"
        aria-label="group_menu"
        id="group-button"
        aria-controls={open ? "group-menu" : undefined}
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
          "aria-labelledby": "group-button",
        }}>
        <MenuItem dense disabled={isDir === true} onClick={handleAddFiles}>
          Add Files
        </MenuItem>
        <MenuItem dense disabled={isDir !== null} onClick={handleAddDir}>
          Add Folder
        </MenuItem>
        <MenuItem dense disabled={!hasHiddenFiles} onClick={handleShowHidden}>
          Show Removed
        </MenuItem>
        <MenuItem dense onClick={handleRunGroupItem}>
          Run Group
        </MenuItem>
        <MenuItem dense onClick={handleClose}>
          Delete Group
        </MenuItem>
      </Menu>
    </Box>
  );
}
