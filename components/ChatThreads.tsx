import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Thread } from '@/app/(tabs)';
import { Signal, signal } from '@preact/signals-react';
import { modalService } from '@/services/modalService';

export interface ChatThreadsProps {
  threads: Signal<Thread[]>;
  currentThread: Signal<Thread>;
}

export const ChatThreads: React.FC<ChatThreadsProps> = ({ threads, currentThread }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const addNewThread = () => {
    threads.value = [...threads.value, {
      id: Date.now().toString(), 
      title: "New thread", 
      messages: [{content: "Hello, how can I help you today?", isUser: false}], 
      selectedModel: {id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}}
    }];
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
          messages: [{content: "Hello, how can I help you today?", isUser: false}],
          selectedModel: {id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}}
        };
      }
    }
  };

  return (
    <View className="flex flex-col mb-2">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-2"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {threads.value.map((thread) => (
          <View key={thread.id} className="flex-row items-center mb-2">
            <TouchableOpacity 
              onPress={() => currentThread.value = thread}
              onLongPress={() => editThreadTitle(thread.id, thread.title)}
              className={
                `flex-1 p-4 rounded-lg ${currentThread.value.id === thread.id 
                  ? 'bg-blue-100 border-2 border-blue-500' 
                  : 'bg-white'}`
              }>
              <Text className="font-bold text-gray-800">{thread.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteThread(thread.id)}
              className="ml-2 p-2 rounded-full bg-red-100"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={addNewThread} className="mx-auto rounded-full bg-white">
        <Ionicons name="add" size={24} className="bg-white" />
      </TouchableOpacity>
    </View>
  );
}; 