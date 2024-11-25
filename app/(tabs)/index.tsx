import { View, Platform } from 'react-native';
import { ChatThread } from '@/components/ChatThread';
import { ChatThreads } from '@/components/ChatThreads';
import { useAtom } from 'jotai';
import { sidebarVisibleAtom } from '@/hooks/atoms';
import { ThreadsSidebar } from '@/components/ThreadsSidebar';
import { useWindowDimensions } from 'react-native';

const MIN_DESKTOP_WIDTH = 768;

export default function HomeScreen() {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= MIN_DESKTOP_WIDTH;

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
    <View className="bg-gray-100 flex-1">
      <ChatThreads />
    </View>
  );
}
