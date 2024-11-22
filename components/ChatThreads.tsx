import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Thread } from '@/app/(tabs)';
import { Signal, signal } from '@preact/signals-react';
export interface ChatThreadsProps {
  threads: Signal<Thread[]>;
  currentThread: Signal<Thread>;
}

export const ChatThreads: React.FC<ChatThreadsProps> = ({ threads, currentThread }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View className="flex flex-col mb-2">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-2"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {threads.value.map((thread) => (
          <TouchableOpacity 
            key={thread.title}
            onPress={() => currentThread.value = thread} 
            className={
              `p-4 mb-2 rounded-lg' ${currentThread.value.id === thread.id 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-white'}`
            }>
            <Text className='font-bold text-gray-800'>{thread.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={()=>{threads.value = [...threads.value, {id:2, title:"New thread", messages: [], selectedModel: {id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}}}]}} className='mx-auto rounded-full bg-white'>
        <Ionicons name='add' className='bg-white'></Ionicons>
      </TouchableOpacity>
    </View>
  );
}; 