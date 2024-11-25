import { View, Text, TouchableOpacity } from 'react-native';
import { ChatThreads } from './ChatThreads';
import { useAtom } from 'jotai';
import { sidebarVisibleAtom } from '@/hooks/atoms';
import Ionicons from '@expo/vector-icons/Ionicons';

export const ThreadsSidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);

  if (!isSidebarVisible) {
    return (
      <TouchableOpacity 
        onPress={() => setIsSidebarVisible(true)} 
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <Ionicons name="chevron-forward" size={24} className="text-black dark:text-white" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="w-64 border-r-2 border-gray-200 dark:border-gray-700">
      <View className="flex-row justify-between items-center p-4 bg-gray-200 dark:bg-gray-700">
        <Text className="text-center text-lg font-bold text-black dark:text-white">
          Threads
        </Text>
        <TouchableOpacity 
          onPress={() => setIsSidebarVisible(false)} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          <Ionicons name="chevron-back" size={24} className="text-black dark:text-white" />
        </TouchableOpacity>
      </View>
      <ChatThreads />
    </View>
  );
}; 