import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PropType = {
  task: Task;
};
const TaskCard = ({ task }: PropType) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const {
    listeners,
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        className="relative flex h-[100px] min-h-[100px] cursor-grab items-center rounded-xl border-rose-500 bg-mainBackgroundColor p-2.5 text-left opacity-60 hover:ring-2 hover:ring-inset hover:ring-rose-500"
        onMouseEnter={() => {
          setMouseIsOver(true);
        }}
        {...listeners}
        {...attributes}
        ref={setNodeRef}
        style={style}
      ></div>
    );
  }

  return (
    <div
      className="relative flex h-[100px] min-h-[100px] cursor-grab items-center rounded-xl bg-mainBackgroundColor p-2.5 text-left hover:ring-2 hover:ring-inset hover:ring-rose-500"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      style={style}
    >
      {task.content}
      {mouseIsOver && (
        <button className="absolute right-0 top-1/2 -translate-y-1/2 rounded stroke-white p-2 opacity-60 hover:opacity-100">
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
