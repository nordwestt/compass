import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { ThemePreset, ThemeConfig } from '@/types/theme';
import { THEME_PRESETS } from '@/constants/themes';

const themeAtom = atomWithStorage<ThemePreset>('theme-preference', 'light');

export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom);
  
  const currentTheme = THEME_PRESETS.find(t => t.id === theme) || THEME_PRESETS[0];
  
  const setThemePreset = (newTheme: ThemePreset) => {
    setTheme(newTheme);
  };

  return {
    theme: currentTheme,
    setTheme: setThemePreset,
    availableThemes: THEME_PRESETS
  };
} 