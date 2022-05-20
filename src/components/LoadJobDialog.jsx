import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Typography } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import JobList from "./JobsList";
import { getSavedJobsListAsync } from "../features/job/jobSlice";

export default function LoadJobDialog(props) {
  const { handleCancel, handleLoad, isOpen, metadataPath } = props;
  const jobsList = useSelector((state) => state.job.value.savedJobsList);
  const [selectedJob, setSelectedJob] = useState("");
  const dispatch = useDispatch();

  const handleSelected = (index, name) => {
    if (index >= 0) {
      setSelectedJob(name);
    }
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(getSavedJobsListAsync(metadataPath));
      //console.log("getting list");
    }
  }, [isOpen]);

  return (
    <Dialog
      sx={{
        "div.MuiDialog-container": {
          transition: "none !important",
        },
      }}
      open={isOpen}
      onClose={() => {
        handleCancel();
        setSelectedJob("");
      }}
      fullWidth>
      <DialogTitle>Jobs</DialogTitle>
      <DialogContent>
        {jobsList.length === 0 ? (
          <Typography variant="body1"> No saved Jobs found </Typography>
        ) : (
          <JobList jobs={jobsList.map((e) => e.name)} handleSelected={handleSelected} />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleCancel();
            setSelectedJob("");
          }}>
          Cancel
        </Button>
        <Button
          disabled={jobsList.length === 0 || selectedJob === ""}
          onClick={() => {
            handleLoad(selectedJob);
            setSelectedJob("");
          }}>
          Load
        </Button>
      </DialogActions>
    </Dialog>
  );
}
