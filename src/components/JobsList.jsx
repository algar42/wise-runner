import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

export default function JobList(props) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { jobs, handleSelected } = props;

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    handleSelected(index, jobs[index]);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 300, overflow: "auto", bgcolor: "background.paper" }}>
      <List dense component="nav" aria-label="jobs-list">
        {jobs.map((v, k) => (
          <ListItemButton key={k} selected={selectedIndex === k} onClick={(event) => handleListItemClick(event, k)}>
            <ListItemText key={k} primary={v.toUpperCase()} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
