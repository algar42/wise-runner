import { useSelector, useDispatch } from "react-redux";
import { dragGroupMove } from "../features/job/jobSlice";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import GroupEntry from "./GroupEntry";

const JobGroup = () => {
  const groups = useSelector((state) => state.job.value.groups);

  const dispatch = useDispatch();

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const oldIndex = result.source.index;
    const newIndex = result.destination.index;

    dispatch(dragGroupMove({ oldIndex, newIndex }));
  };

  const getListStyle = (isDraggingOver) => ({});

  const getItemStyle = (isDragging, draggableStyle) => ({
    ...draggableStyle,
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
            {groups.map((v, i) => (
              <Draggable draggableId={v.id} key={v.id} index={i}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                    <GroupEntry key={v.id} id={v.id} groupId={v.id} handle={provided.dragHandleProps}></GroupEntry>
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

export default JobGroup;
