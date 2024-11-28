import { PropsWithChildren, useEffect } from 'react';
import { View } from 'react-native';
import { useColorScheme, vars } from 'nativewind';
import { themes, rawThemes } from '@/constants/themes';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ThemePreset, ThemePresetRaw } from '@/constants/themes';

const themePresetAtom = atomWithStorage<ThemePreset>('theme-preset', 'default');

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themePreset] = useAtom(themePresetAtom);
  const { colorScheme } = useColorScheme();

  const actualTheme = vars(rawThemes['default'][colorScheme ?? 'light']);
  
  
  return (
    <View style={actualTheme} className="flex-1">
      <View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
        {children}
      </View>
    </View>
  );
}

export function useThemePreset() {
  const [themePreset, setThemePreset] = useAtom(themePresetAtom);
  return {
    themePreset,
    setThemePreset,
    availableThemes: Object.keys(themes) as ThemePreset[],
  };
}