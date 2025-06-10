import React from 'react';
import { TaskItem, TaskType, ClassItem } from '../types';
import { ClipboardListIcon } from '../constants';
import UpcomingSummaryItem from './UpcomingSummaryItem';

interface UpcomingTasksSectionProps {
  tasks: TaskItem[];
  classes: ClassItem[];
  onViewTask: (task: TaskItem) => void;
}

const UpcomingTasksSection: React.FC<UpcomingTasksSectionProps> = ({ tasks, classes, onViewTask }) => {
  const upcomingAssignments = tasks
    .filter(task => !task.isCompleted && (task.type === TaskType.ASSIGNMENT || task.type === TaskType.PROJECT))
    .filter(task => new Date(task.dueDate) >= new Date(new Date().setHours(0,0,0,0))) // Show today's or future tasks
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
        <ClipboardListIcon className="w-6 h-6 mr-2 text-sky-600 dark:text-sky-400" />
        Upcoming Tasks
      </h3>
      {upcomingAssignments.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-4">
          <ClipboardListIcon className="w-12 h-12 mb-3" />
          <p className="text-md font-medium">No upcoming assignments.</p>
          <p className="text-sm">All clear for now!</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-grow max-h-[300px] md:max-h-[calc(100%-4rem)]">
          {upcomingAssignments.map(task => {
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

export default UpcomingTasksSection;