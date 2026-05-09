import type { ThemeMode } from '@/lib/types';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'FocusFlow';

export const DEFAULT_THEME: ThemeMode = process.env.NEXT_PUBLIC_DEFAULT_THEME === 'light' ? 'light' : 'dark';