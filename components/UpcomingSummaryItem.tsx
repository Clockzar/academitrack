import React from 'react';
import { TaskItem, TaskType, ClassItem } from '../types';
import { CalendarIcon } from '../constants';

interface UpcomingSummaryItemProps {
  task: TaskItem;
  classItem?: ClassItem | null;
  onViewTask: (task: TaskItem) => void;
}

const formatDueDateForShortDisplay = (utcIsoString: string): string => {
  // utcIsoString is "YYYY-MM-DDTHH:mm:ss.sssZ"
  const dateParts = utcIsoString.split('T')[0].split('-');
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(dateParts[2], 10);
    // Create a new Date object using these parts, interpreted as local timezone's midnight
    const displayDate = new Date(year, month, day);
    if (!isNaN(displayDate.getTime())) {
      return displayDate.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    }
  }
  return 'Invalid Date'; // Fallback
};


const UpcomingSummaryItem: React.FC<UpcomingSummaryItemProps> = ({ task, classItem, onViewTask }) => {
  const formattedDueDate = formatDueDateForShortDisplay(task.dueDate);

  const taskTypeDisplay = task.type === TaskType.EXAM ? 'Exam' : (task.type === TaskType.PROJECT ? 'Project' : 'Assignment');
  
  let typeColorClasses, bgColorClasses;
  if (task.type === TaskType.EXAM) {
    typeColorClasses = 'text-red-600 dark:text-red-300';
    bgColorClasses = 'bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-800/60';
  } else if (task.type === TaskType.PROJECT) {
    typeColorClasses = 'text-purple-600 dark:text-purple-300';
    bgColorClasses = 'bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-800/60';
  } else { // Assignment
    typeColorClasses = 'text-sky-600 dark:text-sky-300';
    bgColorClasses = 'bg-sky-50 dark:bg-sky-900/50 hover:bg-sky-100 dark:hover:bg-sky-800/60';
  }
  
  return (
    <div 
      className={`p-3 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-slate-700/40 transition-shadow cursor-pointer ${bgColorClasses}`}
      onClick={() => onViewTask(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewTask(task)}
      aria-label={`View details for ${task.title}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow min-w-0">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={task.title}>{task.title}</h4>
          {classItem && <p className="text-xs font-medium" style={{ color: classItem.textColor.startsWith('text-') ? undefined : classItem.textColor /* For direct color hex */}}>{classItem.name}</p>}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 whitespace-nowrap 
          ${task.type === TaskType.EXAM ? 'bg-red-100 dark:bg-red-800/70 text-red-700 dark:text-red-200' : 
            task.type === TaskType.PROJECT ? 'bg-purple-100 dark:bg-purple-800/70 text-purple-700 dark:text-purple-200' :
            'bg-sky-100 dark:bg-sky-800/70 text-sky-700 dark:text-sky-200'}`}>
          {taskTypeDisplay}
        </span>
      </div>
      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1.5">
        <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
        <span>Due: {formattedDueDate}</span>
      </div>
    </div>
  );
};

export default UpcomingSummaryItem;