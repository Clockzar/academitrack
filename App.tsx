
import React, { useState, useEffect, useCallback } from 'react';
import { ClassItem, TaskItem, PersonalTaskItem, ModalState, ModalType, TaskType } from './types';
import { CLASS_COLORS, SunIcon, MoonIcon, CalendarDaysIcon, ClipboardListIcon, HomeIcon } from './constants';
import ClassList from './components/ClassList';
import TaskList from './components/TaskList';
import Modal from './components/Modal';
import ClassForm from './components/ClassForm';
import TaskForm from './components/TaskForm';
import PersonalTaskForm from './components/PersonalTaskForm';
import ScrollAnimatedItem from './components/ScrollAnimatedItem';
import CalendarView from './components/CalendarView';
import UpcomingTasksSection from './components/UpcomingTasksSection';
import UpcomingExamsSection from './components/UpcomingExamsSection';
import DailyPersonalTasksSection from './components/DailyPersonalTasksSection';


// Type guards
const isClassItem = (item: any): item is ClassItem => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.color === 'string' && typeof item.textColor === 'string';
const isTaskItem = (item: any): item is TaskItem => 
  item && 
  typeof item.id === 'string' && 
  typeof item.title === 'string' && 
  typeof item.classId === 'string' && 
  typeof item.dueDate === 'string' && 
  Object.values(TaskType).includes(item.type) &&
  (typeof item.isCompleted === 'boolean' || typeof item.isCompleted === 'undefined'); // Added isCompleted check

const isPersonalTaskItem = (item: any): item is PersonalTaskItem => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.isCompleted === 'boolean';

// Date formatting helper
const formatUtcDateToLocalDateDisplay = (utcIsoString: string): string => {
  const dateParts = utcIsoString.split('T')[0].split('-');
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(dateParts[2], 10);
    const displayDate = new Date(year, month, day); // Create as local date
    if (!isNaN(displayDate.getTime())) {
      return displayDate.toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }
  return 'Invalid Date';
};


