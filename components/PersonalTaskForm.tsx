import React, { useState, useEffect } from 'react';
import { PersonalTaskItem } from '../types';

interface PersonalTaskFormProps {
  onSubmit: (data: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => void;
  initialData?: PersonalTaskItem;
  onClose: () => void;
}

const PersonalTaskForm: React.FC<PersonalTaskFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    setError('');
    onSubmit({ 
        title, 
        description: description.trim() ? description : undefined,
        category: category.trim() ? category : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="personalTaskTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Task Title
        </label>
        <input
          type="text"
          id="personalTaskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="e.g., Grocery Shopping"
          aria-required="true"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="personalTaskDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="personalTaskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="e.g., Buy milk, eggs, and bread."
        />
      </div>

      <div>
        <label htmlFor="personalTaskCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Category (Optional)
        </label>
        <input
          type="text"
          id="personalTaskCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="e.g., Chore, Errand, Wellness"
        />
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
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default PersonalTaskForm;