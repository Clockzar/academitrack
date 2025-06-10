import React from 'react';
import { ClassItem } from '../types';
import { EditIcon, DeleteIcon, BookOpenIcon } from '../constants';
import ScrollAnimatedItem from './ScrollAnimatedItem';

interface ClassItemCardProps {
  classItem: ClassItem;
  onSelect: (id: string) => void;
  onEdit: (classItem: ClassItem) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  index: number;
}

const ClassItemCard: React.FC<ClassItemCardProps> = ({ classItem, onSelect, onEdit, onDelete, isSelected, index }) => {
  const delayClass = `delay-${Math.min(index * 100, 500)}`;

  // Determine text color for selected state in dark mode
  // Assuming classItem.text is like "text-blue-50". For dark backgrounds, a lighter version of the color or white is better.
  // Most class colors are dark (e.g., bg-blue-500), so light text (e.g., text-blue-50) is good.
  // For dark mode, the selected card will use the class color as background. The text should remain light.
  
  const selectedTextColor = classItem.textColor; // e.g. text-rose-50
  const selectedRingColor = classItem.color.replace('bg-', 'ring-'); // e.g. ring-rose-500

  return (
    <ScrollAnimatedItem className="w-full" delay={delayClass}>
      <div
        className={`
          p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out
          hover:shadow-xl dark:hover:shadow-slate-600/50 hover:scale-[1.02]
          ${isSelected 
            ? `${classItem.color} ${selectedTextColor} ring-4 ring-opacity-50 ${selectedRingColor}` 
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/70'}
        `}
        onClick={() => onSelect(classItem.id)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3 min-w-0"> {/* Added min-w-0 for truncation */}
            <BookOpenIcon className={`w-6 h-6 flex-shrink-0 ${isSelected ? selectedTextColor : 'text-blue-600 dark:text-blue-400'}`} />
            <h3 className={`text-lg font-semibold truncate ${isSelected ? selectedTextColor : 'text-slate-800 dark:text-slate-100'}`}>{classItem.name}</h3>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(classItem); }}
              className={`p-1.5 rounded-md ${isSelected ? 'hover:bg-white/20 dark:hover:bg-white/10' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} transition-colors`}
              aria-label={`Edit class ${classItem.name}`}
            >
              <EditIcon className={`w-5 h-5 ${isSelected ? selectedTextColor : 'text-slate-600 dark:text-slate-300'}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(classItem.id); }}
              className={`p-1.5 rounded-md ${isSelected ? 'hover:bg-white/20 dark:hover:bg-white/10' : 'hover:bg-red-100 dark:hover:bg-red-500/30'} transition-colors`}
              aria-label={`Delete class ${classItem.name}`}
            >
              <DeleteIcon className={`w-5 h-5 ${isSelected ? selectedTextColor : 'text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500'}`} />
            </button>
          </div>
        </div>
      </div>
    </ScrollAnimatedItem>
  );
};

export default ClassItemCard;