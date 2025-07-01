import React from 'react';
import { TaskItem, TaskType, ClassItem } from '../types';
import { CalendarIcon } // Or a more specific exam icon
from '../constants';
import UpcomingSummaryItem from './UpcomingSummaryItem';

interface UpcomingExamsSectionProps {
  tasks: TaskItem[];
  classes: ClassItem[];
  onViewTask: (task: TaskItem) => void;
}

const UpcomingExamsSection: React.FC<UpcomingExamsSectionProps> = ({ tasks, classes, onViewTask }) => {
  const upcomingExams = tasks
    .filter(task => !task.isCompleted && task.type === TaskType.EXAM)
    .filter(task => new Date(task.dueDate) >= new Date(new Date().setHours(0,0,0,0))) // Show today's or future exams
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5); // Limit to 5 items

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
        <CalendarIcon className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
        Upcoming Exams
      </h3>
      {upcomingExams.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-4">
          <CalendarIcon className="w-12 h-12 mb-3" />
          <p className="text-md font-medium">No upcoming exams.</p>
          <p className="text-sm">Enjoy the peace while it lasts!</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-grow max-h-[300px] md:max-h-[calc(100%-4rem)]">
          {upcomingExams.map(task => {
            const classItem = classes.find(c => c.id === task.classId);
            return (
              <UpcomingSummaryItem 
                key={task.id} 
                task={task} 
                classItem={classItem} 
                onViewTask={onViewTask} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingExamsSection;