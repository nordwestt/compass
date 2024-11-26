export type ThemePreset = 'light' | 'dark' | 'dim' | 'forest' | 'sunset';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
} 