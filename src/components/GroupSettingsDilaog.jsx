import Button from "@mui/material/Button";
import { TextField, Grid, Switch, FormGroup, FormControlLabel } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function GroupSettingsDialog(props) {
  const { handleCancel, handleSave, isOpen, groupId } = props;
  const { settings, title } = useSelector((state) => state.job.value.groups.find((e) => e.id === groupId));

  const [logOutputFolder, setlogOutputFolderh] = useState();
  const [lstOutputFolder, setlstOutputFolder] = useState();
  const [sysParms, setsysParms] = useState();

  useEffect(() => {
    setlogOutputFolderh(settings.logOutputFolder);
    setlstOutputFolder(settings.lstOutputFolder);
    setsysParms(settings.sysParms);
  }, [settings]);

  const handleInputChange = (event) => {
    event.stopPropagation();
    switch (event.target.id) {
      case "logOutputFolder":
        setlogOutputFolderh(event.target.value);
        break;
      case "lstOutputFolder":
        setlstOutputFolder(event.target.value);
        break;
      case "sysParms":
        setsysParms(event.target.value);
        break;

      default:
        break;
    }
  };

  return (
    <Dialog
      sx={{
        "div.MuiDialog-container": {
          transition: "none !important",
        },
      }}
      open={isOpen}
      onClose={handleCancel}
      onClick={(e) => e.stopPropagation()}
      fullWidth>
      <DialogTitle>Group [{title}] Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              size="small"
              id="logOutputFolder"
              label="Path to SAS Logs output folder"
              defaultValue={settings.logOutputFolder}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              size="small"
              id="lstOutputFolder"
              label="Path to SAS Lst output folder"
              defaultValue={settings.lstOutputFolder}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="sysParms"
              label="SAS System Params"
              defaultValue={settings.sysParms}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={(e) => handleSave(e, { logOutputFolder, lstOutputFolder, sysParms, groupId })}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
