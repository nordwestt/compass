import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TabBarIcon } from './TabBarIcon';
import { useThemePreset } from '@/components/ThemeProvider';
import { rawThemes } from '@/constants/themes';
import { useColorScheme } from 'nativewind';
import { routes } from '@/app/(tabs)/_layout';
import { currentIndexAtom } from '@/hooks/atoms';
import { useAtom, useAtomValue } from 'jotai';

interface Route {
  key: string;
  title: string;
  icon: string;
}


export function WebSidebar({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
  const { colorScheme } = useColorScheme();
  const { themePreset } = useThemePreset();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

  return (
    <View className={`h-full bg-background ${className}`}>
      {routes.map((route, index) => (
        <Pressable
          key={route.key}
          onPress={() => setCurrentIndex(index)}
          className={`flex-row items-center p-4 space-x-3 ${
            currentIndex === index ? 'bg-primary/10' : ''
          }`}
        >
          <TabBarIcon 
            name={route.icon as any} 
            size={22} 
            className={currentIndex === index ? '!text-secondary' : '!text-primary'} 
          />
          <Text 
            className={currentIndex === index ? 'text-secondary' : 'text-primary'}
          >
            {route.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
} 