import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TabBarIcon } from './TabBarIcon';
import { useThemePreset } from '@/components/ThemeProvider';
import { rawThemes } from '@/constants/themes';
import { useColorScheme } from 'nativewind';

interface Route {
  key: string;
  title: string;
  icon: string;
}

interface WebSidebarProps {
  routes: Route[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function WebSidebar({ routes, currentIndex, onIndexChange }: WebSidebarProps) {
  const { colorScheme } = useColorScheme();
  const { themePreset } = useThemePreset();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

  return (
    <View className="h-full border-r border-border bg-background">
      {routes.map((route, index) => (
        <Pressable
          key={route.key}
          onPress={() => onIndexChange(index)}
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