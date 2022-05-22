import { useSelector, useDispatch } from "react-redux";
import { dragGroupMove } from "../features/job/jobSlice";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { memo } from "react";

import MemoGroupEntry from "./GroupEntry";
import { shallowEqual } from "react-redux";

const JobGroup = () => {
  const groups = useSelector(
    (state) =>
      state.job.value.groups.map(({ id }) => {
        return { id };
      }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const oldIndex = result.source.index;
    const newIndex = result.destination.index;
    dispatch(dragGroupMove({ oldIndex, newIndex }));
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    ...draggableStyle,
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} style={{}}>
            {groups.map((v, i) => (
              <Draggable draggableId={v.id} key={v.id} index={i}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                    <MemoGroupEntry
                      key={v.id}
                      id={v.id}
                      groupId={v.id}
                      handle={provided.dragHandleProps}></MemoGroupEntry>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

//export default JobGroup;
export default memo(JobGroup);
