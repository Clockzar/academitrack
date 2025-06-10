import React, { useState } from 'react';
import { TaskItem, TaskType } from '../types';
import { EditIcon, DeleteIcon, CalendarIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon } from '../constants';
import ScrollAnimatedItem from './ScrollAnimatedItem';

interface TaskItemCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onView: (task: TaskItem) => void;
  onToggleStatus: (id: string) => void; // New prop for toggling completion
  index: number;
}

const formatDueDateForDisplay = (utcIsoString: string): string => {
  // utcIsoString is "YYYY-MM-DDTHH:mm:ss.sssZ"
  const dateParts = utcIsoString.split('T')[0].split('-'); // ["YYYY", "MM", "DD"]
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(dateParts[2], 10);
    // Create a new Date object using these parts, interpreted as local timezone's midnight
    const displayDate = new Date(year, month, day);
    if (!isNaN(displayDate.getTime())) {
      return displayDate.toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }
  return 'Invalid Date'; // Fallback
};

const TaskItemCard: React.FC<TaskItemCardProps> = ({ task, onEdit, onDelete, onView, onToggleStatus, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const delayClass = `delay-${Math.min(index * 100, 500)}`;

  const formattedDueDate = formatDueDateForDisplay(task.dueDate);

  const taskTypeColor = task.type === TaskType.EXAM ? 
    'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 
    'bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200';
  const taskTypeBorderColor = task.type === TaskType.EXAM ? 
    'border-red-500 dark:border-red-700' : 
    'border-sky-500 dark:border-sky-700';

  const isCompleted = task.isCompleted;

  return (
    <ScrollAnimatedItem className="w-full" delay={delayClass}>
      <div 
        className={`
          bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border-l-4 
          ${isCompleted ? 'opacity-60' : ''} ${taskTypeBorderColor} 
          transition-all duration-300 ease-in-out hover:shadow-xl dark:hover:shadow-slate-700/50
        `}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <button
              onClick={() => onToggleStatus(task.id)}
              className={`mr-3 mt-1 flex-shrink-0 p-1 rounded-full transition-colors 
                ${isCompleted 
                  ? 'hover:bg-green-200 dark:hover:bg-green-700' 
                  : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
            >
              {isCompleted ? 
                <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" /> : 
                <XCircleIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />}
            </button>
            <div className="flex-grow min-w-0">
              <h3 
                className={`
                  text-lg font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer 
                  hover:text-blue-600 dark:hover:text-blue-400
                  ${isCompleted ? 'line-through' : ''}
                `}
                onClick={() => onView(task)}
                title={task.title}
              >
                {task.title}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${taskTypeColor}`}>
                  {task.type}
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1 text-slate-400 dark:text-slate-500" />
                  {formattedDueDate}
                </span>
              </div>
            </div>
            <div className="flex space-x-1 flex-shrink-0 ml-2">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={`Edit task ${task.title}`}
                disabled={isCompleted}
              >
                <EditIcon className={`w-5 h-5 ${isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`} />
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation();
                  onDelete(task.id); 
                }}
                className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
                aria-label={`Delete task ${task.title}`}
              >
                <DeleteIcon className="w-5 h-5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500" />
              </button>
            </div>
          </div>
          
          {task.description && (
            <div className="mt-3 pl-10"> {/* Align with title after icon button */}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none ${isCompleted ? 'opacity-70' : ''}`}
              >
                {isExpanded ? 'Hide' : 'Show'} Description
                <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isExpanded && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                  {task.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollAnimatedItem>
  );
};

export default TaskItemCard;