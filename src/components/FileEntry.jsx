/** @jsxRuntime classic */
/** @jsx jsx */
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import { Box, Checkbox } from "@mui/material";
import { css, jsx } from "@emotion/react";
import { fileEnabled, fileHide, runApp } from "../features/job/jobSlice";
import BadgeNotifier from "./BadgeNotifier";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import PriorityToggleGroup from "./PriorityToggleGroup";
import { useSlideScroll } from "../app/useSlideScroll";
import { memo, useState, useEffect } from "react";
import FileContextMenu from "./FileContextMenu";

const FileEntry = (props) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const accSummHeight = 25;
  const { fileId, groupId } = props;
  const scrollRef = useSlideScroll();
  const [contextMenu, setContextMenu] = useState(null);
  //const [alertOpen, setAlertOpen] = useState(false);
  const file = useSelector((state) => state.job.value.files.find((e) => e.id === fileId), shallowEqual);

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

  useEffect(() => {
    let interval = null;

    if (file.isRunning) {
      interval = setInterval(() => {
        setElapsedTime((elapsedTime) => elapsedTime + 1);
      }, 1000);
    } else if (!file.isRunning) {
      clearInterval(interval);
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [file.isRunning, elapsedTime]);

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
    console.log(enabled);
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
            {file.file.name.toUpperCase()} {file.isRunning && `[${convertSeconds(elapsedTime)}]`}
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
      <AccordionDetails sx={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}>{JSON.stringify(file)}</AccordionDetails>
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
