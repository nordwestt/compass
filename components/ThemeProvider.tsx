import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { useEffect } from 'react';

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const { setColorScheme } = useColorScheme();
  const isDarkMode = ['dark', 'dim'].includes(theme.id);
  
  // Sync our theme with NativeWind's color scheme
  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Set CSS variables for web platform only
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }

  return (
    <View className={`flex-1 ${isDarkMode ? 'dark' : ''}`}>
      {children}
    </View>
  );
}