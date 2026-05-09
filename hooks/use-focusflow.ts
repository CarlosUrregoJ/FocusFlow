"use client";

import { useEffect, useMemo } from 'react';
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { useLocalStorage } from './use-local-storage';
import type { AppSettings, FocusSession, TaskFilter, TaskItem } from '@/lib/types';
import { DEFAULT_THEME } from '@/lib/env';

const defaultSettings: AppSettings = {
  theme: DEFAULT_THEME,
  pomodoroMinutes: 25,
  dailyGoalMinutes: 120
};

const defaultTasks: TaskItem[] = [
  {
    id: 'welcome-task',
    title: 'Planificar el día',
    notes: 'Define 3 prioridades antes de empezar a trabajar.',
    priority: 'medium',
    dueDate: new Date().toISOString().slice(0, 10),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useFocusFlow() {
  const [tasks, setTasks] = useLocalStorage<TaskItem[]>('focusflow-tasks', defaultTasks);
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focusflow-sessions', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('focusflow-settings', defaultSettings);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const today = new Date();

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((task: TaskItem) => task.completed).length;
    const todayTasks = tasks.filter((task: TaskItem) => task.completed && isSameDay(parseISO(task.updatedAt), today)).length;
    const todaysFocusMinutes = sessions
      .filter((session: FocusSession) => isSameDay(parseISO(session.completedAt), today))
      .reduce((total: number, session: FocusSession) => total + session.minutes, 0);
    const totalFocusMinutes = sessions.reduce((total: number, session: FocusSession) => total + session.minutes, 0);
    const progress = Math.min(100, Math.round((todaysFocusMinutes / Math.max(settings.dailyGoalMinutes, 1)) * 100));

    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weeklyData = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(weekStart, index);
      const dayLabel = format(day, 'EEE');
      const dayMinutes = sessions
        .filter((session: FocusSession) => isSameDay(parseISO(session.completedAt), day))
        .reduce((total: number, session: FocusSession) => total + session.minutes, 0);

      return {
        name: dayLabel,
        minutes: dayMinutes,
        productivity: Math.min(100, Math.round((dayMinutes / Math.max(settings.dailyGoalMinutes, 1)) * 100))
      };
    });

    return {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks: tasks.length - completedTasks,
      todaysFocusMinutes,
      totalFocusMinutes,
      todayTasks,
      dailyProgress: progress,
      weeklyData,
      totalSessions: sessions.length,
      focusHours: (totalFocusMinutes / 60).toFixed(1)
    };
  }, [settings.dailyGoalMinutes, sessions, tasks, today]);

  const filteredTasks = useMemo(() => {
    return (filter: TaskFilter) => {
      if (filter === 'completed') {
        return tasks.filter((task: TaskItem) => task.completed);
      }

      if (filter === 'pending') {
        return tasks.filter((task: TaskItem) => !task.completed);
      }

      return tasks;
    };
  }, [tasks]);

  const addTask = (input: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setTasks((current: TaskItem[]) => [
      {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      },
      ...current
    ]);
  };

  const updateTask = (taskId: string, input: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setTasks((current: TaskItem[]) =>
      current.map((task: TaskItem) =>
        task.id === taskId
          ? {
              ...task,
              ...input,
              updatedAt: now
            }
          : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((current: TaskItem[]) => current.filter((task: TaskItem) => task.id !== taskId));
  };

  const toggleTask = (taskId: string) => {
    const now = new Date().toISOString();
    setTasks((current: TaskItem[]) =>
      current.map((task: TaskItem) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: now
            }
          : task
      )
    );
  };

  const addSession = (minutes: number) => {
    setSessions((current: FocusSession[]) => [
      {
        id: crypto.randomUUID(),
        minutes,
        completedAt: new Date().toISOString()
      },
      ...current
    ]);
  };

  const updateTheme = (theme: AppSettings['theme']) => {
    setSettings((current: AppSettings) => ({ ...current, theme }));
  };

  const updatePomodoroMinutes = (pomodoroMinutes: number) => {
    setSettings((current: AppSettings) => ({ ...current, pomodoroMinutes }));
  };

  const updateDailyGoalMinutes = (dailyGoalMinutes: number) => {
    setSettings((current: AppSettings) => ({ ...current, dailyGoalMinutes }));
  };

  const resetAll = () => {
    setTasks(defaultTasks);
    setSessions([]);
    setSettings(defaultSettings);
  };

  return {
    tasks,
    sessions,
    settings,
    stats,
    filteredTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addSession,
    updateTheme,
    updatePomodoroMinutes,
    updateDailyGoalMinutes,
    resetAll
  };
}
