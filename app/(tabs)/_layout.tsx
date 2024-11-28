import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Platform,useWindowDimensions } from 'react-native';
import { useColorScheme, vars } from 'nativewind';
import colors from "tailwindcss/colors";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import IndexRoute from './index';
import CharactersRoute from './characters';
import SettingsRoute from './settings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreset } from '@/components/ThemeProvider';
import { rawThemes } from '@/constants/themes';
//import { useThemeValue } from '@/constants/themes';
const renderScene = SceneMap({
  index: IndexRoute,
  characters: CharactersRoute,
  settings: SettingsRoute,
});

const routes = [
  { key: 'index', title: 'Chat' },
  { key: 'characters', title: 'Characters' },
  { key: 'settings', title: 'Settings' },
];

export default function TabLayout() {
  const isDesktop = Platform.OS === 'web' && window.innerWidth >= 768;
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const { themePreset } = useThemePreset();
  //console.log(rawThemes, themePreset, colorScheme);
  
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];
  //console.log(theme);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={{ 
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
      indicatorStyle={{
        backgroundColor: theme.primary,
      }}
      activeColor={theme.primary}
      inactiveColor={theme.secondary}
      labelStyle={{
        textTransform: 'none',
      }}
    />
  );
  
  return (
    <SafeAreaView className="flex-1 bg-background">
    <TabView className='!bg-primary'
    tabBarPosition='bottom'
      navigationState={{ index, routes }}
      renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </SafeAreaView>
  );

  // return (
  //   <Tabs
  //     screenOptions={{
  //       tabBarActiveTintColor: 'var(--primary)',
  //       tabBarInactiveTintColor: 'var(--secondary)',
  //       headerShown: !isDesktop,
  //       tabBarShowLabel: Platform.OS === 'web',
  //       tabBarStyle: {
  //         backgroundColor: 'var(--surface)',
  //         borderTopColor: 'var(--border)',
  //         borderTopWidth: 1,
  //         elevation: 0,
  //         shadowOpacity: 0,
  //       },
  //       headerStyle: {
  //         backgroundColor: 'var(--surface)',
  //         elevation: 0,
  //         shadowOpacity: 0,
  //         borderBottomWidth: 1,
  //         borderBottomColor: 'var(--border)',
  //       },
  //       headerTitleStyle: {
  //         color: 'var(--text)',
  //       },
  //       headerTintColor: 'var(--text)',
  //     }}>
  //     <Tabs.Screen
  //       name="index"
  //       options={{
  //         title: 'Chat',
  //         tabBarIcon: ({ focused }) => (
  //           <TabBarIcon 
  //             name={focused ? 'chatbubble' : 'chatbubble-outline'} 
  //             className='!text-primary' 
  //           />
  //         ),
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="characters"
  //       options={{
  //         title: 'Characters',
  //         tabBarIcon: ({ focused }) => (
  //           <TabBarIcon 
  //             name={focused ? 'people' : 'people-outline'} 
  //             className='!text-primary' 
  //           />
  //         ),
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="settings"
  //       options={{
  //         title: 'Settings',
  //         tabBarIcon: ({ focused }) => (
  //           <TabBarIcon 
  //             name={focused ? 'settings' : 'settings-outline'} 
  //             className='!text-primary' 
  //           />
  //         ),
  //       }}
  //     />
  //   </Tabs>
  // );
}
