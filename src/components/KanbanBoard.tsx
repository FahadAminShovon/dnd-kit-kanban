import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
  );

  function generateId() {
    return Math.floor(Math.random() * 10001);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    const updatedColumns = columns.filter((col) => col.id !== id);
    setColumns(updatedColumns);
  }

  function onDragStart(e: DragStartEvent) {
    if (e?.active?.data?.current?.type === "Column") {
      setActiveColumn(e.active.data.current.column);
      return;
    }
    if (e?.active?.data?.current?.type === "Task") {
      setActiveTask(e.active.data.current.task);
      return;
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveTask(null);
    setActiveColumn(null);
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;
    const overColumnIdx = columns.findIndex((col) => col.id === overColumnId);
    const activeColumnIdx = columns.findIndex(
      (col) => col.id === activeColumnId,
    );
    if (overColumnIdx !== -1 && activeColumnIdx !== -1) {
      setColumns(arrayMove(columns, overColumnIdx, activeColumnIdx));
    }
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverATask = active.data.current?.type === "Task";

    if (!isActiveTask) return;
    if (isActiveTask === isOverATask && isActiveTask) {
      setTasks((tasks) => {
        const overTaskIdx = tasks.findIndex((task) => task.id === overId);
        const activeTaskIdx = tasks.findIndex((task) => task.id === activeId);
        if (overTaskIdx !== -1 && activeTaskIdx !== -1) {
          tasks[activeTaskIdx].columnId = tasks[overTaskIdx].columnId;
          return arrayMove(tasks, overTaskIdx, activeTaskIdx);
        }
        return tasks;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isOverAColumn && isActiveTask) {
      setTasks((tasks) => {
        const activeTaskIdx = tasks.findIndex((task) => task.id === activeId);
        tasks[activeTaskIdx].columnId = overId;
        return arrayMove(tasks, activeTaskIdx, activeTaskIdx);
      });
    }
  }

  const updateColumn = ({ id, val }: { id: Id; val: string }) => {
    const updatedColumns = columns.map((col) => {
      if (col.id === id) {
        return { ...col, title: val };
      }
      return col;
    });
    setColumns(updatedColumns);
  };

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId: columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  };

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[400px]">
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        sensors={sensors}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  column={column}
                  key={column.id}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            className="flex h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg border-2 border-columnBackgroundColor bg-mainBackgroundColor p-4 ring-rose-500 hover:ring-2"
            onClick={() => createNewColumn()}
          >
            <PlusIcon />
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id,
                )}
              />
            )}
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
