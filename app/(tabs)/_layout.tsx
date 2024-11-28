import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Platform } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const isDesktop = Platform.OS === 'web' && window.innerWidth >= 768;
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'var(--primary)',
        tabBarInactiveTintColor: 'var(--secondary)',
        headerShown: !isDesktop,
        tabBarShowLabel: Platform.OS === 'web',
        tabBarStyle: {
          backgroundColor: 'var(--surface)',
          borderTopColor: 'var(--border)',
        },
        headerStyle: {
          backgroundColor: 'var(--surface)',
        },
        headerTintColor: 'var(--text)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Characters',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
