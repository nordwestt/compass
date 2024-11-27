import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { Message } from './Message';
import { ChatInput, ChatInputRef } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { useModels } from '@/hooks/useModels';
import { useChat } from '@/hooks/useChat';
import { CharacterSelector } from './CharacterSelector';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Model, Character } from '@/types/core';
import { router } from 'expo-router';
import { HeaderBackButton } from '@react-navigation/elements';

import { 
  currentThreadAtom, 
  threadActionsAtom, 
  threadsAtom,
  isGeneratingAtom,
  availableProvidersAtom
} from '@/hooks/atoms';
import { MentionedCharacter } from './ChatInput';
import { FlashList } from '@shopify/flash-list';
export const ChatThread: React.FC = () => {
  const flatListRef = useRef<FlashList<any>>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const [currentThread, setCurrentThread] = useAtom(currentThreadAtom);
  const threads = useAtomValue(threadsAtom);
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const [providers] = useAtom(availableProvidersAtom);
  
  const previousThreadId = useRef(currentThread.id);
  
  useEffect(() => {

    if (previousThreadId.current !== currentThread.id) {
      chatInputRef.current?.focus();
      previousThreadId.current = currentThread.id;
      setIsGenerating(false);
    }
  }, [currentThread.id]);


  const { handleSend, handleInterrupt } = useChat();

  const wrappedHandleSend = async (message: string, mentionedCharacters: MentionedCharacter[]) => {
    if(!providers.length) {
      return;
    }

    if (currentThread.messages.length === 0 && threads.filter(t => t.id === currentThread.id).length === 0) {

      dispatchThread({ 
        type: 'add', 
        payload: currentThread 
      });

    }

    setIsGenerating(true);
    try{
      await handleSend(message, mentionedCharacters);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSelectModel = (model: Model) => {
    dispatchThread({
      type: 'update',
      payload: { ...currentThread, selectedModel: model }
    });
  };

  const handleSelectPrompt = (prompt: Character) => {
    dispatchThread({
      type: 'update',
      payload: { ...currentThread, character: prompt }
    });
  };

  const renderItem = ({ item: message }: { item: any }) => (
    <Message
      content={message.content}
      isUser={message.isUser}
      character={message.character}
    />
  );

  const isDesktop = Platform.OS === 'web' && window.innerWidth >= 768;

  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4 flex-row justify-between border-b border-gray-200 dark:border-gray-700">
        {currentThread.selectedModel && (
          <ModelSelector 
            selectedModel={currentThread.selectedModel}
            onSetModel={handleSelectModel}
          />
        )}
        <CharacterSelector
          selectedPrompt={currentThread.character}
          onSelectPrompt={handleSelectPrompt}
        />
      </View>

      <FlashList
        ref={flatListRef}
        data={currentThread.messages}
        renderItem={renderItem}
        estimatedItemSize={100} // Adjust based on your average message height
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyExtractor={(_, index) => index.toString()}
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      />
      
      <ChatInput 
        ref={chatInputRef}
        onSend={wrappedHandleSend} 
        isGenerating={isGenerating}
        onInterrupt={handleInterrupt}
      />
    </View>
  );
}; 


