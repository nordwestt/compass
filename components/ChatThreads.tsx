import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtom, useSetAtom } from 'jotai';
import { threadsAtom, currentThreadAtom, threadActionsAtom } from '@/hooks/atoms';
import { modalService } from '@/services/modalService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Thread } from '@/types/core';
import { createDefaultThread } from '@/hooks/atoms';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { FlatList } from 'react-native';

export const ChatThreads: React.FC = () => {
  const [threads] = useAtom(threadsAtom);
  const [currentThread] = useAtom(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const scrollViewRef = useRef<FlatList>(null);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const addNewThread = async () => {
    const defaultModel = await AsyncStorage.getItem('defaultModel');
    const newThread = createDefaultThread();
    newThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
      id: '',
      provider: { source: 'ollama', endpoint: '', apiKey: '' }
    };
    
    dispatchThread({ type: 'add', payload: newThread });
    // wait 100 ms before pushing to allow for thread to be added to state
    setTimeout(() => {
      router.push(`/thread/${newThread.id}`);
    }, 100);
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
    <View className="flex flex-col flex-grow bg-background">
      <FlatList
        ref={scrollViewRef}
        data={threads}
        keyExtractor={(thread) => thread.id}
        renderItem={({ item: thread }) => (
          <View className="flex-row items-center mb-2">
            <TouchableOpacity 
              onPress={() => handleThreadSelect(thread)}
              onLongPress={() => editThreadTitle(thread)}
              className={`shadow-md flex-1 p-4 rounded-lg bg-surface ${
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
              className="ml-2 p-2 rounded-full bg-red-100 dark:bg-red-900"
            >
              <Ionicons 
                name="trash-outline" 
                size={20} 
                className="text-red-500 dark:text-red-300"
              />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1, padding:10 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      <TouchableOpacity 
        onPress={addNewThread} 
        className="mb-2 p-2 rounded-full bg-background"
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
          className="p-2 rounded-full bg-secondary"
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