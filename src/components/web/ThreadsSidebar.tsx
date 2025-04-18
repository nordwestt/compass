import { View, Text, TouchableOpacity } from 'react-native';
import { ChatThreads } from '@/src/components/chat/ChatThreads';
import { useAtom } from 'jotai';
import { sidebarVisibleAtom } from '@/src/hooks/atoms';
import Ionicons from '@expo/vector-icons/Ionicons';

export const ThreadsSidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);

  if (!isSidebarVisible) {
    return (
      <TouchableOpacity 
        onPress={() => setIsSidebarVisible(true)} 
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-surface hover:border border-border"
      >
        <Ionicons name="chevron-forward" size={24} className="!text-text" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="w-64 border-r-2 border-border z-[1] bg-surface m-2 rounded-lg p-1 my-4">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-center text-lg font-bold text-text">
          Chats
        </Text>
      </View>
      <ChatThreads />
      <TouchableOpacity 
        onPress={() => setIsSidebarVisible(false)} 
        className="absolute -right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface hover:border border-border border-r"
      >
        <Ionicons name="chevron-back" size={24} className="!text-text" />
      </TouchableOpacity>
    </View>
  );
}; 