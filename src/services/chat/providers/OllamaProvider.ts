import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/types/core';
import { ChatMessage } from '@/types/core';
import { Model } from '@/types/core';

export class OllamaProvider implements ChatProvider {
  async sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): Promise<Response> {
    const newMessages = [
      { role: 'system', content: character.content },
      ...messages.map(message => ({ 
        role: message.isUser ? 'user' : 'assistant', 
        content: message.content 
      }))
    ];

    return fetch(`${model.provider.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: model.id,
        messages: newMessages,
        stream: true
      }),
    });
  }
} 