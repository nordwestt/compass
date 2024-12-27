import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtom, useSetAtom } from 'jotai';
import { threadsAtom, currentThreadAtom, threadActionsAtom } from '@/hooks/atoms';
import { modalService } from '@/services/modalService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Thread } from '@/types/core';
import { createDefaultThread } from '@/hooks/atoms';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';

interface Section {
  title: string;
  data: Thread[];
}

const ChatThreads: React.FC = () => {
  const [threads] = useAtom(threadsAtom);
  const [currentThread] = useAtom(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const scrollViewRef = useRef<SectionList>(null);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const groupThreadsByDate = useCallback((threads: Thread[]): Section[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sections: Section[] = [
      { title: 'Before', data: [] },
      { title: 'Yesterday', data: [] },
      { title: 'Today', data: [] },
    ];

    threads.forEach(thread => {
      const threadDate = new Date(parseInt(thread.id));
      threadDate.setHours(0, 0, 0, 0);

      if (threadDate.getTime() === today.getTime()) {
        sections[2].data.push(thread);
      } else if (threadDate.getTime() === yesterday.getTime()) {
        sections[1].data.push(thread);
      } else {
        sections[0].data.push(thread);
      }
    });

    // Remove empty sections
    return sections.filter(section => section.data.length > 0);
  }, []);

  const addNewThread = async () => {
    const defaultModel = await AsyncStorage.getItem('defaultModel');
    const newThread = createDefaultThread();
    newThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
      id: '',
      provider: { source: 'ollama', endpoint: '', apiKey: '' }
    };
    
    dispatchThread({ type: 'add', payload: newThread });
    
    if(Platform.OS != 'web' || window.innerWidth < 768){
    // wait 100 ms before pushing to allow for thread to be added to state
      setTimeout(() => {
        router.push(`/thread/${newThread.id}`);
      }, 100);
    }
  };

  // const toggleTheme = useCallback(() => {
  //   if (themePreset === 'default') {
  //     setThemePreset('default');
  //   } else {
  //     setThemePreset('default');
  //   }
  // }, [themePreset, setThemePreset]);
  const toggleDark = useCallback(() => {
    toggleColorScheme();
  }, [toggleColorScheme]);

  const editThreadTitle = async (thread: Thread) => {
    const newTitle = await modalService.prompt({
      title: "Edit Thread Title",
      message: "Enter new title for this thread",
      defaultValue: thread.title
    });

    if (newTitle) {
      dispatchThread({
        type: 'update',
        payload: { ...thread, title: newTitle }
      });
    }
  };

  const deleteThread = async (threadId: string) => {
    const confirmed = await modalService.confirm({
      title: "Delete Thread",
      message: "Are you sure you want to delete this thread?"
    });

    if (confirmed) {
      dispatchThread({ type: 'delete', payload: threadId });
    }
  };

  const handleThreadSelect = (thread: Thread) => {
    if (Platform.OS === 'web' && window.innerWidth >= 768) {
      dispatchThread({ type: 'setCurrent', payload: thread });
    } else {
      dispatchThread({ type: 'setCurrent', payload: thread });
      router.push(`/thread/${thread.id}`);
    }
  };

  return (
    <View className="flex-1 flex-col">
      <SectionList
        ref={scrollViewRef}
        sections={groupThreadsByDate(threads)}
        keyExtractor={(thread) => thread.id}
        renderSectionHeader={({ section: { title } }) => (
          <View className="z-10">
            <Text className="text-sm font-semibold text-text px-4 py-2">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item: thread }) => (
          <View className="flex-row items-center mb-2 px-4">
            <TouchableOpacity 
              onPress={() => handleThreadSelect(thread)}
              onLongPress={() => editThreadTitle(thread)}
              className={`shadow-md flex-1 p-4 rounded-lg bg-surface hover:bg-background ${
                currentThread.id === thread.id 
                  ? 'web:border-primary web:border-2' 
                  : ''
              }`}
            >
              <Text className="font-bold text-text">
                {thread.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteThread(thread.id)}
              className="ml-2 p-2 rounded-full bg-background hover:bg-red-100 hover:dark:bg-red-900"
            >
              <Ionicons 
                name="trash-outline" 
                size={20} 
                className="text-red-500 dark:text-red-300"
              />
            </TouchableOpacity>
          </View>
        )}
        onScrollToIndexFailed={(info) => {
          console.warn('Failed to scroll to index', info);
          // Fallback to scrollToEnd if scrollToLocation fails
          setTimeout(() => {
          }, 100);
        }}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
        onContentSizeChange={() => {
          const lastSectionIndex = groupThreadsByDate(threads).length - 1;
          console.log(lastSectionIndex);
          const lastSection = groupThreadsByDate(threads)[lastSectionIndex];
          if (lastSection?.data.length > 0) {
            scrollViewRef.current?.scrollToLocation({ 
              sectionIndex: lastSectionIndex,
              itemIndex: 0,
              animated: true,
              viewOffset: 0
            });
          }
        }}
      />
      
      <TouchableOpacity 
        onPress={addNewThread} 
        className="mb-2 p-2 rounded-full bg-background hover:bg-surface hover:border-primary hover:border-2"
      >
        <Ionicons 
          className="mx-auto !text-text" 
          name="add" 
          size={24}
        />
      </TouchableOpacity>
      <View className="flex-row justify-center space-x-4 mb-2">
        <TouchableOpacity 
          onPress={toggleDark}
          className="p-2 rounded-full bg-surface hover:bg-background"
        >
          <Ionicons 
            name={isDarkMode ? 'sunny' : 'moon'} 
            size={24}
            className="!text-text"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { ChatThreads }; 