import React, { useState, useMemo } from 'react';
import { TaskItem, ClassItem, TaskType } from '../types';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface CalendarViewProps {
  tasks: TaskItem[];
  classes: ClassItem[]; // Keep for potential future use with class colors, though simplified for now
  onViewTask: (task: TaskItem) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, classes, onViewTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysArray = [];

    const firstDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, i - firstDayOfWeek + 1);
      daysArray.push({ date, isCurrentMonth: false, tasksOnDate: [] });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day); // This is local midnight for the cell's date
      
      // Format cell's date to "YYYY-MM-DD" string
      const cellYearStr = date.getFullYear().toString();
      const cellMonthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const cellDayStr = date.getDate().toString().padStart(2, '0');
      const cellDateYYYYMMDD = `${cellYearStr}-${cellMonthStr}-${cellDayStr}`;

      const tasksOnDate = tasks.filter(task => {
        // task.dueDate is "YYYY-MM-DDTHH:MM:SS.sssZ" (UTC)
        // Extract the "YYYY-MM-DD" part of the task's UTC due date
        const taskUTCDatePart = task.dueDate.split('T')[0];
        return taskUTCDatePart === cellDateYYYYMMDD;
      }).sort((a,b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1) || (a.type === TaskType.EXAM ? -1 : 1) - (b.type === TaskType.EXAM ? -1 : 1) );
      
      daysArray.push({ date, isCurrentMonth: true, tasksOnDate });
    }

    const totalDays = daysArray.length;
    const remainingDays = (7 - (totalDays % 7)) % 7; // Ensure it's 0 if totalDays is multiple of 7

    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        daysArray.push({ date, isCurrentMonth: false, tasksOnDate: [] });
    }
    return daysArray;
  }, [currentDate, tasks]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
          <CalendarDaysIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          Academic Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} aria-label="Previous month" className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-md font-medium text-slate-700 dark:text-slate-200 w-32 text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} aria-label="Next month" className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex-grow">
        {weekdays.map(day => (
          <div key={day} className="text-center py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
            {day}
          </div>
        ))}
        {daysInMonth.map(({ date, isCurrentMonth, tasksOnDate }, index) => {
          const isToday = new Date().toDateString() === date.toDateString();
          return (
            <div 
              key={index} 
              className={`p-1.5 min-h-[70px] md:min-h-[90px] relative flex flex-col
                ${isCurrentMonth ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60' : 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'} 
                transition-colors`}
            >
              <span className={`text-xs font-semibold self-start mb-0.5
                ${isToday && isCurrentMonth ? 'bg-blue-600 dark:bg-blue-500 text-white dark:text-white rounded-full w-5 h-5 flex items-center justify-center' : (isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500')}`}>
                {date.getDate()}
              </span>
              {isCurrentMonth && tasksOnDate.length > 0 && (
                <div className="space-y-0.5 overflow-y-auto flex-grow max-h-[50px] md:max-h-[70px] pr-0.5">
                  {tasksOnDate.slice(0, 2).map(task => (
                    <button
                      key={task.id}
                      onClick={() => onViewTask(task)}
                      title={`${task.title} (${task.type})`}
                      className={`w-full text-left text-[10px] md:text-xs px-1 py-0.5 rounded truncate transition-opacity
                        ${task.isCompleted ? 'line-through opacity-60' : ''}
                        ${task.type === TaskType.EXAM 
                          ? 'bg-red-100 dark:bg-red-900/70 text-red-700 dark:text-red-200 hover:opacity-80 dark:hover:bg-red-800/70' 
                          : 'bg-sky-100 dark:bg-sky-900/70 text-sky-700 dark:text-sky-200 hover:opacity-80 dark:hover:bg-sky-800/70'
                        }
                      `}
                    >
                      {task.title}
                    </button>
                  ))}
                  {tasksOnDate.length > 2 && (
                    <div className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 text-center pt-0.5">
                      +{tasksOnDate.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;