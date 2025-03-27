import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, ScrollView, Platform, TouchableOpacity, Text, FlatList } from 'react-native';
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
  defaultVoiceAtom,
  previewCodeAtom
} from '@/src/hooks/atoms';
import { MentionedCharacter } from './ChatInput';
import { FlashList } from '@shopify/flash-list';
import { VoiceSelector } from './VoiceSelector';
import { CodePreview } from './CodePreview';
import { parseCodeBlocks } from '@/src/utils/codeParser';
import { Modal } from '@/src/components/ui/Modal';
import { useWindowDimensions } from 'react-native';
import { toastService } from '@/src/services/toastService';



export const ChatThread: React.FC = () => {
  const flatListRef = useRef<FlatList<any>>(null);
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

  const [previewCode, setPreviewCode] = useAtom(previewCodeAtom);

  const [contentHeight, setContentHeight] = useState(50);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [userHasScrolled, setUserHasScrolled] = useState(false);

  const { getCompatibleModel } = useChat();

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
    // Check if the character has model preferences
    const compatibleModel = getCompatibleModel(prompt, providers);
    
    if (compatibleModel === undefined) {
      // No compatible model found for required preferences
      toastService.warning({
        title: "Incompatible Character",
        description: "This character requires specific models that aren't available."
      });
      return;
    }
    
    // Update the thread with the new character
    const updatedThread = { ...currentThread, character: prompt };
    
    // If a compatible model is found, update the model too
    if (compatibleModel) {
      updatedThread.selectedModel = compatibleModel;
      toastService.info({
        title: "Model Updated",
        description: `Switched to ${compatibleModel.name} as recommended for this character.`
      });
    }
    
    dispatchThread({
      type: 'update',
      payload: updatedThread
    });
  };

  const handleMessagePress = (index: number, message: ChatMessage) =>{
    if (message.isUser) {
      console.log("User pressed message", message, index);
      setEditingMessageIndex(index);

      chatInputRef.current?.setEditMessage(message.content);

    }
  };

  const renderItem = ({ item: message, index }: { item: any; index: number }) => {
    const parsedCode = !message.isUser ? parseCodeBlocks(message.content) : null;

    return (
      <Message
        content={message.content}
        isUser={message.isUser}
        character={message.character}
        index={index}
        onEdit={() => handleMessagePress(index, message)}
        onPreviewCode={() => parsedCode && setPreviewCode(parsedCode)}
        hasPreviewableCode={!!parsedCode}
      />
    );
  };

  const scrollToEnd = useCallback(() => {
    if (flatListRef.current && !userHasScrolled) {
      flatListRef.current.scrollToOffset({ offset: 99999999, animated: true });
    }
  }, [userHasScrolled]);

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

  const handleScroll = useCallback((event: any) => {
    if (isGenerating) {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const maxOffset = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
      
      // If user has scrolled up more than 50 pixels from bottom, consider it as manual scroll
      setUserHasScrolled(maxOffset - currentOffset > 50);
    }
  }, [isGenerating]);

  // Reset userHasScrolled when generation stops
  useEffect(() => {
    if (!isGenerating) {
      setUserHasScrolled(false);
    }
  }, [isGenerating]);

  const messages = currentThread?.messages || [];

  return (
    <View className="flex-row flex-1">

    <View className="flex-1 bg-background">
      <View className="p-2 flex-row justify-between items-center border-b border-border bg-surface shadow-2xl rounded-xl mt-2 mx-2 z-10">
      <CharacterSelector
          selectedPrompt={currentThread.character}
          onSelectPrompt={handleSelectPrompt}
          className="w-40 overflow-hidden"
        />
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
        
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
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
        className="flex-1 -mt-4"
        contentContainerStyle={{ padding: 16, paddingBottom: 50, paddingTop: 50 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            {/* Optional: Add an empty state message */}
          </View>
        }
        onScroll={handleScroll}
        onScrollBeginDrag={() => setUserHasScrolled(true)}
      />

      

      <ChatInput 
        ref={chatInputRef}
        onSend={wrappedHandleSend} 
        isGenerating={isGenerating}
        onInterrupt={handleInterrupt}
      />
      
    </View>
    {/* Show side panel on desktop, modal on mobile */}
    {previewCode && (
      isDesktop ? (
        <View className="flex-1 p-4 overflow-hidden w-1/3 h-screen">
          <CodePreview
            {...previewCode}
            onClose={() => setPreviewCode(null)}
          />
        </View>
      ) : (
        <Modal
          isVisible={!!previewCode}
          onClose={() => setPreviewCode(null)}
        >
          <View className="flex-1">
            <CodePreview
              {...previewCode}
              onClose={() => setPreviewCode(null)}
            />
          </View>
        </Modal>
      )
    )}
      </View>
  );
}; 


