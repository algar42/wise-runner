/** @jsxRuntime classic */
/** @jsx jsx */
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { Box, Checkbox, Stack } from "@mui/material";
import { css, jsx } from "@emotion/react";
import { useState, useEffect, memo, useCallback } from "react";
import EditGroupTitle from "./EditGroupTitle";
import { groupTitleEdited, groupEnabled, dragFileMove, runApp, clearLogCheckResults } from "../features/job/jobSlice";
//import FileEntry from "./FileEntry";
import { MemoFileEntry } from "./FileEntry";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import GroupMenu from "./GroupMenu";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { pathShorten, convertSeconds } from "../app/utils";
import GroupStatusNotifier from "./GroupStatusNotifier";
import { status as statuses } from "../app/constants";

const GroupEntry = (props) => {
  const accSummHeight = 35;
  const { groupId } = props;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [editGroupDialogOpen, setDialogOpen] = useState(false);
  const [groupExpanded, setGroupExpanded] = useState(false);

  const { title, isEnabled, files, settings, isShowHidden, isRunning, status } = useSelector(
    (state) => state.job.value.groups.find((e) => e.id === groupId),
    shallowEqual
  );
  const { sasExecPath, sasCfgPath, sasParams, sasParams1, runSasHidden } = useSelector(
    (state) => state.application.value.settings
  );
  const file = useSelector(
    (state) =>
      state.job.value.files
        .filter((e) => e.groupId === groupId)
        .map((e) => {
          return {
            isFileEnabled: e.isEnabled,
            isHidden: e.isHidden,
            id: e.id,
            grpId: e.groupId,
            fileInfo: e.fileInfo,
          };
        }),
    shallowEqual
  );

  const anyFileEnabled = useSelector(
    (state) =>
      state.job.value.files
        .filter((e) => e.groupId === groupId)
        .map(({ isEnabled }) => isEnabled)
        .every((e) => e === false),
    shallowEqual
  );

  const anyRunError = useSelector(
    (state) =>
      state.job.value.files
        .filter((e) => e.groupId === groupId)
        .map((f) => {
          return { runError: f.runError, exitCode: f.exitCode };
        })
        .some((e) => e.runError !== null || e.exitCode > 0),
    shallowEqual
  );

  const dispatch = useDispatch();

  const handleGroupExpanded = useCallback((event, expanded) => {
    setGroupExpanded(expanded);
  }, []);

  const handleGroupEnabled = (event) => {
    const enabled = event.target.checked;
    dispatch(groupEnabled({ groupId, enabled }));
  };

  const handleGroupDialogOpen = (event) => {
    event.stopPropagation();

    setDialogOpen(true);
  };
  const handleGroupDialogClose = (action, groupId, groupTitle) => {
    if (action === "OK") {
      dispatch(groupTitleEdited({ groupId, groupTitle }));
    }
  };

  const handleRunGroup = () => {
    if (files.length > 0) {
      dispatch(clearLogCheckResults({ groupId }));

      dispatch(
        runApp({
          fileIds: files.filter((e) =>
            file.find((f) => {
              return f.id === e && f.isFileEnabled && f.fileInfo.fileExist;
            })
          ),
          sasExecPath,
          sasCfgPath,
          sasParams,
          sasParams1,
          runSasHidden,
        })
      );
    }
  };

  const handleFileDragEnd = (result) => {
    if (!result.destination) return;
    const oldIndex = result.source.index;
    const newIndex = result.destination.index;

    dispatch(dragFileMove({ groupId, oldIndex, newIndex }));
  };

  const DragHandle = useCallback(
    () => (
      <DragIndicatorOutlinedIcon
        css={css`
          color: rgba(0, 0, 0, 0.5);
          line-height: ${accSummHeight}px;
          height: ${accSummHeight}px;
        `}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    []
  );

  const handleGroupMenuClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    let interval = null;
    let status = isRunning;
    if (status) {
      interval = setInterval(() => {
        setElapsedTime((elapsedTime) => elapsedTime + 1);
      }, 1000);
    } else if (!status) {
      clearInterval(interval);
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsedTime]);

  return (
    <div>
      <Accordion
        TransitionProps={{ unmountOnExit: true }}
        expanded={groupExpanded}
        disableGutters
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "rgba(0,0,0,0.2)" }}
        css={
          !isEnabled &&
          css`
            background-color: rgba(230, 230, 230, 1);
          `
        }
        onChange={(event, expanded) => handleGroupExpanded(event, expanded)}>
        <AccordionSummary
          css={css`
            height: ${accSummHeight}px;
            min-height: ${accSummHeight}px;
            padding: 0px 5px;
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
            size="small"
            color="primary"
            disableRipple
            onClick={(e) => e.stopPropagation()}
            onChange={handleGroupEnabled}
            checked={isEnabled && true}
          />
          <Box
            css={css`
              line-height: ${accSummHeight}px;
              height: ${accSummHeight}px;
              flex-grow: 1;
              overflow: hidden;
            `}>
            <Typography
              variant="subtitle1"
              component="div"
              css={css`
                line-height: ${accSummHeight}px;
                height: ${accSummHeight}px;
                flex-grow: 1;
                overflow: hidden;
                display: inline-block;
              `}>
              {title}
            </Typography>
            <ModeEditOutlineOutlinedIcon
              css={css`
                line-height: ${accSummHeight}px;
                height: ${accSummHeight}px;
                font-size: 1rem;
                flex-grow: 1;
                overflow: hidden;
                display: inline-block;
                margin-left: 5px;
                color: rgba(0, 0, 0, 0.3);
                :hover {
                  color: rgba(0, 0, 180, 1);
                }
              `}
              onClick={handleGroupDialogOpen}
            />
            <Typography
              variant="subtitle1"
              component="div"
              css={css`
                line-height: ${accSummHeight}px;
                height: ${accSummHeight}px;
                flex-grow: 1;
                overflow: hidden;
                display: inline-block;
              `}>
              {isRunning && `[${convertSeconds(elapsedTime)}]`}
            </Typography>
          </Box>
          {status !== statuses.UNKNOWN || anyRunError ? (
            <GroupStatusNotifier count={-1} disabled={!isEnabled} icon={anyRunError ? "warning" : status} />
          ) : (
            <div />
          )}
          <GroupMenu
            groupId={groupId}
            handleExpanded={handleGroupExpanded}
            handleRunGroup={handleRunGroup}
            anyFileEnabled={anyFileEnabled}
            onClick={handleGroupMenuClick}
          />
        </AccordionSummary>
        <DragDropContext onDragEnd={handleFileDragEnd}>
          <AccordionDetails sx={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}>
            <Droppable droppableId="droppable-file">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Stack spacing={0}>
                    <Typography variant="body2" noWrap gutterBottom>
                      <b>LOG Path:</b>{" "}
                      {settings.logOutputFolder ? pathShorten(settings.logOutputFolder, 80, true) : "Not Defined"}
                    </Typography>
                    <Typography variant="body2" noWrap gutterBottom>
                      <b>LST Path:</b>{" "}
                      {settings.lstOutputFolder ? pathShorten(settings.lstOutputFolder, 80, true) : "Not Defined"}
                    </Typography>
                    {settings.sysParms && (
                      <Typography variant="body2" noWrap gutterBottom>
                        <b>SysParms:</b> {settings.sysParms}
                      </Typography>
                    )}
                  </Stack>
                  {files.map((v, i) =>
                    file.find((e) => e.id === v).isHidden && isShowHidden === false ? (
                      <div key={v} />
                    ) : (
                      <Draggable draggableId={v} key={v} index={i} isDragDisabled={!isEnabled}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <MemoFileEntry key={v} fileId={v} groupId={groupId} handle={provided.dragHandleProps} />
                          </div>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </AccordionDetails>
        </DragDropContext>
      </Accordion>

      <EditGroupTitle
        isOpen={editGroupDialogOpen}
        groupId={groupId}
        groupTitle={title}
        handleClose={handleGroupDialogClose}
        handleOpen={setDialogOpen}
      />
    </div>
  );
};

//export default GroupEntry;
export default memo(GroupEntry);
/*
{status && status !== statuses.UNKNOWN ? (
            <StatusNotifier count={0} disabled={!isEnabled} icon={status} />
          ) : (
            <div />
          )}*/
