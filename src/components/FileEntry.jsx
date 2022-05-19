/** @jsxRuntime classic */
/** @jsx jsx */
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import { Box, Checkbox } from "@mui/material";
import { css, jsx } from "@emotion/react";
import { fileEnabled, fileHide, runApp, runLogViewer, clearLogCheckResults } from "../features/job/jobSlice";
import BadgeNotifier from "./BadgeNotifier";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import PriorityToggleGroup from "./PriorityToggleGroup";
import { useSlideScroll } from "../app/useSlideScroll";
import { memo, useState, useEffect } from "react";
import FileContextMenu from "./FileContextMenu";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const FileEntry = (props) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const accSummHeight = 25;
  const { fileId, groupId } = props;
  const scrollRef = useSlideScroll();
  const [contextMenu, setContextMenu] = useState(null);
  //const [alertOpen, setAlertOpen] = useState(false);
  const file = useSelector((state) => state.job.value.files.find((e) => e.id === fileId), shallowEqual);
  const logViewerPath = useSelector((state) => state.application.value.settings.logViewerPath);
  const groupEnabled = useSelector((state) => state.job.value.groups.find((e) => e.id === groupId).isEnabled);

  const { sasExecPath, sasCfgPath, sasParams, sasParams1, multiThreading, runSasHidden } = useSelector(
    (state) => state.application.value.settings
  );

  const dispatch = useDispatch();

  const convertSeconds = (seconds) => {
    var convert = function (x) {
      return x < 10 ? "0" + x : x;
    };
    return (
      convert(parseInt(seconds / (60 * 60))) +
      ":" +
      convert(parseInt((seconds / 60) % 60)) +
      ":" +
      convert(seconds % 60)
    );
  };

  const getErrorString = () => {
    let e = "";
    let s = [];
    if (file.messages.numErrors > 0) e = `${file.messages.numErrors} error` + (file.messages.numErrors > 1 ? "s" : "");
    if (file.messages.eq > 0) s.push(`${file.messages.eq} QC error` + (file.messages.eq > 1 ? "s" : ""));
    if (file.messages.em > 0) s.push(`${file.messages.em} Macro error` + (file.messages.em > 1 ? "s" : ""));
    if (file.messages.eo > 0) s.push(`${file.messages.eo} SAS system error`);
    if (s.length > 0) {
      return e + " [" + s.join(", ") + "]";
    } else return e;
  };

  const getWarningString = () => {
    let e = "";
    let s = [];
    if (file.messages.numWarnings > 0)
      e = `${file.messages.numWarnings} warning` + (file.messages.numWarnings > 1 ? "s" : "");
    if (file.messages.wq > 0) s.push(`${file.messages.eq} QC warning` + (file.messages.wq > 1 ? "s" : ""));
    if (file.messages.wm > 0) s.push(`${file.messages.wm} Macro warning` + (file.messages.wm > 1 ? "s" : ""));
    if (s.length > 0) {
      return e + " [" + s.join(", ") + "]";
    } else return e;
  };

  const getNoteString = () => {
    let e = "";
    let s = [];
    let k = [];
    let e1 = "";
    let e2 = "";
    if (file.messages.n > 0) e = `${file.messages.n} note` + (file.messages.n > 1 ? "s" : "");
    if (file.messages.np > 0) s.push(`${file.messages.np} Prohibited note` + (file.messages.np > 1 ? "s" : ""));
    if (file.messages.nr > 0) s.push(`${file.messages.nr} Restricted note` + (file.messages.nr > 1 ? "s" : ""));
    if (file.messages.nq > 0) k.push(`${file.messages.nq} QC note` + (file.messages.nq > 1 ? "s" : ""));
    if (file.messages.nm > 0) k.push(`${file.messages.nm} Macro note` + (file.messages.nm > 1 ? "s" : ""));

    if (s.length > 0) {
      e1 = s.join(", ");
    } else {
      e1 = "No Prohibited or Restricted";
    }
    if (k.length > 0) {
      e2 = k.join(" and ");
    }

    if (file.messages.n > 0) return e + " [" + e1 + "]" + (e2 !== "" ? ", plus " + e2 : "");
    else return e2;
  };

  useEffect(() => {
    let interval = null;
    let status = file.isLogChecking || file.isRunning;
    if (status) {
      interval = setInterval(() => {
        setElapsedTime((elapsedTime) => elapsedTime + 1);
      }, 1000);
    } else if (!status) {
      clearInterval(interval);
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [file.isRunning, file.isLogChecking, elapsedTime]);

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  const handleContextMenuFileHide = () => {
    const hide = !file.isHidden;
    dispatch(fileHide({ fileId, hide }));
    setContextMenu(null);
  };

  const handleContextMenuAppRun = () => {
    setContextMenu(null);
    //console.log(SasExecPath);
    dispatch(clearLogCheckResults({ fileId }));
    dispatch(runApp({ fileIds: [fileId], sasExecPath, sasCfgPath, sasParams, sasParams1, runSasHidden }));
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null
    );
  };

  const handleFileEnabled = (event) => {
    const enabled = event.target.checked;
    //console.log(enabled);
    dispatch(fileEnabled({ fileId, enabled }));
    enabled && dispatch(fileHide({ fileId, hide: false }));
  };

  const exitCodeColor = (code) => {
    switch (code) {
      case null:
        return "success";
      case 0:
        return "success";
      case 1:
        return "warning";
      case 2:
        return "error";
      default:
        return "error";
    }
  };

  const DragHandle = () => (
    <DragIndicatorOutlinedIcon
      css={css`
        color: rgba(0, 0, 0, 0.5);
        line-height: ${accSummHeight - 2}px;
        height: ${accSummHeight - 2}px;
        padding-top: 3px;
      `}
      onClick={(e) => e.stopPropagation()}
    />
  );

  const handleLogClick = (event) => {
    event.stopPropagation();
    dispatch(runLogViewer({ logViewerPath, logPath: file.log.logPath }));
  };

  const pathShorten = (str, maxLen, removeFilename) => {
    let splitter = "\\",
      tokens = str.split(splitter),
      maxLength = maxLen || 25,
      drive = str.indexOf(":") > -1 ? tokens[0] : "",
      fileName = tokens[tokens.length - 1],
      len = removeFilename ? drive.length : drive.length + fileName.length,
      remLen = maxLength - len - 5, // remove the current lenth and also space for 3 dots and 2 slashes
      path,
      lenA,
      lenB,
      pathA,
      pathB;
    //remove first and last elements from the array
    tokens.splice(0, 1);
    tokens.splice(tokens.length - 1, 1);
    //recreate our path
    path = tokens.join(splitter);
    //handle the case of an odd length
    lenA = Math.ceil(remLen / 2);
    lenB = Math.floor(remLen / 2);
    //rebuild the path from beginning and end
    pathA = path.substring(0, lenA);
    pathB = path.substring(path.length - lenB);
    path = drive + splitter + pathA + "..." + pathB + splitter;
    path = path + (removeFilename ? "" : fileName);
    //console.log(tokens, maxLength, drive, fileName, len, remLen, pathA, pathB);
    return path;
  };

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{ borderBottom: 1, borderColor: "rgba(0,0,0,0.2)" }}
      css={
        (!file.isEnabled || !groupEnabled) &&
        css`
          background-color: rgba(230, 230, 230, 1);
        `
      }
      onContextMenu={handleContextMenu}>
      <AccordionSummary
        css={css`
          height: ${accSummHeight}px;
          min-height: ${accSummHeight}px;
          padding: 0px 0px;
          & .MuiAccordionSummary-content {
            height: ${accSummHeight}px;
            min-height: ${accSummHeight}px;
            margin: 0;
          }
        `}>
        <div {...props.handle}>
          <DragHandle />
        </div>
        <Checkbox
          css={css`
            height: ${accSummHeight}px;
            min-height: ${accSummHeight}px;
            padding: 0px 5px;
            & .MuiCheckbox-root {
              height: ${accSummHeight}px;
              min-height: ${accSummHeight}px;
              margin: 0;
              padding: 0px 5px;
            }
            & .MuiSvgIcon-root {
              width: 18px;
              height: 18px;
            }
          `}
          color="primary"
          disableRipple
          onClick={(e) => e.stopPropagation()}
          onChange={handleFileEnabled}
          checked={file.isEnabled}
        />

        {multiThreading && (
          <div ref={scrollRef} style={{ width: "80px", overflow: "hidden" }}>
            <PriorityToggleGroup disabled={!file.isEnabled || !groupEnabled} />
          </div>
        )}

        <Box
          css={css`
            line-height: ${accSummHeight}px;
            height: ${accSummHeight}px;
            flex-grow: 1;
            overflow: hidden;
            padding-left: 5px;
          `}>
          <Typography
            variant="subtitle2"
            component="div"
            css={css`
              line-height: ${accSummHeight}px;
              height: ${accSummHeight}px;
              flex-grow: 1;
              padding-right: 5px;
              overflow: hidden;
              display: inline-block;
            `}
            sx={
              (!file.isEnabled || !groupEnabled ? { color: "#aaaaaa" } : {},
              file.isHidden ? { fontStyle: "italic", color: "#777777" } : {})
            }>
            {file.file.name.toUpperCase()}{" "}
            {(file.isRunning || file.isLogChecking) && `[${convertSeconds(elapsedTime)}]`}
          </Typography>
        </Box>

        <BadgeNotifier count={file.messages.numErrors} disabled={!file.isEnabled || !groupEnabled} icon="error" />
        <BadgeNotifier count={file.messages.numWarnings} disabled={!file.isEnabled || !groupEnabled} icon="warning" />
        <BadgeNotifier count={file.messages.numNotice} disabled={!file.isEnabled || !groupEnabled} icon="info" />
        <BadgeNotifier
          count={file.exitCode !== null || file.runError !== null ? -1 : 0}
          disabled={!file.isEnabled || !groupEnabled}
          icon={file.runError !== null ? "error" : exitCodeColor(file.exitCode)}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}>
        <Typography
          variant="subtitle2"
          onClick={file.logInfo.fileExist ? handleLogClick : null}
          sx={
            file.logInfo.fileExist
              ? {
                  "&:hover": {
                    cursor: "pointer",
                    color: "blue",
                  },
                }
              : {}
          }>
          LOG: {file.logInfo.fileExist ? pathShorten(file.log.logPath, 70, false) : <em>No Log file found</em>}
        </Typography>
        {file.isEnabled && groupEnabled ? (
          <Stack sx={{ width: "100%" }} spacing={0.5}>
            {file.messages.numErrors ? (
              <Alert sx={{ padding: "0px 6px" }} variant="outlined" severity="error">
                {getErrorString()}
              </Alert>
            ) : (
              <div />
            )}
            {file.messages.numWarnings ? (
              <Alert sx={{ padding: "0px 6px" }} variant="outlined" severity="warning">
                {getWarningString()}
              </Alert>
            ) : (
              <div />
            )}
            {file.messages.numNoticeAll ? (
              <Alert sx={{ padding: "0px 6px" }} variant="outlined" severity="info">
                {getNoteString()}
              </Alert>
            ) : (
              <div />
            )}
          </Stack>
        ) : (
          <div />
        )}
      </AccordionDetails>
      <FileContextMenu
        contextMenu={contextMenu}
        handleClose={handleContextMenuClose}
        handleHide={handleContextMenuFileHide}
        handleAppRun={handleContextMenuAppRun}
        isHidden={file.isHidden}
      />
    </Accordion>
  );
};

export default FileEntry;

export const MemoFileEntry = memo(FileEntry);
