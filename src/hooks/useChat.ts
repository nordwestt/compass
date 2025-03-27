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
import { MessageContext, MessageTransformPipeline, relevantPassagesTransform, urlContentTransform, searchTransform, threadUpdateTransform, firstMessageTransform, documentContextTransform  } from './pipelines';

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
    .addTransform(documentContextTransform)  
    .addTransform(urlContentTransform)
    .addTransform(relevantPassagesTransform)
    .addTransform(searchTransform)
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

  const getCompatibleModel = (character: Character, availableModels: Model[]): Model | null => {
    // If character has no model preferences, any model is compatible
    if (!character.modelPreferences || character.modelPreferences.length === 0) {
      return null; // Null means any model is compatible
    }

    // Check for required models first
    const requiredPreferences = character.modelPreferences.filter(p => p.level === 'required');
    if (requiredPreferences.length > 0) {
      // Find the first available required model
      for (const pref of requiredPreferences) {
        const model = availableModels.find(m => m.id === pref.modelId);
        if (model) return model;
      }
      // If we have required models but none are available, we can't use this character
      return null; // Null means no compatible model found
    }

    // Check for preferred models
    const preferredPreferences = character.modelPreferences.filter(p => p.level === 'preferred');
    for (const pref of preferredPreferences) {
      const model = availableModels.find(m => m.id === pref.modelId);
      if (model) return model;
    }

    // If we have preferences but none are available, any model is compatible
    return null;
  };

  return { handleSend, handleInterrupt };
}

