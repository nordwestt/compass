import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentThreadAtom, threadActionsAtom, ThreadAction, searchEnabledAtom } from './atoms';
import { useRef } from 'react';
import { MentionedCharacter } from '@/src/components/chat/ChatInput';
import { useTTS } from './useTTS';
import { CharacterContextManager } from '@/src/services/chat/CharacterContextManager';
import { StreamHandlerService } from '@/src/services/chat/StreamHandlerService';
import { ChatProviderFactory } from '@/src/services/chat/ChatProviderFactory';
import { useSearch } from './useSearch';
import { current } from 'tailwindcss/colors';
import { Character, ChatMessage, Thread } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { toastService } from '@/src/services/toastService';
//import TurndownService from 'turndown';
import { Readability } from '@mozilla/readability';
//import { JSDOM } from 'jsdom';
import { getProxyUrl } from '../utils/proxy';
import { searchRelevantPassages } from '../utils/semanticSearch';
import { fetchSiteText } from '../utils/siteFetcher';
import { MessageContext, MessageTransformPipeline, relevantPassagesTransform, urlContentTransform, searchTransform, threadUpdateTransform, firstMessageTransform } from './pipelines';

export function useChat() {
  const currentThread = useAtomValue(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const [searchEnabled] = useAtom(searchEnabledAtom);
  const abortController = useRef<AbortController | null>(null);
  const { search } = useSearch();
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

  const handleFirstMessage = async (
    message: string,
    thread: Thread
  ): Promise<void> => {
    const systemPrompt = `Based on the user message, generate a concise 3-word title that captures the essence of the conversation. Format: "Word1 Word2 Word3" (no quotes, no periods but do include spaces).`;

    const provider = ChatProviderFactory.getProvider(thread.selectedModel);
    try {
      const title = await provider.sendSimpleMessage(message, thread.selectedModel, systemPrompt);
      await new Promise(resolve => setTimeout(resolve, 200));

      dispatchThread({
        type: 'update',
        payload: { ...thread, title: title }
      });
    } catch (error: any) {
      toastService.danger({title: 'Error generating title', description: "The AI service may be experiencing issues. Please try again later."});
      LogService.log(error, { component: 'useChat', function: 'handleFirstMessage' }, 'error');
    }
  }

  

  const pipeline = new MessageTransformPipeline()
    .addTransform(urlContentTransform)
    .addTransform(relevantPassagesTransform)
    .addTransform(searchTransform)
    .addTransform(threadUpdateTransform)
    .addTransform(firstMessageTransform);

  const handleSend = async (messages: ChatMessage[], message: string, mentionedCharacters: MentionedCharacter[] = []) => {
    abortController.current = new AbortController();
    let context = contextManager.prepareContext(message, currentThread, mentionedCharacters);

    const provider = ChatProviderFactory.getProvider(currentThread.selectedModel);

    const initialContext: MessageContext = {
      message,
      provider,
      thread: currentThread,
      mentionedCharacters,
      context,
      metadata: {
        messages,
        searchEnabled,
        searchFunction: search,
        dispatchThread,
      }
    };

    try {
      const transformedContext = await pipeline.process(initialContext);
      
      
      const response = await provider.sendMessage(
        transformedContext.context.useMention ? 
          transformedContext.context.messagesToSend : 
          [...transformedContext.context.historyToSend, ...transformedContext.context.messagesToSend],
        currentThread.selectedModel,
        context.characterToUse,
        abortController.current.signal
      );

      await streamHandler.handleStream(response, transformedContext.metadata.updatedThread, dispatchThread);

    } catch (error: any) {
      toastService.danger({
        title: 'Error sending message',
        description: error.message
      });
      LogService.log(error, {component: 'useChat', function: 'handleSend'}, 'error');
    } finally {
      abortController.current = null;
    }
  };

  return { handleSend, handleInterrupt };
}

