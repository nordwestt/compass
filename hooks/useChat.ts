import { useAtom, useSetAtom } from 'jotai';
import { currentThreadAtom, threadActionsAtom, ThreadAction } from './atoms';
import { Thread, ChatMessage, Model, Character } from '@/types/core';
import { useRef } from 'react';
import { MentionedCharacter } from '@/components/ChatInput';


async function sendMessageToProvider(
  messages: ChatMessage[], 
  selectedModel: Model,
  character: Character,
  signal?: AbortSignal
): Promise<Response> {
  const newMessages = [
    { role: 'system', content: character.content },
    ...messages.map(message => ({ role: message.isUser ? 'user' : 'assistant', content: message.content }))
  ];

  switch (selectedModel.provider.type) {
    case 'ollama':
      return fetch(`http://localhost:11434/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: newMessages,
          stream: true
        }),
        signal
      });

    case 'openai':
      return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedModel.provider.apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: messages,
          stream: true
        }),
        signal
      });

    case 'anthropic':
      return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': selectedModel.provider.apiKey || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: messages,
          stream: true
        }),
        signal
      });

    default:
      throw new Error(`Unsupported provider: ${selectedModel.provider.type}`);
  }
}

async function handleStreamResponse(
  response: Response,
  currentThread: Thread,
  dispatchThread: (action: ThreadAction) => void
) {
  const reader = response?.body?.getReader();
  if (!reader) throw new Error('No reader available from response');

  let assistantMessage = '';
  const isFirstMessage = currentThread.messages.length === 2;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (isFirstMessage) {
          const title = await generateThreadTitle(assistantMessage, currentThread);
          dispatchThread({
            type: 'update',
            payload: { ...currentThread, title }
          });
        }
        break;
      }

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const parsedChunk = JSON.parse(line);
          const content = parsedChunk.message?.content || 
                          parsedChunk.choices?.[0]?.delta?.content || 
                          parsedChunk.delta?.text;
          
          if (content) {
            assistantMessage += content;
            const updatedMessages = [...currentThread.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.content = assistantMessage;
              dispatchThread({
                type: 'update',
                payload: {
                  ...currentThread,
                  messages: updatedMessages
                }
              });
            }
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

const generateThreadTitle = async (message: string, currentThread: Thread): Promise<string> => {
  const prompt = `Based on this first message, generate a concise 3-word title that captures the essence of the conversation. Format: "Word1 Word2 Word3" (no quotes, no periods)
  
Message: ${message}`;

  try {
    const response = await sendMessageToProvider(
      [{content: prompt, isUser: true}], 
      currentThread.selectedModel,
      {
        id: 'title-generator',
        name: 'Title Generator',
        content: 'You are a helpful assistant that generates concise 3-word titles. Only respond with the title in the format "Word1 Word2 Word3" without quotes or periods.'
      }
    );

    const reader = response?.body?.getReader();
    if (!reader) throw new Error('No reader available');

    let title = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const parsedChunk = JSON.parse(line);
          const content = parsedChunk.message?.content || 
                         parsedChunk.choices?.[0]?.delta?.content || 
                         parsedChunk.delta?.text;
          if (content) title += content;
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    }
    return title.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Chat Thread';
  }
};

export function useChat() {
  const [currentThread] = useAtom(currentThreadAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const abortController = useRef<AbortController | null>(null);

  const handleInterrupt = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  };

  const handleSend = async (message: string, mentionedCharacters: MentionedCharacter[] = []) => {
    abortController.current = new AbortController();

    const newMessage = { content: message, isUser: true };
    const assistantPlaceholder = { content: "", isUser: false };
    const updatedMessages = [...currentThread.messages, newMessage, assistantPlaceholder];
    const updatedThread = {
      ...currentThread,
      messages: updatedMessages
    };

    dispatchThread({
      type: 'update',
      payload: updatedThread
    });

    try {
      // First get the main response
      const response = await sendMessageToProvider(
        updatedMessages,
        currentThread.selectedModel,
        currentThread.character,
        abortController.current.signal
      );
      await handleStreamResponse(response, updatedThread, dispatchThread);

      // Then handle any mentioned characters
      for (const mention of mentionedCharacters) {
        const lastMessage = currentThread.messages[currentThread.messages.length - 2];
        const contextMessage = `${currentThread.character.name} just said: "${lastMessage.content}". What do you think about that?`;
        
        const mentionResponse = await sendMessageToProvider(
          [{ content: contextMessage, isUser: true }],
          currentThread.selectedModel,
          mention.character,
          abortController.current.signal
        );
        
        await handleStreamResponse(mentionResponse, updatedThread, dispatchThread);
      }
    } catch (error) {
      const updatedMessages = [...currentThread.messages];
      if (error instanceof Error && error.name === 'AbortError') {
        updatedMessages[updatedMessages.length - 1].content += "\n\n[Generation interrupted]";
      } else {
        updatedMessages[updatedMessages.length - 1].content = "Error: Failed to get response from AI";
      }
      dispatchThread({
        type: 'update',
        payload: {
          ...currentThread,
          messages: updatedMessages
        }
      });
    } finally {
      abortController.current = null;
    }
  };

  return { handleSend, handleInterrupt };
} 