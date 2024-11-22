import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatThread } from '@/components/ChatThread';
import { ChatMessage, SelectedModel } from '@/hooks/useChat';
import { ChatThreads } from '@/components/ChatThreads';
import { useSignal } from '@preact/signals-react';
import { SystemPrompt } from '@/components/SystemPromptSelector';
import { useSignals } from '@preact/signals-react/runtime';

export interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  selectedModel: SelectedModel;
  systemPrompt: SystemPrompt;
}

export default function HomeScreen() {
  useSignals();
  const threads = useSignal<Thread[]>([{id: Date.now().toString(), title: "First conversation", messages:[{content: "Hello, how can I help you today?", isUser: false}], selectedModel: {id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}}, systemPrompt: {id: 'default', name: 'Default Assistant', content: 'You are a helpful AI assistant.'}}]);
  const currentThread = useSignal<Thread>(threads.value[0]);
  return (
    <View className="bg-gray-100 flex-1 flex-row">
      <View className="w-64">
        <ChatThreads threads={threads} currentThread={currentThread}></ChatThreads>
      </View>
      <View className="flex-1 bg-white rounded-t-xl">
        <ChatThread thread={currentThread} threads={threads}/>
      </View>
    </View>
  )
}
