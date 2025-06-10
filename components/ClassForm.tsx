import React, { useState, useEffect } from 'react';
import { ClassItem } from '../types';

interface ClassFormProps {
  onSubmit: (data: Pick<ClassItem, 'name'>) => void;
  initialData?: ClassItem;
  onClose: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Class name is required.');
      return;
    }
    setError('');
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="className" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Class Name
        </label>
        <input
          type="text"
          id="className"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="e.g., Mathematics 101"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>
      <div className="flex justify-end space-x-3">
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
          {initialData ? 'Save Changes' : 'Add Class'}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;