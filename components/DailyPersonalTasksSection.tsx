import React from 'react';
import { PersonalTaskItem } from '../types';
import { PlusIcon, HomeIcon } from '../constants';
import PersonalTaskItemCard from './PersonalTaskItemCard';

interface DailyPersonalTasksSectionProps {
  personalTasks: PersonalTaskItem[];
  onAdd: () => void;
  onEdit: (task: PersonalTaskItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const DailyPersonalTasksSection: React.FC<DailyPersonalTasksSectionProps> = ({
  personalTasks,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const incompleteTasks = personalTasks.filter(task => !task.isCompleted);
  const completedTasks = personalTasks.filter(task => task.isCompleted);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
          <HomeIcon className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
          Daily & Personal Tasks
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-1.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 text-sm"
          aria-label="Add new personal task"
        >
          <PlusIcon className="w-4 h-4 mr-1.5" />
          Add Task
        </button>
      </div>
      
      {personalTasks.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-4">
          <HomeIcon className="w-12 h-12 mb-3" />
          <p className="text-md font-medium">No personal tasks yet.</p>
          <p className="text-sm">Add chores, errands, or goals!</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-grow max-h-[300px] md:max-h-[calc(100%-4rem)]"> {/* Adjust max-h as needed */}
          {incompleteTasks.map(task => (
            <PersonalTaskItemCard
              key={task.id}
              personalTask={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
          {completedTasks.length > 0 && incompleteTasks.length > 0 && <hr className="my-3 border-slate-200 dark:border-slate-700"/>}
          {completedTasks.map(task => (
            <PersonalTaskItemCard
              key={task.id}
              personalTask={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyPersonalTasksSection;