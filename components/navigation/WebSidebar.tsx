import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TabBarIcon } from './TabBarIcon';
import { useThemePreset } from '@/components/ThemeProvider';
import { rawThemes } from '@/constants/themes';
import { useColorScheme } from 'nativewind';
import { routes } from '@/app/(tabs)/_layout';
import { currentIndexAtom } from '@/hooks/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { useRouter } from 'expo-router';

interface Route {
  key: string;
  title: string;
  icon: string;
}


export function WebSidebar({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { themePreset } = useThemePreset();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

  return (
    <View className={`h-full bg-background ${className}`}>
      {routes.map((route, index) => (
        <Pressable
          key={route.key}
          onPress={() => {
            setCurrentIndex(index);
            router.replace(`/${route.key == 'index' ? '' : route.key}` as any);
          }}
          className={`flex-row items-center p-4 space-x-3 m-2 rounded-lg hover:bg-surface ${
            currentIndex === index ? 'border-r border-primary border shadow-sm bg-surface' : ''
          }`}
        >
          <TabBarIcon 
            name={route.icon as any} 
            size={22} 
            className={currentIndex === index ? '!text-primary' : '!text-secondary'} 
          />
          <Text 
            className={currentIndex === index ? 'text-primary' : 'text-secondary'}
          >
            {route.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
} 