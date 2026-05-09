export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFilter = 'all' | 'pending' | 'completed';
export type ThemeMode = 'dark' | 'light';

export interface TaskItem {
  id: string;
  title: string;
  notes: string;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  minutes: number;
  completedAt: string;
}

export interface AppSettings {
  theme: ThemeMode;
  pomodoroMinutes: number;
  dailyGoalMinutes: number;
}
