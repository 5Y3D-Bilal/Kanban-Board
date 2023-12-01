import { useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import ColumnsContainer from "./ColumnsContainer";
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
import { CiCirclePlus } from "react-icons/ci"
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [tasks, setTasks] = useState<Task[]>([])

  const [ActiveTask, setActiveTask] = useState<Task | null>(null)

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  // So here we set a radius of 3px so now  onDragStart function will start from 3px. So our deleteColumn will work now 
  // Beacause when we were trying to delete our board it was shoting up onDragStart function
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3
    }
  }))

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={OndragEnd}
        sensors={sensors}
        onDragOver={OndragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnsContainer
                  column={col}
                  key={col.id}
                  deleteColumn={deleteColumn}
                  updateColumnTitle={updateColumnTitle}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => createNewColumn()}
            className="flex gap-2 h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2"
          >
            <CiCirclePlus size={25} /> Add Column
          </button>
        </div>
        {createPortal(

          <DragOverlay>
            {activeColumn && (
              <ColumnsContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumnTitle={updateColumnTitle}
                createTask={createTask}
                deleteTask={deleteTask}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                updateTask={updateTask}
              />
            )}
            {
              ActiveTask && <TaskCard task={ActiveTask} deleteTask={deleteTask} updateTask={updateTask} />
            }
          </DragOverlay>,
          document.body
        )}


      </DndContext>
    </div>
  );


  //============================ ALL FUNCTIONS ==========================

  // ============================ COLUMNS FUNCTIONS

  //   Create Column Function

  function createNewColumn() {
    const columnsToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnsToAdd]);
  }
  // Delete Column Function

  function deleteColumn(id: Id) {
    const filtiredColumn = columns.filter((col) => col.id !== id);
    setColumns(filtiredColumn);

    const newTasks = tasks.filter((idx) => idx.columnId !== id)
    setTasks(newTasks)
  }
  // updateColumnTitle

  function updateColumnTitle(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) {
        return col
      }
      return { ...col, title }
    })
    setColumns(newColumns)
  }

  // =========================== DRAG FUNCTIONS

  // OnDragStart Function

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column)
      return
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
      return
    }
  }
  // OnDragEnd Function

  function OndragEnd(event: DragEndEvent) {
    setActiveColumn(null)
    setActiveTask(null)
    const { active, over } = event

    if (!over) return
    const activeColumnId = active.id
    const overColumnId = over.id

    if (activeColumnId === overColumnId) return

    setColumns(columns => {
      const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId)
      const overColumnIndex = columns.findIndex(col => col.id === overColumnId)

      //  So this arrayMove is helping us for swaping activeColumnIndex with overColumnIndex
      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }
  // OndragOver Function

  function OndragOver(event: DragOverEvent) {
    const { active, over } = event

    if (!over) return
    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverTask = over.data.current?.type === "Task"

    if (!isActiveTask) return

    // so here we have to use casees of tasks 
    // 1: ) Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((idx) => idx.id === activeId)
        const overIndex = tasks.findIndex((idx) => idx.id === overId)

        tasks[activeIndex].columnId = tasks[overIndex].columnId

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    const isOverColumn = over.data.current?.type === "Column"
    // 2: ) Dropping a Task over a column

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((idx) => idx.id === activeId)

        tasks[activeIndex].columnId = overId

        return arrayMove(tasks, activeIndex, activeIndex)
      })
    }

  }
  // ========================== KANBAN BOARD FUNCTIONS

  // Creating task in kanban board

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }
  // For Deleting task in kanban board

  function deleteTask(id: Id) {
    const newTasks = tasks.filter(task => task.id !== id)
    setTasks(newTasks)
  }
  // For Updating task in kanban board

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map(task => {
      if (task.id !== id) return task
      return { ...task, content }
    })

    setTasks(newTasks)
  }


};


// FUNCTION to Create unique ids
function generateId() {
  // Generate a Random id / numbers
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
