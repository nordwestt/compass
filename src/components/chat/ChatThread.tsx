import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, ScrollView, Platform, TouchableOpacity, Text } from 'react-native';
import { Message } from './Message';
import { ChatInput, ChatInputRef } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { useModels } from '@/src/hooks/useModels';
import { useChat } from '@/src/hooks/useChat';
import { CharacterSelector } from '@/src/components/character/CharacterSelector';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Model, Character, ChatMessage } from '@/src/types/core';

import { 
  currentThreadAtom, 
  threadActionsAtom, 
  threadsAtom,
  editingMessageIndexAtom,
  isGeneratingAtom,
  availableProvidersAtom,
  ttsEnabledAtom,
  defaultVoiceAtom
} from '@/src/hooks/atoms';
import { MentionedCharacter } from './ChatInput';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { toastService } from '@/src/services/toastService';
import { VoiceSelector } from './VoiceSelector';

export const ChatThread: React.FC = () => {
  const flatListRef = useRef<FlashList<any>>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const [currentThread, setCurrentThread] = useAtom(currentThreadAtom);
  const threads = useAtomValue(threadsAtom);
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const [providers] = useAtom(availableProvidersAtom);
  const [ttsEnabled, setTtsEnabled] = useAtom(ttsEnabledAtom);
  const [selectedVoice, setSelectedVoice] = useAtom(defaultVoiceAtom);
  
  const previousThreadId = useRef(currentThread.id);

  const [editingMessageIndex, setEditingMessageIndex] = useAtom(editingMessageIndexAtom);

  useEffect(() => {
    if(threads.find(t => t.id === currentThread.id) === undefined) {
      dispatchThread({ type: 'add', payload: currentThread });
    }
  }, []);
  
  useEffect(() => {
    chatInputRef.current?.focus();
    if (previousThreadId.current !== currentThread.id) {
      
      previousThreadId.current = currentThread.id;
      setIsGenerating(false);
    }
  }, [currentThread.id]);


  const { handleSend, handleInterrupt } = useChat();

  const wrappedHandleSend = async (message: string, mentionedCharacters: MentionedCharacter[]) => {
    if(!providers.length) {
      return;
    }
    let messages = [...currentThread.messages];

    const isEditing = editingMessageIndex !== -1;

    if (isEditing) {
      messages.splice(editingMessageIndex);
      setEditingMessageIndex(-1);
    }

    if (currentThread.messages.length === 0 && threads.filter(t => t.id === currentThread.id).length === 0) {
      await dispatchThread({ 
        type: 'add', 
        payload: currentThread 
      });
    }

    setIsGenerating(true);
    try {
      await handleSend(messages, message, mentionedCharacters);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsGenerating(false);
      if(flatListRef.current) {
        await new Promise(resolve => setTimeout(resolve, 200));
        debouncedScrollToEnd();
      }
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

  const handleMessagePress = (index: number, message: ChatMessage) =>{
    if (message.isUser) {
      console.log("User pressed message", message, index);
      setEditingMessageIndex(index);

      chatInputRef.current?.setEditMessage(message.content);

    }
  };

  const renderItem = ({ item: message, index }: { item: any; index: number }) => (
    // <TouchableOpacity 
    //   onPress={() => handleMessagePress(index, message)}
    //   activeOpacity={message.isUser ? 0.7 : 1}
    // >
      <Message
        content={message.content}
        isUser={message.isUser}
        character={message.character}
        index={index}
      />
    // </TouchableOpacity>
  );

  const scrollToEnd = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 99999999, animated: true });
    }
  }, []);

  // Debounced version of scrollToEnd
  const debouncedScrollToEnd = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(scrollToEnd, 300);
      };
    })(),
    [scrollToEnd]
  );

  const messages = currentThread?.messages || [];

  return (
    <View className="flex-1 bg-background">
      <View className="p-2 flex-row justify-between items-center border-b border-border bg-surface shadow-2xl rounded-xl mt-2 mx-2 z-10">
        <View className="flex-row items-center gap-2">
          {currentThread?.selectedModel && (
            <ModelSelector 
              selectedModel={currentThread.selectedModel}
              onSetModel={handleSelectModel}
            />
          )}
          
          {ttsEnabled && (
            <VoiceSelector
              selectedVoice={selectedVoice}
              onSelectVoice={setSelectedVoice}
            />
          )}
        </View>
        <CharacterSelector
          selectedPrompt={currentThread.character}
          onSelectPrompt={handleSelectPrompt}
          className="w-40 overflow-hidden"
        />
      </View>

      <FlashList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        estimatedItemSize={400}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            debouncedScrollToEnd();
          }
        }}
        keyExtractor={(_, index) => index.toString()}
        maintainVisibleContentPosition={{ // Add this prop
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
        className="flex-1 -mt-4 pt-4"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            {/* Optional: Add an empty state message */}
          </View>
        }
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


