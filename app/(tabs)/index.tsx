import { Image, StyleSheet, Platform, View, Text, TouchableOpacity } from 'react-native';

import { ChatThread } from '@/components/ChatThread';
import { ChatMessage } from '@/hooks/useChat';
import { ChatThreads } from '@/components/ChatThreads';
import { useSignal } from '@preact/signals-react';
import { SystemPrompt } from '@/components/SystemPromptSelector';
import { useSignals } from '@preact/signals-react/runtime';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Model } from '@/hooks/useModels';

export interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  selectedModel: Model;
  systemPrompt: SystemPrompt;
}

export default function HomeScreen() {
  useSignals();
  const threads = useSignal<Thread[]>([{id: Date.now().toString(), title: "First conversation", messages:[], selectedModel: {id: '', name: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}}, systemPrompt: {id: 'default', name: 'Default Assistant', content: 'You are a helpful AI assistant.', image: require('@/assets/characters/default.png')}}]);
  const currentThread = useSignal<Thread>(threads.value[0]);
  const isSidebarVisible = useSignal(true);
  return (
    <View className="bg-gray-100 flex-1 flex-row">
      {isSidebarVisible.value && (
        <View className="w-64 border-r-2 border-gray-200 dark:border-gray-700">
          <View className="flex-row justify-between items-center p-4 bg-gray-200 dark:bg-gray-700">
            <Text className="text-center text-lg font-bold text-black dark:text-white">Threads</Text>
          <TouchableOpacity onPress={() => {isSidebarVisible.value = !isSidebarVisible.value}} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <Ionicons name={"chevron-back"} size={24} className="text-black dark:text-white" />
          </TouchableOpacity>
        </View>
          <ChatThreads threads={threads} currentThread={currentThread}></ChatThreads>
        </View>
      )}
      {!isSidebarVisible.value && (
        <TouchableOpacity onPress={() => {isSidebarVisible.value = !isSidebarVisible.value}} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <Ionicons name={"chevron-forward"} size={24} className="text-black dark:text-white" />
        </TouchableOpacity>
      )}
      <View className="flex-1 bg-white rounded-t-xl">
        <ChatThread thread={currentThread} threads={threads}/>
      </View>
    </View>
  )
}
