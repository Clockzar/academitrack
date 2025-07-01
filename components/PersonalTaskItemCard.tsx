import React from 'react';
import { PersonalTaskItem } from '../types';
import { EditIcon, DeleteIcon, CheckCircleIcon, XCircleIcon } from '../constants';

interface PersonalTaskItemCardProps {
  personalTask: PersonalTaskItem;
  onEdit: (task: PersonalTaskItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const PersonalTaskItemCard: React.FC<PersonalTaskItemCardProps> = ({ personalTask, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div className={`
      p-3 rounded-lg shadow transition-all duration-300 ease-in-out flex items-center space-x-3 
      ${personalTask.isCompleted 
        ? 'bg-slate-100 dark:bg-slate-700/50 opacity-70' 
        : 'bg-white dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-700/50'}
    `}>
      <button 
        onClick={() => onToggleComplete(personalTask.id)} 
        aria-label={personalTask.isCompleted ? `Mark ${personalTask.title} as incomplete` : `Mark ${personalTask.title} as complete`}
        className="flex-shrink-0 p-1 rounded-full transition-colors"
      >
        {personalTask.isCompleted ? 
          <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" /> : 
          <XCircleIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />}
      </button>
      <div className="flex-grow min-w-0">
        <h4 className={`font-medium ${personalTask.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-100'}`}>{personalTask.title}</h4>
        {personalTask.category && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full 
            ${personalTask.isCompleted 
              ? 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400' 
              : 'bg-indigo-100 dark:bg-indigo-800/70 text-indigo-700 dark:text-indigo-300'}`}>
            {personalTask.category}
          </span>
        )}
        {personalTask.description && !personalTask.isCompleted && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5" title={personalTask.description}>{personalTask.description}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex space-x-1">
        <button
          onClick={() => onEdit(personalTask)}
          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label={`Edit personal task ${personalTask.title}`}
          disabled={personalTask.isCompleted}
        >
          <EditIcon className={`w-5 h-5 ${personalTask.isCompleted ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300'}`} />
        </button>
        <button
          onClick={() => onDelete(personalTask.id)}
          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
          aria-label={`Delete personal task ${personalTask.title}`}
        >
          <DeleteIcon className="w-5 h-5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default PersonalTaskItemCard;