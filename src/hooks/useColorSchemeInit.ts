import { StyleSheet } from 'nativewind';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';

export function useColorSchemeInit() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Initialize the color scheme based on system preference
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setColorScheme(darkModeMediaQuery.matches ? 'dark' : 'light');
      
      // Listen for system color scheme changes
      const listener = (e: MediaQueryListEvent) => {
        setColorScheme(e.matches ? 'dark' : 'light');
      };
      
      darkModeMediaQuery.addEventListener('change', listener);
      return () => darkModeMediaQuery.removeEventListener('change', listener);
    }
  }, []);

  return { colorScheme, toggleColorScheme };
}