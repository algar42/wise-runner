import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

export default function FileContextMenu(props) {
  const { contextMenu, handleClose, handleHide, isHidden } = props;
  //style={{ cursor: 'context-menu' }}

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem dense onClick={handleClose}>
        Run
      </MenuItem>

      <MenuItem dense onClick={handleHide}>
        {isHidden ? "Unhide" : "Hide"}
      </MenuItem>
    </Menu>
  );
}
