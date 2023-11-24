import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
type Props = {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (obj: { id: Id; val: string }) => void;
  createTask: (colId: Id) => void;
  tasks: Task[];
};

const ColumnContainer = ({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
}: Props) => {
  const [editMode, setEditMode] = useState(false);
  const {
    listeners,
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  if (isDragging) {
    return (
      <div
        className="flex h-[500px] max-h-[500px] w-[350px] flex-col rounded-md border-2 border-rose-500 bg-columnBackgroundColor opacity-40"
        ref={setNodeRef}
        style={style}
      ></div>
    );
  }

  return (
    <div
      className="flex h-[500px] max-h-[500px] w-[350px] flex-col rounded-md bg-columnBackgroundColor"
      ref={setNodeRef}
      style={style}
    >
      <div
        className="text-md flex h-[60px] cursor-grab items-center justify-between rounded-md rounded-b-none bg-mainBackgroundColor p-3 font-bold"
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
      >
        <div className="flex gap-2">
          <div className="flex items-center justify-center rounded-full bg-columnBackgroundColor px-2 py-1 text-sm">
            0
          </div>
          {!editMode && column.title}
          {editMode && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditMode(false);
              }}
            >
              <input
                className="rounded border bg-black px-2 outline-none focus:border-rose-500"
                value={column.title}
                onChange={(e) =>
                  updateColumn({ id: column.id, val: e.target.value })
                }
                autoFocus
                onBlur={() => {
                  setEditMode(false);
                }}
              />
            </form>
          )}
        </div>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="rounded stroke-gray-500 px-1 py-2 hover:bg-columnBackgroundColor"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="flex flex-grow flex-col gap-4 overflow-y-auto overflow-x-hidden p-2">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
      <button
        className="flex items-center gap-2 rounded-md border-2 border-columnBackgroundColor border-x-columnBackgroundColor p-4 hover:bg-mainBackgroundColor hover:text-red-500 active:bg-black"
        onClick={() => {
          createTask(column.id);
        }}
      >
        <PlusIcon />
        Add task
      </button>
    </div>
  );
};

export default ColumnContainer;
