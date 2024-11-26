import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtom, useSetAtom } from 'jotai';
import { threadsAtom, currentThreadAtom, threadActionsAtom } from '@/hooks/atoms';
import { modalService } from '@/services/modalService';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Thread } from '@/types/core';
import { createDefaultThread } from '@/hooks/atoms';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { router } from 'expo-router';

export const ChatThreads: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [threads] = useAtom(threadsAtom);
  const [currentThread] = useAtom(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const isDarkMode = ['dark', 'dim'].includes(theme.id);

  const addNewThread = async () => {
    const defaultModel = await AsyncStorage.getItem('defaultModel');
    const newThread = createDefaultThread();
    newThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
      id: '',
      provider: { source: 'ollama', endpoint: '', apiKey: '' }
    };
    
    dispatchThread({ type: 'add', payload: newThread });
    router.push(`/thread/${newThread.id}`);
  };

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
    <View className="flex flex-col flex-grow bg-gray-50 dark:bg-gray-900">
      <ScrollView
        ref={scrollViewRef}
        className="p-2"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {threads.map((thread) => (
          <View key={thread.id} className="flex-row items-center mb-2">
            <TouchableOpacity 
              onPress={() => handleThreadSelect(thread)}
              onLongPress={() => editThreadTitle(thread)}
              className={`flex-1 p-4 rounded-lg bg-white dark:bg-gray-800 ${
                currentThread.id === thread.id 
                  ? 'web:border-2 web:border-blue-500' 
                  : ''
              }`}
            >
              <Text className="font-bold text-gray-800 dark:text-gray-200">
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
                color={isDarkMode ? '#FCA5A5' : '#EF4444'} 
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity 
        onPress={addNewThread} 
        className="mb-2 p-2 rounded-full bg-white dark:bg-gray-800"
      >
        <Ionicons 
          className='mx-auto' 
          name="add" 
          size={24} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
      <View className="flex-row justify-center space-x-4 mb-2">
        <TouchableOpacity 
          onPress={() => setTheme(isDarkMode ? 'light' : 'dark')} 
          className="p-2 rounded-full bg-surface"
        >
          <Ionicons 
            name={isDarkMode ? 'sunny' : 'moon'} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 