import React from 'react';
import { ClassItem } from '../types';
import { PlusIcon, BookOpenIcon } from '../constants';
import ClassItemCard from './ClassItemCard';

interface ClassListProps {
  classes: ClassItem[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  onAddClass: () => void;
  onEditClass: (classItem: ClassItem) => void;
  onDeleteClass: (id: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  onAddClass,
  onEditClass,
  onDeleteClass,
}) => {
  return (
    <div className="p-4 md:p-6 bg-white dark:bg-slate-800 md:rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-baseline mb-6"> {/* Changed items-center to items-baseline */}
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <BookOpenIcon className="w-7 h-7 mr-2 text-blue-600 dark:text-blue-400" />
          My Classes
        </h2>
        <button
          onClick={onAddClass}
          className="flex items-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-1.5 px-3 text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          aria-label="Add new class"
        >
          <PlusIcon className="w-5 h-5 mr-1.5" />
          Add Class
        </button>
      </div>
      {classes.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-8">
          <BookOpenIcon className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-xl font-medium">No classes yet.</p>
          <p className="mt-1">Click "Add Class" to get started!</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-grow"> {/* Added pr-1 and -mr-1 for scrollbar spacing */}
          {classes.map((classItem, index) => (
            <ClassItemCard
              key={classItem.id}
              classItem={classItem}
              onSelect={onSelectClass}
              onEdit={onEditClass}
              onDelete={onDeleteClass}
              isSelected={selectedClassId === classItem.id}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassList;