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
      className={`group absolute left-0 top-20 h-[70%] my-auto z-[1] transition-all duration-200 ${
        isSidebarVisible ? 'w-64' : 'w-10'
      }`}
      onMouseEnter={() => setIsSidebarVisible(true)}
      onMouseLeave={() => setIsSidebarVisible(false)}
    >
      <View 
        className={`h-full border-r-2 border-border bg-surface m-2 rounded-lg p-1 my-4 transition-all duration-200 ${
          isSidebarVisible ? 'w-64 shadow-lg' : 'w-10'
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
            <Ionicons name="chevron-forward" size={24} className="!text-text" />
          </View>
        )}
      </View>
    </View>
  );
}; 