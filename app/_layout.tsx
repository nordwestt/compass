import "@/global.css";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useThemePreset } from '@/src/components/ui/ThemeProvider';
import { ConfirmationModal } from '@/src/components/ui/ConfirmationModal';
import { rawThemes } from '@/constants/themes';
import { useColorScheme } from 'nativewind';
import { Toast } from "@/src/components/ui/Toast";
import { View } from "react-native";
import { WebSidebar } from "@/src/components/navigation/WebSidebar";
import { routes } from "./(tabs)/_layout";
import { Command } from "@tauri-apps/plugin-shell";
import { CustomHeader } from "@/src/components/navigation/CustomHeader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useKeyboardShortcuts } from "@/src/hooks/useKeyboardShortcuts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAtomValue } from 'jotai';
import { hasSeenOnboardingAtom } from '@/src/hooks/atoms';
SplashScreen.preventAutoHideAsync();
import { Platform } from '@/src/utils/platform';
import { WelcomeIntroduction } from "@/src/components/onboarding/WelcomeIntroduction";

export default function RootLayout() {
  const { themePreset } = useThemePreset();
  const { colorScheme } = useColorScheme();
  useKeyboardShortcuts();

  let theme = {} as any;
  if(!rawThemes[themePreset]){
    theme = rawThemes['default'][colorScheme ?? 'light'];
  }
  else{
    theme = rawThemes[themePreset][colorScheme ?? 'light'];
  }
  const isDesktop = Platform.isWeb && window.innerWidth >= 768;

  const myFunc = async function() {
    const command = Command.sidecar("binaries/corsproxy");
    const output = await command.execute();
  }
  if(Platform.isTauri) {
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

  const hasSeenOnboarding = useAtomValue(hasSeenOnboardingAtom);

  if (!loaded) {
    return null;
  }
  

  return (
    <GestureHandlerRootView>
    <ThemeProvider>
      <View className="flex-row flex-1">
      {isDesktop && <WebSidebar className="" />}
      <Stack screenOptions={{
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.text,
            headerShadowVisible: false,
            header: () => <CustomHeader />
          }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      </View>
      <ConfirmationModal />
      <Toast />
      {!hasSeenOnboarding && <WelcomeIntroduction />}
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
