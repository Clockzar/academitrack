import React from 'react';
import { TaskItem, ClassItem } from '../types';
import { PlusIcon, ClipboardListIcon } from '../constants';
import TaskItemCard from './TaskItemCard';

interface TaskListProps {
  tasks: TaskItem[];
  selectedClass: ClassItem | null;
  onAddTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onViewTask: (task: TaskItem) => void;
  onToggleTaskStatus: (id: string) => void; // Added for task completion
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedClass,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onToggleTaskStatus, // Added
}) => {
  if (!selectedClass) {
    return (
      <div className="p-4 md:p-6 bg-white dark:bg-slate-800 md:rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-center">
        <ClipboardListIcon className="w-20 h-20 mb-6 text-slate-400 dark:text-slate-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Select a Class</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Choose a class from the list to view its tasks.</p>
      </div>
    );
  }

  const tasksForSelectedClass = tasks
    .filter(task => task.classId === selectedClass.id)
    .sort((a,b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());


  return (
    <div className="p-4 md:p-6 bg-white dark:bg-slate-800 md:rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center">
          <ClipboardListIcon className="w-7 h-7 mr-2 text-blue-600 dark:text-blue-400" />
          Tasks for <span className="ml-2 font-bold" style={{ color: selectedClass.textColor.startsWith('text-') ? undefined : selectedClass.textColor /* direct color value */ }}>{selectedClass.name}</span>
        </h2>
        <button
          onClick={onAddTask}
          className="flex items-center bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          aria-label={`Add new task to ${selectedClass.name}`}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Task
        </button>
      </div>
      {tasksForSelectedClass.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-8">
          <ClipboardListIcon className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-xl font-medium">No tasks yet for {selectedClass.name}.</p>
          <p className="mt-1">Click "Add Task" to create one!</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-1 -mr-1 flex-grow">  {/* Added pr-1 and -mr-1 for scrollbar spacing */}
          {tasksForSelectedClass.map((task, index) => (
            <TaskItemCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onView={onViewTask}
              onToggleStatus={onToggleTaskStatus} // Pass handler
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;