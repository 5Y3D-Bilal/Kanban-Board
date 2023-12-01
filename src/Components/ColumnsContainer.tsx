import { Column, Id, Task } from "../types";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState , useMemo } from "react";
import { CiCirclePlus } from "react-icons/ci"
import TaskCard from "./TaskCard";


type Props = {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void
  createTask: (columnId: Id) => void
  tasks: Task[]
  deleteTask: (id: Id) => void
  updateTask: (id: Id, content: string) => void
};

const ColumnsContainer = (props: Props) => {
  const { column, deleteColumn, updateColumnTitle, createTask, tasks, deleteTask, updateTask } = props;
  const [editMode, setEditMode] = useState(false)


  const tasksIds = useMemo(() => {
    return tasks.map(task => task.id)
  }, [tasks])

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: column,
      column,
    },
    disabled: editMode
  });


  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
      bg-columnBackgroundColor
      opacity-40
      border-2
      border-pink-500
      w-[350px]
      h-[500px]
      max-h-[500px]
      rounded-md
      flex
      flex-col
      "
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={column.id}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      {/* Column Title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => { setEditMode(true) }}
        className="bg-mainBackgroundColor justify-between  text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center"
      >
        <div className="flex gap-2 items-center">
          <div className="flex justify-center items-center bg-columnBackgroundColor w-6 h-6 text-sm rounded-full">
            0
          </div>

          {!editMode &&
            column.title}
          {editMode &&
            <input
              value={column.title}
              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
              className="bg-black focus:border-rose-500 border rounded outline-none px-2"
              autoFocus
              onBlur={() => { setEditMode(false) }}
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                setEditMode(false);
              }}
            />}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="p-1.5 border-[0.3px] border-white hover:bg-columnBackgroundColor rounded-full"
        >
          <MdOutlineDeleteOutline />
        </button>
      </div>
      {/* Column task Container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>

          {tasks.map(task => <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />)}
        </SortableContext>
      </div>
      {/* Column Footer */}

      <button className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:text-rose-500 active:bg-black" onClick={() => { createTask(column.id) }}><CiCirclePlus /> Add Task</button>
    </div>
  );
};

export default ColumnsContainer;
