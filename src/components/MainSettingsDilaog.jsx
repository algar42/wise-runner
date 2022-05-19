import Button from "@mui/material/Button";
import { TextField, Grid, Switch, FormGroup, FormControlLabel } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function MainSettingsDialog(props) {
  const { handleCancel, handleSave, isOpen } = props;
  const settings = useSelector((state) => state.application.value.settings);

  const [execPath, setExecPath] = useState(settings.sasExecPath);
  const [cfgPath, setcfgPath] = useState(settings.sasCfgPath);
  const [params, setParams] = useState(settings.sasParams);
  const [params1, setParams1] = useState(settings.sasParams1);
  const [runHidden, setRunHidden] = useState(settings.runSasHidden);
  const [logViewerPath, setlogViewerPath] = useState(settings.logViewerPath);

  useEffect(() => {
    setExecPath(settings.sasExecPath);
    setcfgPath(settings.sasCfgPath);
    setParams(settings.sasParams);
    setParams1(settings.sasParams1);
    setRunHidden(settings.runSasHidden);
    setlogViewerPath(settings.logViewerPath);
  }, [settings]);

  const handleInputChange = (event) => {
    switch (event.target.id) {
      case "sasExecPath":
        setExecPath(event.target.value);
        break;
      case "sasCfgPath":
        setcfgPath(event.target.value);
        break;
      case "sasParams":
        setParams(event.target.value);
        break;
      case "sasParams1":
        setParams1(event.target.value);
        break;
      case "runHidden":
        setRunHidden(Boolean(event.target.checked));
        break;
      case "logViewerPath":
        setlogViewerPath(event.target.value);
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
      fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              size="small"
              id="sasExecPath"
              label="Path to SAS Executable"
              defaultValue={settings.sasExecPath}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              size="small"
              id="sasCfgPath"
              label="Path to SAS Configuration"
              defaultValue={settings.sasCfgPath}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="sasParams"
              label="SAS Parameters"
              defaultValue={settings.sasParams}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="sasParams1"
              label="Additional SAS Parameters"
              defaultValue={settings.sasParams1}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={4}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    id="runHidden"
                    checked={runHidden}
                    onChange={handleInputChange}
                    inputProps={{ "aria-label": "run-sas-hidden" }}
                  />
                }
                label="Run SAS hidden"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="logViewerPath"
              label="SAS Log View Application Path"
              defaultValue={settings.logViewerPath}
              margin="dense"
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={() => handleSave({ execPath, cfgPath, params, params1, runHidden, logViewerPath })}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
