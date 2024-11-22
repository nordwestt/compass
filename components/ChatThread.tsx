import React, { useRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { Thread } from '@/app/(tabs)';
import { effect, Signal, useSignal, computed, useComputed } from '@preact/signals-react';
import { ModelSelector } from './ModelSelector';
import { Model, useModels } from '@/hooks/useModels';
import { SelectedModel, useChat } from '@/hooks/useChat';

export interface ChatThreadProps {
  thread: Signal<Thread>;
  threads: Signal<Thread[]>;
}

export const ChatThread: React.FC<ChatThreadProps> = ({thread, threads}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const selectedModel = useComputed(() => thread.value.selectedModel);
  const availableModels = useSignal<Model[]>([]);

  const { fetchAvailableModels, setDefaultModel } = useModels(thread.value.selectedModel);
  const { handleSend } = useChat(thread, threads);

  if(availableModels.value.length === 0){
    fetchAvailableModels().then((models) => {
      availableModels.value = models ?? [];
    });
  }

  const setSelectedModel = (model: SelectedModel) => {
    thread.value = {...thread.value, selectedModel: model};
    // find the thread in threads and update it
    const threadIndex = threads.value.findIndex((t) => t.id === thread.value.id);
    if(threadIndex !== -1){
      threads.value[threadIndex] = thread.value;
    }
  }

  return (
    <View className="flex-1">
      <View className="p-4 border-b border-gray-200">
        {selectedModel.value && <ModelSelector 
          models={availableModels}
          selectedModel={selectedModel}
          onSetModel={setSelectedModel}
          onSetDefault={setDefaultModel}
        />}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {thread.value.messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
          />
        ))}
      </ScrollView>
      <ChatInput onSend={handleSend} />
    </View>
  );
}; 


