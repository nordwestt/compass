import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import colors from "tailwindcss/colors";

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
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: 'var(--surface)',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'var(--border)',
        },
        headerTitleStyle: {
          color: 'var(--text)',
        },
        headerTintColor: 'var(--text)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'chatbubble' : 'chatbubble-outline'} 
              className='!text-primary' 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Characters',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'people' : 'people-outline'} 
              className='!text-primary' 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'settings' : 'settings-outline'} 
              className='!text-primary' 
            />
          ),
        }}
      />
    </Tabs>
  );
}
