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
import { Platform as PlatformCustom } from '@/src/utils/platform';

import { 
  currentThreadAtom, 
  threadActionsAtom, 
  threadsAtom,
  editingMessageIndexAtom,
  isGeneratingAtom,
  availableProvidersAtom,
  ttsEnabledAtom,
  defaultVoiceAtom,
  previewCodeAtom,
  sidebarVisibleAtom
} from '@/src/hooks/atoms';
import { MentionedCharacter } from './ChatInput';
import { FlashList } from '@shopify/flash-list';
import { VoiceSelector } from './VoiceSelector';
import { CodePreview } from './CodePreview';
import { parseCodeBlocks } from '@/src/utils/codeParser';
import { Modal } from '@/src/components/ui/Modal';
import { useWindowDimensions } from 'react-native';
import { toastService } from '@/src/services/toastService';
import { Dropdown, DropdownElement } from '../ui/Dropdown';
import { Settings } from './Settings';
import { Ionicons } from '@expo/vector-icons';



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
  const [sidebarVisible, setSidebarVisible] = useAtom(sidebarVisibleAtom);
  
  const previousThreadId = useRef(currentThread.id);

  const [editingMessageIndex, setEditingMessageIndex] = useAtom(editingMessageIndexAtom);

  const [previewCode, setPreviewCode] = useAtom(previewCodeAtom);

  const [contentHeight, setContentHeight] = useState(50);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

    if(Platform.OS == 'web'){
      setSidebarVisible(false);
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

  const handleSelectCharacter = (character: Character) => {
    dispatchThread({
      type: 'update',
      payload: { ...currentThread, character: character }
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
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 99999999, animated: true });
      setUserHasScrolled(false);
      setShowScrollButton(false);
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

  const handleScroll = useCallback((event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const maxOffset = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
    
    // If user has scrolled up more than 50 pixels from bottom, consider it as manual scroll
    const hasScrolledUp = maxOffset - currentOffset > 50;
    setUserHasScrolled(hasScrolledUp);
    setShowScrollButton(hasScrolledUp);
  }, []);

  // Reset userHasScrolled when generation stops
  useEffect(() => {
    if (!isGenerating) {
      setUserHasScrolled(false);
    }
  }, [isGenerating]);

  const messages = currentThread?.messages || [];
  const isEmpty = messages.length === 0;

  return (
    <View className="flex-row flex-1">

    <View className="flex-1 bg-background">
      <View className="p-2 flex-row justify-between items-center border-b border-border bg-surface shadow-2xl rounded-xl mt-2 mx-2 z-10">
      <CharacterSelector
          selectedPrompt={currentThread.character}
          onSelectPrompt={handleSelectCharacter}
          className="w-40 overflow-hidden"
        />
        <View className="flex-row items-center gap-2">
        
          
          
            <ModelSelector 
              selectedModel={currentThread.selectedModel}
              onModelSelect={handleSelectModel}
              character={currentThread.character}
            />
            <Settings thread={currentThread}></Settings>
          
          
          {ttsEnabled && (
            <VoiceSelector
              selectedVoice={selectedVoice}
              onSelectVoice={setSelectedVoice}
            />
          )}
        </View>
        
      </View>
      
      {isEmpty ? (
        <View className="flex-1 items-center justify-center">
          <View className="w-full max-w-xl px-4">
            <View className="mb-8">
              <Text className="text-2xl font-bold text-center text-text mb-2">
                Start a conversation with {currentThread.character?.name || 'AI'}
              </Text>
              <Text className="text-center text-text opacity-70">
                Ask a question or start a conversation to get help with anything.
              </Text>
            </View>
            <ChatInput 
              ref={chatInputRef}
              onSend={wrappedHandleSend} 
              isGenerating={isGenerating}
              onInterrupt={handleInterrupt}
              className="shadow-lg rounded-xl"
            />
          </View>
        </View>
      ) : (
        <View className={`mx-auto flex-1 ${Platform.OS == 'web' ? 'w-[80%]' : ''}`}>
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
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
            className={`flex-1 -mt-4`}
            contentContainerStyle={{ padding: 16, paddingBottom: 50, paddingTop: 50 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center p-4">
                {/* Optional: Add an empty state message */}
              </View>
            }
            onScroll={handleScroll}
            onScrollBeginDrag={() => setUserHasScrolled(true)}
          />
          
          {showScrollButton && (
            <View className="absolute bottom-24 left-0 right-0 items-center mb-2">
              <TouchableOpacity 
                onPress={scrollToEnd}
                className="bg-primary w-10 h-10 rounded-full items-center justify-center shadow-md"
              >
                <Ionicons name="chevron-down" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          <ChatInput 
            ref={chatInputRef}
            onSend={wrappedHandleSend} 
            isGenerating={isGenerating}
            onInterrupt={handleInterrupt}
            className={`${Platform.OS == 'web' ? 'mb-8 rounded-xl' : ''}`}
          />
        </View>
      )}
      
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


