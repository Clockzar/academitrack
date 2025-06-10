import React, { useState, useEffect, useRef } from 'react';
import { TaskItem, TaskType } from '../types';
import DatePicker from './DatePicker'; // Import the new DatePicker
import { CalendarIcon } from '../constants'; // For the button icon

interface TaskFormProps {
  onSubmit: (data: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => void;
  initialData?: TaskItem;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); // Store as YYYY-MM-DD string
  const [type, setType] = useState<TaskType>(TaskType.ASSIGNMENT);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');
      setType(initialData.type);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!dueDate) newErrors.dueDate = 'Due date is required.';
    else {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if(!datePattern.test(dueDate)) {
            newErrors.dueDate = 'Invalid date format. Use YYYY-MM-DD.';
        } else {
            const dateObj = new Date(dueDate + "T00:00:00"); // Check local time
            if (isNaN(dateObj.getTime())) {
                newErrors.dueDate = 'Invalid date selected.';
            }
        }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // dueDate is 'YYYY-MM-DD'
    const parts = dueDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2], 10);
    // Create a UTC date object for the selected local day
    const dateObjUTC = new Date(Date.UTC(year, month, day));
    const isoDueDate = dateObjUTC.toISOString();

    onSubmit({ 
      title, 
      description: description.trim() ? description : undefined, 
      dueDate: isoDueDate, 
      type 
    });
  };

  const handleDateChange = (isoDateString: string) => {
    setDueDate(isoDateString); // DatePicker returns YYYY-MM-DD
    setIsDatePickerOpen(false); // Close picker on selection
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Select Date';
    // dateString is YYYY-MM-DD. Create date as local.
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day); // This is local midnight
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      }
    }
    return 'Invalid Date';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="taskTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Title
        </label>
        <input
          type="text"
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="e.g., Chapter 5 Homework"
        />
        {errors.title && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="taskDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="e.g., Complete exercises 1-10 on page 50."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="taskDueDateButton" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Due Date
          </label>
          <button
            type="button"
            id="taskDueDateButton"
            ref={datePickerButtonRef}
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="w-full flex items-center justify-between px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            aria-haspopup="true"
            aria-expanded={isDatePickerOpen}
          >
            <span>{formatDateForDisplay(dueDate)}</span>
            <CalendarIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
          {isDatePickerOpen && (
            <DatePicker 
              value={dueDate} 
              onChange={handleDateChange} 
              onClose={() => setIsDatePickerOpen(false)}
            />
          )}
          {errors.dueDate && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.dueDate}</p>}
        </div>
        <div>
          <label htmlFor="taskType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Type
          </label>
          <select
            id="taskType"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value={TaskType.ASSIGNMENT}>Assignment</option>
            <option value={TaskType.EXAM}>Exam</option>
            <option value={TaskType.PROJECT}>Project</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;