import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/types/core';
import { ChatMessage } from '@/types/core';
import { Model } from '@/types/core';

export class OllamaProvider implements ChatProvider {
  async sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): Promise<Response> {
    const newMessages = [
      { role: 'system', content: character.content },
      ...messages.map(message => ({ 
        role: message.isUser ? 'user' : message.isSystem ? 'system' : 'assistant', 
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

  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    let response = await fetch(`${model.provider.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        stream: false
      }),
    });
    let data = await response.json();
    return data.message.content;
  }

  
  async sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<any>{
    let response = await fetch(`${model.provider.endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
          stream: false,
          format: 'json'
        }),
      });
      let data = await response.json();
    
    try{
      return JSON.parse(data.message.content);
    } catch (error) {
      return {query: "", searchRequired: false};
    }
  }

} 