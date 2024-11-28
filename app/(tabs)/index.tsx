import { View, Platform } from 'react-native';
import { ChatThread } from '@/components/ChatThread';
import { ChatThreads } from '@/components/ChatThreads';
import { useAtom } from 'jotai';
import { sidebarVisibleAtom } from '@/hooks/atoms';
import { ThreadsSidebar } from '@/components/ThreadsSidebar';
import { useWindowDimensions, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayoutEffect } from 'react';

const MIN_DESKTOP_WIDTH = 768;

export default function HomeScreen() {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= MIN_DESKTOP_WIDTH;
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (isDesktop) {
    return (
      <View className="bg-gray-100 flex-1 flex-row">
        <ThreadsSidebar />
        <View className="flex-1 bg-white rounded-t-xl">
          <ChatThread />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-gray-100 flex-1 dark:bg-gray-900">
      <View className="flex-row items-center p-4 bg-background">
        <Ionicons name="compass" size={36} className='!text-primary' />
        <Text className="ms-2 text-2xl font-bold text-primary">Compass</Text>
      </View>
      <ChatThreads />
    </View>
  );
}
