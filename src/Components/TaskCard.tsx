import { Id, Task } from "../types"
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



interface Props {
    task: Task
    deleteTask: (id: Id) => void
    updateTask: (id: Id, content: string) => void
}


const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
    const [mouseIsOver, setMouseIsOver] = useState(false)
    const [editMode, setEditMode] = useState(false)

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: editMode
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <>
                <div
                    style={style}
                    ref={setNodeRef}
                    className="justify-between opacity-60 px-5 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-lg border-2 border-rose-500 cursor-grab"
                />
            </>
        )
    }




    const toggleEditMode = () => {
        setEditMode((prev) => !prev)
        setMouseIsOver(false)
    }

    if (editMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="justify-between px-5 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-lg hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab">
                <textarea
                    value={task.content}
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => { if (e.key === "Enter" && e.shiftKey) { toggleEditMode() } }}
                    onChange={e => updateTask(task.id, e.target.value)}
                    autoFocus
                    placeholder="Edit your task here"
                    className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"></textarea>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={toggleEditMode}
            onMouseEnter={() => { setMouseIsOver(true) }}
            onMouseLeave={() => { setMouseIsOver(false) }}
            className="Task justify-between px-5 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-lg hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab">
            <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                {task.content}
            </p>
            {mouseIsOver &&
                <button onClick={() => { deleteTask(task.id) }} className="opacity-60 hover:opacity-100 bg-columnBackgroundColor p-2 rounded"><MdOutlineDeleteOutline /></button>
            }
        </div>
    )
}

export default TaskCard
