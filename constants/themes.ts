import { useColorScheme, vars } from 'nativewind';

export const rawThemes = {
  default: {
    light: {
      primary: '#ff7ea4',
      secondary: '#4B5563',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      border: '#e5e7eb',
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#9CA3AF',
      background: '#111827',
      surface: '#1F2937',
      text: '#F3F4F6',
      border: '#374151',
    },
  },
  mossy: {
    light: {
      primary: '#2d5a27',
      secondary: '#4a5c47',
      background: '#f5f7f4',
      surface: '#e8ede7',
      text: '#1a2419',
      border: '#d1ddd0',
    },
    dark: {
      primary: '#7ca677',
      secondary: '#9ab497',
      background: '#1a2419',
      surface: '#243122',
      text: '#e8ede7',
      border: '#384936',
    },
  },
} as const;

export const themes = {
  default: {
    light: vars({
      '--primary': '#ff7ea4',
      '--secondary': '#4B5563',
      '--background': '#ffffff',
      '--surface': '#f9fafb',
      '--text': '#111827',
      '--border': '#e5e7eb',
    }),
    dark: vars({
      '--primary': '#60a5fa',
      '--secondary': '#9CA3AF',
      '--background': '#111827',
      '--surface': '#1F2937',
      '--text': '#F3F4F6',
      '--border': '#374151',
    }),
  },
  mossy: {
    light: vars({
      '--primary': '#2d5a27',
      '--secondary': '#4a5c47',
      '--background': '#f5f7f4',
      '--surface': '#e8ede7',
      '--text': '#1a2419',
      '--border': '#d1ddd0',
    }),
    dark: vars({
      '--primary': '#7ca677',
      '--secondary': '#9ab497',
      '--background': '#1a2419',
      '--surface': '#243122',
      '--text': '#e8ede7',
      '--border': '#384936',
    }),
  },
};

export type ThemePreset = keyof typeof themes; 
export type ThemePresetRaw = keyof typeof rawThemes;
