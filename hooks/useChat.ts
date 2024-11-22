import { Signal } from '@preact/signals-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Thread } from '@/app/(tabs)';

export interface ChatMessage {
  content: string;
  isUser: boolean;
}

export interface APIEndpoint {
  id?: string;
  name?: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  endpoint: string;
}

export interface SelectedModel {
  id: string;
  provider: APIEndpoint;
}

async function sendMessageToProvider(
  message: string, 
  selectedModel: SelectedModel, 
): Promise<Response> {

  switch (selectedModel.provider.type) {
    case 'ollama':
      return fetch(`http://localhost:11434/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [{ role: 'user', content: message }],
          stream: true
        }),
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
          messages: [{ role: 'user', content: message }],
          stream: true
        }),
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
          messages: [{ role: 'user', content: message }],
          stream: true
        }),
      });

    default:
      throw new Error(`Unsupported provider: ${selectedModel.provider.type}`);
  }
}

async function handleStreamResponse(
  response: Response,
  thread: Signal<Thread>,
  threads: Signal<Thread[]>
) {
  const reader = response?.body?.getReader();
  if (!reader) throw new Error('No reader available from response');

  let assistantMessage = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Update threads array with the final message
        threads.value = threads.value.map(t => 
          t.id === thread.value.id ? thread.value : t
        );
        break;
      }

      // Convert the chunk to text and process each line
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const parsedChunk = JSON.parse(line);
          // Extract content based on provider format
          const content = parsedChunk.message?.content || // Ollama format
                         parsedChunk.choices?.[0]?.delta?.content || // OpenAI format
                         parsedChunk.delta?.text; // Anthropic format
          
          if (content) {
            assistantMessage += content;
            // Update the thread's messages in real-time
            const updatedMessages = [...thread.value.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.content = assistantMessage;
              thread.value = {
                ...thread.value,
                messages: updatedMessages
              };
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

export function useChat(
  thread: Signal<Thread>, 
  threads: Signal<Thread[]>, 
  selectedModel: Signal<SelectedModel>
) {
  const handleSend = async (message: string) => {
    const newMessage = { content: message, isUser: true };
    const assistantPlaceholder = { content: "", isUser: false };
    
    thread.value = {
      ...thread.value,
      messages: [...thread.value.messages, newMessage, assistantPlaceholder]
    };

    try {
      

      const response = await sendMessageToProvider(message, selectedModel.value);
      await handleStreamResponse(response, thread, threads);
    } catch (error) {
      console.error('Error sending message:', error);
      // Update the placeholder message to show the error
      const updatedMessages = [...thread.value.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage && !lastMessage.isUser) {
        lastMessage.content = "Error: Failed to get response from AI";
        thread.value = {
          ...thread.value,
          messages: updatedMessages
        };
      }
    }
  };

  return { handleSend };
} 