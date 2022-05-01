import React from "react";
import IconButton from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { addFilesAsync, setGroupShowHidden } from "../features/job/jobSlice";
import { useDispatch, useSelector } from "react-redux";

export default function GroupMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { groupId } = props;
  const { hasHiddenFiles } = useSelector((state) =>
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

    dispatch(addFilesAsync(groupId));
    setAnchorEl(null);
  };

  const handleShowHidden = (event) => {
    event.stopPropagation();
    dispatch(setGroupShowHidden({ groupId }));
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
        sx={{ minWidth: "48px" }}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        id="main-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "group-button",
        }}
      >
        <MenuItem onClick={handleAddFiles}>Add Files</MenuItem>
        <MenuItem onClick={handleClose}>Add Folder</MenuItem>
        <MenuItem disabled={!hasHiddenFiles} onClick={handleShowHidden}>
          Show Removed
        </MenuItem>
        <MenuItem onClick={handleClose}>Delete Group</MenuItem>
      </Menu>
    </Box>
  );
}
