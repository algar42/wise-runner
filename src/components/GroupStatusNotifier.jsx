import IconButton from "@mui/material/IconButton";

import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

function notificationsLabel(count) {
  if (count === 0) {
    return "no notifications";
  } else if (count > 99) {
    return "more than 99 notificationicon";
  }
  return `${count} notifications`;
}

export default function GroupStatusNotifier(props) {
  const { count, icon, disabled } = props;
  const iconActiveStyle = { fontSize: "18px" };
  const iconInactiveStyle = { fontSize: "18px", color: "rgba(0, 0, 0, 0.3)" };
  const cnt = disabled ? 0 : count;

  const SelectedIcon = () => {
    switch (icon) {
      case "error":
        return <ClearOutlinedIcon color={icon} sx={cnt ? iconActiveStyle : iconInactiveStyle} />;
      case "warning":
        return <PriorityHighOutlinedIcon color={icon} sx={cnt ? iconActiveStyle : iconInactiveStyle} />;
      case "info":
        return <QuestionMarkOutlinedIcon color={icon} sx={cnt ? iconActiveStyle : iconInactiveStyle} />;
      case "success":
        return <CheckOutlinedIcon color={icon} sx={cnt ? iconActiveStyle : iconInactiveStyle} />;
      default:
        break;
    }
  };

  return (
    <IconButton
      disableRipple
      aria-label={notificationsLabel(cnt)}
      size="small"
      sx={{
        right: 0,
        padding: "0px 5px",
        top: -1,
      }}>
      <SelectedIcon />
    </IconButton>
  );
}
