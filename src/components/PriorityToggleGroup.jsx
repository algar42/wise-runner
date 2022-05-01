import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";
import { Box } from "@mui/material";

export default function PriorityToggleGroup(props) {
  const [filePriority, setAlignment] = useState(5);
  const { disabled } = props;
  const handleChange = (event, filePriority) => {
    setAlignment(filePriority);
    event.stopPropagation();
  };

  const buttonStyle = {
    padding: "0px 0px",
    fontSize: 11,
    lineHeight: "15px",
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: "#4dabf5",
      color: "#ffffff",
      border: "1px solid #000000",
    },
  };

  return (
    <Box sx={{ paddingRight: "5px", lineHeight: "22px" }}>
      <ToggleButtonGroup
        disabled={disabled}
        sx={{
          "& .MuiToggleButtonGroup-grouped": {
            marginTop: 0,
            padding: "0px 4px",
            paddingTop: 0,

            border: 1,
            "&.Mui-disabled": {
              border: 0,
            },
          },
        }}
        value={filePriority}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton sx={buttonStyle} value={1}>
          1
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={2}>
          2
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={3}>
          3
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={4}>
          4
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={5}>
          5
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={6}>
          6
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={7}>
          7
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={8}>
          8
        </ToggleButton>
        <ToggleButton sx={buttonStyle} value={9}>
          9
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
