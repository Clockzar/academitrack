
<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User
} from 'firebase/auth';
import { 
  db, 
  auth, 
  GoogleAuthProvider 
} from './firebase';
import { 
  collection, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

// Types
import { ClassItem, TaskItem, TaskType, PersonalTaskItem, ModalState, ModalType } from './types';

// Constants and Icons
import { CLASS_COLORS, SunIcon, MoonIcon, HomeIcon, CalendarDaysIcon, ClipboardListIcon, BookOpenIcon, CheckCircleIcon, XCircleIcon } from './constants';

// Components
=======

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User
} from 'firebase/auth';
import { 
  db, 
  auth, 
  GoogleAuthProvider 
} from './firebase';
import { 
  collection, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

// Types
import { ClassItem, TaskItem, TaskType, PersonalTaskItem, ModalState, ModalType } from './types';

// Constants and Icons
import { CLASS_COLORS, SunIcon, MoonIcon, HomeIcon, CalendarDaysIcon, ClipboardListIcon, BookOpenIcon, CheckCircleIcon, XCircleIcon } from './constants';

// Components
import ClassList from './components/ClassList';
import TaskList from './components/TaskList';
import Modal from './components/Modal';
import ClassForm from './components/ClassForm';
import TaskForm from './components/TaskForm';
import PersonalTaskForm from './components/PersonalTaskForm';
import DailyPersonalTasksSection from './components/DailyPersonalTasksSection';
import UpcomingTasksSection from './components/UpcomingTasksSection';
import UpcomingExamsSection from './components/UpcomingExamsSection';
import CalendarView from './components/CalendarView';

// App component
const App = () => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start with loading true for auth check
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [personalTasks, setPersonalTasks] = useState<PersonalTaskItem[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null });
    const [activeView, setActiveView] = useState<'dashboard' | 'manager' | 'calendar'>('dashboard');

    // Theme effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Auth effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) {
                // Clear all data on logout
                setClasses([]);
                setTasks([]);
                setPersonalTasks([]);
                setSelectedClassId(null);
                setInitialDataLoaded(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Firestore data listeners effect
    useEffect(() => {
        if (!user) return;

        setInitialDataLoaded(false); // Reset loading state for new user data

        const classesQuery = query(collection(db, 'users', user.uid, 'classes'));
        const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'));
        const personalTasksQuery = query(collection(db, 'users', user.uid, 'personalTasks'));

        const unsubClasses = onSnapshot(classesQuery, (snapshot) => {
            const classesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClassItem[];
            setClasses(classesData.sort((a,b) => a.name.localeCompare(b.name)));
        });

        const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => {
              const data = doc.data();
              // Firestore Timestamps need to be converted to ISO strings
              return { 
                id: doc.id, 
                ...data, 
                dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() 
              }
            }) as TaskItem[];
            setTasks(tasksData);
        });

        const unsubPersonalTasks = onSnapshot(personalTasksQuery, (snapshot) => {
            const personalTasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PersonalTaskItem[];
            setPersonalTasks(personalTasksData);
            setInitialDataLoaded(true); // Set loaded after the last listener is set up
        });

        // Cleanup
        return () => {
            unsubClasses();
            unsubTasks();
            unsubPersonalTasks();
        };
    }, [user]);

    // Derived state
    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || null, [classes, selectedClassId]);

    // Modal handlers
    const openModal = useCallback((type: ModalType, data?: any) => {
        setModalState({ isOpen: true, type, data });
    }, []);
    const closeModal = useCallback(() => {
        setModalState({ isOpen: false, type: null });
    }, []);
    
    // CRUD Handlers
    // Classes
    const handleAddClass = async (data: { name: string }) => {
        if (!user) return;
        const colorIndex = classes.length % CLASS_COLORS.length;
        const newClass = {
            ...data,
            color: CLASS_COLORS[colorIndex].bg,
            textColor: CLASS_COLORS[colorIndex].text,
        };
        await addDoc(collection(db, 'users', user.uid, 'classes'), newClass);
        closeModal();
    };

    const handleEditClass = async (data: { name: string }) => {
        if (!user || !modalState.data || !('id' in modalState.data)) return;
        const classDocRef = doc(db, 'users', user.uid, 'classes', modalState.data.id);
        await updateDoc(classDocRef, { name: data.name });
        closeModal();
    };

    const handleDeleteClass = async (classId: string) => {
        if (!user || !window.confirm("Are you sure? This will also delete all tasks associated with this class.")) return;
        const batch = writeBatch(db);
        // Delete class doc
        const classDocRef = doc(db, 'users', user.uid, 'classes', classId);
        batch.delete(classDocRef);
        // Find and delete associated tasks
        const tasksQueryToDelete = query(collection(db, 'users', user.uid, 'tasks'), where('classId', '==', classId));
        const taskSnapshot = await getDocs(tasksQueryToDelete);
        taskSnapshot.forEach(taskDoc => batch.delete(taskDoc.ref));
        
        await batch.commit();
        if(selectedClassId === classId) setSelectedClassId(null);
    };

    // Tasks
    const handleAddTask = async (data: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => {
        if (!user || !selectedClassId) return;
        const newTask = {
            ...data,
            classId: selectedClassId,
            isCompleted: false,
            // Convert ISO string back to Firestore Timestamp
            dueDate: Timestamp.fromDate(new Date(data.dueDate))
        };
        await addDoc(collection(db, 'users', user.uid, 'tasks'), newTask);
        closeModal();
    };

    const handleEditTask = async (data: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => {
        if (!user || !modalState.data || !('id' in modalState.data)) return;
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', modalState.data.id);
        await updateDoc(taskDocRef, { 
            ...data,
            dueDate: Timestamp.fromDate(new Date(data.dueDate))
        });
        closeModal();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
    };

    const handleToggleTaskStatus = async (taskId: string) => {
        if (!user) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
        await updateDoc(taskDocRef, { isCompleted: !task.isCompleted });
    };
    
    // Personal Tasks
    const handleAddPersonalTask = async (data: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => {
      if(!user) return;
      await addDoc(collection(db, 'users', user.uid, 'personalTasks'), {
        ...data,
        isCompleted: false,
        createdAt: serverTimestamp(),
      });
      closeModal();
    }
    
    const handleEditPersonalTask = async (data: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => {
      if (!user || !modalState.data || !('id' in modalState.data)) return;
      const taskDocRef = doc(db, 'users', user.uid, 'personalTasks', modalState.data.id);
      await updateDoc(taskDocRef, data);
      closeModal();
    }
    
    const handleDeletePersonalTask = async (taskId: string) => {
      if(!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'personalTasks', taskId));
    }

    const handleTogglePersonalTaskComplete = async (taskId: string) => {
      if(!user) return;
      const task = personalTasks.find(t => t.id === taskId);
      if(!task) return;
      const taskDocRef = doc(db, 'users', user.uid, 'personalTasks', taskId);
      await updateDoc(taskDocRef, { isCompleted: !task.isCompleted });
    }

    // Auth handlers
    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // Render Logic
    if (loading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4">
                <div className="text-center max-w-md w-full">
                    <BookOpenIcon className="w-20 h-20 mx-auto text-blue-600 dark:text-blue-500 mb-4" />
                    <h1 className="text-4xl font-bold mb-2">Welcome to AcademiTrack</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Your personal academic and task manager.</p>
                    <button
                        onClick={handleSignIn}
                        className="w-full flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                         <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                        <span className="font-semibold">Sign in with Google</span>
                    </button>
                </div>
            </div>
        );
    }
    
    // Main App UI
    return (
        <div className="flex h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
            {/* Main container */}
            <main className="flex-1 flex flex-col p-2 md:p-4 lg:p-6 overflow-hidden">
                {/* Header */}
                 <header className="flex-shrink-0 mb-4 flex flex-col md:flex-row justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                        <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-500"/>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AcademiTrack</h1>
                        <nav className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setActiveView('dashboard')} className={`p-2 rounded-md transition-colors ${activeView === 'dashboard' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`} aria-label="Dashboard"><HomeIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveView('manager')} className={`p-2 rounded-md transition-colors ${activeView === 'manager' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`} aria-label="Class Manager"><ClipboardListIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveView('calendar')} className={`p-2 rounded-md transition-colors ${activeView === 'calendar' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`} aria-label="Calendar"><CalendarDaysIcon className="w-5 h-5"/></button>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                            {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
                        </button>
                        {user.photoURL && <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full" />}
                        <button onClick={handleSignOut} className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Sign Out</button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    { !initialDataLoaded && user ? (
                       <div className="w-full h-full flex items-center justify-center">
                           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                       </div>
                    ) : (
                        <div className="h-full w-full">
                            {activeView === 'dashboard' && (
                               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-1 overflow-y-auto">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 lg:col-span-1 min-h-[400px]">
                                      <DailyPersonalTasksSection personalTasks={personalTasks} onAdd={() => openModal('addPersonalTask')} onEdit={(task) => openModal('editPersonalTask', task)} onDelete={handleDeletePersonalTask} onToggleComplete={handleTogglePersonalTaskComplete} />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 lg:col-span-1 min-h-[400px]">
                                      <UpcomingTasksSection tasks={tasks} classes={classes} onViewTask={(task) => openModal('viewTask', task)} />
                                    </div>
                                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 lg:col-span-1 min-h-[400px]">
                                       <UpcomingExamsSection tasks={tasks} classes={classes} onViewTask={(task) => openModal('viewTask', task)} />
                                     </div>
                                </div>
                            )}
                             {activeView === 'manager' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                    <div className="lg:col-span-1 h-full"><ClassList classes={classes} selectedClassId={selectedClassId} onSelectClass={setSelectedClassId} onAddClass={() => openModal('addClass')} onEditClass={(cls) => openModal('editClass', cls)} onDeleteClass={handleDeleteClass} /></div>
                                    <div className="lg:col-span-2 h-full"><TaskList tasks={tasks} selectedClass={selectedClass} onAddTask={() => openModal('addTask', { classId: selectedClassId })} onEditTask={(task) => openModal('editTask', task)} onDeleteTask={handleDeleteTask} onViewTask={(task) => openModal('viewTask', task)} onToggleTaskStatus={handleToggleTaskStatus}/></div>
                                </div>
                            )}
                             {activeView === 'calendar' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 h-full">
                                    <CalendarView tasks={tasks} classes={classes} onViewTask={(task) => openModal('viewTask', task)} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={
                    modalState.type === 'addClass' ? 'Add a New Class' :
                    modalState.type === 'editClass' ? 'Edit Class' :
                    modalState.type === 'addTask' ? `Add Task to ${selectedClass?.name}`:
                    modalState.type === 'editTask' ? 'Edit Task' :
                    modalState.type === 'addPersonalTask' ? 'Add Personal Task' :
                    modalState.type === 'editPersonalTask' ? 'Edit Personal Task' :
                    modalState.type === 'viewTask' ? 'Task Details' :
                    'Modal'
                }
            >
                {modalState.type === 'addClass' && <ClassForm onSubmit={handleAddClass} onClose={closeModal} />}
                {modalState.type === 'editClass' && <ClassForm onSubmit={handleEditClass} initialData={modalState.data as ClassItem} onClose={closeModal} />}
                {modalState.type === 'addTask' && <TaskForm onSubmit={handleAddTask} onClose={closeModal} />}
                {modalState.type === 'editTask' && <TaskForm onSubmit={handleEditTask} initialData={modalState.data as TaskItem} onClose={closeModal} />}
                {modalState.type === 'addPersonalTask' && <PersonalTaskForm onSubmit={handleAddPersonalTask} onClose={closeModal} />}
                {modalState.type === 'editPersonalTask' && <PersonalTaskForm onSubmit={handleEditPersonalTask} initialData={modalState.data as PersonalTaskItem} onClose={closeModal} />}
                {modalState.type === 'viewTask' && modalState.data && (
                    <div className="text-slate-700 dark:text-slate-300 space-y-4">
                        <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 pr-4">{(modalState.data as TaskItem).title}</h3>
                             <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap
                                 ${(modalState.data as TaskItem).type === TaskType.EXAM ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200'}`}>
                                 {(modalState.data as TaskItem).type}
                             </span>
                        </div>

                        <p><strong>Class:</strong> {classes.find(c => c.id === (modalState.data as TaskItem).classId)?.name || 'N/A'}</p>
                        
                        <p><strong>Due:</strong> {new Date((modalState.data as TaskItem).dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <div className="flex items-center space-x-2">
                            <strong>Status:</strong>
                             {(modalState.data as TaskItem).isCompleted 
                                ? <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircleIcon className="w-5 h-5 mr-1"/>Completed</span> 
                                : <span className="flex items-center text-slate-600 dark:text-slate-400"><XCircleIcon className="w-5 h-5 mr-1"/>Incomplete</span>
                             }
                        </div>
                        {(modalState.data as TaskItem).description && <div className="space-y-1"><p className="font-semibold">Description:</p><p className="whitespace-pre-wrap bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-slate-600 dark:text-slate-300">{(modalState.data as TaskItem).description}</p></div>}
                        <div className="flex justify-end pt-4">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-md">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;

>>>>>>> f51626b0f94bf6380ec4e12bcd124e0be922a5e2
import ClassList from './components/ClassList';
import TaskList from './components/TaskList';
import Modal from './components/Modal';
import ClassForm from './components/ClassForm';
import TaskForm from './components/TaskForm';
import PersonalTaskForm from './components/PersonalTaskForm';
<<<<<<< HEAD
import DailyPersonalTasksSection from './components/DailyPersonalTasksSection';
import UpcomingTasksSection from './components/UpcomingTasksSection';
import UpcomingExamsSection from './components/UpcomingExamsSection';
import CalendarView from './components/CalendarView';

// App component
const App = () => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start with loading true for auth check
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [personalTasks, setPersonalTasks] = useState<PersonalTaskItem[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null });
    const [activeView, setActiveView] = useState<'dashboard' | 'manager' | 'calendar'>('dashboard');

    // Theme effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Auth effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) {
                // Clear all data on logout
                setClasses([]);
                setTasks([]);
                setPersonalTasks([]);
                setSelectedClassId(null);
                setInitialDataLoaded(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Firestore data listeners effect
    useEffect(() => {
        if (!user) return;

        setInitialDataLoaded(false); // Reset loading state for new user data

        const classesQuery = query(collection(db, 'users', user.uid, 'classes'));
        const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'));
        const personalTasksQuery = query(collection(db, 'users', user.uid, 'personalTasks'));

        const unsubClasses = onSnapshot(classesQuery, (snapshot) => {
            const classesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClassItem[];
            setClasses(classesData.sort((a,b) => a.name.localeCompare(b.name)));
        });

        const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => {
              const data = doc.data();
              // Firestore Timestamps need to be converted to ISO strings
              return { 
                id: doc.id, 
                ...data, 
                dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() 
              }
            }) as TaskItem[];
            setTasks(tasksData);
        });

        const unsubPersonalTasks = onSnapshot(personalTasksQuery, (snapshot) => {
            const personalTasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PersonalTaskItem[];
            setPersonalTasks(personalTasksData);
            setInitialDataLoaded(true); // Set loaded after the last listener is set up
        });

        // Cleanup
        return () => {
            unsubClasses();
            unsubTasks();
            unsubPersonalTasks();
        };
    }, [user]);

    // Derived state
    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || null, [classes, selectedClassId]);

    // Modal handlers
    const openModal = useCallback((type: ModalType, data?: any) => {
        setModalState({ isOpen: true, type, data });
    }, []);
    const closeModal = useCallback(() => {
        setModalState({ isOpen: false, type: null });
    }, []);
    
    // CRUD Handlers
    // Classes
    const handleAddClass = async (data: { name: string }) => {
        if (!user) return;
        const colorIndex = classes.length % CLASS_COLORS.length;
        const newClass = {
            ...data,
            color: CLASS_COLORS[colorIndex].bg,
            textColor: CLASS_COLORS[colorIndex].text,
        };
        await addDoc(collection(db, 'users', user.uid, 'classes'), newClass);
        closeModal();
    };

    const handleEditClass = async (data: { name: string }) => {
        if (!user || !modalState.data || !('id' in modalState.data)) return;
        const classDocRef = doc(db, 'users', user.uid, 'classes', modalState.data.id);
        await updateDoc(classDocRef, { name: data.name });
        closeModal();
    };

    const handleDeleteClass = async (classId: string) => {
        if (!user || !window.confirm("Are you sure? This will also delete all tasks associated with this class.")) return;
        const batch = writeBatch(db);
        // Delete class doc
        const classDocRef = doc(db, 'users', user.uid, 'classes', classId);
        batch.delete(classDocRef);
        // Find and delete associated tasks
        const tasksQueryToDelete = query(collection(db, 'users', user.uid, 'tasks'), where('classId', '==', classId));
        const taskSnapshot = await getDocs(tasksQueryToDelete);
        taskSnapshot.forEach(taskDoc => batch.delete(taskDoc.ref));
        
        await batch.commit();
        if(selectedClassId === classId) setSelectedClassId(null);
    };

    // Tasks
    const handleAddTask = async (data: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => {
        if (!user || !selectedClassId) return;
        const newTask = {
            ...data,
            classId: selectedClassId,
            isCompleted: false,
            // Convert ISO string back to Firestore Timestamp
            dueDate: Timestamp.fromDate(new Date(data.dueDate))
        };
        await addDoc(collection(db, 'users', user.uid, 'tasks'), newTask);
        closeModal();
    };

    const handleEditTask = async (data: Omit<TaskItem, 'id' | 'classId' | 'isCompleted'>) => {
        if (!user || !modalState.data || !('id' in modalState.data)) return;
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', modalState.data.id);
        await updateDoc(taskDocRef, { 
            ...data,
            dueDate: Timestamp.fromDate(new Date(data.dueDate))
        });
        closeModal();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
    };

    const handleToggleTaskStatus = async (taskId: string) => {
        if (!user) return;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
        await updateDoc(taskDocRef, { isCompleted: !task.isCompleted });
    };
    
    // Personal Tasks
    const handleAddPersonalTask = async (data: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => {
      if(!user) return;
      await addDoc(collection(db, 'users', user.uid, 'personalTasks'), {
        ...data,
        isCompleted: false,
        createdAt: serverTimestamp(),
      });
      closeModal();
    }
    
    const handleEditPersonalTask = async (data: Omit<PersonalTaskItem, 'id' | 'isCompleted'>) => {
      if (!user || !modalState.data || !('id' in modalState.data)) return;
      const taskDocRef = doc(db, 'users', user.uid, 'personalTasks', modalState.data.id);
      await updateDoc(taskDocRef, data);
      closeModal();
    }
    
    const handleDeletePersonalTask = async (taskId: string) => {
      if(!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'personalTasks', taskId));
    }

    const handleTogglePersonalTaskComplete = async (taskId: string) => {
      if(!user) return;
      const task = personalTasks.find(t => t.id === taskId);
      if(!task) return;
      const taskDocRef = doc(db, 'users', user.uid, 'personalTasks', taskId);
      await updateDoc(taskDocRef, { isCompleted: !task.isCompleted });
    }

    // Auth handlers
    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // Render Logic
    if (loading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4">
                <div className="text-center max-w-md w-full">
                    <BookOpenIcon className="w-20 h-20 mx-auto text-blue-600 dark:text-blue-500 mb-4" />
                    <h1 className="text-4xl font-bold mb-2">Welcome to AcademiTrack</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Your personal academic and task manager.</p>
                    <button
                        onClick={handleSignIn}
                        className="w-full flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                         <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                        <span className="font-semibold">Sign in with Google</span>
                    </button>
                </div>
            </div>
        );
    }
    
    // Main App UI
    return (
        <div className="flex h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
            {/* Main container */}
            <main className="flex-1 flex flex-col p-2 md:p-4 lg:p-6 overflow-hidden">
                {/* Header */}
                 <header className="flex-shrink-0 mb-4 flex flex-col md:flex-row justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                        <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-500"/>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AcademiTrack</h1>
                        <nav className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setActiveView('dashboard')} className={`p-2 rounded-md transition-colors ${activeView === 'dashboard' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`} aria-label="Dashboard"><HomeIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveView('manager')} className={`p-2 rounded-md transition-colors ${activeView === 'manager' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`} aria-label="Class Manager"><ClipboardListIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveView('calendar')} className={`p-2 rounded-md transition-colors ${activeView === 'calendar' ? 'bg-white dark:bg-slate-800 shadow' : 'hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`} aria-label="Calendar"><CalendarDaysIcon className="w-5 h-5"/></button>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                            {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
                        </button>
                        {user.photoURL && <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full" />}
                        <button onClick={handleSignOut} className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Sign Out</button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    { !initialDataLoaded && user ? (
                       <div className="w-full h-full flex items-center justify-center">
                           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                       </div>
                    ) : (
                        <div className="h-full w-full">
                            {activeView === 'dashboard' && (
                               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-1 overflow-y-auto">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 lg:col-span-1 min-h-[400px]">
                                      <DailyPersonalTasksSection personalTasks={personalTasks} onAdd={() => openModal('addPersonalTask')} onEdit={(task) => openModal('editPersonalTask', task)} onDelete={handleDeletePersonalTask} onToggleComplete={handleTogglePersonalTaskComplete} />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 lg:col-span-1 min-h-[400px]">
                                      <UpcomingTasksSection tasks={tasks} classes={classes} onViewTask={(task) => openModal('viewTask', task)} />
                                    </div>
                                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 lg:col-span-1 min-h-[400px]">
                                       <UpcomingExamsSection tasks={tasks} classes={classes} onViewTask={(task) => openModal('viewTask', task)} />
                                     </div>
                                </div>
                            )}
                             {activeView === 'manager' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                    <div className="lg:col-span-1 h-full"><ClassList classes={classes} selectedClassId={selectedClassId} onSelectClass={setSelectedClassId} onAddClass={() => openModal('addClass')} onEditClass={(cls) => openModal('editClass', cls)} onDeleteClass={handleDeleteClass} /></div>
                                    <div className="lg:col-span-2 h-full"><TaskList tasks={tasks} selectedClass={selectedClass} onAddTask={() => openModal('addTask', { classId: selectedClassId })} onEditTask={(task) => openModal('editTask', task)} onDeleteTask={handleDeleteTask} onViewTask={(task) => openModal('viewTask', task)} onToggleTaskStatus={handleToggleTaskStatus}/></div>
                                </div>
                            )}
                             {activeView === 'calendar' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 h-full">
                                    <CalendarView tasks={tasks} classes={classes} onViewTask={(task) => openModal('viewTask', task)} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={
                    modalState.type === 'addClass' ? 'Add a New Class' :
                    modalState.type === 'editClass' ? 'Edit Class' :
                    modalState.type === 'addTask' ? `Add Task to ${selectedClass?.name}`:
                    modalState.type === 'editTask' ? 'Edit Task' :
                    modalState.type === 'addPersonalTask' ? 'Add Personal Task' :
                    modalState.type === 'editPersonalTask' ? 'Edit Personal Task' :
                    modalState.type === 'viewTask' ? 'Task Details' :
                    'Modal'
                }
            >
                {modalState.type === 'addClass' && <ClassForm onSubmit={handleAddClass} onClose={closeModal} />}
                {modalState.type === 'editClass' && <ClassForm onSubmit={handleEditClass} initialData={modalState.data as ClassItem} onClose={closeModal} />}
                {modalState.type === 'addTask' && <TaskForm onSubmit={handleAddTask} onClose={closeModal} />}
                {modalState.type === 'editTask' && <TaskForm onSubmit={handleEditTask} initialData={modalState.data as TaskItem} onClose={closeModal} />}
                {modalState.type === 'addPersonalTask' && <PersonalTaskForm onSubmit={handleAddPersonalTask} onClose={closeModal} />}
                {modalState.type === 'editPersonalTask' && <PersonalTaskForm onSubmit={handleEditPersonalTask} initialData={modalState.data as PersonalTaskItem} onClose={closeModal} />}
                {modalState.type === 'viewTask' && modalState.data && (
                    <div className="text-slate-700 dark:text-slate-300 space-y-4">
                        <div className="flex justify-between items-start">
                             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 pr-4">{(modalState.data as TaskItem).title}</h3>
                             <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap
                                 ${(modalState.data as TaskItem).type === TaskType.EXAM ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200'}`}>
                                 {(modalState.data as TaskItem).type}
                             </span>
                        </div>

                        <p><strong>Class:</strong> {classes.find(c => c.id === (modalState.data as TaskItem).classId)?.name || 'N/A'}</p>
                        
                        <p><strong>Due:</strong> {new Date((modalState.data as TaskItem).dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <div className="flex items-center space-x-2">
                            <strong>Status:</strong>
                             {(modalState.data as TaskItem).isCompleted 
                                ? <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircleIcon className="w-5 h-5 mr-1"/>Completed</span> 
                                : <span className="flex items-center text-slate-600 dark:text-slate-400"><XCircleIcon className="w-5 h-5 mr-1"/>Incomplete</span>
                             }
                        </div>
                        {(modalState.data as TaskItem).description && <div className="space-y-1"><p className="font-semibold">Description:</p><p className="whitespace-pre-wrap bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-slate-600 dark:text-slate-300">{(modalState.data as TaskItem).description}</p></div>}
                        <div className="flex justify-end pt-4">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-md">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
=======
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
>>>>>>> f51626b0f94bf6380ec4e12bcd124e0be922a5e2
};

export default App;
