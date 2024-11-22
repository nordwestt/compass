import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatThread } from '@/components/ChatThread';
import { ChatMessage } from '@/hooks/useChat';
import { ChatThreads } from '@/components/ChatThreads';
import { useSignal } from '@preact/signals-react';

export interface Thread {
  id: number;
  title: string;
  messages: ChatMessage[];
}

export default function HomeScreen() {
  const threads = useSignal<Thread[]>([{id: 0, title: "First conversation", messages:[{content: "Hello, how can I help you today?", isUser: false}]}]);
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
