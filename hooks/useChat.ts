import { useAtom, useSetAtom } from 'jotai';
import { currentThreadAtom, threadActionsAtom, ThreadAction, searchEnabledAtom } from './atoms';
import { useRef } from 'react';
import { MentionedCharacter } from '@/components/ChatInput';
import { useTTS } from './useTTS';
import { CharacterContextManager } from '@/src/services/chat/CharacterContextManager';
import { StreamHandlerService } from '@/src/services/chat/StreamHandlerService';
import { ChatProviderFactory } from '@/src/services/chat/ChatProviderFactory';
import { useSearch } from './useSearch';
import { current } from 'tailwindcss/colors';

export function useChat() {
  const [currentThread] = useAtom(currentThreadAtom);
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

    let jsonResponse = await provider.sendJSONMessage(message, currentThread.selectedModel, systemPrompt);
    return jsonResponse;
  }

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

      console.log("handling stream");

      await streamHandler.handleStream(response, updatedThread, dispatchThread);

    } catch (error) {
      // Handle error cases
    } finally {
      abortController.current = null;
    }
  };

  return { handleSend, handleInterrupt };
} 