import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform } from 'react-native';

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  
  // Set CSS variables for web platform only
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }

  return (
    <View className={`flex-1 ${theme.id}`}>
      {children}
    </View>
  );
}