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
import { ChatMessage, Thread } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { toastService } from '@/src/services/toastService';
//import TurndownService from 'turndown';
import { Readability } from '@mozilla/readability';
//import { JSDOM } from 'jsdom';
import { getProxyUrl } from '../utils/proxy';
import { searchRelevantPassages } from '../utils/semanticSearch';

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

  const isSearchRequired = async (message: string) : Promise<{query: string, searchRequired: boolean}> => {
    const provider = ChatProviderFactory.getProvider(currentThread.selectedModel);
    const systemPrompt = `
    Your name is SearchAssistantBot, and you identify if the user's message requires a search on the internet.
    If the user's message requires a search, return the query to be searched and set "searchRequired" to true. 
    If the user's message does not require a search, simply return an empty string and set "searchRequired" to false.
    Examples:
    - "What is the weather in Tokyo?" -> {"query": "weather in Tokyo", "searchRequired": true}
    - "What is the capital of France?" -> {"query": "", "searchRequired": false}
    `;

    return await provider.sendJSONMessage(message, currentThread.selectedModel, systemPrompt);
  }

  const handleSend = async (messages: ChatMessage[], message: string, mentionedCharacters: MentionedCharacter[] = []) => {
    abortController.current = new AbortController();
    
    let webContent: string[] = [];
    const urls = message.match(/https?:\/\/[^\s]+/g);
    if (urls && urls.length > 0) {
      toastService.info({ title: 'Processing URLs', description: 'Fetching content from links...' });
      
      for (const url of urls) {
        try {
          const html = await fetch(await getProxyUrl(url)).then(res => res.text());
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const reader = new Readability(doc);
          const article = reader.parse();
          
          if (article?.textContent) {
            // Trim and clean up the content
            const cleanContent = article.textContent
              .trim()
              .replace(/\s+/g, ' ')
              .slice(0, 2000); // Limit content length
            
            webContent.push(`Content from ${url}:\n${cleanContent}\n`);
          }
        } catch (error: any) {
          LogService.log(error, { component: 'useChat', function: 'handleSend' }, 'error');
          toastService.warning({ 
            title: 'URL Processing Error', 
            description: `Failed to process ${url}` 
          });
        }
      }
    }
    
    let context = contextManager.prepareContext(message, currentThread, mentionedCharacters);
    
    // Add web content to context if available
    if (webContent.length > 0) {
      const relevantPassages = await searchRelevantPassages(message, webContent.join('\n'), ChatProviderFactory.getProvider(currentThread.selectedModel), {
        maxChunkSize: 512,
        minSimilarity: 0.7,
        maxResults: 3
      });
      if(relevantPassages.length > 0) {
        context.messagesToSend.push({
          content: `Web content context:\n${relevantPassages.map(passage => passage.text).join('\n')}`,
          isSystem: true,
          isUser: false
        });
      }
    }

    const updatedThread = {
      ...currentThread,
      messages: [...messages, {content: message, isUser: true}, context.assistantPlaceholder]
    };

    await dispatchThread({
      type: 'update',
      payload: updatedThread
    });

    if(searchEnabled) {
      const searchRequired = await isSearchRequired(message);
      if(searchRequired.searchRequired) {
        const searchResponse = await search(searchRequired.query);
        if(searchResponse?.results?.length && searchResponse?.results?.length > 0) {
          context.messagesToSend.push({content: `Web search results: ${searchResponse?.results.slice(0,3)?.map(result => result.content).join('\n')}`, isSystem: true, isUser: false});
        }
      }
    }

    try {
      const provider = ChatProviderFactory.getProvider(currentThread.selectedModel);
      const response = await provider.sendMessage(
        context.useMention ? context.messagesToSend : [...context.historyToSend, ...context.messagesToSend],
        currentThread.selectedModel,
        context.characterToUse,
        abortController.current.signal
      );

      await streamHandler.handleStream(response, updatedThread, dispatchThread);
      const isFirstMessage = currentThread.messages.length === 0;
      if(isFirstMessage) {
        await handleFirstMessage(message, updatedThread);
      }

    } catch (error: any) {
      toastService.danger({
        title: 'Error sending message',
        description: error.message
      });
      LogService.log(error, {component: 'useChat', function: `handleSend`}, 'error');
    } finally {
      abortController.current = null;
    }
  };

  return { handleSend, handleInterrupt };
} 