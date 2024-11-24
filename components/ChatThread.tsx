import React, { useRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Message } from './Message';
import { ChatInput, ChatInputRef } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { fetchAvailableModelsV2, useModels } from '@/hooks/useModels';
import { useChat } from '@/hooks/useChat';
import { CharacterSelector } from './CharacterSelector';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Model, Character } from '@/types/core';
import { 
  currentThreadAtom, 
  threadActionsAtom, 
  availableModelsAtom,
  isGeneratingAtom,
  availableEndpointsAtom
} from '@/hooks/atoms';
import { MentionedCharacter } from './ChatInput';
export const ChatThread: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const [currentThread] = useAtom(currentThreadAtom);
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const availableModels = useAtomValue(availableModelsAtom);
  const [endpoints] = useAtom(availableEndpointsAtom);
  const setAvailableModels = useSetAtom(availableModelsAtom);
  
  const previousThreadId = useRef(currentThread.id);
  
  useEffect(() => {
    if (previousThreadId.current !== currentThread.id) {
      chatInputRef.current?.focus();
      previousThreadId.current = currentThread.id;
    }
  }, [currentThread.id]);

  const { fetchAvailableModels, setDefaultModel } = useModels();
  const { handleSend, handleInterrupt } = useChat();

  const wrappedHandleSend = async (message: string, mentionedCharacters: MentionedCharacter[]) => {
    setIsGenerating(true);
    await handleSend(message, mentionedCharacters);
    setIsGenerating(false);
  };

  // Fetch models if needed
  useEffect(() => {
    if (availableModels.length === 0) {
      fetchAvailableModelsV2(endpoints, setAvailableModels).then(() => {
        
      });
    }
  }, [endpoints]);

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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4 flex-row justify-between border-b border-gray-200 dark:border-gray-700">
        {currentThread.selectedModel && (
          <ModelSelector 
            selectedModel={currentThread.selectedModel}
            onSetModel={handleSelectModel}
            onSetDefault={() => setDefaultModel(currentThread.selectedModel)}
          />
        )}
        <CharacterSelector
          selectedPrompt={currentThread.character}
          onSelectPrompt={handleSelectPrompt}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {currentThread.messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
          />
        ))}
      </ScrollView>
      
      <ChatInput 
        ref={chatInputRef}
        onSend={wrappedHandleSend} 
        isGenerating={isGenerating}
        onInterrupt={handleInterrupt}
      />
    </View>
  );
}; 


