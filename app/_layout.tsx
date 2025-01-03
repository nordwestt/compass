import "@/global.css";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useThemePreset } from '@/components/ThemeProvider';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { rawThemes } from '@/constants/themes';
import { useColorScheme } from 'nativewind';
import { Toast } from "@/components/Toast";
import { Platform, View } from "react-native";
import { WebSidebar } from "@/components/navigation/WebSidebar";
import { routes } from "./(tabs)/_layout";
import { Command } from "@tauri-apps/plugin-shell";
import { CustomHeader } from "@/components/navigation/CustomHeader";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { themePreset } = useThemePreset();
  const { colorScheme } = useColorScheme();
  let theme = {} as any;
  if(!rawThemes[themePreset]){
    theme = rawThemes['default'][colorScheme ?? 'light'];
  }
  else{
    theme = rawThemes[themePreset][colorScheme ?? 'light'];
  }
  const isDesktop = Platform.OS === 'web' && window.innerWidth >= 768;
  const isTauri = Platform.OS === 'web' && typeof window !== 'undefined' && !!(window as any).__TAURI__;


  const myFunc = async function() {
    const command = Command.sidecar("binaries/corsproxy");
    const output = await command.execute();
  }
  if(isTauri) {
    myFunc();
  }


  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Caveat-Regular': require('../assets/fonts/Caveat-Regular.ttf'),
    'Caveat-Medium': require('../assets/fonts/Caveat-Medium.ttf'),
    'Caveat-Bold': require('../assets/fonts/Caveat-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  

  return (
    <ThemeProvider>
      <View className="flex-row flex-1">
      {isDesktop && <WebSidebar className="" />}
      <Stack screenOptions={{
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.text,
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            header: () => <CustomHeader />
          }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      </View>
      <ConfirmationModal />
      <Toast />
    </ThemeProvider>
  );
}
