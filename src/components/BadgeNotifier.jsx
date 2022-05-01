import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

function notificationsLabel(count) {
  if (count === 0) {
    return "no notifications";
  }
  if (count > 99) {
    return "more than 99 notifications";
  }
  return `${count} notifications`;
}

export default function BadgeNotifier(props) {
  const { count, icon, disabled } = props;

  const incoActiveStyle = { fontSize: "16px" };
  const iconInactiveStyle = { fontSize: "16px", color: "rgba(0, 0, 0, 0.3)" };

  const cnt = disabled ? 0 : count;

  const SelectedIcon = () => {
    switch (icon) {
      case "error":
        return (
          <DangerousOutlinedIcon
            color={icon}
            sx={cnt ? incoActiveStyle : iconInactiveStyle}
          />
        );
      case "warning":
        return (
          <WarningAmberOutlinedIcon
            color={icon}
            sx={cnt ? incoActiveStyle : iconInactiveStyle}
          />
        );

      case "info":
        return (
          <ErrorOutlineOutlinedIcon
            color={icon}
            sx={cnt ? incoActiveStyle : iconInactiveStyle}
          />
        );

      case "success":
        return (
          <CheckCircleOutlineOutlinedIcon
            color={icon}
            sx={cnt ? incoActiveStyle : iconInactiveStyle}
          />
        );
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
        right: 8,
        padding: "0px 9px",
        top: 1,
      }}
    >
      <Badge
        badgeContent={cnt > 0 ? cnt : 0}
        color={icon}
        sx={{
          "& .MuiBadge-badge": {
            right: -2,
            top: 2,
            padding: "0px 4px",
            borderRadius: "45%",
            fontSize: 9,
            height: 12,
            minWidth: 12,
          },
        }}
      >
        <SelectedIcon />
      </Badge>
    </IconButton>
  );
}
