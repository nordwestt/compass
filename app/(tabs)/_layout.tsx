import React from 'react';
import { TabBarIcon } from '@/src/components/navigation/TabBarIcon';
import { Platform,useWindowDimensions, View } from 'react-native';
import { useColorScheme, vars } from 'nativewind';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import IndexRoute from './index';
import CharactersRoute from './characters';
import SettingsRoute from './settings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreset } from '@/components/ThemeProvider';
import { rawThemes } from '@/constants/themes';
import { currentIndexAtom } from '@/hooks/atoms';
import { useAtom } from 'jotai';
import ImagesRoute from './images';
//import { useThemeValue } from '@/constants/themes';
const renderScene = SceneMap({
  index: IndexRoute,
  characters: CharactersRoute,
  images: ImagesRoute,
  settings: SettingsRoute,
});

export const routes = [
  { key: 'index', title: 'Chat', icon: 'chatbubble' },
  { key: 'characters', title: 'Characters', icon: 'people' },
  { key: 'images', title: 'Images', icon: 'image' },
  { key: 'settings', title: 'Settings', icon: 'cog' },
];

export default function TabLayout() {
  const isDesktop = Platform.OS === 'web' && window.innerWidth >= 768;
  const { colorScheme } = useColorScheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = useAtom(currentIndexAtom);

  const { themePreset } = useThemePreset();
  let theme = {} as any;
  if(!rawThemes[themePreset]){
    theme = rawThemes['default'][colorScheme ?? 'light'];
  }
  else{
    theme = rawThemes[themePreset][colorScheme ?? 'light'];
  }
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

  if (isDesktop) {
    const CurrentScene = [IndexRoute, CharactersRoute, ImagesRoute, SettingsRoute][index];
    return (
      <CurrentScene />
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-background">
      <TabView
        
        tabBarPosition='bottom'
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        commonOptions={{
          labelText:"",
          icon: ({ route, focused, color }) => {
            return <TabBarIcon name={route.icon as any} size={22} className={`${focused ? '!text-primary' : '!text-secondary'}`}/>;
          },
        }}
      />
    </SafeAreaView>
  );
}
