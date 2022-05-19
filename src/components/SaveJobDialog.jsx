import React from "react";
import { useState, useCallback, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import DialogTitle from "@mui/material/DialogTitle";

export default function SaveJobDialog(props) {
  const { isOpen, title, handleClose, handleOpen } = props;
  const [textValue, setTextValue] = useState(title);
  const [isUntitled, setIsUntitled] = useState(true);

  const handleInputChange = (event) => {
    setTextValue(event.target.value);
  };

  useEffect(() => {
    setTextValue(title);
  }, [title]);

  useEffect(() => {
    //setTextValue(title);
    if (textValue === "Untitled-job" || textValue === "") setIsUntitled(true);
    else setIsUntitled(false);
  }, [textValue]);

  const handleDialogClose = (action) => {
    handleOpen(false);
    handleClose(action, textValue);
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
      <Dialog
        sx={{
          "div.MuiDialog-container": {
            transition: "none !important",
          },
        }}
        open={isOpen}
        maxWidth="lg"
        onClose={() => handleDialogClose("")}>
        <DialogTitle>Enter New Name</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={callbackRef}
            margin="dense"
            id="name"
            label={title}
            defaultValue={title}
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
          <Button disabled={isUntitled} onClick={() => handleDialogClose("OK")}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
