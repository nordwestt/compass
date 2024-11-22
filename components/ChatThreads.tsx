import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Thread } from '@/app/(tabs)';
import { Signal, signal } from '@preact/signals-react';
import { modalService } from '@/services/modalService';
import { useColorScheme } from 'nativewind';
import { useSignals } from '@preact/signals-react/runtime';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatThreadsProps {
  threads: Signal<Thread[]>;
  currentThread: Signal<Thread>;
}

export const ChatThreads: React.FC<ChatThreadsProps> = ({ threads, currentThread }) => {
  useSignals();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const addNewThread = async () => {
    // get default model
    const defaultModel = await AsyncStorage.getItem('defaultModel');
    const newThread: Thread = {
      id: Date.now().toString(), 
      title: "New thread", 
      messages: [], 
      selectedModel: defaultModel ? JSON.parse(defaultModel) : {id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}},
      character: {id: 'default', name: 'Default Assistant', content: 'You are a helpful AI assistant.'}
    };
    threads.value = [...threads.value, newThread];
    currentThread.value = newThread;
  }

  const editThreadTitle = async (threadId: string, currentTitle: string) => {
    const newTitle = await modalService.prompt({
      title: "Edit Thread Title",
      message: "Enter new title for this thread",
      defaultValue: currentTitle
    });

    if (newTitle) {
      threads.value = threads.value.map(thread => 
        thread.id === threadId 
          ? { ...thread, title: newTitle }
          : thread
      );
    }
  };

  const deleteThread = async (threadId: string) => {
    const confirmed = await modalService.confirm({
      title: "Delete Thread",
      message: "Are you sure you want to delete this thread?"
    });

    if (confirmed) {
      threads.value = threads.value.filter(t => t.id !== threadId);
      
      if (currentThread.value.id === threadId) {
        currentThread.value = threads.value[0] || {
          id: Date.now().toString(),
          title: "New thread",
          messages: [],
          selectedModel: {id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}}
        };
      }
    }
  };

  return (
    <View className="flex flex-col flex-grow bg-gray-50 dark:bg-gray-900">
      <ScrollView
        ref={scrollViewRef}
        className="p-2"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {threads.value.map((thread) => (
          <View key={thread.id} className="flex-row items-center mb-2">
            <TouchableOpacity 
              onPress={() => currentThread.value = thread}
              onLongPress={() => editThreadTitle(thread.id, thread.title)}
              className={
                `flex-1 p-4 rounded-lg ${currentThread.value.id === thread.id 
                  ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' 
                  : 'bg-white dark:bg-gray-800'}`
              }>
              <Text className="font-bold text-gray-800 dark:text-gray-200">{thread.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteThread(thread.id)}
              className="ml-2 p-2 rounded-full bg-red-100 dark:bg-red-900"
            >
              <Ionicons name="trash-outline" size={20} color={colorScheme === 'dark' ? '#FCA5A5' : '#EF4444'} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={addNewThread} className="mb-2 p-2 rounded-full bg-white dark:bg-gray-800">
          <Ionicons className='mx-auto' name="add" size={24} color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'} />
        </TouchableOpacity>
      <View className="flex-row justify-center space-x-4 mb-2">
        
        <TouchableOpacity onPress={toggleColorScheme} className="p-2 rounded-full bg-white dark:bg-gray-800">
          <Ionicons 
            name={colorScheme === 'dark' ? 'sunny' : 'moon'} 
            size={24} 
            color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 