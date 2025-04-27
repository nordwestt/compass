import { getDefaultStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentThreadAtom, threadActionsAtom, ThreadAction, searchEnabledAtom, documentsAtom } from './atoms';
import { useRef } from 'react';
import { MentionedCharacter } from '@/src/components/chat/ChatInput';
import { useTTS } from './useTTS';
import { CharacterContextManager } from '@/src/services/chat/CharacterContextManager';
import { StreamHandlerService } from '@/src/services/chat/StreamHandlerService';
import { ChatProviderFactory } from '@/src/services/chat/ChatProviderFactory';
import { useSearch } from './useSearch';
import { Character, ChatMessage, Thread, Document, Model } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { toastService } from '@/src/services/toastService';
import { MessageContext, MessageTransformPipeline, relevantPassagesTransform, urlContentTransform, webSearchTransform, threadUpdateTransform, firstMessageTransform, documentContextTransform, templateVariableTransform } from './pipelines';

export function useChat() {
  const currentThread = useAtomValue(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const documents = useAtomValue(documentsAtom);
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


  const pipeline = new MessageTransformPipeline()
    .addTransform(templateVariableTransform)
    .addTransform(documentContextTransform)  
    .addTransform(urlContentTransform)
    .addTransform(relevantPassagesTransform)
    .addTransform(webSearchTransform)
    .addTransform(threadUpdateTransform)
    .addTransform(firstMessageTransform)
    

  const handleSend = async (messages: ChatMessage[], message: string, mentionedCharacters: MentionedCharacter[] = []) => {
    abortController.current = new AbortController();
    currentThread.messages = messages;
    let context = contextManager.prepareContext(message, currentThread, mentionedCharacters);
    
    

    const provider = ChatProviderFactory.getProvider(currentThread.selectedModel.provider);

    let relevantDocuments = documents.filter((doc: Document) => currentThread.character.documentIds?.includes(doc.id));
    relevantDocuments.push(...documents.filter((doc: Document) => currentThread.metadata?.documentIds?.includes(doc.id) ?? []));

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
        documents: relevantDocuments
      }
    };

    try {
      const transformedContext = await pipeline.process(initialContext);

      transformedContext.context.messagesToSend.push(transformedContext.context.assistantPlaceholder);
      
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
      console.log('error', error);
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

