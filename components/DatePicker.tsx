import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, CalendarIcon } from '../constants';

interface DatePickerProps {
  value: string | null; // ISO string date YYYY-MM-DD
  onChange: (isoDateString: string) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, onClose }) => {
  // value is YYYY-MM-DD. new Date(value) will parse it as UTC midnight.
  // For display month/year, we need to interpret it as local.
  // Add 'T00:00:00' to make it parse as local time.
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const [currentDisplayDate, setCurrentDisplayDate] = useState(initialDate);

  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
        const newSelectedDate = new Date(value + "T00:00:00");
        if (!isNaN(newSelectedDate.getTime())) {
             setCurrentDisplayDate(newSelectedDate); // Sync display month with selected value if valid
        }
    } else {
        setCurrentDisplayDate(new Date()); // Reset to current month if value is cleared
    }
  }, [value]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const daysInMonth = useMemo(() => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, i - firstDayOfWeek + 1);
      days.push({ date, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    const totalDays = days.length;
    const remainingDays = (7 - (totalDays % 7)) % 7 ; 

    if (remainingDays > 0) { 
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false });
        }
    }
    return days;
  }, [currentDisplayDate]);

  const handlePrevMonth = () => {
    setCurrentDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    // onClose(); // Kept open by user request implicitly. Explicit close button.
  };
  
  // value is YYYY-MM-DD, parse as local date for comparison
  const selectedDateObj = value ? new Date(value + "T00:00:00") : null;

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div 
      ref={datePickerRef} 
      className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl z-50 p-3 space-y-2"
    >
      <div className="flex justify-between items-center">
        <button onClick={handlePrevMonth} aria-label="Previous month" className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {currentDisplayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={handleNextMonth} aria-label="Next month" className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map(day => (
          <div key={day} className="text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
            {day}
          </div>
        ))}
        {daysInMonth.map(({ date, isCurrentMonth }, index) => {
          const isSelected = selectedDateObj && date.toDateString() === selectedDateObj.toDateString() && isCurrentMonth;
          const isToday = new Date().toDateString() === date.toDateString() && isCurrentMonth;
          
          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && handleDateSelect(date)}
              disabled={!isCurrentMonth}
              className={`
                py-1.5 text-sm rounded-md transition-colors
                ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'hover:bg-blue-100 dark:hover:bg-blue-700/50'}
                ${isSelected ? 'bg-blue-600 dark:bg-blue-500 text-white dark:text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600' : ''}
                ${!isSelected && isToday ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}
                ${isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end pt-1">
        <button 
            onClick={onClose} 
            className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
        >
            Close
        </button>
      </div>
    </div>
  );
};

export default DatePicker;