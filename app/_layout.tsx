import "@/global.css";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { colorScheme } from 'nativewind';
import { useTheme } from "@/hooks/useTheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useTheme();
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
      <Stack screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.text,
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <ConfirmationModal />
    </ThemeProvider>
  );
}
