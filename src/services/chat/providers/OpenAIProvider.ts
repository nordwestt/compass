import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/types/core';
import { ChatMessage } from '@/types/core';
import { Model } from '@/types/core';

export class OpenAIProvider implements ChatProvider {
  async sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): Promise<Response> {
    const newMessages = [
      { role: 'system', content: character.content },
      ...messages.map(message => ({ 
        role: message.isUser ? 'user' : 'assistant', 
        content: message.content 
      }))
    ];

    return fetch(`${model.provider.endpoint}/v1/chat/completions`, {
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

  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    let response = await fetch(`${model.provider.endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        stream: false
      }),
    });
    let data = await response.json();
    return data.choices[0].message.content;
  }

  async sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<string>{
    let response = await fetch(`${model.provider.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
          stream: false,
          response_format: { type: 'json_object' }
        }),
      });
    let data = await response.json();
    return JSON.parse(data.response);
  }
} 