import React, { useRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { Thread } from '@/app/(tabs)';
import { Signal } from '@preact/signals-react';
import { ModelSelector } from './ModelSelector';
import { useModels } from '@/hooks/useModels';
import { useChat } from '@/hooks/useChat';

export interface ChatThreadProps {
  thread: Signal<Thread>;
  threads: Signal<Thread[]>;
}

export const ChatThread: React.FC<ChatThreadProps> = ({thread, threads}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { availableModels, selectedModel, isLoadingModels, fetchAvailableModels } = useModels();
  const { handleSend } = useChat(thread, threads, selectedModel);

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  return (
    <View className="flex-1">
      <View className="p-4 border-b border-gray-200">
        {selectedModel.value && <ModelSelector 
          isLoading={isLoadingModels.value}
          models={availableModels}
          selectedModel={selectedModel}
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


