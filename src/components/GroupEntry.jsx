/** @jsxRuntime classic */
/** @jsx jsx */
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { Box, Checkbox } from "@mui/material";
import { css, jsx } from "@emotion/react";
import { useState } from "react";
import EditGroupTitle from "./EditGroupTitle";
import { groupTitleEdited, groupEnabled, dragFileMove, runApp } from "../features/job/jobSlice";
//import FileEntry from "./FileEntry";
import { MemoFileEntry } from "./FileEntry";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import GroupMenu from "./GroupMenu";
import { useSelector, useDispatch, shallowEqual } from "react-redux";

const GroupEntry = (props) => {
  const accSummHeight = 35;
  const { groupId } = props;
  const [editGroupDialogOpen, setDialogOpen] = useState(false);
  const [groupExpanded, setGroupExpanded] = useState(false);

  const dispatch = useDispatch();

  const handleGroupExpanded = (event, expanded) => {
    setGroupExpanded(expanded);
  };

  const handleGroupEnabled = (event) => {
    const enabled = event.target.checked;
    dispatch(groupEnabled({ groupId, enabled }));
  };

  const group = useSelector((state) => state.job.value.groups.find((e) => e.id === groupId), shallowEqual);
  const { sasExecPath, sasCfgPath, sasParams, sasParams1, runSasHidden } = useSelector(
    (state) => state.application.value.settings
  );
  const files = useSelector((state) => state.job.value.files.filter((e) => e.groupId === groupId));

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
    if (group.files.length > 0)
      dispatch(
        runApp({
          fileIds: group.files.filter((e) => files.find((f) => f.id === e && f.isEnabled)),
          sasExecPath,
          sasCfgPath,
          sasParams,
          sasParams1,
          runSasHidden,
        })
      );
  };

  const handleFileDragEnd = (result) => {
    if (!result.destination) return;
    const oldIndex = result.source.index;
    const newIndex = result.destination.index;

    dispatch(dragFileMove({ groupId, oldIndex, newIndex }));
  };

  const DragHandle = () => (
    <DragIndicatorOutlinedIcon
      css={css`
        color: rgba(0, 0, 0, 0.5);
        line-height: ${accSummHeight}px;
        height: ${accSummHeight}px;
      `}
      onClick={(e) => e.stopPropagation()}
    />
  );

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
          !group.isEnabled &&
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
            checked={group.isEnabled && true}
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
              {group.title}
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
          </Box>

          <GroupMenu groupId={groupId} handleExpanded={handleGroupExpanded} handleRunGroup={handleRunGroup} />
        </AccordionSummary>
        <DragDropContext onDragEnd={handleFileDragEnd}>
          <AccordionDetails sx={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}>
            <Droppable droppableId="droppable-file">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {group.files.map((v, i) =>
                    files.find((e) => e.id === v).isHidden && group.isShowHidden === false ? (
                      <div key={v} />
                    ) : (
                      <Draggable draggableId={v} key={v} index={i} isDragDisabled={!group.isEnabled}>
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
        groupTitle={group.title}
        handleClose={handleGroupDialogClose}
        handleOpen={setDialogOpen}
      />
    </div>
  );
};

export default GroupEntry;
