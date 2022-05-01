import React from "react";
import { useState, useCallback } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import DialogTitle from "@mui/material/DialogTitle";

export default function EditGroupTitle(props) {
  const { isOpen, groupTitle, groupId, handleClose, handleOpen } = props;
  const [textValue, setTextValue] = useState(groupTitle);

  const handleInputChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleDialogClose = (action) => {
    handleOpen(false);
    handleClose(action, groupId, textValue);
  };

  const callbackRef = useCallback((inputElement) => {
    setTimeout(() => {
      if (inputElement) {
        inputElement.focus();
      }
    }, 15);
  }, []);

  return (
    <div>
      <Dialog open={isOpen} maxWidth="lg" onClose={() => handleDialogClose("")}>
        <DialogTitle>Enter New Name</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={callbackRef}
            margin="dense"
            id="name"
            label={groupTitle}
            type="text"
            fullWidth
            variant="standard"
            onChange={handleInputChange}
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                handleDialogClose("OK");
                ev.preventDefault();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose("CANCEL")}>Cancel</Button>
          <Button onClick={() => handleDialogClose("OK")}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