const App: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTaskItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null, data: undefined });
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    let preference: boolean | null = null;
    try {
      const storedMode = localStorage.getItem('academiTrackDarkMode');
      if (storedMode === "true") {
        preference = true;
      } else if (storedMode === "false") {
        preference = false;
      }
    } catch (error) {
      // Silently catch error, preference remains null
    }

    if (preference !== null) {
      return preference;
    }
    
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Apply dark mode class and save preference
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('academiTrackDarkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Failed to save dark mode preference to localStorage:', error);
    }
  }, [darkMode]);
  

  // Load data from localStorage
  useEffect(() => {
    const storedClasses = localStorage.getItem('academiTrackClasses');
    if (storedClasses) {
      try {
        const parsedClasses = JSON.parse(storedClasses);
        if (Array.isArray(parsedClasses) && parsedClasses.every(isClassItem)) {
          setClasses(parsedClasses);
        } else {
          localStorage.removeItem('academiTrackClasses');
        }
      } catch (e) {
        localStorage.removeItem('academiTrackClasses');
      }
    }
    const storedTasks = localStorage.getItem('academiTrackTasks');
    if (storedTasks) {
       try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.every(isTaskItem)) {
          setTasks(parsedTasks.map(t => ({...t, isCompleted: t.isCompleted ?? false })));
        } else {
          localStorage.removeItem('academiTrackTasks');
        }
      } catch (e) {
        localStorage.removeItem('academiTrackTasks');
      }
    }
    const storedPersonalTasks = localStorage.getItem('academiTrackPersonalTasks');
    if (storedPersonalTasks) {
      try {
        const parsedPersonalTasks = JSON.parse(storedPersonalTasks);
        if (Array.isArray(parsedPersonalTasks) && parsedPersonalTasks.every(isPersonalTaskItem)) {
          setPersonalTasks(parsedPersonalTasks);
        } else {
          localStorage.removeItem('academiTrackPersonalTasks');
        }
      } catch (e) {
        localStorage.removeItem('academiTrackPersonalTasks');
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('academiTrackClasses', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('academiTrackTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('academiTrackPersonalTasks', JSON.stringify(personalTasks));
  }, [personalTasks]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleOpenModal = useCallback((type: ModalType, data?: ClassItem | TaskItem | PersonalTaskItem | { classId?: string }) => {
    setModalState({ isOpen: true, type, data });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, type: null, data: undefined });
  }, []);

  // Class CRUD
  const handleAddClass = useCallback((classData: Pick<ClassItem, 'name'>) => {
    const colorScheme = CLASS_COLORS[classes.length % CLASS_COLORS.length];
    const newClass: ClassItem = {
      id: crypto.randomUUID(),
      name: classData.name,
      color: colorScheme.bg,
      textColor: colorScheme.text,
    };
    setClasses(prev => [...prev, newClass]);
    handleCloseModal();
  }, [classes.length, handleCloseModal]);

  const handleEditClass = useCallback((id: string, updatedData: Pick<ClassItem, 'name'>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...updatedData } : c)));
    handleCloseModal();
  }, [handleCloseModal]);

  const handleDeleteClass = useCallback((id: string) => {
    setClasses(prevClasses => prevClasses.filter(c => c.id !== id));
    setTasks(prevTasks => prevTasks.filter(t => t.classId !== id));
    if (selectedClassId === id) {
      setSelectedClassId(null);
    }
  }, [selectedClassId]); 

  // Task CRUD
  const handleAddTask = useCallback((taskData: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => {
    if (!modalState.data || !('classId' in modalState.data) || !modalState.data.classId) {
        console.error("Cannot add task: classId is missing from modal data.");
        return;
    }
    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      classId: modalState.data.classId,
      isCompleted: false, // Default to not completed
      ...taskData,
    };
    setTasks(prev => [...prev, newTask]);
    handleCloseModal();
  }, [modalState.data, handleCloseModal]);

  const handleEditTask = useCallback((id: string, updatedData: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updatedData } : t)));
    handleCloseModal();
  }, [handleCloseModal]);
  
  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
  }, []);

  const handleToggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }, []);


  // Personal Task CRUD
  const handleAddPersonalTask = useCallback((taskData: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => {
    const newPersonalTask: PersonalTaskItem = {
      id: crypto.randomUUID(),
      isCompleted: false,
      ...taskData,
    };
    setPersonalTasks(prev => [...prev, newPersonalTask]);
    handleCloseModal();
  }, [handleCloseModal]);

  const handleEditPersonalTask = useCallback((id: string, updatedData: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => {
    setPersonalTasks(prev => prev.map(pt => (pt.id === id ? { ...pt, ...updatedData } : pt)));
    handleCloseModal();
  }, [handleCloseModal]);

  const handleDeletePersonalTask = useCallback((id: string) => {
    setPersonalTasks(prev => prev.filter(pt => pt.id !== id));
  }, []);

  const handleTogglePersonalTask = useCallback((id: string) => {
    setPersonalTasks(prev => prev.map(pt => pt.id === id ? {...pt, isCompleted: !pt.isCompleted} : pt));
  }, []);


  const handleSelectClass = useCallback((id: string) => {
    setSelectedClassId(id);
  }, []);
  
  const selectedClass = classes.find(c => c.id === selectedClassId) || null;

  const getModalTitle = () => {
    switch (modalState.type) {
      case 'addClass': return 'Add New Class';
      case 'editClass': return 'Edit Class';
      case 'addTask': return 'Add New Task';
      case 'editTask': return 'Edit Task';
      case 'viewTask': return 'Task Details';
      case 'addPersonalTask': return 'Add Personal Task';
      case 'editPersonalTask': return 'Edit Personal Task';
      default: return '';
    }
  };
  
  const renderModalContent = () => {
    if (!modalState.type) return null;

    switch (modalState.type) {
      case 'addClass':
        return <ClassForm onSubmit={handleAddClass} onClose={handleCloseModal} />;
      case 'editClass':
        if (modalState.data && isClassItem(modalState.data)) {
          const classToEdit = modalState.data;
          return <ClassForm onSubmit={(data) => handleEditClass(classToEdit.id, data)} initialData={classToEdit} onClose={handleCloseModal} />;
        }
        return null;
      case 'addTask':
        if (modalState.data && 'classId' in modalState.data && modalState.data.classId) {
             return <TaskForm onSubmit={handleAddTask} onClose={handleCloseModal} />;
        }
        return <p className="text-red-500 dark:text-red-400">Error: Class context not found. Please select a class and try again.</p>;
      case 'editTask':
        if (modalState.data && isTaskItem(modalState.data)) {
          const taskToEdit = modalState.data;
          return <TaskForm onSubmit={(data) => handleEditTask(taskToEdit.id, data)} initialData={taskToEdit} onClose={handleCloseModal} />;
        }
        return null;
      case 'viewTask':
        if (modalState.data && isTaskItem(modalState.data)) {
            const task = modalState.data;
            const taskClass = classes.find(c => c.id === task.classId);
            return (
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p><strong className="font-semibold text-slate-800 dark:text-slate-100">Class:</strong> {taskClass?.name || 'N/A'}</p>
                    <p><strong className="font-semibold text-slate-800 dark:text-slate-100">Type:</strong> <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${task.type === TaskType.EXAM ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200'}`}>{task.type}</span></p>
                    <p><strong className="font-semibold text-slate-800 dark:text-slate-100">Due Date:</strong> {formatUtcDateToLocalDateDisplay(task.dueDate)}</p>
                    <p><strong className="font-semibold text-slate-800 dark:text-slate-100">Status:</strong> {task.isCompleted ? <span className="text-green-600 dark:text-green-400">Completed</span> : <span className="text-orange-600 dark:text-orange-400">Pending</span>}</p>
                    {task.description && <div className="pt-2">
                        <strong className="font-semibold text-slate-800 dark:text-slate-100">Description:</strong>
                        <p className="mt-1 whitespace-pre-wrap bg-slate-50 dark:bg-slate-700 p-3 rounded-md">{task.description}</p>
                    </div>}
                     <div className="flex justify-end pt-2">
                        <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                        Close
                        </button>
                    </div>
                </div>
            );
        }
        return null;
      case 'addPersonalTask':
        return <PersonalTaskForm onSubmit={handleAddPersonalTask} onClose={handleCloseModal} />;
      case 'editPersonalTask':
        if (modalState.data && isPersonalTaskItem(modalState.data)) {
          const personalTaskToEdit = modalState.data;
          return <PersonalTaskForm onSubmit={(data) => handleEditPersonalTask(personalTaskToEdit.id, data)} initialData={personalTaskToEdit} onClose={handleCloseModal} />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-800 dark:to-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">AcademiTrack</h1>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        {/* Section 1: Dashboard Overview */}
        <section aria-labelledby="dashboard-overview-title">
          <ScrollAnimatedItem delay="delay-0">
            <h2 id="dashboard-overview-title" className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 sr-only">Dashboard Overview</h2>
          </ScrollAnimatedItem>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <ScrollAnimatedItem delay="delay-100" className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg h-full">
                <CalendarView 
                  tasks={tasks} 
                  classes={classes} 
                  onViewTask={(task) => handleOpenModal('viewTask', task)} 
                />
              </div>
            </ScrollAnimatedItem>
            <ScrollAnimatedItem delay="delay-200" className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg h-full">
                <DailyPersonalTasksSection
                  personalTasks={personalTasks}
                  onAdd={() => handleOpenModal('addPersonalTask')}
                  onEdit={(task) => handleOpenModal('editPersonalTask', task)}
                  onDelete={handleDeletePersonalTask}
                  onToggleComplete={handleTogglePersonalTask}
                />
              </div>
            </ScrollAnimatedItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
            <ScrollAnimatedItem delay="delay-300">
              <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg h-full">
                <UpcomingTasksSection 
                  tasks={tasks} 
                  classes={classes} 
                  onViewTask={(task) => handleOpenModal('viewTask', task)} 
                />
              </div>
            </ScrollAnimatedItem>
            <ScrollAnimatedItem delay="delay-400">
              <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg h-full">
                <UpcomingExamsSection 
                  tasks={tasks} 
                  classes={classes} 
                  onViewTask={(task) => handleOpenModal('viewTask', task)} 
                />
              </div>
            </ScrollAnimatedItem>
          </div>
        </section>

        {/* Section 2: Class & Task Management */}
        <section aria-labelledby="class-management-title" className="pt-8">
           <ScrollAnimatedItem delay="delay-500">
             <h2 id="class-management-title" className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Class & Task Management</h2>
           </ScrollAnimatedItem>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 items-start">
            <div className="md:col-span-1 lg:col-span-1 h-full md:max-h-[calc(100vh-160px)] md:sticky md:top-[calc(theme(spacing.16)+theme(spacing.4))]">
              <ClassList
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={handleSelectClass}
                onAddClass={() => handleOpenModal('addClass')}
                onEditClass={(classItem) => handleOpenModal('editClass', classItem)}
                onDeleteClass={handleDeleteClass}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 h-full md:max-h-[calc(100vh-160px)]">
               <TaskList
                tasks={tasks}
                selectedClass={selectedClass}
                onAddTask={() => selectedClassId ? handleOpenModal('addTask', { classId: selectedClassId }) : alert("Please select a class first.")}
                onEditTask={(task) => handleOpenModal('editTask', task)}
                onDeleteTask={handleDeleteTask}
                onViewTask={(task) => handleOpenModal('viewTask', task)}
                onToggleTaskStatus={handleToggleTaskStatus} // Pass handler
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 dark:bg-slate-900 text-slate-300 dark:text-slate-400 py-6 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} AcademiTrack. All rights reserved.</p>
      </footer>
      
      {modalState.isOpen && (
        <Modal 
            isOpen={modalState.isOpen} 
            onClose={handleCloseModal} 
            title={getModalTitle()} 
            size={modalState.type === 'viewTask' ? 'lg' : (modalState.type === 'addPersonalTask' || modalState.type === 'editPersonalTask' ? 'md' : 'md')}
        >
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
};

export default App;
