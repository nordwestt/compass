import { View, Text, TouchableOpacity } from 'react-native';
import { ChatThreads } from '@/src/components/chat/ChatThreads';
import { useAtom } from 'jotai';
import { sidebarVisibleAtom } from '@/src/hooks/atoms';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalization } from '@/src/hooks/useLocalization';

export const ThreadsSidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(sidebarVisibleAtom);
  const { t } = useLocalization();

  return (
    <View 
      className={`group absolute left-0 my-auto z-[1] transition-all duration-200 ${
        isSidebarVisible ? 'w-64 top-20 h-[70%]' : 'w-10 h-[20%] top-40'
      }`}
      onMouseEnter={() => setIsSidebarVisible(true)}
      onMouseLeave={() => setIsSidebarVisible(false)}
    >
      <View 
        className={`h-full border-r-2 border-border bg-surface m-2  p-1 my-4 transition-all duration-200 ${
          isSidebarVisible ? 'w-64 shadow-lg rounded-lg' : 'w-10 rounded-lg'
        }`}
      >
        {isSidebarVisible ? (
          <>
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-center text-lg font-bold text-text">
                {t('chats.chats')}
              </Text>
            </View>
            <ChatThreads />
          </>
        ) : (
          <View className="flex items-center justify-center h-full">
            <Ionicons name="chatbubbles" size={24} className="!text-primary" />
          </View>
        )}
      </View>
    </View>
  );
}; 