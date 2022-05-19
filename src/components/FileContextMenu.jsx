import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useSelector } from "react-redux";

export default function FileContextMenu(props) {
  const { contextMenu, handleClose, handleHide, isHidden, handleAppRun } = props;
  //style={{ cursor: 'context-menu' }}
  const isRunning = useSelector((state) => state.job.value.isRunning);

  return (
    <Menu
      sx={{
        "div.MuiPaper-root": {
          transition: "none !important",
        },
      }}
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}>
      <MenuItem dense onClick={handleAppRun} disabled={isRunning}>
        Run
      </MenuItem>

      <MenuItem dense onClick={handleHide}>
        {isHidden ? "Undo Remove" : "Remove"}
      </MenuItem>
    </Menu>
  );
}
