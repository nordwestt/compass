import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { ChatThreads } from '@/src/components/chat/ChatThreads';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { defaultThreadAtom, sidebarVisibleAtom, threadActionsAtom } from '@/src/hooks/atoms';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalization } from '@/src/hooks/useLocalization';
import Tooltip from '../ui/Tooltip';
import { router } from 'expo-router';
import { threadsAtom } from '@/src/hooks/atoms';
import { useState } from 'react';
export const ThreadsSidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const { t } = useLocalization();
  const dispatchThread = useSetAtom(threadActionsAtom);

  const defaultThread = useAtomValue(defaultThreadAtom);
  

  const addNewThread = async () => {
    const newThread = {...defaultThread, id: Date.now().toString()};
    
    dispatchThread({ type: 'add', payload: newThread });
    
    if(Platform.OS != 'web' || window.innerWidth < 768){
    // wait 100 ms before pushing to allow for thread to be added to state
      setTimeout(() => {
        router.push(`/thread/${newThread.id}`);
      }, 100);
    }
  };

  return (
    <View className='absolute left-0 my-auto z-[1] flex flex-col top-20'>
    <View 
      className={`group transition-all duration-200 h-32 ${
        isSidebarVisible ? 'w-64 h-[70%]' : 'w-10'
      }`}
      onMouseEnter={() => setIsSidebarVisible(true)}
      onMouseLeave={() => setIsSidebarVisible(false)}
    >
      <View 
        className={`h-full border-r-2 border-border bg-surface m-2 p-1 my-4 transition-all duration-200 ${
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
          <View className="flex items-center justify-center my-auto">
            <Ionicons name="chatbubbles" size={24} className="!text-primary" />
          </View>
        )}
      </View>
      
    </View>
    {!isSidebarVisible && (
        <Tooltip text={t('chats.new_chat') + '\n(Alt + N)'} tooltipClassName="w-20">
        <TouchableOpacity 
          onPress={addNewThread} 
          className="mt-4 p-4 justify-between items-center"
        >
          <Ionicons 
            className="!text-primary" 
            name="add" 
            size={24}
          />
        </TouchableOpacity>
      </Tooltip>)}
    </View>
  );
}; 