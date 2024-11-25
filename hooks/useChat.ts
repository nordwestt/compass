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

  switch (selectedModel.provider.source) {
    case 'ollama':
      console.log('sending message to ollama', selectedModel.provider.endpoint);
      return fetch(`${selectedModel.provider.endpoint}/api/chat`, {
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
      throw new Error(`Unsupported provider: ${selectedModel.provider.source}`);
  }
}

async function handleStreamResponse(
  response: Response,
  currentThread: Thread,
  dispatchThread: (action: ThreadAction) => void
) {
  if (!response.body) {
    throw new Error('Response stream not available');
  }

  const reader = response.body.getReader();
  if (!reader) {
    throw new Error('Stream reader not available');
  }

  let assistantMessage = currentThread.messages[currentThread.messages.length - 1].content;

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
      console.log('chunk', chunk);
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
    let assistantPlaceholder: ChatMessage = { content: "", isUser: false };

    let messagesToSend = [] as ChatMessage[];
    if (mentionedCharacters.length > 0) {
      let contextMessage = `User: "${newMessage.content}"`;
      
      // Only add previous context if there are at least 2 previous messages
      if (currentThread.messages.length >= 2) {
        const userLastMessage = currentThread.messages[currentThread.messages.length - 2];
        const assistantLastMessage = currentThread.messages[currentThread.messages.length - 1];
        contextMessage = `I told ${currentThread.character.name} "${userLastMessage.content}" and they responded with "${assistantLastMessage.content}"\n\nUser: "${newMessage.content}"`;
      }
      
      assistantPlaceholder = { content: '', isUser: false, character: mentionedCharacters[0].character };
      messagesToSend = [
        { content: contextMessage, isUser: true },
        assistantPlaceholder
      ];
    } else {
      messagesToSend = [newMessage, assistantPlaceholder];
    }

    const updatedThread = {
      ...currentThread, 
      messages: [...currentThread.messages, newMessage, assistantPlaceholder]
    };

    const characterToSend = mentionedCharacters.length > 0 ? mentionedCharacters[0].character : currentThread.character;

    dispatchThread({
      type: 'update',
      payload: updatedThread
    });

    try {
      
      let historyToSend: ChatMessage[] = [];

      // any character messages should be merged with the user's last message
      for (let i = 0; i < currentThread.messages.length; i++) {
        const message = currentThread.messages[i];
        if (message.character && historyToSend.length > 0) {
          historyToSend[historyToSend.length - 1].content += `\n\n${[message.character.name]} responded: "${message.content}"`;
        } else {
          historyToSend.push(message);
        }
      }

      // First get the main response
      const response = await sendMessageToProvider(
        mentionedCharacters.length > 0 ? messagesToSend : [...historyToSend, ...messagesToSend], // include history if no mentions
        currentThread.selectedModel,
        characterToSend,
        abortController.current.signal
      );
      await handleStreamResponse(response, updatedThread, dispatchThread);


    } catch (error) {
      const updatedMessages = [...currentThread.messages];
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation interrupted');
        //updatedMessages[updatedMessages.length - 1].content += "\n\n[Generation interrupted]";
      } else {
        console.log('Generation failed', error);
        //updatedMessages[updatedMessages.length - 1].content = "Error: Failed to get response from AI";
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