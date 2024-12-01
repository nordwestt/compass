import { useAtom, useSetAtom } from 'jotai';
import { currentThreadAtom, threadActionsAtom, ThreadAction } from './atoms';
import { useRef } from 'react';
import { MentionedCharacter } from '@/components/ChatInput';
import { useTTS } from './useTTS';
import { CharacterContextManager } from '@/src/services/chat/CharacterContextManager';
import { StreamHandlerService } from '@/src/services/chat/StreamHandlerService';
import { ChatProviderFactory } from '@/src/services/chat/ChatProviderFactory';

export function useChat() {
  const [currentThread] = useAtom(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const abortController = useRef<AbortController | null>(null);
  const tts = useTTS();

  const contextManager = new CharacterContextManager();
  const streamHandler = new StreamHandlerService(tts);

  const handleInterrupt = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    tts.stopStreaming();
  };

  const handleSend = async (message: string, mentionedCharacters: MentionedCharacter[] = []) => {
    abortController.current = new AbortController();


    let context = contextManager.prepareContext(message, currentThread, mentionedCharacters);

    const updatedThread = {
      ...currentThread,
      messages: [...currentThread.messages, {content: message, isUser: true}, context.assistantPlaceholder]
    };

    dispatchThread({
      type: 'update',
      payload: updatedThread
    });

    try {
      const provider = ChatProviderFactory.getProvider(currentThread.selectedModel);
      const response = await provider.sendMessage(
        context.useMention ? context.messagesToSend : [...context.historyToSend, ...context.messagesToSend],
        currentThread.selectedModel,
        context.characterToUse,
        abortController.current.signal
      );

      await streamHandler.handleStream(response, updatedThread, dispatchThread);

    } catch (error) {
      // Handle error cases
    } finally {
      abortController.current = null;
    }
  };

  return { handleSend, handleInterrupt };
} 