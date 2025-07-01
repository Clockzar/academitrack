export interface ClassItem {
  id: string;
  name: string;
  color: string; // Tailwind background color class e.g. "bg-blue-500"
  textColor: string; // Tailwind text color class e.g. "text-blue-100"
}

export enum TaskType {
  ASSIGNMENT = 'Assignment',
  EXAM = 'Exam',
  PROJECT = 'Project', // Added for more specificity, though ASSIGNMENT can cover it
}

export interface TaskItem {
  id: string;
  classId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string date
  type: TaskType;
  isCompleted?: boolean; // Added for class task completion
}

export interface PersonalTaskItem {
  id: string;
  title: string;
  description?: string;
  category?: string; // e.g., 'Chore', 'Errand', 'Personal Goal'
  isCompleted: boolean;
}

export type ModalType = 
  | 'addClass' 
  | 'editClass' 
  | 'addTask' 
  | 'editTask' 
  | 'viewTask'
  | 'addPersonalTask'
  | 'editPersonalTask';

export interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data?: ClassItem | TaskItem | PersonalTaskItem | { classId?: string }; // Contextual data for the modal
}