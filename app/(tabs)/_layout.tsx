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
  { key: 'index', title: 'Chat', icon: 'chatbubble' },
  { key: 'characters', title: 'Characters', icon: 'people' },
  { key: 'settings', title: 'Settings', icon: 'settings' },
];

export default function TabLayout() {
  const isDesktop = Platform.OS === 'web' && window.innerWidth >= 768;
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const { themePreset } = useThemePreset();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

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
        commonOptions={{
          icon: ({ route, focused, color }) => {
            return <TabBarIcon name={route.icon as any} size={22} className='!text-primary' />;
          },
        }}
      />
    </SafeAreaView>
  );

}
