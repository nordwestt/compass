import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/src/types/core';
import { ChatMessage } from '@/src/types/core';
import { Model } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { Platform } from 'react-native';

export class AnthropicProvider implements ChatProvider {
  async *sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): AsyncGenerator<string> {
    const newMessages = [
      ...messages.map((message, index) => ({
        role: message.isUser ? 'user' : 'assistant',
        content: index === 0 && message.isUser 
          ? `${character.content}\n\n${message.content}`
          : message.content
      }))
    ];

    try {
      const response = await fetch(`${model.provider.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': model.provider.apiKey,
          'anthropic-version': '2023-06-01'
        },
        signal,
        body: JSON.stringify({
          model: model.id,
          messages: newMessages,
          stream: true,
          max_tokens: 4096
        }),
        reactNative: { textStreaming: true }
      } as any);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(line.slice(6));
            
            if (json.type === 'content_block_delta') {
              const content = json.delta?.text;
              if (content) {
                yield content;
              }
            }
          } catch (error: any) {
            LogService.log(error, { component: 'AnthropicProvider', function: 'sendMessage.processChunk' }, 'error');
            throw error;
          }
        }
      }
    } catch (error: any) {
      LogService.log(error, { component: 'AnthropicProvider', function: 'sendMessage' }, 'error');
      throw error;
    }
  }

  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    const response = await fetch(`${model.provider.endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': model.provider.apiKey,
        'anthropic-version': '2023-06-01'
      } as HeadersInit,
      body: JSON.stringify({
        model: model.id,
        messages: [
          { 
            role: 'user', 
            content: `${systemPrompt}\n\n${message}` 
          }
        ],
        max_tokens: 4096
      }),
    });

    const data = await response.json();
    if (!data.content || !data.content[0]?.text) {
      throw new Error(`Unexpected format: ${JSON.stringify(data)}`);
    }
    return data.content[0].text;
  }

  async sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<any> {
    const response = await fetch(`${model.provider.endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': model.provider.apiKey,
        'anthropic-version': '2023-06-01'
      } as HeadersInit,
      body: JSON.stringify({
        model: model.id,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${message}\n\nRespond only with valid JSON.`
          }
        ],
        max_tokens: 4096
      }),
    });

    const data = await response.json();
    
    try {
      return JSON.parse(data.content[0].text);
    } catch (error) {
      return { query: "", searchRequired: false };
    }
  }
} 