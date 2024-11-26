import { ThemeConfig } from '@/types/theme';

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#0a7ea4',
      secondary: '#4B5563',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      border: '#e5e7eb',
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#9CA3AF',
      background: '#111827',
      surface: '#1F2937',
      text: '#F3F4F6',
      border: '#374151',
    }
  },
  {
    id: 'dim',
    name: 'Dim',
    colors: {
      primary: '#60a5fa',
      secondary: '#9CA3AF',
      background: '#15202B',
      surface: '#1E2732',
      text: '#F3F4F6',
      border: '#38444D',
    }
  },
  // Add more themes as needed
]; 