import { Image, View, Text, TouchableOpacity } from 'react-native';
import { ChatThread } from '@/components/ChatThread';
import { ChatThreads } from '@/components/ChatThreads';
import { useAtom } from 'jotai';
import { sidebarVisibleAtom } from '@/hooks/atoms';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);

  return (
    <View className="bg-gray-100 flex-1 flex-row">
      {isSidebarVisible && (
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
      )}
      {!isSidebarVisible && (
        <TouchableOpacity 
          onPress={() => setIsSidebarVisible(true)} 
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          <Ionicons name="chevron-forward" size={24} className="text-black dark:text-white" />
        </TouchableOpacity>
      )}
      <View className="flex-1 bg-white rounded-t-xl">
        <ChatThread />
      </View>
    </View>
  );
}
